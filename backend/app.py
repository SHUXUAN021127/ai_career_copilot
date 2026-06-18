from pathlib import Path
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException
from backend.config import UPLOAD_DIR
from backend.services.resume_parser import extract_text_from_pdf
from backend.services.resume_analyzer import analyze_resume
from backend.services.report_generator import generate_report
from backend.services.interview_evaluator import (
    evaluate_answer
)
from backend.services.interview_question_generator import generate_first_question
from backend.services.interview_followup_generator import (
    generate_followup
)
from pydantic import BaseModel
from backend.services.interview_summary_evaluator import (
    evaluate_interview
)

app = FastAPI(
    title="AI Career Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

from enum import Enum

class FollowupRequest(
    BaseModel
):
    question:str
    answer:str

class CareerType(str, Enum):
    ai_application_engineer = "ai_application_engineer"
    ml_engineer = "ml_engineer"
    data_analyst = "data_analyst"
    # backend_engineer = "backend_engineer"

class InterviewSummaryRequest(
    BaseModel
):
    history:list

@app.get("/")
def root():
    return {
        "message": "AI Career Copilot API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/careers")
def get_careers():

    profile_dir = (
        Path(__file__).parent
        / "career_profiles"
    )

    careers = [
        file.stem
        for file in profile_dir.glob("*.json")
    ]

    return {
        "careers": careers
    }

@app.post("/interview-followup")
async def interview_followup(
    req: FollowupRequest
):

    result = generate_followup(
        req.question,
        req.answer
    )

    return result

@app.get("/interview-questions")
async def interview_questions(
    career: str
):

    return {
        "question": generate_first_question(career)
    }

class InterviewRequest(
    BaseModel
):
    question: str
    answer: str


@app.post(
    "/evaluate-interview"
)
async def evaluate_interview_score(
    req: InterviewRequest
):

    feedback = (
        evaluate_answer(
            req.question,
            req.answer
        )
    )

    return {
        "feedback": feedback
    }

@app.post("/interview-summary")
async def interview_summary(
    req: InterviewSummaryRequest
):

    result = evaluate_interview(
          req.history
      )

    return {
        "result": result
    }

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    filename = (
        f"{uuid.uuid4()}_"
        f"{file.filename}"
    )

    file_path = (
        UPLOAD_DIR
        / filename
    )

    with open(
        file_path,
        "wb"
    ) as f:

        f.write(
            await file.read()
        )

    resume_text = extract_text_from_pdf(
        str(file_path)
    )

    return {
        "filename": filename,
        "preview": resume_text[:1000]
    }


@app.post("/analyze")
async def analyze_resume_api(
    career: CareerType,
    file: UploadFile = File(...)
):

    try:

        filename = (
            f"{uuid.uuid4()}_"
            f"{file.filename}"
        )

        file_path = (
            UPLOAD_DIR
            / filename
        )

        with open(
            file_path,
            "wb"
        ) as f:

            f.write(
                await file.read()
            )

        resume_text = extract_text_from_pdf(
            str(file_path)
        )

        resume_info = analyze_resume(
            resume_text
        )

        result = generate_report(
            resume_info,
            career
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )