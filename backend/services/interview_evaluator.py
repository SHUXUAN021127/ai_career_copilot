from backend.agents.answer_evaluation_agent import evaluation_agent


def evaluate_answer(question, answer):
    return evaluation_agent.evaluate(question, answer)
