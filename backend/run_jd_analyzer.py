from backend.services.jd_analyzer import analyze_jd

jd = """
AI Application Engineer

Requirements:

- Python
- FastAPI
- LangChain
- RAG

Preferred:

- AWS
- Docker
"""

result = analyze_jd(jd)

print(result)