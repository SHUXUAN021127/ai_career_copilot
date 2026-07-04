"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type CareerProfile = {
  career: string;
  target_description?: string;
  required_skills?: string[];
  bonus_skills?: string[];
  projects?: string[];
  interview_focus?: string[];
  source?: "local_profile" | "dynamic_agent";
  agent?: string;
};

type ResumeReport = {
  career: string;
  score: number;
  level?: string;
  matched_count?: number;
  required_count?: number;
  matched?: string[];
  missing?: string[];
  learning_path?: string;
  resume_suggestions?: string;
  career_profile?: CareerProfile;
};

type QuestionMeta = {
  question: string;
  focus_area?: string;
  difficulty?: "easy" | "medium" | "hard";
  expected_points?: string[];
  agent?: string;
};

type Evaluation = {
  score: number;
  level: "weak" | "average" | "good" | "excellent";
  strengths?: string[];
  weaknesses?: string[];
  improvement_suggestions?: string[];
  better_answer?: string;
};

type InterviewTurn = {
  question: string;
  answer: string;
  focus_area?: string;
  difficulty?: "easy" | "medium" | "hard";
  expected_points?: string[];
  evaluation?: Evaluation;
  reason?: string;
};

type QuestionReview = {
  question: string;
  expected_points?: string[];
  candidate_gap?: string;
  review?: string;
};

type SummaryReport = {
  overall_score: number;
  dimension_scores?: Record<string, number>;
  summary?: string;
  top_strengths?: string[];
  priority_improvements?: string[];
  practice_plan?: string[];
  question_reviews?: QuestionReview[];
  agent?: string;
};

const difficultyLabel: Record<string, string> = {
  easy: "基础",
  medium: "中等",
  hard: "进阶",
};

const levelLabel: Record<string, string> = {
  weak: "待加强",
  average: "一般",
  good: "良好",
  excellent: "优秀",
};

