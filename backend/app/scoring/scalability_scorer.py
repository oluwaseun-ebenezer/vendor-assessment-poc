from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class ScalabilityScorer(BaseDimensionScorer):
    DIMENSION_NAME = "scalability"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []
        for field, pts, label in [
            ("multi_region", 20, "Data hosted in multiple regions"),
            ("eu_data_residency", 20, "EU data residency available"),
            ("multilingual_ui", 15, "Multi-language UI support"),
        ]:
            val = v.get(field)
            if val:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if val else "0", "source": "vendor_form"})

        countries = v.get("operating_countries", 0) or 0
        if countries >= 3:
            score += 15
            evidence.append({"signal": f"Operating in {countries}+ countries",
                            "value": countries, "impact": "+15", "source": "vendor_form"})

        if v.get("cloud_provider"):
            score += 10
            evidence.append({"signal": "Cloud infrastructure (auto-scaling capable)",
                            "value": True, "impact": "+10", "source": "vendor_form"})

        country = v.get("country", "").lower()
        if "denmark" in country or "dk" in country or "eu" in (v.get("data_residency", "") or "").lower():
            score += 20
            evidence.append({"signal": "EU/Danish regulatory compliance",
                            "value": True, "impact": "+20", "source": "vendor_form"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess global scalability of vendor {inp.vendor.get('company_name')}.\n"
            f"Countries: {inp.vendor.get('operating_countries')}, cloud: {inp.vendor.get('cloud_provider')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: multi-region infra, regulatory compliance, localisation, scalability architecture.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
