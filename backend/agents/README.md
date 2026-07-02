# AI Career Copilot Agents

Each agent is implemented in its own Python file. The orchestrator imports these agents and coordinates the interview workflow.

## Directory Map

```text
backend/agents/
|-- __init__.py
|-- agent_utils.py
|-- career_analysis_agent.py
|-- interview_question_agent.py
|-- answer_evaluation_agent.py
|-- followup_agent.py
|-- interview_summary_agent.py
`-- interview_orchestrator.py
```

## Agents

### Career Analysis Agent

File: `career_analysis_agent.py`

Class: `CareerAnalysisAgent`

Responsibility:

- Converts a user-entered target job or job description into a structured career profile.
- Allows the project to avoid relying only on local `career_profiles/*.json`.
- Used by resume analysis and interview question generation.

### Question Agent

File: `interview_question_agent.py`

Class: `InterviewQuestionAgent`

Responsibility:

- Generates interview questions based on the target career profile.
- Produces hidden `expected_points` for final review only.

### Evaluation Agent

File: `answer_evaluation_agent.py`

Class: `AnswerEvaluationAgent`

Responsibility:

- Scores each candidate answer.
- Returns strengths, weaknesses, improvement suggestions, and a better answer example.

### Follow-up Agent

File: `followup_agent.py`

Class: `FollowupAgent`

Responsibility:

- Decides whether to ask a deeper follow-up question.
- Decides whether to move to the next question.
- Ends the interview when the maximum question count is reached.

### Summary Agent

File: `interview_summary_agent.py`

Class: `InterviewSummaryAgent`

Responsibility:

- Generates the final interview report.
- Reviews hidden expected answer points after the interview is complete.

## Orchestrator

File: `interview_orchestrator.py`

Responsibility:

- Calls Evaluation Agent, Follow-up Agent, Question Agent, and Summary Agent in the right order.
- Keeps API-facing functions stable:
  - `generate_interview_question`
  - `run_interview_turn`
  - `summarize_interview`

## Compatibility Layer

The old service imports still exist under `backend/services/` so existing API code and scripts keep working. New code should prefer imports from `backend.agents`.
