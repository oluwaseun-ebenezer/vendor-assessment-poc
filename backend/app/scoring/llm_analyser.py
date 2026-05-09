import asyncio
import json
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# Free-tier fallbacks tried in order when the project model is rate-limited.
# These are only used if the project-configured model returns 429.
RATE_LIMIT_FALLBACKS = [
    "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "minimax/minimax-m2.5:free",
]


class LLMAnalyser:
    def __init__(
        self,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        system_prompt: str = "",
    ):
        self.client = httpx.AsyncClient(timeout=60)
        self.model = model or settings.openrouter_model
        self.temperature = temperature if temperature is not None else 0.2
        self.max_tokens = max_tokens or 800
        self.system_prompt = system_prompt

    async def _call_model(self, model: str, system_content: str, prompt: str) -> tuple[float, str]:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": self.temperature,
        }
        response = await self.client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "HTTP-Referer": "https://vendor-assessment.carlsberg.com",
                "X-Title": "Vendor Assessment PoC",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        content = json.loads(data["choices"][0]["message"]["content"])
        score = float(max(0, min(100, content.get("score", 50))))
        reasoning = content.get("reasoning", "")
        return score, reasoning

    async def analyse(self, prompt: str) -> tuple[float, str]:
        if not settings.openrouter_api_key:
            return 50.0, "LLM analysis skipped: no API key configured"

        base_system = (
            "You are an enterprise vendor risk analyst. "
            "Always respond with valid JSON only: "
            '{"score": <integer 0-100>, "reasoning": "<explanation>"}'
        )
        system_content = f"{self.system_prompt}\n\n{base_system}".strip() if self.system_prompt else base_system

        # Primary: always use the project-configured model first
        # Fallback: only if the project model is rate-limited (429), try others
        models_to_try = [self.model]
        for m in RATE_LIMIT_FALLBACKS:
            if m != self.model:
                models_to_try.append(m)

        last_error = None
        for i, model in enumerate(models_to_try):
            try:
                score, reasoning = await self._call_model(model, system_content, prompt)
                if i > 0:
                    # Fell back — note which model was used
                    logger.info(f"LLM fell back to '{model}' (project model '{self.model}' was rate-limited)")
                    reasoning = f"[via {model}] {reasoning}"
                return score, reasoning
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    last_error = e
                    logger.warning(f"Model '{model}' rate-limited (429), trying next fallback...")
                    await asyncio.sleep(3)
                    continue
                # Non-429 HTTP errors (401, 400 etc) — don't fallback, surface immediately
                raise
            except Exception as e:
                last_error = e
                continue

        raise last_error or RuntimeError("All LLM models exhausted")

    async def close(self):
        await self.client.aclose()


def extract_document_text(file_path: str, max_chars: int = 24000) -> str:
    """Extract text from PDF or DOCX files."""
    try:
        if file_path.endswith(".pdf"):
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = "\n".join(page.extract_text()
                             or "" for page in reader.pages)
        elif file_path.endswith(".docx"):
            from docx import Document
            doc = Document(file_path)
            text = "\n".join(para.text for para in doc.paragraphs)
        else:
            with open(file_path, "r", errors="ignore") as f:
                text = f.read()
        return text[:max_chars]
    except Exception as e:
        return f"[Could not extract text: {str(e)}]"
