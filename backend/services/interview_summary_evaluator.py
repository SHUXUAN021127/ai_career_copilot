from backend.agents.interview_orchestrator import summarize_interview


def evaluate_interview(history, career=None):
    return summarize_interview(history, career)
