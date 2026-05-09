import json
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings


class LLMAnalyser:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=60)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def analyse(self, prompt: str) -> tuple[float, str]:
        if not settings.openrouter_api_key:
            return 50.0, "LLM analysis skipped: no API key configured"

        payload = {
            "model": settings.openrouter_model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an enterprise vendor risk analyst. "
                        "Always respond with valid JSON only: "
                        '{"score": <integer 0-100>, "reasoning": "<explanation>"}'
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
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
