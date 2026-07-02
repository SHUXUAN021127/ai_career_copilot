from pathlib import Path
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from openai import OpenAIError
from backend.config import UPLOAD_DIR
from backend.services.resume_parser import extract_text_from_pdf
from backend.services.resume_analyzer import analyze_resume
from backend.services.report_generator import generate_report
from pydantic import BaseModel, Field
from backend.agents.answer_evaluation_agent import evaluation_agent
from backend.agents.career_analysis_agent import resolve_career_profile
from backend.agents.interview_orchestrator import (
    generate_interview_question,
    run_interview_turn,
    summarize_interview,
)

app = FastAPI(
    title="AI Career Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(OpenAIError)
async def openai_error_handler(
    request: Request,
    exc: OpenAIError
):
    return JSONResponse(
        status_code=503,
        content={
            "detail": str(exc)
        }
    )

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

class FollowupRequest(
    BaseModel
):
    question:str
    answer:str
    career:str | None = None
    history:list = Field(default_factory=list)

class InterviewSummaryRequest(
    BaseModel
):
    history:list = Field(default_factory=list)
    career:str | None = None


class CareerProfileRequest(
    BaseModel
):
    career: str

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


@app.post("/career-profile")
async def career_profile(
    req: CareerProfileRequest
):
    return resolve_career_profile(
        req.career
    )

@app.post("/interview-followup")
async def interview_followup(
    req: FollowupRequest
):

    result = run_interview_turn(
        req.question,
        req.answer,
        req.career,
        req.history
    )

    return result

@app.get("/interview-questions")
async def interview_questions(
    career: str
):

    result = generate_interview_question(career)

    return result

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
        evaluation_agent.evaluate(
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

    result = summarize_interview(
        req.history,
        req.career
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
    career: str,
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
