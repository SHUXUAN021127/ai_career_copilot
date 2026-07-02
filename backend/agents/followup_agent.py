from typing import Any

from backend.agents.agent_utils import chat, extract_json, to_json_text

MAX_INTERVIEW_QUESTIONS = 5


class FollowupAgent:
    name = "Follow-up Agent"

    def decide(
        self,
        question: str,
        answer: str,
        evaluation: dict[str, Any],
        answered_count: int,
    ) -> dict[str, Any]:
        prompt = f"""
你是候选人模拟面试中的「追问官 Agent」。

当前题目：
{question}

候选人回答：
{answer}

评价结果：
{to_json_text(evaluation)}

已经完成题目数：{answered_count}
最多题目数：{MAX_INTERVIEW_QUESTIONS}

请判断下一步：
1. 如果回答缺少关键技术细节，生成一个追问。
2. 如果回答已经足够，进入下一题。
3. 如果已经达到最多题目数，结束面试。

只返回 JSON，不要返回 Markdown：
{{
  "action": "followup|next|finish",
  "question": "当 action 为 followup 时填写追问，否则为空字符串",
  "reason": "做出该决策的原因"
}}
"""

        fallback = {
            "action": "next",
            "question": "",
            "reason": "回答可以进入下一题",
        }

        result = extract_json(chat(prompt, temperature=0), fallback)
        if answered_count >= MAX_INTERVIEW_QUESTIONS:
            result["action"] = "finish"
            result["question"] = ""
            result["reason"] = "已完成本轮模拟面试的题目数量"
        elif result.get("action") not in {"followup", "next", "finish"}:
            result["action"] = "next"
        return result


followup_agent = FollowupAgent()
