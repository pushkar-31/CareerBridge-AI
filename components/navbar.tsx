"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>

          <span className="text-2xl font-bold tracking-tight">
            SkillBridge
            <span className="text-blue-600"> AI</span>
          </span>
        </Link>

        {/* Navigation */}

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            Features
          </Link>

          <Link
            href="#how-it-works"
            className="font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            How it Works
          </Link>

          <Link
            href="#about"
            className="font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            About
          </Link>
        </div>

        {/* CTA Button */}

        <Button
          className="rounded-xl bg-blue-600 px-6 py-5 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg"
        >
          Get Started
        </Button>

      </div>
    </motion.nav>
  );
}