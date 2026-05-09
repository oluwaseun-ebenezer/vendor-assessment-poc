from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class IntegrationScorer(BaseDimensionScorer):
    DIMENSION_NAME = "integration"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []
        checks = [
            ("api_docs_available", 20, "API documentation available"),
            ("gdpr_dpa", 10, "Data governance documented"),
        ]
        for field, pts, label in checks:
            val = v.get(field)
            if val:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if val else "0", "source": "vendor_form"})

        sla = v.get("sla_uptime", "")
        try:
            uptime = float(str(sla).replace("%", ""))
            if uptime >= 99.5:
                score += 20
                evidence.append({"signal": "SLA uptime ≥ 99.5%",
                                "value": sla, "impact": "+20", "source": "vendor_form"})
            else:
                evidence.append({"signal": f"SLA uptime {sla}",
                                "value": sla, "impact": "0", "source": "vendor_form"})
        except Exception:
            pass

        for field, pts, label in [("iso27001", 15, "SSO/SAML support"), ("multi_region", 10, "Multi-region infra"), ("business_continuity_plan", 10, "DR plan documented")]:
            val = v.get(field)
            if val:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if val else "0", "source": "vendor_form"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess technical integration quality for enterprise use.\n\nVENDOR: {inp.vendor.get('company_name')}\n"
            f"API docs: {inp.vendor.get('api_docs_url')}, SLA: {inp.vendor.get('sla_uptime')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: API maturity, data integrity controls, error handling, DR/backup plan.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
