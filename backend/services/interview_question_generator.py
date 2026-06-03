from backend.services.llm_service import get_llm

client = get_llm()

def generate_questions(career):

    prompt = f"""
你是一名技术面试官。

岗位：

{career}

请生成5道面试题。

格式：

Q1:
Q2:
Q3:
Q4:
Q5:
"""

    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )

    return (
        response
        .choices[0]
        .message
        .content
    )