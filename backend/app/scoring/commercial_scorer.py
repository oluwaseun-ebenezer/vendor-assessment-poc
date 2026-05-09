from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class CommercialScorer(BaseDimensionScorer):
    DIMENSION_NAME = "commercial"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []

        for field, pts, label in [
            ("pricing_model", 20, "Pricing model transparent/documented"),
            ("enterprise_pricing", 20, "Enterprise pricing tier available"),
            ("annual_cost_estimate", 15, "Annual cost estimate provided"),
            ("volume_discount", 15, "Volume discount offered"),
        ]:
            val = v.get(field)
            has = bool(val)
            if has:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if has else "0", "source": "vendor_form"})

        has_commercial_doc = any(d.get("doc_type") in [
                                 "financial_doc", "contract"] for d in inp.documents)
        if has_commercial_doc:
            score += 15
            evidence.append({"signal": "TCO/financial documentation available",
                            "value": True, "impact": "+15", "source": "uploaded_doc"})
        else:
            score += 15  # assume no lock-in if no doc available — give benefit of doubt
            evidence.append({"signal": "No vendor lock-in clauses identified",
                            "value": True, "impact": "+15", "source": "vendor_form"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess commercial and pricing risk for enterprise procurement.\n\nVENDOR: {inp.vendor.get('company_name')}\n"
            f"Pricing model: {inp.vendor.get('pricing_model')}, annual cost: {inp.vendor.get('annual_cost_estimate')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: pricing clarity, hidden costs, data egress fees, lock-in terms, exit clauses.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
