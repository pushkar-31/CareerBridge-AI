"use client";

import { useEffect, useRef, useState } from "react";

interface MatchAnalysis {
  matchScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  jobRequirements: string[];
  experienceMatch: string;
  recommendations: string[];
}

export default function UploadCard() {
  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [jdFile, setJdFile] =
    useState<File | null>(null);

  const [analysis, setAnalysis] =
    useState<MatchAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const resultsRef =
    useRef<HTMLDivElement | null>(null);

  // Automatically scroll after results render
  useEffect(() => {
    if (!analysis) return;

    const timer = setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [analysis]);

  const handleMatch = async () => {
    if (!resumeFile || !jdFile) {
      setError(
        "Please upload both resume and job description."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const formData = new FormData();

      formData.append("resume", resumeFile);
      formData.append("jd", jdFile);

      console.log(
        "Sending resume and JD to match API..."
      );

      const response = await fetch("/api/match", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      console.log(
        "API status:",
        response.status
      );

      console.log(
        "API response:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "JD matching failed."
        );
      }

      if (
        data.success &&
        data.analysis
      ) {
        setAnalysis(data.analysis);

        alert(
          "JD Match analysis completed successfully!"
        );
      } else {
        throw new Error(
          "Match analysis was not received."
        );
      }

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">

      {/* =========================
          UPLOAD SECTION
      ========================= */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Resume Upload */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Your Resume
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload your resume in PDF format.
          </p>

          <label
            htmlFor="resume-upload"
            className="mt-6 flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30"
          >

            <div className="text-5xl">
              📄
            </div>

            <p className="mt-4 font-medium text-gray-700">
              {resumeFile
                ? resumeFile.name
                : "Upload your resume"}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              PDF only · Maximum 10 MB
            </p>

            <span className="mt-5 rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium">
              Browse Resume
            </span>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (file) {
                  setResumeFile(file);
                  setAnalysis(null);
                  setError("");
                }
              }}
              className="hidden"
            />

          </label>

          {resumeFile && (
            <div className="mt-4 rounded-lg bg-green-50 p-3">

              <p className="text-sm font-medium text-green-700">
                ✓ Resume selected
              </p>

            </div>
          )}

        </div>

        {/* JD Upload */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Job Description
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload the job description in PDF format.
          </p>

          <label
            htmlFor="jd-upload"
            className="mt-6 flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30"
          >

            <div className="text-5xl">
              📋
            </div>

            <p className="mt-4 font-medium text-gray-700">
              {jdFile
                ? jdFile.name
                : "Upload job description"}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              PDF only · Maximum 10 MB
            </p>

            <span className="mt-5 rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium">
              Browse Job Description
            </span>

            <input
              id="jd-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (file) {
                  setJdFile(file);
                  setAnalysis(null);
                  setError("");
                }
              }}
              className="hidden"
            />

          </label>

          {jdFile && (
            <div className="mt-4 rounded-lg bg-green-50 p-3">

              <p className="text-sm font-medium text-green-700">
                ✓ Job description selected
              </p>

            </div>
          )}

        </div>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 p-4">

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

        </div>
      )}

      {/* =========================
          MATCH BUTTON
      ========================= */}

      <div className="mt-8 text-center">

        <button
          onClick={handleMatch}
          disabled={
            !resumeFile ||
            !jdFile ||
            loading
          }
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading
            ? "Analyzing..."
            : "Match Resume"}
        </button>

      </div>

      {/* =========================
          RESULTS DASHBOARD
      ========================= */}

      {analysis && (
        <div
          ref={resultsRef}
          className="mt-12 scroll-mt-24 space-y-6"
        >

          {/* Header */}

          <div>

            <h2 className="text-3xl font-bold">
              JD Match Results
            </h2>

            <p className="mt-2 text-gray-500">
              AI-powered comparison between your
              resume and the selected job description.
            </p>

          </div>

          {/* MATCH SCORE */}

          <div className="rounded-2xl border bg-white p-8 shadow-sm">

            <p className="text-sm font-semibold text-gray-500">
              JOB MATCH SCORE
            </p>

            <div className="mt-3 flex items-end gap-2">

              <span className="text-6xl font-bold text-blue-600">
                {analysis.matchScore}
              </span>

              <span className="mb-2 text-2xl text-gray-400">
                / 100
              </span>

            </div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                style={{
                  width: `${analysis.matchScore}%`,
                }}
              />

            </div>

          </div>

          {/* SUMMARY */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Match Summary
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              {analysis.summary}
            </p>

          </div>

          {/* MATCHING SKILLS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Matching Skills
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Skills from your resume that match
              the job description.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              {analysis.matchingSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
                  >
                    ✓ {skill}
                  </span>
                )
              )}

            </div>

          </div>

          {/* MISSING SKILLS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Missing Skills
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Important skills mentioned in the JD
              that are not clearly present in your
              resume.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              {analysis.missingSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>

          {/* JOB REQUIREMENTS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Job Requirements
            </h3>

            <div className="mt-5 space-y-3">

              {analysis.jobRequirements.map(
                (requirement, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >

                    <span className="font-semibold text-blue-600">
                      {index + 1}.
                    </span>

                    <p className="text-gray-600">
                      {requirement}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* EXPERIENCE MATCH */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Experience Match
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              {analysis.experienceMatch}
            </p>

          </div>

          {/* RECOMMENDATIONS */}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <h3 className="text-xl font-semibold text-blue-800">
              AI Recommendations
            </h3>

            <p className="mt-2 text-sm text-blue-600">
              Personalized suggestions to improve
              your resume for this specific job.
            </p>

            <div className="mt-5 space-y-4">

              {analysis.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl bg-white p-4"
                  >

                    <span className="font-bold text-blue-600">
                      {index + 1}.
                    </span>

                    <p className="text-gray-600">
                      {recommendation}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}