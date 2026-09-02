"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  Sparkles,
  Bot,
  FileText,
  Briefcase,
  CheckCircle2,
  Database,
  LayoutDashboard,
  FileCheck2,
  Mic,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/auth-ui";
import { InteractiveCharacter } from "@/components/ui/interactive-character";
import { InteractiveDotGrid } from "@/components/ui/interactive-dot-grid";
import { ResumeAnalyzer } from "@/components/resume/ResumeAnalyzer";
import { MockInterviewSimulator } from "@/components/interview/MockInterviewSimulator";
import { ApiKeyModal } from "@/components/ui/api-key-modal";
import { hasGeminiApiKey } from "@/lib/gemini";

export function UserDashboard() {
  const { user, userProfile, logout, isFirebaseConfigured } = useAuth();
  const [currentTab, setCurrentTab] = useState<"overview" | "resume" | "interview">("overview");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  // State trigger to re-render when key changes
  const [, setKeyUpdated] = useState(0);

  const candidateName = userProfile?.displayName || user?.displayName || "Candidate";
  const candidateEmail = userProfile?.email || user?.email || "candidate@hiremind.ai";
  const isGeminiConnected = hasGeminiApiKey();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Interactive Dot Grid Background */}
      <InteractiveDotGrid dotSpacing={32} baseRadius={1.2} maxRadius={4.5} influenceRadius={160} />

      {/* Ambient background auroras */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-500/10 dark:bg-yellow-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-border/70 backdrop-blur-md bg-card/40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-base sm:text-lg flex items-center gap-2">
                <span>HireMind AI</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  2.0 Live
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Intelligent Career Preparation Platform</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border/60 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setCurrentTab("overview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "overview"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab("resume")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "resume"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Resume ATS</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab("interview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "interview"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>AI Interview</span>
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Gemini API Status Badge & Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isGeminiConnected
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 shadow-sm"
                  : "border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground hover:border-amber-500/30"
              }`}
              title="Configure Google Gemini API Key"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Gemini AI:</span>
              <span>{isGeminiConnected ? "Active" : "Connect"}</span>
            </button>

            {/* Firebase connection status */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              <span>{isFirebaseConfigured ? "Firebase Synced" : "Local Mode"}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2 border-border/80 hover:bg-destructive/10 hover:text-destructive transition-colors text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-10 space-y-8">
        {/* TAB 1: OVERVIEW */}
        {currentTab === "overview" && (
          <div className="space-y-8 animate-in fade-in">
            {/* Welcome Hero Banner */}
            <div className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini 2.0 Flash AI Enabled</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                    {candidateName}
                  </span>
                  !
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Your AI-powered career assistant is ready. Optimize your resume for ATS algorithms, prepare for live technical interviews, and accelerate your job search.
                </p>

                {/* User Profile Card Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="px-3 py-1.5 rounded-lg bg-background/80 border border-border/80 text-xs font-mono text-muted-foreground">
                    UID: {user?.uid ? user.uid.slice(0, 16) + "..." : "local-auth-active"}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-background/80 border border-border/80 text-xs font-mono text-muted-foreground">
                    Email: {candidateEmail}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-background/80 border border-border/80 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Firestore Document Synced
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: AI Resume Optimizer */}
              <div className="group relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-md hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Resume ATS Optimizer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Instant ATS compatibility percentage, missing keyword alerts, and Gemini AI-powered STAR bullet rewrites.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCurrentTab("resume")}
                  className="w-full font-medium shadow-md"
                >
                  Launch ATS Analyzer
                </Button>
              </div>

              {/* Card 2: AI Mock Interview */}
              <div className="group relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-md hover:border-sky-500/40 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">AI Mock Interviewer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Real-time technical & behavioral voice interview simulations tailored to your target job role.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTab("interview")}
                  className="w-full font-medium"
                >
                  Start Mock Interview
                </Button>
              </div>

              {/* Card 3: Job Readiness Roadmap */}
              <div className="group relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-md hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Job Match Engine</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compare your skill profile against top positions and generate custom 7-day prep checklists.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTab("resume")}
                  className="w-full font-medium"
                >
                  Compare Job Post
                </Button>
              </div>
            </div>

            {/* Interactive Companion Assistant at Bottom */}
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                Click your AI companion for sound & reactions
              </p>
              <InteractiveCharacter className="max-w-[220px]" />
            </div>
          </div>
        )}

        {/* TAB 2: RESUME ATS ANALYZER */}
        {currentTab === "resume" && (
          <div className="animate-in fade-in">
            <ResumeAnalyzer onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
          </div>
        )}

        {/* TAB 3: MOCK INTERVIEW SIMULATOR */}
        {currentTab === "interview" && (
          <div className="animate-in fade-in">
            <MockInterviewSimulator onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
          </div>
        )}
      </main>

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyChange={() => setKeyUpdated((prev) => prev + 1)}
      />
    </div>
  );
}
