# AI Career Copilot

AI Career Copilot is a resume analysis and mock interview assistant. It helps users upload a PDF resume, define a target career, compare their current skills with that target, generate a learning plan, and practice with a multi-agent AI interview workflow.

The target career no longer has to be limited to local JSON files. Users can enter a real target job title or job description, and the Career Analysis Agent will generate a dynamic career profile for resume matching and interview questions.

## Features

- PDF resume upload and text extraction
- Resume skill analysis with Qwen through DashScope
- Local career templates for common directions:
  - AI Application Engineer
  - Machine Learning Engineer
  - Data Analyst
- Dynamic career profile generation from user-entered target jobs
- Skill gap report with matched and missing skills
- Personalized learning path and resume improvement suggestions
- Multi-agent mock interview:
  - Career Analysis Agent builds a structured profile from a custom target job
  - Question Agent generates career-specific interview questions
  - Evaluation Agent scores each answer
  - Follow-up Agent decides whether to ask a deeper follow-up
  - Summary Agent creates the final interview report and reviews hidden answer points

## Tech Stack

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- PyMuPDF
- OpenAI Python SDK with DashScope OpenAI-compatible endpoint

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

### AI

- Qwen Plus
- Prompt engineering
- Multi-agent orchestration implemented in Python
- LangGraph is included for planned workflow expansion

## Project Structure

```text
ai_career_copilot/
|-- backend/
|   |-- agents/
|   |   |-- README.md
|   |   |-- agent_utils.py
|   |   |-- career_analysis_agent.py
|   |   |-- interview_question_agent.py
|   |   |-- answer_evaluation_agent.py
|   |   |-- followup_agent.py
|   |   |-- interview_summary_agent.py
|   |   `-- interview_orchestrator.py
|   |-- app.py
|   |-- config.py
|   |-- career_profiles/
|   |   |-- ai_application_engineer.json
|   |   |-- data_analyst.json
|   |   `-- ml_engineer.json
|   |-- models/
|   `-- services/
|       |-- interview_agents.py
|       |-- llm_service.py
|       |-- resume_analyzer.py
|       |-- resume_parser.py
|       |-- report_generator.py
|       `-- skill_matcher.py
|-- frontend/
|   |-- app/
|   |-- lib/
|   `-- package.json
|-- requirements.txt
`-- README.md
```

## Agents

### Career Analysis Agent

File: `backend/agents/career_analysis_agent.py`

Converts a user-entered target job or job description into a structured profile:

- career
- target_description
- required_skills
- bonus_skills
- projects
- interview_focus

This profile is then used by resume analysis and interview question generation.

### Interview Agents

Files:

- `backend/agents/interview_question_agent.py`
- `backend/agents/answer_evaluation_agent.py`
- `backend/agents/followup_agent.py`
- `backend/agents/interview_summary_agent.py`

The workflow is coordinated by:

- `backend/agents/interview_orchestrator.py`

See `backend/agents/README.md` for a quick map of the agents.

## Environment Variables

Create a `.env` file in the project root:

```env
DASHSCOPE_API_KEY=your_dashscope_api_key
```

You can create the key in Alibaba Cloud Model Studio / DashScope:

- https://bailian.console.aliyun.com/
- https://help.aliyun.com/zh/model-studio/get-api-key

Do not commit `.env` or share your API key.

## Setup

### 1. Install Backend Dependencies

From the project root:

```powershell
cd C:\Users\35799\Desktop\ai_career_copilot
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```powershell
cd C:\Users\35799\Desktop\ai_career_copilot\frontend
npm install
```

## Run Locally

Use two PowerShell terminals.

### Terminal 1: Backend

Run from the project root:

```powershell
cd C:\Users\35799\Desktop\ai_career_copilot
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8001 --reload
```

Backend health check:

```text
http://127.0.0.1:8001/health
```

API docs:

```text
http://127.0.0.1:8001/docs
```

### Terminal 2: Frontend

Run from the frontend directory:

```powershell
cd C:\Users\35799\Desktop\ai_career_copilot\frontend
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open the app:

```text
http://127.0.0.1:3000
```

