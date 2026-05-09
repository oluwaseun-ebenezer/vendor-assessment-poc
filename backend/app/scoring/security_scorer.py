from app.scoring.base_scorer import BaseDimensionScorer, ScorerInput


class SecurityScorer(BaseDimensionScorer):
    DIMENSION_NAME = "security"

    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        v = inp.vendor
        score = 0.0
        evidence = []

        checks = [
            ("iso27001", 20, "ISO 27001 certified"),
            ("soc2", 20, "SOC 2 Type II certified"),
            ("gdpr_dpa", 20, "GDPR DPA signed/available"),
            ("pen_test", 15, "Pen-test in last 12 months"),
        ]
        for field, points, label in checks:
            val = v.get(field)
            if val:
                score += points
            evidence.append({"signal": label, "value": val,
                            "impact": f"+{points}" if val else "0", "source": "vendor_form"})

        # No breach = +15
        breach = v.get("security_breach")
        if breach is False:
            score += 15
            evidence.append({"signal": "No security breach in last 2 years",
                            "value": True, "impact": "+15", "source": "vendor_form"})
        elif breach is True:
            score -= 30
            evidence.append({"signal": "Security breach in last 2 years",
                            "value": True, "impact": "-30", "source": "vendor_form"})

        # EU data residency
        residency = v.get("data_residency", "")
        if residency and "eu" in residency.lower():
            score += 10
            evidence.append({"signal": "EU data residency", "value": True,
                            "impact": "+10", "source": "vendor_form"})

        # CVE enrichment
        cves = inp.enrichment.get("nvd", {}).get("cve_count", 0)
        if cves > 10:
            score -= 15
            evidence.append({"signal": f"CVEs found for tech stack ({cves})",
                            "value": cves, "impact": "-15", "source": "nvd"})
        elif cves > 0:
            evidence.append({"signal": f"CVEs found for tech stack ({cves})",
                            "value": cves, "impact": "0", "source": "nvd"})

        return max(0.0, min(100.0, score)), evidence

    def get_llm_prompt(self, inp: ScorerInput) -> str:
        docs_text = "\n\n---\n\n".join(d.get("text_content", "")
                                       for d in inp.documents[:3])
        return (
            f"You are assessing an AI startup vendor for enterprise security compliance.\n\n"
            f"VENDOR: {inp.vendor.get('company_name')}\n\n"
            f"DOCUMENTS:\n{docs_text[:8000]}\n\n"
            f"Evaluate: GDPR data handling, data minimisation, breach notification, encryption standards, access controls.\n"
            f"Score 0-100 (100=excellent security posture). Return JSON: {{\"score\": <int>, \"reasoning\": \"<text>\"}}"
        )
