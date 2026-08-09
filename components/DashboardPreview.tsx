"use client";

import { motion } from "framer-motion";

const skills = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "SQL",
];

const missingSkills = ["Docker", "AWS"];

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{
        opacity: 1,
        x: 0,
        y: [0, -10, 0],
      }}
      transition={{
        duration: 0.8,
        y: {
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        },
      }}
      className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* ATS Score */}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500">
          ATS Score
        </h3>

        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
          }}
          className="mt-2 text-5xl font-bold text-green-600"
        >
          92%
        </motion.h2>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "92%" }}
            transition={{
              delay: 0.5,
              duration: 1,
            }}
            className="h-full rounded-full bg-green-500"
          />
        </div>
      </div>

      {/* Skills */}

      <div>
        <h3 className="text-sm font-semibold text-gray-500">
          Skills
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <motion.span
              key={skill}
              initial={{
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: index * 0.15,
              }}
              whileHover={{
                scale: 1.08,
              }}
              className="cursor-default rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Job Match */}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500">
          Job Match
        </h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1,
          }}
          className="mt-2 text-3xl font-bold text-blue-600"
        >
          87%
        </motion.div>
      </div>

      {/* Missing Skills */}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500">
          Missing Skills
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {missingSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* AI Career Insight */}

      <div className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <h3 className="font-semibold text-blue-700">
          AI Career Insight
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Learn Docker and build a deployment project to
          improve your job match score and strengthen your
          backend deployment skills.
        </p>
      </div>
    </motion.div>
  );
}