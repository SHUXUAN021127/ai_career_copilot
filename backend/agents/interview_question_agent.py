from typing import Any

from backend.agents.agent_utils import chat, extract_json, to_json_text
from backend.agents.career_analysis_agent import resolve_career_profile


class InterviewQuestionAgent:
    name = "Question Agent"

    def generate(
        self,
        career: str,
        history: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        history = history or []
        career_profile = resolve_career_profile(career)

        prompt = f"""
你是候选人模拟面试中的「出题官 Agent」。

目标岗位资料：
{to_json_text(career_profile)}

已完成面试记录：
{to_json_text(history)}

请生成一道新的技术面试题。

要求：
1. 题目要贴近目标岗位和岗位技能。
2. 避免重复已经问过的问题。
3. 优先考察真实项目能力、技术理解和工程落地。
4. 难度循序渐进。
5. expected_points 是隐藏字段，只给最后复盘使用，不能在答题阶段提示给候选人。

只返回 JSON，不要返回 Markdown：
{{
  "question": "面试题",
  "focus_area": "考察点",
  "difficulty": "easy|medium|hard",
  "expected_points": ["优秀回答应覆盖的要点"]
}}
"""

        fallback = {
            "question": "请结合一个你做过的项目，说明你如何使用目标岗位相关技术解决实际问题。",
            "focus_area": "项目经验与技术落地",
            "difficulty": "medium",
            "expected_points": ["项目背景", "技术选择", "实现过程", "结果与反思"],
        }

        return extract_json(chat(prompt), fallback)


question_agent = InterviewQuestionAgent()
