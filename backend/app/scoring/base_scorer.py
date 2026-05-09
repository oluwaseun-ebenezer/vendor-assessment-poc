from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ScorerInput:
    vendor: dict          # vendor DB record as dict
    # [{doc_type, file_path, text_content}]
    documents: list[dict] = field(default_factory=list)
    # pre-fetched external data
    enrichment: dict = field(default_factory=dict)


@dataclass
class DimensionResult:
    dimension: str
    rules_score: float       # 0-100
    llm_score: float         # 0-100, or 0 if no docs
    composite_score: float   # 0.6*rules + 0.4*llm
    risk_flag: str           # green | amber | red
    evidence: list[dict]     # [{signal, value, impact, source}]
    llm_reasoning: str       # raw LLM explanation


class BaseDimensionScorer(ABC):
    DIMENSION_NAME: str = ""
    WEIGHT_RULES: float = 0.6
    WEIGHT_LLM: float = 0.4

    @abstractmethod
    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        """Returns (score_0_to_100, evidence_list)"""
        ...

    @abstractmethod
    def get_llm_prompt(self, inp: ScorerInput) -> str:
        """Returns the dimension-specific prompt to send to the LLM"""
        ...

    def compute_risk_flag(self, score: float) -> str:
        if score >= 70:
            return "green"
        elif score >= 40:
            return "amber"
        return "red"

    async def score(self, inp: ScorerInput, llm_analyser: Any) -> DimensionResult:
        rules_score, evidence = self.score_with_rules(inp)

        llm_score = 0.0
        llm_reasoning = ""

        if inp.documents and llm_analyser:
            try:
                prompt = self.get_llm_prompt(inp)
                llm_score, llm_reasoning = await llm_analyser.analyse(prompt)
            except Exception as e:
                llm_reasoning = f"LLM analysis unavailable: {str(e)}"
                llm_score = rules_score  # Fall back to rules score

        if inp.documents:
            composite = self.WEIGHT_RULES * rules_score + self.WEIGHT_LLM * llm_score
        else:
            composite = rules_score  # No documents → rules only

        composite = max(0.0, min(100.0, composite))

        return DimensionResult(
            dimension=self.DIMENSION_NAME,
            rules_score=round(rules_score, 2),
            llm_score=round(llm_score, 2),
            composite_score=round(composite, 2),
            risk_flag=self.compute_risk_flag(composite),
            evidence=evidence,
            llm_reasoning=llm_reasoning,
        )
