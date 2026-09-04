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
    useState("");

  const [jdStatus, setJdStatus] =
    useState("");

  const sessionIdRef =
    useRef<string | null>(null);

  const [sessionReady, setSessionReady] =
    useState(false);

  // --------------------------------
  // SESSION + CLEANUP
  // --------------------------------

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
            new Blob([data], {
              type: "application/json",
            })
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
  // UPLOAD DOCUMENT
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
  // FILE INPUTS
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
  // CHAT
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

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <header className="mb-8 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg text-white shadow-lg shadow-indigo-200">
              ✦
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                SkillBridge
                <span className="text-indigo-600">
                  AI
                </span>
              </h1>

              <p className="text-xs text-slate-500">
                Your AI career copilot
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Assistant Online
          </div>

        </header>

        {/* ===================================== */}
        {/* HERO */}
        {/* ===================================== */}

        <section className="mb-8">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="relative px-6 py-10 sm:px-10 sm:py-12">

              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-100/50 blur-3xl" />

              <div className="relative max-w-3xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  <span>✦</span>
                  Personalized Career Intelligence
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Turn your resume into
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {" "}career strategy.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Upload your resume and target job
                  description. SkillBridge AI analyzes
                  both documents and gives you
                  personalized, context-aware career
                  guidance.
                </p>

              </div>

            </div>

            {/* Progress */}
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-10">

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">

                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      resumeFile
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {resumeFile ? "✓" : "1"}
                  </span>

                  <span
                    className={
                      resumeFile
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }
                  >
                    Resume
                  </span>
                </div>

                <div className="hidden h-px w-8 bg-slate-200 sm:block" />

                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      jdFile
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {jdFile ? "✓" : "2"}
                  </span>

                  <span
                    className={
                      jdFile
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }
                  >
                    Job Description
                  </span>
                </div>

                <div className="hidden h-px w-8 bg-slate-200 sm:block" />

                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      documentsReady
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    3
                  </span>

                  <span
                    className={
                      documentsReady
                        ? "text-indigo-700"
                        : "text-slate-500"
                    }
                  >
                    Ask AI
                  </span>
                </div>

              </div>

            </div>
          </div>

        </section>

        {/* ===================================== */}
        {/* DOCUMENT UPLOADS */}
        {/* ===================================== */}

        <section className="mb-8">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Your documents
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These documents power your personalized
                AI responses.
              </p>
            </div>

            {documentsReady && (
              <div className="hidden items-center gap-2 text-xs font-semibold text-emerald-600 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Both documents ready
              </div>
            )}

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Resume Card */}

            <div
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                resumeFile
                  ? "border-emerald-200"
                  : "border-slate-200"
              }`}
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    📄
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Resume
                    </h4>

                    <p className="text-xs text-slate-500">
                      Your professional profile
                    </p>
                  </div>

                </div>

                {resumeFile && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    ✓ Ready
                  </span>
                )}

              </div>

              <label
                htmlFor="resume-upload"
                className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-7 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
              >

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  {resumeUploading
                    ? "⏳"
                    : "↑"}
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  {resumeUploading
                    ? "Analyzing resume..."
                    : "Upload your resume"}
                </span>

                <span className="mt-1 text-xs text-slate-400">
                  PDF • Max recommended size 5 MB
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
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5">

                  <span className="text-sm">
                    📎
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-emerald-800">
                    {resumeFile.name}
                  </span>

                </div>
              )}

              {resumeStatus && (
                <p
                  className={`mt-3 text-xs font-medium ${
                    resumeStatus.startsWith(
                      "✓"
                    )
                      ? "text-emerald-600"
                      : resumeStatus ===
                        "Uploading..."
                      ? "text-indigo-600"
                      : "text-red-500"
                  }`}
                >
                  {resumeStatus}
                </p>
              )}

            </div>

            {/* JD Card */}

            <div
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                jdFile
                  ? "border-emerald-200"
                  : "border-slate-200"
              }`}
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                    💼
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Job Description
                    </h4>

                    <p className="text-xs text-slate-500">
                      Your target role
                    </p>
                  </div>

                </div>

                {jdFile && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    ✓ Ready
                  </span>
                )}

              </div>

              <label
                htmlFor="jd-upload"
                className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-7 text-center transition hover:border-violet-400 hover:bg-violet-50/40"
              >

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  {jdUploading
                    ? "⏳"
                    : "↑"}
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  {jdUploading
                    ? "Analyzing job description..."
                    : "Upload job description"}
                </span>

                <span className="mt-1 text-xs text-slate-400">
                  PDF • Role requirements
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
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5">

                  <span className="text-sm">
                    📎
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-emerald-800">
                    {jdFile.name}
                  </span>

                </div>
              )}

              {jdStatus && (
                <p
                  className={`mt-3 text-xs font-medium ${
                    jdStatus.startsWith(
                      "✓"
                    )
                      ? "text-emerald-600"
                      : jdStatus ===
                        "Uploading..."
                      ? "text-indigo-600"
                      : "text-red-500"
                  }`}
                >
                  {jdStatus}
                </p>
              )}

            </div>

          </div>
        </section>

        {/* ===================================== */}
        {/* CHAT */}
        {/* ===================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Chat Header */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100">
                ✦
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Career Assistant
                </h3>

                <p className="text-xs text-slate-500">
                  Powered by your resume + job
                  description
                </p>
              </div>

            </div>

            {documentsReady && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Context ready
              </div>
            )}

          </div>

          {/* Messages */}

          <div className="min-h-[420px] bg-gradient-to-b from-white to-slate-50/60 px-4 py-6 sm:px-6">

            {messages.length === 0 ? (
              <div className="flex min-h-[370px] items-center justify-center">

                <div className="max-w-xl text-center">

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-3xl shadow-sm">
                    ✦
                  </div>

                  <h4 className="text-2xl font-bold tracking-tight text-slate-900">
                    Ask anything about
                    your career.
                  </h4>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                    {documentsReady
                      ? "Your Resume and Job Description are ready. Ask SkillBridge AI to compare them and guide your next move."
                      : "Upload your Resume and Job Description above to unlock personalized career guidance."}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">

                    {[
                      "What skills am I missing?",
                      "How well do I match this job?",
                      "What should I improve?",
                    ].map(
                      (suggestion) => (
                        <button
                          key={
                            suggestion
                          }
                          type="button"
                          disabled={
                            !documentsReady
                          }
                          onClick={() =>
                            setQuestion(
                              suggestion
                            )
                          }
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      )
                    )}

                  </div>

                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-5">

                {messages.map(
                  (
                    message,
                    index
                  ) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {message.role ===
                        "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm text-white shadow-sm">
                          ✦
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-sm ${
                          message.role ===
                          "user"
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {
                            message.content
                          }
                        </p>
                      </div>

                    </div>
                  )
                )}

                {loading && (
                  <div className="flex gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm text-white">
                      ✦
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm">

                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Input */}

          <div className="border-t border-slate-100 bg-white p-4 sm:p-5">

            <form
              onSubmit={
                handleSubmit
              }
              className="mx-auto max-w-4xl"
            >

              <div
                className={`flex items-center gap-2 rounded-2xl border bg-slate-50 p-2 transition ${
                  documentsReady
                    ? "border-slate-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50"
                    : "border-slate-200"
                }`}
              >

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
                      ? "Ask about your resume, skills, or target job..."
                      : "Upload your resume and job description first..."
                  }
                  disabled={
                    loading ||
                    !documentsReady ||
                    !sessionReady
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim() ||
                    !documentsReady ||
                    !sessionReady
                  }
                  className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:px-5"
                >
                  {loading
                    ? "Thinking..."
                    : "Ask AI"}

                  {!loading && (
                    <span>
                      →
                    </span>
                  )}
                </button>

              </div>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                SkillBridge AI uses your uploaded
                documents to provide contextual
                career guidance.
              </p>

            </form>

          </div>

        </section>

        {/* Footer */}

        <div className="py-6 text-center text-[11px] text-slate-400">
          SkillBridge AI • Built for smarter
          career decisions
        </div>

      </div>
    </main>
  );
}