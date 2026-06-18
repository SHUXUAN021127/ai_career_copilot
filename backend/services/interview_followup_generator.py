from backend.services.llm_service import get_llm
import json

client = get_llm()


def generate_followup(
        question,
        answer
):

    prompt = f"""
你是一名高级技术面试官。

当前问题：

{question}

候选人回答：

{answer}

请判断：

1. 回答是否完整
2. 是否需要继续追问

返回JSON

如果继续追问：

{{
    "action":"followup",
    "question":"新的追问"
}}

如果进入下一题：

{{
    "action":"next"
}}
"""

    response = (
        client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {
                    "role":"user",
                    "content":prompt
                }
            ],
            temperature=0
        )
    )

    return json.loads(
        response
        .choices[0]
        .message
        .content
    )