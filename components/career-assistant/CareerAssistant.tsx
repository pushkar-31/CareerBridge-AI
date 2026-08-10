"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type UploadType = "resume" | "jd";

export default function CareerAssistant() {
  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [jdFile, setJdFile] =
    useState<File | null>(null);

  const [resumeUploading, setResumeUploading] =
    useState(false);

  const [jdUploading, setJdUploading] =
    useState(false);

  const [resumeStatus, setResumeStatus] =
    useState<string>("");

  const [jdStatus, setJdStatus] =
    useState<string>("");

  // --------------------------------
  // Career Chat Session
  // --------------------------------

  const sessionIdRef =
    useRef<string | null>(null);

  const [sessionReady, setSessionReady] =
    useState(false);

  useEffect(() => {
    let sessionId =
      sessionStorage.getItem(
        "skillbridge-career-session"
      );

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      sessionStorage.setItem(
        "skillbridge-career-session",
        sessionId
      );
    }

    sessionIdRef.current = sessionId;

    console.log(
      "Career Chat Session:",
      sessionId
    );

    setSessionReady(true);

    // --------------------------------
    // Cleanup Career Chat session
    // --------------------------------

    const cleanupSession = () => {
      const currentSessionId =
        sessionIdRef.current;

      if (!currentSessionId) {
        return;
      }

      const data = JSON.stringify({
        sessionId: currentSessionId,
      });

      try {
        const sent =
          navigator.sendBeacon(
            "/api/career-chat/cleanup",
            new Blob(
              [data],
              {
                type: "application/json",
              }
            )
          );

        console.log(
          "Career Chat cleanup requested:",
          sent
        );
      } catch (error) {
        console.error(
          "Failed to send cleanup request:",
          error
        );
      }

      sessionStorage.removeItem(
        "skillbridge-career-session"
      );
    };

    window.addEventListener(
      "pagehide",
      cleanupSession
    );

    return () => {
      window.removeEventListener(
        "pagehide",
        cleanupSession
      );
    };
  }, []);

  // --------------------------------
  // Upload Resume / JD
  // --------------------------------

  const uploadDocument = async (
    file: File,
    type: UploadType
  ) => {
    const isResume =
      type === "resume";

    if (!sessionIdRef.current) {
      if (isResume) {
        setResumeStatus(
          "Session is not ready. Please try again."
        );
      } else {
        setJdStatus(
          "Session is not ready. Please try again."
        );
      }

      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      if (isResume) {
        setResumeStatus(
          "Only PDF files are allowed."
        );
      } else {
        setJdStatus(
          "Only PDF files are allowed."
        );
      }

      return;
    }

    if (isResume) {
      setResumeUploading(true);
      setResumeStatus(
        "Uploading..."
      );
    } else {
      setJdUploading(true);
      setJdStatus(
        "Uploading..."
      );
    }

    try {
      const formData =
        new FormData();

      formData.append(
        isResume
          ? "resume"
          : "jd",
        file
      );

      // --------------------------------
      // Send session ID
      // --------------------------------

      formData.append(
        "sessionId",
        sessionIdRef.current
      );

      const endpoint =
        isResume
          ? "/api/career-chat/upload-resume"
          : "/api/career-chat/upload-jd";

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Upload failed."
        );
      }

      if (isResume) {
        setResumeFile(file);

        setResumeStatus(
          `✓ Ready • ${data.chunks} chunks`
        );
      } else {
        setJdFile(file);

        setJdStatus(
          `✓ Ready • ${data.chunks} chunks`
        );
      }
    } catch (error) {
      console.error(error);

      if (isResume) {
        setResumeStatus(
          error instanceof Error
            ? error.message
            : "Resume upload failed."
        );
      } else {
        setJdStatus(
          error instanceof Error
            ? error.message
            : "JD upload failed."
        );
      }
    } finally {
      if (isResume) {
        setResumeUploading(false);
      } else {
        setJdUploading(false);
      }
    }
  };

  // --------------------------------
  // Resume file selection
  // --------------------------------

  const handleResumeChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadDocument(
      file,
      "resume"
    );
  };

  // --------------------------------
  // JD file selection
  // --------------------------------

  const handleJdChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadDocument(
      file,
      "jd"
    );
  };

  // --------------------------------
  // Career Chat
  // --------------------------------

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (
      !trimmedQuestion ||
      loading ||
      !sessionIdRef.current
    ) {
      return;
    }

    setMessages(
      (previous) => [
        ...previous,
        {
          role: "user",
          content:
            trimmedQuestion,
        },
      ]
    );

    setQuestion("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/career-chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              question:
                trimmedQuestion,

              sessionId:
                sessionIdRef.current,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Career assistant failed."
        );
      }

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              data.answer,
          },
        ]
      );
    } catch (error) {
      console.error(error);

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              error instanceof Error
                ? error.message
                : "Sorry, I couldn't process your question.",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const documentsReady =
    !!resumeFile &&
    !!jdFile;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            SkillBridge Career AI
          </h1>

          <p className="mt-2 text-gray-600">
            Upload your resume and job
            description to get personalized
            career guidance.
          </p>
        </div>

        {/* Upload Cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-2">

          {/* Resume */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Resume
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload your latest resume
                in PDF format.
              </p>
            </div>

            <label
              htmlFor="resume-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="mb-2 text-3xl">
                📄
              </span>

              <span className="font-medium text-gray-700">
                {resumeUploading
                  ? "Uploading..."
                  : "Upload Resume"}
              </span>

              <span className="mt-1 text-xs text-gray-500">
                PDF only
              </span>
            </label>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                handleResumeChange
              }
              disabled={
                resumeUploading ||
                !sessionReady
              }
              className="hidden"
            />

            {resumeFile && (
              <p className="mt-3 truncate text-sm text-gray-700">
                📎 {resumeFile.name}
              </p>
            )}

            {resumeStatus && (
              <p
                className={`mt-2 text-sm ${
                  resumeStatus.startsWith(
                    "✓"
                  )
                    ? "text-green-600"
                    : resumeStatus ===
                      "Uploading..."
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {resumeStatus}
              </p>
            )}
          </div>

          {/* JD */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Job Description
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload the job description
                you're targeting.
              </p>
            </div>

            <label
              htmlFor="jd-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="mb-2 text-3xl">
                📋
              </span>

              <span className="font-medium text-gray-700">
                {jdUploading
                  ? "Uploading..."
                  : "Upload Job Description"}
              </span>

              <span className="mt-1 text-xs text-gray-500">
                PDF only
              </span>
            </label>

            <input
              id="jd-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                handleJdChange
              }
              disabled={
                jdUploading ||
                !sessionReady
              }
              className="hidden"
            />

            {jdFile && (
              <p className="mt-3 truncate text-sm text-gray-700">
                📎 {jdFile.name}
              </p>
            )}

            {jdStatus && (
              <p
                className={`mt-2 text-sm ${
                  jdStatus.startsWith(
                    "✓"
                  )
                    ? "text-green-600"
                    : jdStatus ===
                      "Uploading..."
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {jdStatus}
              </p>
            )}
          </div>
        </div>

        {/* Document Status */}
        <div className="mb-6 rounded-lg border bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <p className="font-medium text-gray-800">
                Document Status
              </p>

              <p className="text-sm text-gray-500">
                {documentsReady
                  ? "Both documents are ready for Career AI."
                  : "Upload both documents to get the best personalized answers."}
              </p>
            </div>

            <div className="flex gap-3 text-sm">

              <span
                className={
                  resumeFile
                    ? "text-green-600"
                    : "text-gray-400"
                }
              >
                {resumeFile
                  ? "✓ Resume"
                  : "○ Resume"}
              </span>

              <span
                className={
                  jdFile
                    ? "text-green-600"
                    : "text-gray-400"
                }
              >
                {jdFile
                  ? "✓ JD"
                  : "○ JD"}
              </span>

            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="rounded-xl border bg-white shadow-sm">

          <div className="min-h-[400px] space-y-4 p-6">

            {messages.length === 0 && (
              <div className="flex min-h-[350px] items-center justify-center text-center">
                <div>

                  <h2 className="text-xl font-semibold text-gray-800">
                    How can I help?
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Try asking:
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">

                    <p>
                      "What skills am I missing?"
                    </p>

                    <p>
                      "How well do I match this job?"
                    </p>

                    <p>
                      "What should I improve?"
                    </p>

                  </div>
                </div>
              </div>
            )}

            {messages.map(
              (
                message,
                index
              ) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      message.role ===
                      "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {
                        message.content
                      }
                    </p>
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                  SkillBridge AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={
              handleSubmit
            }
            className="border-t p-4"
          >
            <div className="flex gap-3">

              <input
                type="text"
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                placeholder={
                  documentsReady
                    ? "Ask about your resume and job..."
                    : "Upload your documents first..."
                }
                disabled={
                  loading ||
                  !documentsReady ||
                  !sessionReady
                }
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim() ||
                  !documentsReady ||
                  !sessionReady
                }
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Thinking..."
                  : "Ask AI"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </main>
  );
}