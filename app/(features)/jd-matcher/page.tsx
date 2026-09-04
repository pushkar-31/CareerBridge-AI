"use client";

import { useState } from "react";

type MatchAnalysis = {
  matchScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  jobRequirements: string[];
  experienceMatch: string;
  recommendations: string[];
};

export default function JDMatcherPage() {
  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [jdFile, setJdFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysis, setAnalysis] =
    useState<MatchAnalysis | null>(null);

  // --------------------------------
  // MATCH RESUME
  // --------------------------------

  const handleMatch = async () => {
    if (!resumeFile || !jdFile) {
      setError(
        "Please upload both your resume and job description."
      );
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      console.log("=== JD MATCH STARTED ===");

      const formData =
        new FormData();

      formData.append(
        "resume",
        resumeFile
      );

      formData.append(
        "jd",
        jdFile
      );

      console.log(
        "Resume:",
        resumeFile.name
      );

      console.log(
        "JD:",
        jdFile.name
      );

      const response =
        await fetch(
          "/api/match",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(
        "Match API response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Resume matching failed."
        );
      }

      setAnalysis(
        data.analysis
      );

      console.log(
        "=== JD MATCH SUCCESS ==="
      );
    } catch (error) {
      console.error(
        "=== JD MATCH ERROR ==="
      );

      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to match resume with job description."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="mb-10 flex items-center justify-between">

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
                Job Match Intelligence
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Matching Online
          </div>

        </header>

        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="relative px-6 py-12 sm:px-10 lg:px-14">

            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-100/50 blur-3xl" />

            <div className="relative max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                <span>✦</span>
                AI-Powered Job Matching
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Discover how well you
                <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  match your dream job.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Compare your resume against a job
                description and discover your strongest
                matches, missing skills, and what you
                should improve before applying.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  🎯 Match Score
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  🧩 Skill Matching
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  ⚠️ Skill Gaps
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  💡 Career Advice
                </span>

              </div>

            </div>

          </div>

          {/* Process */}

          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-10">

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  1
                </span>

                <span className="text-slate-600">
                  Upload Resume
                </span>
              </div>

              <div className="hidden h-px w-8 bg-slate-200 sm:block" />

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  2
                </span>

                <span className="text-slate-600">
                  Add Job Description
                </span>
              </div>

              <div className="hidden h-px w-8 bg-slate-200 sm:block" />

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  3
                </span>

                <span className="text-slate-600">
                  Get Match Analysis
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* UPLOAD SECTION */}
        {/* ================================= */}

        <section className="mb-8">

          <div className="mb-5">

            <h3 className="text-xl font-bold text-slate-900">
              Build your job match
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Provide your resume and the role you're
              targeting.
            </p>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            <div className="grid gap-5 md:grid-cols-2">

              {/* Resume */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                    📄
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Resume
                    </h4>

                    <p className="text-xs text-slate-500">
                      Upload your latest resume
                    </p>
                  </div>

                </div>

                <label
                  htmlFor="resume-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"
                >

                  <span className="mb-3 text-2xl">
                    ↑
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    {resumeFile
                      ? "Change resume"
                      : "Upload resume"}
                  </span>

                  <span className="mt-1 max-w-full truncate text-xs text-slate-400">
                    {resumeFile
                      ? resumeFile.name
                      : "PDF files only"}
                  </span>

                </label>

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (
                      file.type !==
                      "application/pdf"
                    ) {
                      setError(
                        "Resume must be a PDF file."
                      );

                      return;
                    }

                    setResumeFile(file);
                    setError("");
                    setAnalysis(null);
                  }}
                />

                {resumeFile && (
                  <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    ✓ Resume selected
                  </div>
                )}

              </div>

              {/* JD */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
                    💼
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Job Description
                    </h4>

                    <p className="text-xs text-slate-500">
                      Upload the target role
                    </p>
                  </div>

                </div>

                <label
                  htmlFor="jd-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-violet-400 hover:bg-violet-50/30"
                >

                  <span className="mb-3 text-2xl">
                    ↑
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    {jdFile
                      ? "Change job description"
                      : "Upload job description"}
                  </span>

                  <span className="mt-1 max-w-full truncate text-xs text-slate-400">
                    {jdFile
                      ? jdFile.name
                      : "PDF files only"}
                  </span>

                </label>

                <input
                  id="jd-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (
                      file.type !==
                      "application/pdf"
                    ) {
                      setError(
                        "Job description must be a PDF file."
                      );

                      return;
                    }

                    setJdFile(file);
                    setError("");
                    setAnalysis(null);
                  }}
                />

                {jdFile && (
                  <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    ✓ Job description selected
                  </div>
                )}

              </div>

            </div>

            {/* Match button */}

            <div className="mt-7 flex justify-center">

              <button
                type="button"
                onClick={handleMatch}
                disabled={
                  loading ||
                  !resumeFile ||
                  !jdFile
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {loading
                  ? "Analyzing..."
                  : "Match Resume"}

                {!loading && (
                  <span>→</span>
                )}

              </button>

            </div>

            {/* Error */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

          </div>

        </section>

        {/* ================================= */}
        {/* RESULTS */}
        {/* ================================= */}

        {analysis && (
          <section className="mb-8">

            <div className="mb-5">

              <h3 className="text-xl font-bold text-slate-900">
                Your match analysis
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Here's how your profile compares with
                the target role.
              </p>

            </div>

            <div className="space-y-5">

              {/* Match score */}

              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Overall Match Score
                </p>

                <div className="mt-2 text-7xl font-bold tracking-tight text-indigo-600">
                  {analysis.matchScore}%
                </div>

                <div className="mx-auto mt-5 h-3 max-w-xl overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          analysis.matchScore,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-500">
                  {analysis.summary}
                </p>

              </div>

              {/* Experience */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-bold text-slate-900">
                  Experience Match
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {analysis.experienceMatch}
                </p>

              </div>

              {/* Skills */}

              <div className="grid gap-5 md:grid-cols-2">

                {/* Matching */}

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">

                  <h3 className="font-bold text-emerald-800">
                    Matching Skills
                  </h3>

                  {analysis.matchingSkills
                    .length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {analysis.matchingSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No clear matching skills were
                      identified.
                    </p>
                  )}

                </div>

                {/* Missing */}

                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">

                  <h3 className="font-bold text-amber-800">
                    Missing Skills
                  </h3>

                  {analysis.missingSkills
                    .length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {analysis.missingSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No major skill gaps were identified.
                    </p>
                  )}

                </div>

              </div>

              {/* Job requirements */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-bold text-slate-900">
                  Job Requirements
                </h3>

                <ul className="mt-4 space-y-3">

                  {analysis.jobRequirements.map(
                    (requirement) => (
                      <li
                        key={requirement}
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="font-semibold text-indigo-600">
                          ✓
                        </span>

                        <span>
                          {requirement}
                        </span>
                      </li>
                    )
                  )}

                </ul>

              </div>

              {/* Recommendations */}

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">

                <h3 className="font-bold text-indigo-900">
                  Recommendations
                </h3>

                <ul className="mt-4 space-y-3">

                  {analysis.recommendations.map(
                    (recommendation) => (
                      <li
                        key={
                          recommendation
                        }
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="font-semibold text-indigo-600">
                          →
                        </span>

                        <span>
                          {recommendation}
                        </span>
                      </li>
                    )
                  )}

                </ul>

              </div>

            </div>

          </section>
        )}

        {/* ================================= */}
        {/* EMPTY STATE / EXPLANATION */}
        {/* ================================= */}

        {!analysis && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:p-10">

              <div>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  🧠
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  More than keyword matching
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  SkillBridge AI compares your resume
                  with the requirements of the target
                  role to identify strengths, gaps, and
                  actionable improvements.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-2xl font-bold text-indigo-600">
                    01
                  </p>

                  <p className="mt-2 text-xs font-semibold">
                    Understand
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Analyze your resume.
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-2xl font-bold text-violet-600">
                    02
                  </p>

                  <p className="mt-2 text-xs font-semibold">
                    Compare
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Understand the job.
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-2xl font-bold text-emerald-600">
                    03
                  </p>

                  <p className="mt-2 text-xs font-semibold">
                    Identify
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Find strengths and gaps.
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-2xl font-bold text-amber-600">
                    04
                  </p>

                  <p className="mt-2 text-xs font-semibold">
                    Improve
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Get your next steps.
                  </p>
                </div>

              </div>

            </div>

          </section>
        )}

        {/* Footer */}

        <footer className="py-8 text-center text-xs text-slate-400">
          SkillBridge AI • Match your skills with
          the right opportunities.
        </footer>

      </div>
    </main>
  );
}