from typing import Any

from backend.agents.agent_utils import chat, extract_json


class AnswerEvaluationAgent:
    name = "Evaluation Agent"

    def evaluate(
        self,
        question: str,
        answer: str,
        career: str | None = None,
    ) -> dict[str, Any]:
        prompt = f"""
你是候选人模拟面试中的「评价官 Agent」。

目标岗位：
{career or "未指定"}

面试题：
{question}

候选人回答：
{answer}

请从技术准确性、结构表达、项目深度、问题解决能力四个维度评价回答。

只返回 JSON，不要返回 Markdown：
{{
  "score": 0,
  "level": "weak|average|good|excellent",
  "strengths": ["优点"],
  "weaknesses": ["不足"],
  "improvement_suggestions": ["可执行的改进建议"],
  "better_answer": "更好的回答示例，控制在 180 字以内"
}}
"""

        fallback = {
            "score": 60,
            "level": "average",
            "strengths": ["回答覆盖了部分问题"],
            "weaknesses": ["技术细节和项目结果还不够具体"],
            "improvement_suggestions": ["补充具体技术方案、权衡原因和量化结果"],
            "better_answer": "建议按背景、任务、行动、结果组织回答，并补充关键技术细节。",
        }

        result = extract_json(chat(prompt, temperature=0), fallback)
        result["score"] = int(result.get("score", 60))
        return result


evaluation_agent = AnswerEvaluationAgent()
