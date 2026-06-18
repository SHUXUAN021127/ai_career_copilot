from backend.services.llm_service import get_llm

client = get_llm()


def generate_first_question(career):

    prompt = f"""
你是一名资深AI面试官。

岗位：

{career}

请生成第一道面试题。

只返回问题。
"""

    response = (
        client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {
                    "role":"user",
                    "content":prompt
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