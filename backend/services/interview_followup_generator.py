from backend.agents.interview_orchestrator import run_interview_turn


def generate_followup(question, answer, career=None, history=None):
    return run_interview_turn(question, answer, career, history)