export default function Home() {
  const [careers, setCareers] = useState<string[]>([]);
  const [career, setCareer] = useState("");
  const [customCareer, setCustomCareer] = useState("");
  const [careerProfile, setCareerProfile] = useState<CareerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeReport | null>(null);
  const [loading, setLoading] = useState(false);

  const [interviewLoading, setInterviewLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionMeta | null>(null);
  const [chatHistory, setChatHistory] = useState<InterviewTurn[]>([]);
  const [answer, setAnswer] = useState("");
  const [finalReport, setFinalReport] = useState<SummaryReport | null>(null);
  const [agentTrace, setAgentTrace] = useState<string[]>([]);
  const [interviewStatus, setInterviewStatus] = useState("输入目标岗位后，可以开始模拟面试。");

  const targetCareer = useMemo(() => customCareer.trim() || career, [customCareer, career]);
  const answeredCount = chatHistory.length;
  const canUseAi = Boolean(targetCareer);

  useEffect(() => {
    const loadCareers = async () => {
      try {
        const res = await api.get("/careers");
        const careerList = res.data.careers || [];
        setCareers(careerList);

        if (careerList.length > 0) {
          setCareer(careerList[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadCareers();
  }, []);

  const analyzeCareerProfile = async () => {
    if (!targetCareer) {
      alert("请先输入或选择目标岗位。");
      return;
    }

    setProfileLoading(true);

    try {
      const response = await api.post("/career-profile", {
        career: targetCareer,
      });
      setCareerProfile(response.data);
    } catch (error) {
      console.error(error);
      alert("岗位画像生成失败，请检查后端服务和 DASHSCOPE_API_KEY。");
    } finally {
      setProfileLoading(false);
    }
  };

  const analyzeResume = async () => {
    if (!targetCareer || !file) {
      alert("请输入目标岗位并上传 PDF 简历。");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        `/analyze?career=${encodeURIComponent(targetCareer)}`,
        formData,
      );
      setResult(response.data);
      setCareerProfile(response.data.career_profile || null);
    } catch (error) {
      console.error(error);
      alert("简历分析失败，请检查后端服务和 DASHSCOPE_API_KEY。");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    if (!canUseAi) {
      alert("请先输入或选择目标岗位。");
      return;
    }

    setInterviewLoading(true);
    setFinalReport(null);
    setChatHistory([]);
    setAgentTrace([]);
    setAnswer("");

    try {
      const response = await api.get(
        `/interview-questions?career=${encodeURIComponent(targetCareer)}`,
      );
      setCurrentQuestion(response.data);
      setInterviewStatus("出题官 Agent 已基于目标岗位生成第一题。");
    } catch (error) {
      console.error(error);
      alert("获取面试题失败，请确认后端服务和 DASHSCOPE_API_KEY。");
    } finally {
      setInterviewLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) {
      alert("请输入本题回答。");
      return;
    }

    setSubmittingAnswer(true);

    try {
      const response = await api.post("/interview-followup", {
        career: targetCareer,
        question: currentQuestion.question,
        answer,
        history: chatHistory,
      });

      const completedTurn: InterviewTurn = {
        question: currentQuestion.question,
        answer,
        focus_area: currentQuestion.focus_area,
        difficulty: currentQuestion.difficulty,
        expected_points: currentQuestion.expected_points,
        evaluation: response.data.evaluation,
        reason: response.data.reason,
      };

      setChatHistory((prev) => [...prev, completedTurn]);
      setAgentTrace((response.data.agent_trace || []).filter(Boolean));

      if (response.data.action === "finish") {
        setCurrentQuestion(null);
        setInterviewStatus("本轮题目已完成，可以生成最终报告。");
      } else {
        setCurrentQuestion({
          question: response.data.question,
          ...(response.data.next_question_meta || {}),
        });
        setInterviewStatus(
          response.data.action === "followup"
            ? "追问官 Agent 认为需要继续深挖这一题。"
            : "评价官 Agent 已完成评分，出题官 Agent 已切换到下一题。",
        );
      }

      setAnswer("");
    } catch (error) {
      console.error(error);
      alert("提交回答失败，请稍后重试。");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const finishInterview = async () => {
    if (chatHistory.length === 0) {
      alert("至少完成一道题后再生成报告。");
      return;
    }

    setInterviewLoading(true);

    try {
      const response = await api.post("/interview-summary", {
        career: targetCareer,
        history: chatHistory,
      });

      setFinalReport(response.data.result);
      setInterviewStatus("总结官 Agent 已生成最终面试报告。");
    } catch (error) {
      console.error(error);
      alert("生成面试报告失败。");
    } finally {
      setInterviewLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8">
        <header className="flex flex-col gap-2 border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
            AI Career Copilot
          </p>
          <h1 className="text-3xl font-semibold">简历分析与多 Agent 模拟面试</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            选择职业模板，或输入真实目标岗位。系统会生成岗位画像，并给出更接近真实产品报告的简历分析结果。
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr_auto] lg:items-end">
            <label className="flex flex-col gap-2 text-sm font-medium">
              本地职业模板
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                {careers.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              自定义目标岗位或岗位描述
              <input
                value={customCareer}
                onChange={(e) => setCustomCareer(e.target.value)}
                placeholder="例如：面向企业知识库的 RAG 应用工程师，需要 FastAPI、LangChain、向量数据库经验"
                className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-blue-600"
              />
            </label>

            <button
              onClick={analyzeCareerProfile}
              disabled={profileLoading || !canUseAi}
              className="h-11 rounded-md border border-zinc-300 px-5 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              {profileLoading ? "生成中..." : "生成岗位画像"}
            </button>
          </div>

          <p className="mt-3 text-sm text-zinc-600">
            当前目标：<span className="font-medium text-zinc-950">{targetCareer || "未选择"}</span>
          </p>

          {careerProfile && <CareerProfilePanel profile={careerProfile} />}
        </section>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_auto] md:items-end">
          <label className="flex flex-col gap-2 text-sm font-medium">
            PDF 简历
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>

          <button
            onClick={analyzeResume}
            disabled={loading || !canUseAi}
            className="h-11 rounded-md bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {loading ? "分析中..." : "生成简历分析报告"}
          </button>
        </section>

        {result && <ResumeReportDashboard report={result} />}

        <InterviewPanel
          agentTrace={agentTrace}
          answeredCount={answeredCount}
          answer={answer}
          chatHistory={chatHistory}
          currentQuestion={currentQuestion}
          finalReport={finalReport}
          interviewLoading={interviewLoading}
          interviewStatus={interviewStatus}
          canUseAi={canUseAi}
          submittingAnswer={submittingAnswer}
          onAnswerChange={setAnswer}
          onFinish={finishInterview}
          onStart={startInterview}
          onSubmit={submitAnswer}
        />
      </div>
    </main>
  );
}

function ResumeReportDashboard({ report }: { report: ResumeReport }) {
  const requiredCount = report.required_count || report.career_profile?.required_skills?.length || 0;
  const matchedCount = report.matched_count || report.matched?.length || 0;
  const missingCount = report.missing?.length || Math.max(requiredCount - matchedCount, 0);
  const scoreInfo = getScoreInfo(report.score);

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 bg-zinc-950 px-5 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-200">Resume Intelligence Report</p>
            <h2 className="mt-1 text-2xl font-semibold">{report.career}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
              基于目标岗位画像、简历技能提取和岗位能力要求生成的候选人准备度报告。
            </p>
          </div>
          <div className="grid min-w-80 grid-cols-3 gap-2">
            <MetricTile label="匹配技能" value={`${matchedCount}`} tone="emerald" />
            <MetricTile label="待补齐" value={`${missingCount}`} tone="amber" />
            <MetricTile label="要求项" value={`${requiredCount || "-"}`} tone="blue" />
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-5 lg:border-b-0 lg:border-r">
          <ScoreCard score={report.score} level={report.level || scoreInfo.label} />
          <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-semibold">报告解读</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{scoreInfo.description}</p>
          </div>
          {report.career_profile && (
            <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm font-semibold">岗位画像来源</p>
              <p className="mt-2 text-sm text-zinc-600">
                {report.career_profile.source === "dynamic_agent" ? "Career Analysis Agent 动态生成" : "本地职业模板"}
              </p>
              {report.career_profile.target_description && (
                <p className="mt-3 text-sm leading-6 text-zinc-700">{report.career_profile.target_description}</p>
              )}
            </div>
          )}
        </aside>

        <div className="flex flex-col gap-5 p-5">
          <div className="grid gap-4 xl:grid-cols-2">
            <SkillMatrix
              matched={report.matched || []}
              missing={report.missing || []}
              required={report.career_profile?.required_skills || []}
            />
            <PriorityPanel
              bonus={report.career_profile?.bonus_skills || []}
              missing={report.missing || []}
              projects={report.career_profile?.projects || []}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <InsightPanel title="学习路径" content={report.learning_path} accent="blue" />
            <InsightPanel title="简历优化建议" content={report.resume_suggestions} accent="emerald" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CareerProfilePanel({ profile }: { profile: CareerProfile }) {
  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{profile.career}</h3>
        <span className="rounded-full bg-white px-2 py-1 text-xs text-zinc-600">
          {profile.source === "dynamic_agent" ? "动态岗位画像" : "本地职业模板"}
        </span>
      </div>
      {profile.target_description && (
        <p className="mt-2 text-sm leading-6 text-zinc-700">{profile.target_description}</p>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CompactList title="核心技能" items={profile.required_skills || []} />
        <CompactList title="面试重点" items={profile.interview_focus || []} />
      </div>
    </div>
  );
}

function ScoreCard({ score, level }: { score: number; level: string }) {
  const scoreInfo = getScoreInfo(score);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">岗位准备度</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">{score}%</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${scoreInfo.badgeClass}`}>
          {level}
        </span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full ${scoreInfo.barClass}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-zinc-500">
        <span>起步</span>
        <span>可投递</span>
        <span>强匹配</span>
      </div>
    </div>
  );
}

function SkillMatrix({
  matched,
  missing,
  required,
}: {
  matched: string[];
  missing: string[];
  required: string[];
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">技能匹配矩阵</h3>
          <p className="mt-1 text-sm text-zinc-500">区分已经具备和优先补齐的岗位技能。</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
          {matched.length}/{required.length || matched.length + missing.length}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SkillColumn title="已匹配" items={matched} tone="emerald" />
        <SkillColumn title="待补齐" items={missing} tone="rose" />
      </div>
    </div>
  );
}

function PriorityPanel({
  bonus,
  missing,
  projects,
}: {
  bonus: string[];
  missing: string[];
  projects: string[];
}) {
  const topMissing = missing.slice(0, 4);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="font-semibold">下一步优先级</h3>
      <p className="mt-1 text-sm text-zinc-500">把报告结论转成更容易执行的准备动作。</p>

      <div className="mt-4 flex flex-col gap-4">
        <PriorityBlock
          label="优先补齐"
          items={topMissing.length ? topMissing : ["暂无明显技能缺口"]}
          tone="amber"
        />
        <PriorityBlock
          label="可作为加分项"
          items={bonus.length ? bonus.slice(0, 4) : ["暂无额外加分项"]}
          tone="blue"
        />
        <PriorityBlock
          label="推荐项目方向"
          items={projects.length ? projects.slice(0, 3) : ["围绕目标岗位准备一个完整项目案例"]}
          tone="emerald"
        />
      </div>
    </div>
  );
}

function InsightPanel({
  title,
  content,
  accent,
}: {
  title: string;
  content?: string;
  accent: "blue" | "emerald";
}) {
  const lines = normalizeLines(content);
  const accentClass = accent === "blue" ? "border-blue-200 bg-blue-50" : "border-emerald-200 bg-emerald-50";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className={`rounded-md border px-4 py-3 ${accentClass}`}>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600">
          {title === "学习路径" ? "按阶段补齐能力，形成可展示的项目产出。" : "面向岗位要求优化表达、项目和技能证明。"}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {lines.length > 0 ? (
          lines.map((line, index) => (
            <div key={`${line}-${index}`} className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700">
              {line}
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">暂无数据</p>
        )}
      </div>
    </div>
  );
}

function InterviewPanel({
  agentTrace,
  answeredCount,
  answer,
  chatHistory,
  currentQuestion,
  finalReport,
  interviewLoading,
  interviewStatus,
  canUseAi,
  submittingAnswer,
  onAnswerChange,
  onFinish,
  onStart,
  onSubmit,
}: {
  agentTrace: string[];
  answeredCount: number;
  answer: string;
  chatHistory: InterviewTurn[];
  currentQuestion: QuestionMeta | null;
  finalReport: SummaryReport | null;
  interviewLoading: boolean;
  interviewStatus: string;
  canUseAi: boolean;
  submittingAnswer: boolean;
  onAnswerChange: (value: string) => void;
  onFinish: () => void;
  onStart: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">多 Agent 模拟面试</h2>
          <p className="mt-1 text-sm text-zinc-600">{interviewStatus}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onStart}
            disabled={interviewLoading || !canUseAi}
            className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {interviewLoading && !finalReport ? "生成中..." : "开始新面试"}
          </button>
          <button
            onClick={onFinish}
            disabled={interviewLoading || chatHistory.length === 0}
            className="h-10 rounded-md border border-zinc-300 px-4 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            生成报告
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          {chatHistory.map((item, index) => (
            <InterviewHistoryItem key={`${item.question}-${index}`} index={index} turn={item} />
          ))}

          {currentQuestion && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-blue-950">当前题目</p>
                {currentQuestion.difficulty && (
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-blue-800">
                    {difficultyLabel[currentQuestion.difficulty] || currentQuestion.difficulty}
                  </span>
                )}
                {currentQuestion.focus_area && (
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-blue-800">
                    {currentQuestion.focus_area}
                  </span>
                )}
              </div>
              <p className="mt-3 leading-7">{currentQuestion.question}</p>
            </div>
          )}

          {currentQuestion && (
            <div className="flex flex-col gap-3">
              <textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="输入你的回答。建议按背景、思路、实现、结果和反思组织。"
                className="min-h-40 resize-y rounded-lg border border-zinc-300 p-3 text-sm leading-6 outline-none focus:border-blue-600"
              />
              <button
                onClick={onSubmit}
                disabled={submittingAnswer}
                className="h-10 w-fit rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {submittingAnswer ? "评价中..." : "提交回答"}
              </button>
            </div>
          )}

          {!currentQuestion && chatHistory.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              点击“开始新面试”后，出题官 Agent 会基于当前目标岗位生成第一道题。
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold">面试进度</p>
            <p className="mt-2 text-3xl font-semibold">{answeredCount}/5</p>
            <div className="mt-3 h-2 rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-blue-700"
                style={{ width: `${Math.min(answeredCount / 5, 1) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold">最近协作 Agent</p>
            <div className="mt-3 flex flex-col gap-2">
              {(agentTrace.length ? agentTrace : ["Career Analysis Agent", "Question Agent"]).map((agent) => (
                <span key={agent} className="rounded-md bg-white px-3 py-2 text-sm text-zinc-700">
                  {agent}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {finalReport && <FinalReport report={finalReport} />}
    </section>
  );
}

function InterviewHistoryItem({ index, turn }: { index: number; turn: InterviewTurn }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <p className="text-sm font-semibold text-zinc-500">第 {index + 1} 轮</p>
      <div className="mt-3 rounded-md bg-zinc-50 p-3">
        <p className="text-sm font-medium">面试官</p>
        <p className="mt-1 text-sm leading-6">{turn.question}</p>
      </div>
      <div className="mt-3 rounded-md bg-emerald-50 p-3">
        <p className="text-sm font-medium">候选人</p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{turn.answer}</p>
      </div>
      {turn.evaluation && (
        <div className="mt-3 rounded-md border border-zinc-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">单题反馈</p>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">
              {turn.evaluation.score} 分
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">
              {levelLabel[turn.evaluation.level] || turn.evaluation.level}
            </span>
          </div>
          <FeedbackList title="优势" items={turn.evaluation.strengths || []} />
          <FeedbackList title="改进点" items={turn.evaluation.weaknesses || []} />
          {turn.evaluation.better_answer && (
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              <span className="font-medium">参考回答：</span>
              {turn.evaluation.better_answer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FinalReport({ report }: { report: SummaryReport }) {
  return (
    <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-900">{report.agent || "Summary Agent"}</p>
          <h3 className="text-xl font-semibold text-emerald-950">最终面试报告</h3>
        </div>
        <p className="text-4xl font-semibold text-emerald-900">{report.overall_score}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-emerald-950">{report.summary}</p>

      {report.dimension_scores && (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {Object.entries(report.dimension_scores).map(([key, value]) => (
            <div key={key} className="rounded-md bg-white p-3">
              <p className="text-xs uppercase text-zinc-500">{key.replaceAll("_", " ")}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {report.question_reviews && report.question_reviews.length > 0 && (
        <div className="mt-4 rounded-md bg-white p-4">
          <p className="text-sm font-semibold">逐题复盘要点</p>
          <div className="mt-3 flex flex-col gap-4">
            {report.question_reviews.map((item, index) => (
              <div key={`${item.question}-${index}`} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0">
                <p className="text-sm font-medium">第 {index + 1} 题：{item.question}</p>
                {item.expected_points && item.expected_points.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
                    {item.expected_points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
                {(item.candidate_gap || item.review) && (
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    {item.candidate_gap || item.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ReportList title="核心优势" items={report.top_strengths || []} />
        <ReportList title="优先改进" items={report.priority_improvements || []} />
        <ReportList title="练习计划" items={report.practice_plan || []} />
      </div>
    </div>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: "blue" | "emerald" | "amber" }) {
  const toneClass = {
    blue: "bg-blue-500/15 text-blue-100",
    emerald: "bg-emerald-500/15 text-emerald-100",
    amber: "bg-amber-500/15 text-amber-100",
  }[tone];

  return (
    <div className={`rounded-md px-3 py-3 ${toneClass}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function CompactList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item} className="rounded-full bg-zinc-100 px-3 py-1 text-sm">
              {item}
            </li>
          ))
        ) : (
          <li className="text-sm text-zinc-500">暂无数据</li>
        )}
      </ul>
    </div>
  );
}

function SkillColumn({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "rose" }) {
  const toneClass = tone === "emerald" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800";

  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className={`rounded-full px-3 py-1 text-sm ${toneClass}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-zinc-500">暂无数据</span>
        )}
      </div>
    </div>
  );
}

function PriorityBlock({ label, items, tone }: { label: string; items: string[]; tone: "blue" | "emerald" | "amber" }) {
  const markerClass = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
  }[tone];

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${markerClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>暂无数据</li>}
      </ul>
    </div>
  );
}

function getScoreInfo(score: number) {
  if (score >= 85) {
    return {
      label: "高度匹配",
      description: "当前简历和目标岗位要求高度一致，可以重点打磨项目表述和量化结果。",
      badgeClass: "bg-emerald-50 text-emerald-700",
      barClass: "bg-emerald-600",
    };
  }

  if (score >= 70) {
    return {
      label: "良好匹配",
      description: "已经具备主要能力基础，建议优先补齐少数关键技能并强化项目证据。",
      badgeClass: "bg-blue-50 text-blue-700",
      barClass: "bg-blue-600",
    };
  }

  if (score >= 50) {
    return {
      label: "需要补强",
      description: "目标岗位相关能力有基础但不够完整，需要用学习计划和项目补足短板。",
      badgeClass: "bg-amber-50 text-amber-700",
      barClass: "bg-amber-500",
    };
  }

  return {
    label: "差距较大",
    description: "当前简历和目标岗位要求差距较明显，建议先聚焦核心技能和一个可展示项目。",
    badgeClass: "bg-rose-50 text-rose-700",
    barClass: "bg-rose-600",
  };
}

function normalizeLines(content?: string) {
  if (!content) {
    return [];
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*#\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
}
