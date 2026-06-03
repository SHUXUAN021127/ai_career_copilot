"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {

  const [careers, setCareers] =
    useState<string[]>([]);

  const [career, setCareer] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [questions, setQuestions] =
    useState("");

  const [interviewLoading, setInterviewLoading] =
    useState(false);

  const [answer, setAnswer] =
  useState("");

const [feedback, setFeedback] =
  useState("");

  useEffect(() => {

    const loadCareers = async () => {

      try {

        const res =
          await api.get("/careers");

        setCareers(
          res.data.careers || []
        );

        if (
          res.data.careers?.length > 0
        ) {

          setCareer(
            res.data.careers[0]
          );

        }

      } catch (err) {

        console.error(err);

      }

    };

    loadCareers();

  }, []);

  const analyzeResume = async () => {

    if (
      !career ||
      !file
    ) {

      alert(
        "请选择职业和简历"
      );

      return;

    }

    setLoading(true);

    try {

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await api.post(
          `/analyze?career=${career}`,
          formData
        );

      setResult(
        response.data
      );

    } catch (error) {

      console.error(error);

      alert(
        "分析失败"
      );

    } finally {

      setLoading(false);

    }

  };

  const startInterview = async () => {

    if (!career) {

      alert(
        "请先选择职业"
      );

      return;

    }

    setInterviewLoading(true);

    try {

      const response =
        await api.get(
          `/interview-questions?career=${career}`
        );

      setQuestions(
        response.data.questions
      );

    } catch (error) {

      console.error(error);

      alert(
        "获取面试题失败"
      );

    } finally {

      setInterviewLoading(false);

    }

  };

  const evaluateInterview =
  async () => {

  const response =
    await api.post(
      "/evaluate-interview",
      {
        question:
          questions,
        answer:
          answer
      }
    );

  setFeedback(
    response.data.feedback
  );

};

  return (

    <main className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        AI Career Copilot
      </h1>

      <select
        value={career}
        onChange={(e) =>
          setCareer(
            e.target.value
          )
        }
        className="
          border
          p-2
          rounded
          mr-4
        "
      >

        {
          careers.map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))
        }

      </select>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {

          if (
            e.target.files
          ) {

            setFile(
              e.target.files[0]
            );

          }

        }}
        className="mr-4"
      />

      <button
        onClick={analyzeResume}
        className="
          bg-blue-600
          text-white
          px-4
          py-2
          rounded
        "
      >

        {
          loading
            ? "Analyzing..."
            : "Analyze"
        }

      </button>

      {
        result && (

          <div className="mt-10">

            <div
              className="
                border
                p-6
                rounded-lg
              "
            >

              <h2 className="text-2xl font-bold">
                Match Score
              </h2>

              <p className="text-4xl mt-2">
                {result.score}%
              </p>

              <hr className="my-4" />

              <h3 className="text-xl font-semibold">
                Matched Skills
              </h3>

              <ul className="mt-2">

                {
                  result.matched?.map(
                    (skill: string) => (

                      <li key={skill}>
                        ✓ {skill}
                      </li>

                    )
                  )
                }

              </ul>

              <hr className="my-4" />

              <h3 className="text-xl font-semibold">
                Missing Skills
              </h3>

              <ul className="mt-2">

                {
                  result.missing?.map(
                    (skill: string) => (

                      <li key={skill}>
                        ✗ {skill}
                      </li>

                    )
                  )
                }

              </ul>

              <hr className="my-4" />

              <h3 className="text-xl font-semibold">
                Learning Path
              </h3>

              <pre className="whitespace-pre-wrap mt-2">
                {result.learning_path}
              </pre>

              <hr className="my-4" />

              <h3 className="text-xl font-semibold">
                Resume Suggestions
              </h3>

              <pre className="whitespace-pre-wrap mt-2">
                {result.resume_suggestions}
              </pre>

            </div>

            <button
              onClick={startInterview}
              className="
                mt-6
                w-full
                bg-gradient-to-r
                from-blue-600
                to-purple-600
                hover:from-blue-700
                hover:to-purple-700
                text-white
                font-semibold
                py-3
                rounded-xl
                shadow-lg
              "
            >

              {
                interviewLoading
                  ? "Generating Questions..."
                  : "🚀 Start AI Interview"
              }

            </button>

            {
              questions && (

                <div
                  className="
                    mt-6
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                  "
                >

                  <h3
                    className="
                      text-xl
                      font-semibold
                      mb-3
                    "
                  >
                    Interview Questions
                  </h3>

                  <textarea
                      value={answer}
                      onChange={(e) =>
                        setAnswer(
                          e.target.value
                        )
                      }
                      placeholder="
                    请输入你的回答...
                    "
                      className="
                        w-full
                        mt-4
                        border
                        rounded-lg
                        p-3
                        h-40
                      "
                    />

                  <pre
                    className="
                      whitespace-pre-wrap
                    "
                  >
                    {questions}
                  </pre>
                    <button
                      onClick={evaluateInterview}
                      className="
                        mt-4
                        bg-green-600
                        text-white
                        px-4
                        py-2
                        rounded
                      "
                    >
                      Submit Answer
                    </button>

                    {
                      feedback && (

                        <div
                          className="
                            mt-6
                            border
                            rounded-lg
                            p-4
                            bg-white
                          "
                        >

                          <h3
                            className="
                              text-xl
                              font-bold
                              mb-3
                            "
                          >
                            Interview Feedback
                          </h3>

                          <pre
                            className="
                              whitespace-pre-wrap
                            "
                          >
                            {feedback}
                          </pre>

                        </div>

                      )
                    }
                </div>

              )
            }

          </div>

        )
      }

    </main>

  );

}