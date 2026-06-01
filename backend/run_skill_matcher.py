from backend.services.skill_matcher import match_skills

resume_skills = [
    "Python",
    "FastAPI",
    "LangChain"
]

target_skills = [
    "Python",
    "FastAPI",
    "Docker",
    "RAG",
    "Prompt Engineering"
]

result = match_skills(
    resume_skills,
    target_skills
)

print(result)