from backend.services.llm_service import get_llm

client = get_llm()

def generate_learning_path(
    career,
    missing_skills
):

    prompt = f"""
目标岗位：

{career}

缺失技能：

{missing_skills}

请制定3个月学习路线。

要求：

1. 分阶段
2. 具体到项目实践
3. 输出Markdown
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
