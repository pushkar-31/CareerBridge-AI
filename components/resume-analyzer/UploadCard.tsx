"use client";

import { useEffect, useRef, useState } from "react";

interface Analysis {
  atsScore: number;
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll after results are rendered
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

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setAnalysis(null);

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Only PDF files are allowed.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setFile(null);
      setError("File size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const formData = new FormData();

      formData.append("resume", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

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
          data.message || "Resume analysis failed."
        );
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);

        alert(
          "Resume analysis completed successfully!"
        );
      } else {
        throw new Error(
          "Analysis data was not received."
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

      <div className="rounded-2xl border border-gray-300 bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-semibold">
          Upload Resume
        </h2>

        <p className="mt-2 text-gray-600">
          Upload your resume in PDF format and let AI
          analyze your profile.
        </p>

        {/* Upload Area */}

        <label
          htmlFor="resume-upload"
          className="mt-8 block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-12 text-center transition hover:border-blue-500 hover:bg-blue-50/30"
        >
          <div className="text-4xl">
            📄
          </div>

          <p className="mt-4 font-medium text-gray-700">
            {file
              ? file.name
              : "Choose your resume"}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            PDF only · Maximum 10 MB
          </p>

          <span className="mt-5 inline-block rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium">
            Browse File
          </span>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Selected File */}

        {file && (
          <div className="mt-5 flex items-center justify-between rounded-lg bg-green-50 p-4">
            <div>
              <p className="text-sm font-medium text-green-700">
                ✓ {file.name}
              </p>

              <p className="mt-1 text-xs text-green-600">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        {/* Analyze Button */}

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading
            ? "Analyzing Resume..."
            : "Analyze Resume"}
        </button>

      </div>

      {/* =========================
          ANALYSIS RESULTS
      ========================= */}

      {analysis && (
        <div
          ref={resultsRef}
          className="mt-12 scroll-mt-24 space-y-6"
        >

          {/* Header */}

          <div>
            <h2 className="text-3xl font-bold">
              Resume Analysis
            </h2>

            <p className="mt-2 text-gray-500">
              AI-powered analysis of your resume.
            </p>
          </div>

          {/* ATS SCORE */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold text-gray-500">
              ATS SCORE
            </p>

            <div className="mt-3 flex items-end gap-2">

              <span className="text-5xl font-bold text-blue-600">
                {analysis.atsScore}
              </span>

              <span className="mb-1 text-2xl text-gray-400">
                / 100
              </span>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${analysis.atsScore}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Overall resume compatibility score based
              on structure, skills, experience, and ATS
              readability.
            </p>

          </div>

          {/* SUMMARY */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Resume Summary
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              {analysis.summary}
            </p>

          </div>

          {/* SKILLS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Skills Detected
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">

              {analysis.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}

            </div>

          </div>

          {/* STRENGTHS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Strengths
            </h3>

            <div className="mt-4 space-y-3">

              {analysis.strengths.map(
                (strength, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >

                    <span className="font-semibold text-green-600">
                      ✓
                    </span>

                    <p className="text-gray-600">
                      {strength}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* WEAKNESSES */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-semibold">
              Areas to Improve
            </h3>

            <div className="mt-4 space-y-3">

              {analysis.weaknesses.map(
                (weakness, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >

                    <span className="font-semibold text-orange-500">
                      !
                    </span>

                    <p className="text-gray-600">
                      {weakness}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* SUGGESTIONS */}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <h3 className="text-xl font-semibold text-blue-800">
              AI Suggestions
            </h3>

            <p className="mt-2 text-sm text-blue-600">
              Personalized recommendations to improve
              your resume.
            </p>

            <div className="mt-5 space-y-4">

              {analysis.suggestions.map(
                (suggestion, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl bg-white p-4"
                  >

                    <span className="font-bold text-blue-600">
                      {index + 1}.
                    </span>

                    <p className="text-gray-600">
                      {suggestion}
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