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

const [interviewLoading, setInterviewLoading] =
useState(false);

const [currentQuestion, setCurrentQuestion] =
useState("");

const [chatHistory, setChatHistory] =
useState<any[]>([]);

const [answer, setAnswer] =
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

  setCurrentQuestion(
    response.data.question
  );

  setChatHistory([]);

  setAnswer("");

} catch (error) {

  console.error(error);

  alert(
    "获取面试题失败"
  );

} finally {

  setInterviewLoading(false);

}
 

};

const submitAnswer = async () => {

 
if (!answer.trim()) {

  alert(
    "请输入回答"
  );

  return;

}

try {

  const response =
    await api.post(
      "/interview-followup",
      {
        question:
          currentQuestion,
        answer:
          answer
      }
    );

  setChatHistory(prev => [

    ...prev,

    {
      question:
        currentQuestion,

      answer:
        answer
    }

  ]);

  if (
    response.data.action ===
    "followup"
  ) {

    setCurrentQuestion(
      response.data.question
    );

  } else {

    setCurrentQuestion(
      "🎉 面试结束"
    );

  }

  setAnswer("");

} catch (error) {

  console.error(error);

  alert(
    "提交失败"
  );

}
 

};

return (

 
<main className="p-10 max-w-5xl mx-auto">

  <h1
    className="
      text-4xl
      font-bold
      mb-8
    "
  >
    AI Career Copilot
  </h1>

  <div
    className="
      flex
      gap-4
      items-center
      flex-wrap
    "
  >

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
      "
    >

      {
        careers.map(
          (item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          )
        )
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
          : "Analyze Resume"
      }

    </button>

  </div>

  {

    result && (

      <div
        className="
          mt-10
        "
      >

        <div
          className="
            border
            rounded-lg
            p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Match Score
          </h2>

          <p
            className="
              text-5xl
              mt-3
            "
          >
            {result.score}%
          </p>

          <hr className="my-6" />

          <h3
            className="
              text-xl
              font-semibold
            "
          >
            Matched Skills
          </h3>

          <ul className="mt-2">

            {
              result.matched?.map(
                (skill: string) => (

                  <li
                    key={skill}
                  >
                    ✓ {skill}
                  </li>

                )
              )
            }

          </ul>

          <hr className="my-6" />

          <h3
            className="
              text-xl
              font-semibold
            "
          >
            Missing Skills
          </h3>

          <ul className="mt-2">

            {
              result.missing?.map(
                (skill: string) => (

                  <li
                    key={skill}
                  >
                    ✗ {skill}
                  </li>

                )
              )
            }

          </ul>

          <hr className="my-6" />

          <h3
            className="
              text-xl
              font-semibold
            "
          >
            Learning Path
          </h3>

          <pre
            className="
              whitespace-pre-wrap
              mt-2
            "
          >
            {result.learning_path}
          </pre>

          <hr className="my-6" />

          <h3
            className="
              text-xl
              font-semibold
            "
          >
            Resume Suggestions
          </h3>

          <pre
            className="
              whitespace-pre-wrap
              mt-2
            "
          >
            {result.resume_suggestions}
          </pre>

        </div>

        <button
          onClick={
            startInterview
          }
          className="
            mt-6
            w-full
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            text-white
            font-semibold
            py-3
            rounded-xl
          "
        >

          {
            interviewLoading
              ? "Generating..."
              : "🚀 Start AI Interview"
          }

        </button>

        {

          currentQuestion && (

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
                  mb-4
                "
              >
                AI Interview
              </h3>

              {

                chatHistory.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}
                      className="mb-4"
                    >

                      <div
                        className="
                          bg-blue-100
                          p-3
                          rounded
                        "
                      >
                        <strong>
                          AI:
                        </strong>

                        {" "}

                        {
                          item.question
                        }

                      </div>

                      <div
                        className="
                          bg-green-100
                          p-3
                          rounded
                          mt-2
                        "
                      >
                        <strong>
                          You:
                        </strong>

                        {" "}

                        {
                          item.answer
                        }

                      </div>

                    </div>

                  )
                )

              }

              <div
                className="
                  bg-white
                  p-4
                  rounded
                  border
                  mb-4
                "
              >

                <strong>
                  Current Question
                </strong>

                <p
                  className="
                    mt-2
                  "
                >
                  {
                    currentQuestion
                  }
                </p>

              </div>

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(
                    e.target.value
                  )
                }
                placeholder="请输入你的回答..."
                className="
                  w-full
                  border
                  rounded-lg
                  p-3
                  h-40
                "
              />

              <button
                onClick={
                  submitAnswer
                }
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

            </div>

          )

        }

      </div>

    )

  }

</main>
 

);

}
