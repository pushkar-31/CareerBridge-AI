import UploadCard from "@/components/resume-analyzer/UploadCard";

export default function ResumeAnalyzerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">

      <h1 className="text-4xl font-bold">
        AI Resume Analyzer
      </h1>

      <p className="mt-3 text-gray-600">
        Upload your resume and receive an ATS score,
        extracted skills, resume summary, and AI-powered
        suggestions.
      </p>

      <UploadCard />

    </main>
  );
}