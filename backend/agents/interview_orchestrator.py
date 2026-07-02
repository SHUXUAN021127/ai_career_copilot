from typing import Any

from backend.agents.answer_evaluation_agent import evaluation_agent
from backend.agents.followup_agent import MAX_INTERVIEW_QUESTIONS, followup_agent
from backend.agents.interview_question_agent import question_agent
from backend.agents.interview_summary_agent import summary_agent


def generate_interview_question(
    career: str,
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    question = question_agent.generate(career, history)
    question["agent"] = question_agent.name
    return question


def run_interview_turn(
    question: str,
    answer: str,
    career: str | None = None,
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    history = history or []
    answered_count = len(history) + 1

    evaluation = evaluation_agent.evaluate(question, answer, career)
    decision = followup_agent.decide(question, answer, evaluation, answered_count)

    next_question = None
    if decision["action"] == "next":
        next_question = question_agent.generate(career or "AI Application Engineer", history)
        decision["question"] = next_question["question"]

    return {
        "action": decision["action"],
        "question": decision.get("question", ""),
        "reason": decision.get("reason", ""),
        "evaluation": evaluation,
        "next_question_meta": next_question,
        "progress": {
            "answered": min(answered_count, MAX_INTERVIEW_QUESTIONS),
            "total": MAX_INTERVIEW_QUESTIONS,
        },
        "agent_trace": [
            evaluation_agent.name,
            followup_agent.name,
            question_agent.name if decision["action"] == "next" else None,
        ],
    }


def summarize_interview(
    history: list[dict[str, Any]],
    career: str | None = None,
) -> dict[str, Any]:
    result = summary_agent.summarize(history, career)
    result["agent"] = summary_agent.name
    return result
