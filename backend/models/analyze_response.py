from pydantic import BaseModel


class AnalyzeResponse(BaseModel):

    career: str

    score: float

    matched: list[str]

    missing: list[str]

    learning_path: str