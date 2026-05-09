"""Vendor lookup service — uses LLM to research a vendor from URL or name."""
import json
import logging
import re
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

LOOKUP_PROMPT = """You are a vendor intelligence analyst. Research the following company and return a structured JSON profile suitable for an enterprise vendor assessment.

Company: {query}

Return ONLY a valid JSON object with these fields (use null for unknown values, do not guess):

{{
  "company_name": "Official company name",
  "website": "https://... (official website)",
  "description": "2-3 sentence description of what they do and their core product/service",
  "country": "HQ country (2-letter ISO code e.g. US, GB, DK)",
  "founded_year": 2019,
  "employee_count": 150,
  "funding_stage": "seed|Series A|Series B|Series C|growth|public|bootstrapped",
  "cloud_provider": "AWS|Azure|GCP|Multi-cloud|On-premise|null",
  "deployment_method": "SaaS|On-premise|Hybrid",
  "tech_stack": ["Python", "React", "PostgreSQL"],
  "sla_uptime": "99.9%|null",
  "iso27001": true|false|null,
  "soc2": true|false|null,
  "gdpr_dpa": true|false|null,
  "pen_test": true|false|null,
  "security_breach": false,
  "eu_data_residency": true|false|null,
  "api_docs_available": true|false|null,
  "enterprise_customers": true|false|null,
  "enterprise_pricing": true|false|null,
  "dedicated_csm": true|false|null,
  "pricing_model": "usage_based|subscription|per_seat|custom|null",
  "ip_ownership_documented": null,
  "pending_litigation": null,
  "business_continuity_plan": null,
  "in_production": true|false|null,
  "multi_region": true|false|null,
  "operating_countries": 10,
  "confidence": "high|medium|low",
  "notes": "Any caveats or things the assessor should verify"
}}

Be accurate. Only set boolean fields to true/false when you are confident. Use null when uncertain.
Return ONLY the JSON, no markdown, no explanation."""


async def lookup_vendor(query: str) -> dict:
    if not settings.openrouter_api_key:
        return _fallback(query)

    prompt = LOOKUP_PROMPT.format(query=query)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "openai/gpt-oss-20b:free",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1000,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()

            # Strip markdown code fences if present
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            data = json.loads(content)

            # Ensure company_name is set
            if not data.get("company_name"):
                data["company_name"] = query

            # Normalize null strings to None
            for k, v in data.items():
                if v == "null":
                    data[k] = None

            logger.info(f"Vendor lookup completed for '{query}' confidence={data.get('confidence')}")
            return data

    except json.JSONDecodeError as e:
        logger.warning(f"Vendor lookup JSON parse failed: {e}")
        return _fallback(query)
    except Exception as e:
        logger.warning(f"Vendor lookup failed: {e}")
        return _fallback(query)


def _fallback(query: str) -> dict:
    name = query.replace("https://", "").replace("http://", "").split("/")[0]
    return {
        "company_name": name,
        "website": query if query.startswith("http") else None,
        "description": None,
        "country": None,
        "founded_year": None,
        "employee_count": None,
        "funding_stage": None,
        "confidence": "low",
        "notes": "Automatic lookup unavailable — please fill in details manually.",
    }
