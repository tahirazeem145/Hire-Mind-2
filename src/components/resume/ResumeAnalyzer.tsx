"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Search,
  BookOpen,
  RefreshCw,
  Zap,
  Target,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/auth-ui";
import {
  analyzeResumeATS,
  extractTextFromFile,
  TECH_ROLES,
  SAMPLE_RESUMES,
} from "@/lib/ats-analyzer";
import type { ResumeAnalysisResult } from "@/types/resume";
import { InteractiveCharacter } from "@/components/ui/interactive-character";

export function ResumeAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("frontend-engineer");
  const [customJD, setCustomJD] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [activeTab, setActiveTab] = useState<"keywords" | "bullets" | "sections" | "recommendations">("keywords");

  // Analysis result state
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  // Process file upload
  const handleFileProcess = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const text = await extractTextFromFile(file);
      const sizeFormatted = (file.size / 1024).toFixed(1) + " KB";
      const analysis = analyzeResumeATS(
        text,
        file.name,
        sizeFormatted,
        selectedRole,
        showJdInput ? customJD : undefined
      );
      setResult(analysis);
    } catch (error) {
      console.error("Resume analysis error:", error);
      alert("Failed to parse resume file. Please ensure it is a valid PDF or text document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Load pre-built sample resumes for 1-click test
  const handleLoadSample = (type: "juniorReact" | "seniorFullstack") => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const sample = SAMPLE_RESUMES[type];
      const analysis = analyzeResumeATS(
        sample.text,
        `${type === "juniorReact" ? "Alex_Rivera_Resume" : "Sarah_Chen_Senior_Resume"}.pdf`,
        "128.4 KB",
        type === "juniorReact" ? "frontend-engineer" : "fullstack-developer",
        showJdInput ? customJD : undefined
      );
      setResult(analysis);
      setIsAnalyzing(false);
    }, 400);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500";
    if (score >= 60) return "text-amber-500 stroke-amber-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Resume ATS Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Resume ATS Analyzer & Keyword Optimizer
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your resume to get an instant industry ATS compatibility score, identify missing technical keywords, and convert passive bullet points into high-impact STAR statements.
            </p>
          </div>

          {/* Quick Action: Reset / New Analysis */}
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResult(null)}
              className="gap-2 shrink-0 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Analyze Another Resume</span>
            </Button>
          )}
        </div>
      </div>

      {/* Configuration & Upload Section */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target Role & Job Description Settings (Col 1) */}
          <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-lg space-y-5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Target className="w-5 h-5 text-amber-500" />
              <h2>1. Target Role & Match Criteria</h2>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Select Target Career Track
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-11 rounded-xl border border-border/80 bg-background/80 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {Object.entries(TECH_ROLES).map(([key, role]) => (
                  <option key={key} value={key}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Job Description Toggle */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Compare Against Specific Job Post</span>
                <button
                  type="button"
                  onClick={() => setShowJdInput((prev) => !prev)}
                  className="text-xs text-amber-500 font-semibold hover:underline"
                >
                  {showJdInput ? "Use Standard Role" : "+ Paste Job Description"}
                </button>
              </div>

              {showJdInput && (
                <div className="mt-3 space-y-2 animate-in fade-in">
                  <textarea
                    rows={4}
                    value={customJD}
                    onChange={(e) => setCustomJD(e.target.value)}
                    placeholder="Paste full job description from LinkedIn, Indeed, etc..."
                    className="w-full rounded-xl border border-border/80 bg-background/80 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Our AI parser will extract required technical skills directly from the text.
                  </p>
                </div>
              )}
            </div>

            {/* Quick 1-Click Samples */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Or test with 1-click sample:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample("juniorReact")}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/40 hover:bg-amber-500/10 hover:border-amber-500/30 text-xs font-medium transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Junior React Developer Sample</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("seniorFullstack")}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/40 hover:bg-sky-500/10 hover:border-sky-500/30 text-xs font-medium transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-sky-500" />
                    <span>Senior Full-Stack Engineer Sample</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Zone (Col 2 & 3) */}
          <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-8 shadow-lg flex flex-col items-center justify-center min-h-[340px]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full min-h-[280px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
                  : "border-border/80 hover:border-amber-500/50 hover:bg-card/80"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 shadow-inner">
                {isAnalyzing ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-lg font-bold mb-1">
                {isAnalyzing
                  ? "Analyzing Resume with AI Engine..."
                  : "Drag & Drop your Resume here"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-4">
                Supports PDF, DOCX, and TXT files. Client-side encrypted & parsed locally.
              </p>

              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={isAnalyzing}
                className="font-medium shadow-md pointer-events-none"
              >
                {isAnalyzing ? "Processing..." : "Browse Local File"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Scoreboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Radial Score Gauge */}
            <div className="md:col-span-1 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Overall ATS Score
              </span>

              {/* Radial Progress Circle */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-muted/40"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={getScoreColor(result.scores.overallScore)}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.scores.overallScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {result.scores.overallScore}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {result.scores.overallScore >= 80
                      ? "High Match"
                      : result.scores.overallScore >= 60
                      ? "Good Match"
                      : "Needs Work"}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                Target: <span className="font-semibold text-foreground">{result.targetRole}</span>
              </div>
            </div>

            {/* Sub-Score Breakdown Cards (3 Columns) */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Keyword Match */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Keyword Match</span>
                  <Search className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold">{result.scores.keywordScore}%</div>
                <div className="w-full bg-muted/40 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${result.scores.keywordScore}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Impact & Action Verbs */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Impact & Verbs</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold">{result.scores.impactScore}%</div>
                <div className="w-full bg-muted/40 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${result.scores.impactScore}%` }}
                  />
                </div>
              </div>

              {/* Card 3: Structure & Formatting */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Structure</span>
                  <Layers className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-2xl font-bold">{result.scores.structureScore}%</div>
                <div className="w-full bg-muted/40 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${result.scores.structureScore}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Technical Skills */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Core Skills</span>
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{result.scores.skillsScore}%</div>
                <div className="w-full bg-muted/40 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${result.scores.skillsScore}%` }}
                  />
                </div>
              </div>

              {/* Metadata Info Footer */}
              <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
                <span>File: {result.fileName} ({result.fileSize})</span>
                <span>Word Count: {result.wordCount} words</span>
                <span>Est. Reading Time: ~{result.readingTimeMinutes} min</span>
                <span>Analyzed: {result.analyzedAt}</span>
              </div>
            </div>
          </div>

          {/* Interactive Tabbed Deep Dive */}
          <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("keywords")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "keywords"
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                Keyword Breakdown ({result.matchedKeywords.length} Found / {result.missingKeywords.length} Missing)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bullets")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "bullets"
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                STAR Bullet Point Optimizer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sections")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "sections"
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                Section Health Check
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("recommendations")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "recommendations"
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                AI Priority Fixes ({result.topRecommendations.length})
              </button>
            </div>

            {/* TAB 1: Keywords Breakdown */}
            {activeTab === "keywords" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Missing Keywords Warning */}
                {result.missingKeywords.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-500 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Missing Critical Keywords (Add these to boost your ATS score)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((k, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20 flex items-center gap-1.5"
                        >
                          <span>{k.keyword}</span>
                          <span className="text-[10px] opacity-70">[{k.importance}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Keywords */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Keywords Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((k, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5"
                      >
                        <span>{k.keyword}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 font-bold">
                          {k.frequency}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Bullet Point Optimizer */}
            {activeTab === "bullets" && (
              <div className="space-y-6 animate-in fade-in">
                <p className="text-xs text-muted-foreground">
                  Transform passive task descriptions into quantified achievements using the **STAR Formula (Situation, Task, Action, Result)**.
                </p>

                <div className="space-y-4">
                  {result.bulletPoints.map((bp, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-4 shadow-sm"
                    >
                      {/* Before (Weak) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-red-500">
                          <span>Original Bullet Point</span>
                          <span className="font-mono">Impact: {bp.impactScoreBefore}/100</span>
                        </div>
                        <p className="text-sm line-through text-muted-foreground bg-red-500/5 p-2.5 rounded-xl border border-red-500/10">
                          {bp.original}
                        </p>
                      </div>

                      {/* After (Optimized STAR) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-500">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 fill-emerald-500" />
                            <span>AI Optimized STAR Rewrite</span>
                          </span>
                          <span className="font-mono">Impact: {bp.impactScoreAfter}/100 (+{bp.impactScoreAfter - bp.impactScoreBefore}%)</span>
                        </div>
                        <p className="text-sm font-medium text-foreground bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 leading-relaxed">
                          {bp.improved}
                        </p>
                      </div>

                      <div className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        <span className="font-semibold text-amber-500">Why this is better:</span> {bp.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Section Health Check */}
            {activeTab === "sections" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        sec.found
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      }`}
                    >
                      {sec.found ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">{sec.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{sec.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Actionable Recommendations */}
            {activeTab === "recommendations" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-3">
                  {result.topRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-border/80 bg-background/60 flex items-center gap-3 text-xs sm:text-sm font-medium"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Minion Score Proctor Reaction */}
          <div className="flex flex-col items-center justify-center pt-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
              {result.scores.overallScore >= 80
                ? "🎉 Minion is impressed with your resume score!"
                : "💡 Minion recommends adding the missing keywords above."}
            </p>
            <InteractiveCharacter className="max-w-[210px]" />
          </div>
        </div>
      )}
    </div>
  );
}
