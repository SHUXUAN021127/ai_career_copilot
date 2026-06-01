from .llm_service import get_llm

client = get_llm()

def rewrite_resume(
    resume_text: str,
    missing_skills: list[str]
):

    prompt = f"""
你是一位资深AI招聘顾问。

当前简历：

{resume_text}

缺失技能：

{missing_skills}

请给出：

1. 简历优化建议
2. 项目描述优化建议
3. 学习路线建议

返回Markdown格式。
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

    return response.choices[0].message.content