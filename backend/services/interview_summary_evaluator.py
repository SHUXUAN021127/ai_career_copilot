
from backend.services.llm_service import get_llm

client = get_llm()

def evaluate_interview(history):

    prompt = f"""
你是一名资深AI技术面试官。

下面是完整面试记录：

{history}

请从以下维度评分：

1. Technical Accuracy
2. Communication
3. Project Depth
4. Problem Solving

返回JSON：

{{
  "overall_score":85,
  "feedback":"..."
}}
"""

    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = (
        response
        .choices[0]
        .message
        .content
    )

    return content