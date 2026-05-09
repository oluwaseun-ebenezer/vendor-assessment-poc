from datetime import datetime
from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class ViabilityScorer(BaseDimensionScorer):
    DIMENSION_NAME = "viability"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []

        founded = v.get("founded_year")
        if founded:
            age = datetime.now().year - founded
            if age >= 2:
                score += 15
                evidence.append({"signal": "Founded > 2 years ago",
                                "value": age, "impact": "+15", "source": "vendor_form"})
            else:
                evidence.append({"signal": "Founded < 2 years ago",
                                "value": age, "impact": "0", "source": "vendor_form"})

        emp = v.get("employee_count", 0) or 0
        if emp >= 25:
            score += 25
            evidence.append({"signal": "Employee count ≥ 25",
                            "value": emp, "impact": "+25", "source": "vendor_form"})
        elif emp >= 10:
            score += 15
            evidence.append({"signal": "Employee count ≥ 10",
                            "value": emp, "impact": "+15", "source": "vendor_form"})

        funding = v.get("funding_stage", "").lower()
        if "series" in funding:
            score += 25
            evidence.append({"signal": "Series funding", "value": funding,
                            "impact": "+25", "source": "vendor_form"})
        elif "seed" in funding or "pre-seed" in funding:
            score += 15
            evidence.append({"signal": "Seed funding", "value": funding,
                            "impact": "+15", "source": "vendor_form"})

        if v.get("business_continuity_plan"):
            score += 20
            evidence.append({"signal": "BCP documented", "value": True,
                            "impact": "+20", "source": "vendor_form"})

        # Companies House enrichment
        ch = inp.enrichment.get("companies_house", {})
        if ch.get("active"):
            score += 10
            evidence.append({"signal": "Companies House: active",
                            "value": True, "impact": "+10", "source": "companies_house"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess this vendor's financial health and business viability.\n\n"
            f"VENDOR: {inp.vendor.get('company_name')}, {inp.vendor.get('employee_count')} employees, "
            f"founded {inp.vendor.get('founded_year')}, funding: {inp.vendor.get('funding_stage')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: financial runway, team stability, growth trajectory, key-person risk.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
