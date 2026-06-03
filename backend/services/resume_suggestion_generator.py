from backend.services.llm_service import get_llm

client = get_llm()


def generate_resume_suggestions(
        resume_info,
        missing_skills
):

    prompt = f"""
你是一名资深技术招聘顾问。

候选人简历信息：

{resume_info}

缺失技能：

{missing_skills}

请给出：

1. 简历优化建议

2. 应补充的项目经验

3. 应突出展示的技能

4. 应修改的描述方式

控制在300字以内。
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

    return (
        response
        .choices[0]
        .message
        .content
    )