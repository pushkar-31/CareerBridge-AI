import Navbar from "@/components/navbar";
import UploadCard from "@/components/JDMatcher/UploadCard";

export default function JDMatcherPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">

          <div className="text-center">

            <h1 className="text-4xl font-bold">
              JD Resume Matcher
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Upload your resume and job description to
              discover your match score, missing skills,
              and areas you should improve.
            </p>

          </div>

          <UploadCard />

        </div>
      </main>
    </>
  );
}