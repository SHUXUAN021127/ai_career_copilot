from typing import Any

from backend.agents.agent_utils import chat, extract_json, to_json_text


class InterviewSummaryAgent:
    name = "Summary Agent"

    def summarize(
        self,
        history: list[dict[str, Any]],
        career: str | None = None,
    ) -> dict[str, Any]:
        prompt = f"""
你是候选人模拟面试中的「总结官 Agent」。

目标岗位：
{career or "未指定"}

完整面试记录：
{to_json_text(history)}

请生成最终面试报告。

要求：
1. 结合每题隐藏的 expected_points 做复盘。
2. 不要只给泛泛建议，要指出候选人回答和优秀回答要点之间的差距。
3. practice_plan 要可执行。

只返回 JSON，不要返回 Markdown：
{{
  "overall_score": 0,
  "dimension_scores": {{
    "technical_accuracy": 0,
    "communication": 0,
    "project_depth": 0,
    "problem_solving": 0
  }},
  "summary": "总体评价",
  "top_strengths": ["最突出的优势"],
  "priority_improvements": ["最需要优先改进的问题"],
  "practice_plan": ["下一步练习建议"],
  "question_reviews": [
    {{
      "question": "题目",
      "expected_points": ["本题优秀回答应该覆盖的要点"],
      "candidate_gap": "候选人回答和优秀回答要点之间的主要差距",
      "review": "复盘建议"
    }}
  ]
}}
"""

        fallback = {
            "overall_score": 60,
            "dimension_scores": {
                "technical_accuracy": 60,
                "communication": 60,
                "project_depth": 60,
                "problem_solving": 60,
            },
            "summary": "本轮面试完成，但还需要更多结构化回答和技术细节。",
            "top_strengths": ["能够完成基本回答"],
            "priority_improvements": ["补充具体项目细节和结果指标"],
            "practice_plan": ["用 STAR 结构复盘 2 个项目", "准备常见技术方案的取舍说明"],
            "question_reviews": [
                {
                    "question": item.get("question", ""),
                    "expected_points": item.get("expected_points", []),
                    "candidate_gap": "请对照优秀回答要点补充遗漏的技术细节。",
                    "review": "复盘时优先检查回答是否覆盖关键概念、技术取舍和结果指标。",
                }
                for item in history
            ],
        }

        result = extract_json(chat(prompt, temperature=0), fallback)
        result["overall_score"] = int(result.get("overall_score", 60))
        return result


summary_agent = InterviewSummaryAgent()
