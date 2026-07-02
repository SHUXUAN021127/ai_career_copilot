from typing import Any

from backend.agents.agent_utils import chat, extract_json
from backend.services.career_profile_service import load_career_profile


class CareerAnalysisAgent:
    name = "Career Analysis Agent"

    def analyze(self, target_career: str) -> dict[str, Any]:
        target_career = target_career.strip()

        prompt = f"""
你是职业画像分析 Agent。

用户输入的目标职业或岗位描述：
{target_career}

请根据这个目标生成一个用于简历匹配和模拟面试的岗位画像。

要求：
1. 不要只复述岗位名称，要推断真实工作内容和能力要求。
2. required_skills 控制在 6-10 项，适合做简历匹配。
3. interview_focus 控制在 4-6 项，适合生成技术面试题。
4. projects 给出 3-5 个适合候选人准备或展示的项目方向。

只返回 JSON，不要返回 Markdown：
{{
  "career": "规范化后的目标岗位名称",
  "target_description": "对该岗位的简短画像",
  "required_skills": ["核心必备技能"],
  "bonus_skills": ["加分技能"],
  "projects": ["推荐项目方向"],
  "interview_focus": ["面试重点考察方向"]
}}
"""

        fallback = {
            "career": target_career or "Custom Career",
            "target_description": "根据用户输入动态生成的目标岗位画像。",
            "required_skills": ["Python", "项目经验", "问题分析", "沟通表达"],
            "bonus_skills": [],
            "projects": ["围绕目标岗位准备一个完整项目案例"],
            "interview_focus": ["项目深度", "技术理解", "问题解决", "业务匹配度"],
        }

        profile = extract_json(chat(prompt, temperature=0), fallback)
        profile["agent"] = self.name
        return profile


career_analysis_agent = CareerAnalysisAgent()


def resolve_career_profile(target_career: str) -> dict[str, Any]:
    try:
        profile = load_career_profile(target_career)
        profile["source"] = "local_profile"
        return profile
    except FileNotFoundError:
        profile = career_analysis_agent.analyze(target_career)
        profile["source"] = "dynamic_agent"
        return profile
