"""
Scoring Engine Orchestrator
Runs all 8 dimension scorers concurrently and stores results.
"""
import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.assessment import Assessment
from app.models.vendor import Vendor, VendorDocument
from app.models.dimension_score import DimensionScore
from app.scoring.base_scorer import ScorerInput
from app.scoring.llm_analyser import LLMAnalyser, extract_document_text
from app.scoring.security_scorer import SecurityScorer
from app.scoring.viability_scorer import ViabilityScorer
from app.scoring.integration_scorer import IntegrationScorer
from app.scoring.legal_scorer import LegalScorer
from app.scoring.commercial_scorer import CommercialScorer
from app.scoring.operations_scorer import OperationsScorer
from app.scoring.scalability_scorer import ScalabilityScorer
from app.scoring.maturity_scorer import MaturityScorer

logger = logging.getLogger(__name__)

ALL_SCORERS = [
    SecurityScorer(),
    ViabilityScorer(),
    IntegrationScorer(),
    LegalScorer(),
    CommercialScorer(),
    OperationsScorer(),
    ScalabilityScorer(),
    MaturityScorer(),
]


async def run_assessment_task(assessment_id: str, vendor_id: str):
    """Background task: runs all 8 scorers and saves results."""
    async with AsyncSessionLocal() as db:
        try:
            # Mark as running
            result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
            assessment = result.scalar_one()
            assessment.status = "running"
            assessment.started_at = datetime.now(timezone.utc)
            await db.commit()

            # Load vendor + documents
            v_result = await db.execute(
                select(Vendor).options(selectinload(Vendor.documents)).where(
                    Vendor.id == vendor_id)
            )
            vendor = v_result.scalar_one()
            vendor_dict = {c.name: getattr(vendor, c.name)
                           for c in vendor.__table__.columns}

            # Extract document text
            documents = []
            for doc in vendor.documents:
                text = extract_document_text(doc.file_path)
                documents.append(
                    {"doc_type": doc.doc_type, "file_path": doc.file_path, "text_content": text})

            # Enrichment (basic - extend with real API calls)
            enrichment = await _fetch_enrichment(vendor_dict, db)

            scorer_input = ScorerInput(
                vendor=vendor_dict, documents=documents, enrichment=enrichment)
            llm = LLMAnalyser()

            # Run all 8 scorers concurrently
            tasks = [scorer.score(scorer_input, llm) for scorer in ALL_SCORERS]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            await llm.close()

            # Save scores
            dimension_scores = []
            for res in results:
                if isinstance(res, Exception):
                    logger.error(f"Scorer failed: {res}")
                    continue
                ds = DimensionScore(
                    assessment_id=assessment_id,
                    dimension=res.dimension,
                    rules_score=res.rules_score,
                    llm_score=res.llm_score,
                    composite_score=res.composite_score,
                    risk_flag=res.risk_flag,
                    evidence=res.evidence,
                    llm_reasoning=res.llm_reasoning,
                )
                db.add(ds)
                dimension_scores.append(res)

            # Compute overall composite score
            valid_scores = [
                r.composite_score for r in dimension_scores if not isinstance(r, Exception)]
            composite = sum(valid_scores) / \
                len(valid_scores) if valid_scores else 0.0

            # Overall risk flag
            flags = [
                r.risk_flag for r in dimension_scores if not isinstance(r, Exception)]
            if "red" in flags:
                overall_flag = "red"
            elif "amber" in flags:
                overall_flag = "amber"
            else:
                overall_flag = "green"

            assessment.composite_score = round(composite, 2)
            assessment.risk_flag = overall_flag
            assessment.status = "complete"
            assessment.completed_at = datetime.now(timezone.utc)
            await db.commit()

            # Update vendor status to in_review
            vendor.status = "in_review"
            await db.commit()

            # Trigger report generation
            try:
                from app.services.report_service import generate_report
                await generate_report(assessment_id, vendor_id, db)
            except Exception as e:
                logger.error(f"Report generation failed: {e}")

        except Exception as e:
            logger.error(f"Assessment {assessment_id} failed: {e}")
            async with AsyncSessionLocal() as err_db:
                err_result = await err_db.execute(select(Assessment).where(Assessment.id == assessment_id))
                err_assessment = err_result.scalar_one_or_none()
                if err_assessment:
                    err_assessment.status = "failed"
                    err_assessment.error_message = str(e)
                    await err_db.commit()


async def _fetch_enrichment(vendor_dict: dict, db: AsyncSession) -> dict:
    """Fetch enrichment data from external APIs with caching."""
    from app.services.enrichment_service import EnrichmentService
    enrichment_svc = EnrichmentService()
    return await enrichment_svc.fetch(vendor_dict, db)
