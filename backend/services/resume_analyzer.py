from services.llm_service import get_llm
import json

client = get_llm()

def analyze_resume(resume_text: str):

    prompt = f"""
你是一位资深AI招聘顾问。

请分析下面简历。

仅返回JSON，不要返回任何解释。

格式如下：

{{
    "name": "",
    "skills": [],
    "projects": [],
    "education": []
}}

简历内容：

{resume_text}
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