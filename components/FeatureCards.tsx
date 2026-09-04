"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Target,
  Bot,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI Resume Analyzer",
    description:
      "Upload your resume and receive detailed AI-powered analysis to improve your chances of getting shortlisted.",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-100",
    button: "Analyze Resume",
    href: "/resume-analyzer",
    bullets: [
      "ATS Score",
      "Skill Extraction",
      "Resume Summary",
      "AI Suggestions",
    ],
  },
  {
    title: "Resume JD Matcher",
    description:
      "Compare your resume with any job description and discover missing skills and improvement opportunities.",
    icon: Target,
    color: "text-green-600",
    bg: "bg-green-100",
    button: "Match Resume",
    href: "/jd-matcher",
    bullets: [
      "Match Score",
      "Missing Skills",
      "Matching Skills",
      "Resume Improvements",
    ],
  },
  {
    title: "AI Career Chat",
    description:
      "Chat with an AI assistant powered by your resume and job description using Retrieval-Augmented Generation.",
    icon: Bot,
    color: "text-purple-600",
    bg: "bg-purple-100",
    button: "Start AI Chat",
    href: "/career-chat",
    bullets: [
      "RAG Powered",
      "Career Guidance",
      "Interview Questions",
      "Learning Roadmap",
    ],
  },
];

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">

      {/* Section heading */}
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        className="mb-16 text-center"
      >
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Core Features
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Everything you need to analyze your resume,
          compare it with job descriptions, and receive
          AI-powered career guidance.
        </p>
      </motion.div>

      {/* Feature cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {features.map(
          (feature, index) => {
            const Icon =
              feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay:
                    index * 0.2,
                }}
                whileHover={{
                  y: -10,
                }}
                className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl"
              >
                {/* Icon */}
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg}`}
                >
                  <Icon
                    className={`h-8 w-8 ${feature.color}`}
                  />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-4 leading-7 text-gray-600">
                  {
                    feature.description
                  }
                </p>

                {/* Divider */}
                <div className="my-8 h-px bg-gray-200" />

                {/* Features */}
                <ul className="space-y-3">
                  {feature.bullets.map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <span className="font-semibold text-green-600">
                          ✓
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>

                {/* Button */}
                <div className="mt-auto pt-10">
                  <Link
                    href={
                      feature.href
                    }
                    className="block"
                  >
                    <Button
                      className="w-full rounded-xl py-6 text-base"
                    >
                      {
                        feature.button
                      }

                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          }
        )}
      </div>
    </section>
  );
}