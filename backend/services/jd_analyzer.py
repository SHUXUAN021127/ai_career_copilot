from services.llm_service import get_llm

client = get_llm()


def analyze_jd(jd_text: str):

    prompt = f"""
你是一位资深技术招聘专家。

分析以下岗位描述。

仅返回JSON：

{{
    "required_skills": [],
    "preferred_skills": [],
    "responsibilities": []
}}

岗位描述：

{jd_text}
"""

    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content