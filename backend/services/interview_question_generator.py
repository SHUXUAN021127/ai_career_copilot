from backend.agents.interview_orchestrator import generate_interview_question


def generate_first_question(career):
    return generate_interview_question(career)["question"]
