from backend.services.llm_service import get_llm

client = get_llm()


def evaluate_answer(
        question,
        answer
):

    prompt = f"""
你是一名AI面试官。

面试题：

{question}

候选人回答：

{answer}

请输出：

1. Score(0-100)

2. Strengths

3. Weaknesses

4. Better Answer
"""

    response = (
        client
        .chat
        .completions
        .create(
            model="qwen-plus",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
    )

    return (
        response
        .choices[0]
        .message
        .content
    )