import UploadCard from "@/components/resume-analyzer/UploadCard";

export default function ResumeAnalyzerPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
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
                Resume Intelligence
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Analyzer Online
          </div>
        </header>

        {/* Hero */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative px-6 py-12 sm:px-10 lg:px-14">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <span>✦</span>
                AI-Powered Resume Analysis
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Know exactly how strong
                <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  your resume really is.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Upload your resume and let SkillBridge AI
                analyze your ATS score, skills, strengths,
                weaknesses, and opportunities for improvement.
              </p>

              {/* Feature pills */}
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  🎯 ATS Score
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  🧠 AI Analysis
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  🛠 Skill Extraction
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  💡 Improvement Tips
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Analyzer section */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              Analyze your resume
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Upload a PDF to generate your personalized
              resume analysis.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <UploadCard />
          </div>
        </section>

        {/* What you'll get */}
        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                🎯
              </div>

              <h4 className="font-semibold text-slate-900">
                ATS Score
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Understand how effectively your resume
                performs against ATS screening.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                🧩
              </div>

              <h4 className="font-semibold text-slate-900">
                Skills
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Automatically identify technical and
                professional skills from your resume.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                💪
              </div>

              <h4 className="font-semibold text-slate-900">
                Strengths
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Discover the strongest parts of your
                current resume.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                💡
              </div>

              <h4 className="font-semibold text-slate-900">
                Suggestions
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Get actionable recommendations to make
                your resume stronger.
              </p>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-xs text-slate-400">
          SkillBridge AI • Build a stronger resume,
          build a stronger career.
        </footer>
      </div>
    </main>
  );
}