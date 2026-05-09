from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class LegalScorer(BaseDimensionScorer):
    DIMENSION_NAME = "legal"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []

        if v.get("company_registration_number"):
            score += 20
            evidence.append({"signal": "Company legally registered",
                            "value": True, "impact": "+20", "source": "vendor_form"})

        for field, pts, label in [
            ("ip_ownership_documented", 25, "IP ownership documented"),
            ("open_source_licence_clean", 15, "Open-source licence review clean"),
        ]:
            val = v.get(field)
            if val:
                score += pts
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{pts}" if val else "0", "source": "vendor_form"})

        if v.get("pending_litigation") is False:
            score += 20
            evidence.append({"signal": "No pending litigation",
                            "value": True, "impact": "+20", "source": "vendor_form"})
        elif v.get("pending_litigation") is True:
            evidence.append({"signal": "Pending litigation disclosed",
                            "value": True, "impact": "-10", "source": "vendor_form"})
            score -= 10

        # Check if MSA/contract exists via documents
        has_legal_doc = any(d.get("doc_type") in [
                            "legal_doc", "contract"] for d in inp.documents)
        if has_legal_doc:
            score += 20
            evidence.append({"signal": "MSA/contract available",
                            "value": True, "impact": "+20", "source": "uploaded_doc"})

        ch = inp.enrichment.get("companies_house", {})
        if ch.get("active") and not ch.get("insolvency"):
            score += 5
            evidence.append({"signal": "Companies House: no insolvency",
                            "value": True, "impact": "+5", "source": "companies_house"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"Assess legal and IP risk for enterprise vendor onboarding.\n\nVENDOR: {inp.vendor.get('company_name')}\n"
            f"Registered: {inp.vendor.get('company_registration_number')}, country: {inp.vendor.get('company_registration_country')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: IP ownership clarity, liability caps, indemnification, open-source compliance, data processing terms.\n"
            f"Score 0-100. Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
