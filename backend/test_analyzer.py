from services.resume_analyzer import analyze_resume
import os

text = """
Shuxuan Wang

Skills:
Python
FastAPI
LangChain
ChromaDB

Project:
University of Melbourne AI Assistant

Education:
University of Melbourne
"""

result = analyze_resume(text)

print(result)