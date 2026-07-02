import json
import re
from typing import Any

from backend.services.llm_service import get_llm

MODEL_NAME = "qwen-plus"


def chat(prompt: str, temperature: float = 0.2) -> str:
    client = get_llm()
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=temperature,
    )

    return response.choices[0].message.content.strip()


def extract_json(content: str, fallback: dict[str, Any]) -> dict[str, Any]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", content)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return fallback
        return fallback


def to_json_text(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2)
