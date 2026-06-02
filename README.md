# AI Career Copilot

An AI-powered career assistant that helps users analyze resumes, identify skill gaps, and generate personalized learning paths based on target career directions.

## Features

### Resume Analysis

* Upload PDF resumes
* Extract resume content automatically
* Analyze skills, projects, and education using Qwen LLM

### Career Profile Matching

* Built-in career knowledge base
* Supports multiple career paths:

  * AI Application Engineer
  * ML Engineer
  * Data Analyst
  * Backend Engineer

### Skill Gap Analysis

* Compare resume skills with target career requirements
* Identify missing skills
* Calculate matching score

### Learning Path Generation

* Generate personalized learning roadmap
* Recommend technologies and projects
* Provide career development suggestions

---

## Architecture

```text
Resume PDF
      ↓

Resume Parser
      ↓

Resume Analyzer (Qwen)
      ↓

Career Profile Knowledge Base
      ↓

Skill Matcher
      ↓

Learning Path Generator
      ↓

Final Report
```

---

## Tech Stack

### Backend

* Python
* FastAPI
* Pydantic

### AI

* Qwen Plus
* Prompt Engineering

### Data

* JSON Career Profiles

### Future Roadmap

* PostgreSQL
* LangGraph
* Multi-Agent Workflow
* RAG Knowledge Base
* Mock Interview Agent

---

## Project Structure

```text
backend/

├── career_profiles/
├── models/
├── services/
├── uploads/

├── app.py
├── config.py

├── run_jd_analyzer.py
├── run_report.py
├── run_skill_matcher.py
```

---

## API Endpoints

### Get Career List

```http
GET /careers
```

Response:

```json
{
  "careers": [
    "ai_application_engineer",
    "ml_engineer",
    "data_analyst",
    "backend_engineer"
  ]
}
```

---

### Analyze Resume

```http
POST /analyze
```

Parameters:

* file (PDF Resume)
* career

Response:

```json
{
  "career": "AI Application Engineer",
  "score": 78,
  "matched": [
    "Python",
    "FastAPI",
    "LangChain"
  ],
  "missing": [
    "Docker",
    "LangGraph"
  ],
  "learning_path": "..."
}
```

---

## Quick Start

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai_career_copilot.git
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create `.env`

```env
DASHSCOPE_API_KEY=YOUR_API_KEY
```

### Run Server

```bash
uvicorn backend.app:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

---

## Future Improvements

* [ ] Frontend (Next.js)
* [ ] PostgreSQL Persistence
* [ ] Multi-Agent Architecture
* [ ] LangGraph Workflow
* [ ] Interview Simulation Agent
* [ ] Streaming Response
* [ ] Docker Deployment

---

## License

MIT License
