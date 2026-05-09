"""Enrichment service — fetches and caches external API data."""
import logging
from datetime import datetime, timezone, timedelta
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.enrichment_cache import EnrichmentCache

logger = logging.getLogger(__name__)


class EnrichmentService:
    async def fetch(self, vendor_dict: dict, db: AsyncSession) -> dict:
        vendor_id = vendor_dict.get("id")
        enrichment = {}
        if not vendor_id:
            return enrichment

        # Try cache first
        cache_result = await db.execute(
            select(EnrichmentCache)
            .where(EnrichmentCache.vendor_id == vendor_id, EnrichmentCache.expires_at > datetime.now(timezone.utc))
            .order_by(EnrichmentCache.fetched_at.desc())
        )
        cached = {row.source: row.data for row in cache_result.scalars().all()}

        # NVD CVE lookup
        if "nvd" not in cached:
            enrichment["nvd"] = await self._fetch_nvd(vendor_dict, vendor_id, db)
        else:
            enrichment["nvd"] = cached["nvd"]

        # Companies House (UK vendors)
        if "companies_house" not in cached:
            enrichment["companies_house"] = await self._fetch_companies_house(vendor_dict, vendor_id, db)
        else:
            enrichment["companies_house"] = cached["companies_house"]

        return enrichment

    async def _fetch_nvd(self, vendor_dict: dict, vendor_id: str, db: AsyncSession) -> dict:
        tech_stack = vendor_dict.get("tech_stack") or []
        if isinstance(tech_stack, list):
            techs = tech_stack[:3]
        else:
            techs = []

        cve_count = 0
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                for tech in techs:
                    params = {"keywordSearch": str(tech), "resultsPerPage": 5}
                    if settings.nvd_api_key:
                        params["apiKey"] = settings.nvd_api_key
                    resp = await client.get("https://services.nvd.nist.gov/rest/json/cves/2.0", params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        cve_count += data.get("totalResults", 0)
        except Exception as e:
            logger.warning(f"NVD lookup failed: {e}")

        result = {"cve_count": cve_count}
        await self._cache(vendor_id, "nvd", result, db)
        return result

    async def _fetch_companies_house(self, vendor_dict: dict, vendor_id: str, db: AsyncSession) -> dict:
        if not settings.companies_house_api_key:
            return {}
        name = vendor_dict.get("company_name", "")
        result = {}
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://api.company-information.service.gov.uk/search/companies",
                    params={"q": name},
                    auth=(settings.companies_house_api_key, ""),
                )
                if resp.status_code == 200:
                    items = resp.json().get("items", [])
                    if items:
                        result = {"active": items[0].get(
                            "company_status") == "active", "company_number": items[0].get("company_number")}
        except Exception as e:
            logger.warning(f"Companies House lookup failed: {e}")
        await self._cache(vendor_id, "companies_house", result, db)
        return result

    async def _cache(self, vendor_id: str, source: str, data: dict, db: AsyncSession):
        try:
            cache = EnrichmentCache(
                vendor_id=vendor_id,
                source=source,
                data=data,
                expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            )
            db.add(cache)
            await db.commit()
        except Exception as e:
            logger.warning(f"Cache write failed: {e}")