The frontend uses this backend URL by default:

```text
http://127.0.0.1:8001
```

To override it:

```powershell
$env:NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8010"
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

## Main API Endpoints

### Health Check

```http
GET /health
```

### Career List

```http
GET /careers
```

Returns local career templates.

### Generate Dynamic Career Profile

```http
POST /career-profile
```

Request:

```json
{
  "career": "面向企业知识库的 RAG 应用工程师，需要 FastAPI、LangChain、向量数据库经验"
}
```

Response:

```json
{
  "career": "RAG Application Engineer",
  "target_description": "...",
  "required_skills": ["Python", "FastAPI", "RAG"],
  "bonus_skills": ["LangGraph"],
  "projects": ["Enterprise knowledge base RAG system"],
  "interview_focus": ["document parsing", "retrieval quality", "API design"],
  "agent": "Career Analysis Agent",
  "source": "dynamic_agent"
}
```

### Analyze Resume

```http
POST /analyze?career=ai_application_engineer
```

The `career` query parameter can be either a local career key or a custom target job description.

Form data:

- `file`: PDF resume

Response:

```json
{
  "career": "AI Application Engineer",
  "score": 78,
  "matched": ["Python", "FastAPI"],
  "missing": ["Docker", "LangGraph"],
  "learning_path": "...",
  "resume_suggestions": "...",
  "career_profile": {
    "career": "AI Application Engineer",
    "required_skills": ["Python", "FastAPI"]
  }
}
```

### Generate Interview Question

```http
GET /interview-questions?career=ai_application_engineer
```

The `career` query parameter can also be a custom target job description.

Response:

```json
{
  "question": "请介绍一个你做过的 AI 应用项目...",
  "focus_area": "project depth",
  "difficulty": "medium",
  "expected_points": ["project context", "technical design", "result"],
  "agent": "Question Agent"
}
```

The frontend hides `expected_points` during the interview and only shows them in the final review.

### Submit Interview Answer

```http
POST /interview-followup
```

Request:

```json
{
  "career": "ai_application_engineer",
  "question": "current question",
  "answer": "candidate answer",
  "history": []
}
```

### Final Interview Summary

```http
POST /interview-summary
```

Request:

```json
{
  "career": "ai_application_engineer",
  "history": []
}
```

## Troubleshooting

### `DASHSCOPE_API_KEY is not configured`

Create `.env` in the project root:

```env
DASHSCOPE_API_KEY=your_dashscope_api_key
```

Then restart the backend.

### `address already in use 127.0.0.1:3000`

Port `3000` is already occupied. Check the process:

```powershell
netstat -ano | findstr :3000
```

Stop it:

```powershell
taskkill /PID <PID> /F
```

Then start the frontend again.

### `address already in use 127.0.0.1:8001`

Port `8001` is already occupied. Check the process:

```powershell
netstat -ano | findstr :8001
```

Stop it:

```powershell
taskkill /PID <PID> /F
```

Or run the backend on another port and override the frontend API URL:

```powershell
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8010 --reload
```

```powershell
$env:NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8010"
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

### CORS Error

The backend currently allows:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

If you use a different frontend port, update `allow_origins` in `backend/app.py`.

## Development Notes

- The backend defaults to port `8001`.
- The frontend defaults to port `3000`.
- AI features require `DASHSCOPE_API_KEY`.
- Dynamic career analysis is in `backend/agents/career_analysis_agent.py`.
- Each agent has its own file under `backend/agents/`.
- The interview workflow is coordinated by `backend/agents/interview_orchestrator.py`.
- `backend/services/interview_agents.py` is now a compatibility export layer.
- Existing compatibility wrappers are kept in:
  - `career_analysis_agent.py`
  - `interview_question_generator.py`
  - `interview_followup_generator.py`
  - `interview_evaluator.py`
  - `interview_summary_evaluator.py`

## Roadmap

- Cache dynamic career profiles during a user session
- Add persistent interview sessions
- Add user profile and resume history storage
- Move the interview workflow to LangGraph
- Add RAG with career knowledge base retrieval
- Add streaming interview responses
- Add Docker deployment
