from backend.services.report_generator import generate_report

resume_info = {
    "skills": [
        "Python",
        "FastAPI",
        "LangChain"
    ]
}

result = generate_report(
    resume_info,
    "ai_application_engineer"
)

print(result)