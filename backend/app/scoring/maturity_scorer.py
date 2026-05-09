from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class MaturityScorer(BaseDimensionScorer):
    DIMENSION_NAME = "maturity"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []
        for field, pts, label in [
            ("in_production", 25, "Product in live production"),
            ("enterprise_customers", 20, "At least 1 enterprise customer"),
            ("product_roadmap_available", 20, "Product roadmap provided"),
            ("api_docs_url", 15, "Demo/docs available"),
        ]:
            val = v.get(field)
            if val:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if val else "0", "source": "vendor_form"})

        if v.get("current_customers"):
            score += 10
            evidence.append({"signal": "Named customers referenced",
                            "value": True, "impact": "+10", "source": "vendor_form"})

        if v.get("founded_year"):
            from datetime import datetime
            age = datetime.now().year - v["founded_year"]
            if age >= 2:
                score += 10
                evidence.append({"signal": "Delivery track record (2+ years)",
                                "value": age, "impact": "+10", "source": "vendor_form"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess product maturity and delivery track record of vendor {inp.vendor.get('company_name')}.\n"
            f"In production: {inp.vendor.get('in_production')}, enterprise customers: {inp.vendor.get('enterprise_customers')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: TRL level, roadmap credibility, delivery evidence, customer references.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
