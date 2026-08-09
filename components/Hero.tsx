"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
      
      {/* Badge */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
      >
        🚀 AI-Powered Career Assistant
      </motion.div>

      {/* Heading */}

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl"
      >
        AI Resume{" "}
        <span className="text-blue-600">Analyzer</span>,{" "}
        <span className="text-green-600">Job Matcher</span> &
        <br />
        <span className="text-purple-600">Career Chat Assistant</span>
      </motion.h1>

      {/* Description */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl"
      >
        Analyze your resume, compare it with any job description,
        identify missing skills, and receive personalized AI-powered
        career guidance using Large Language Models (LLMs) and
        Retrieval-Augmented Generation (RAG).
      </motion.p>

      {/* Buttons */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-wrap justify-center gap-4"
      >
        <Link href="#features">
          <Button
            size="lg"
            className="rounded-xl px-8 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            Explore Features
          </Button>
        </Link>

        <Button
          variant="outline"
          size="lg"
          className="rounded-xl px-8 py-6 text-base transition-all duration-300 hover:-translate-y-1"
        >
          View Demo
        </Button>
      </motion.div>

      {/* Stats */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3"
      >
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-3xl font-bold text-blue-600">ATS</h3>
          <p className="mt-2 text-gray-600">
            AI-powered resume analysis and ATS scoring.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-3xl font-bold text-green-600">JD Match</h3>
          <p className="mt-2 text-gray-600">
            Compare resumes with job descriptions and identify skill gaps.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-3xl font-bold text-purple-600">RAG Chat</h3>
          <p className="mt-2 text-gray-600">
            Ask career questions using your resume and job description.
          </p>
        </div>
      </motion.div>
    </section>
  );
}