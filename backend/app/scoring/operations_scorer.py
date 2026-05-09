from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class OperationsScorer(BaseDimensionScorer):
    DIMENSION_NAME = "operations"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []
        for field, pts, label in [
            ("dedicated_csm", 20, "Dedicated CSM offered"),
            ("business_continuity_plan", 15, "Support SLA tiers documented"),
            ("deployment_method", 15, "Deployment method suitable"),
        ]:
            val = v.get(field)
            if val:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if val else "0", "source": "vendor_form"})

        if v.get("current_customers"):
            score += 20
            evidence.append({"signal": "Training/onboarding programme documented",
                            "value": True, "impact": "+20", "source": "vendor_form"})
        score += 15  # Default: assume change mgmt exists
        evidence.append({"signal": "Change management process",
                        "value": True, "impact": "+15", "source": "assumed"})
        score += 15  # Default: rollback process
        evidence.append({"signal": "Rollback/downtime mitigation",
                        "value": True, "impact": "+15", "source": "assumed"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess operational maturity of vendor {inp.vendor.get('company_name')}.\n"
            f"Deployment: {inp.vendor.get('deployment_method')}, CSM: {inp.vendor.get('dedicated_csm')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: support quality, change management, incident response, onboarding process.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
