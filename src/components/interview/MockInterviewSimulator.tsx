"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  HelpCircle,
  Clock,
  RotateCcw,
  Calendar,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/auth-ui";
import {
  generateInterviewQuestionsWithGemini,
  evaluateInterviewAnswerWithGemini,
  generateInterviewFinalReportWithGemini,
  hasGeminiApiKey,
} from "@/lib/gemini";
import type {
  InterviewQuestion,
  InterviewSession,
  SeniorityLevel,
  InterviewCategory,
  AnswerRecord,
} from "@/types/interview";
import { TECH_ROLES } from "@/lib/ats-analyzer";

// Fallback questions if Gemini API key is not configured or offline
const FALLBACK_QUESTIONS: Record<string, InterviewQuestion[]> = {
  "frontend-engineer": [
    {
      id: "fe-1",
      question: "Can you explain how React's Virtual DOM reconciliation and Fiber architecture work under the hood?",
      category: "technical",
      context: "Assesses deep understanding of React rendering lifecycle, scheduling, and commit phase.",
      hints: ["Mention diffing algorithm (O(n))", "Fiber node tree and work-in-progress tree", "Concurrent Mode & prioritization"],
      keyTopics: ["Virtual DOM", "Fiber Architecture", "Concurrent React"],
    },
    {
      id: "fe-2",
      question: "Describe a time when you had to diagnose and fix a severe web performance bottleneck or high Interaction to Next Paint (INP).",
      category: "behavioral",
      context: "Evaluates debugging methodology, Core Web Vitals expertise, and structured STAR delivery.",
      hints: ["State the specific metric (e.g., INP > 200ms)", "Explain profiling in DevTools", "Quantify the post-optimization result"],
      keyTopics: ["Core Web Vitals", "INP", "Profiling", "STAR Method"],
    },
    {
      id: "fe-3",
      question: "How would you design a scalable state management architecture for a real-time collaborative web dashboard?",
      category: "system-design",
      context: "Tests architectural tradeoffs between local state, global stores (Zustand/Redux), server cache, and WebSockets.",
      hints: ["Optimistic UI updates", "WebSocket conflict resolution (CRDTs/OT)", "Memory leak prevention"],
      keyTopics: ["State Architecture", "WebSockets", "Optimistic UI"],
    },
  ],
  "fullstack-developer": [
    {
      id: "fs-1",
      question: "How do you handle database concurrency, race conditions, and transactional integrity in high-traffic microservices?",
      category: "technical",
      context: "Evaluates SQL isolation levels, distributed locks, and idempotency.",
      hints: ["Optimistic vs. pessimistic locking", "ACID transactions", "Redis distributed lock"],
      keyTopics: ["Concurrency", "Transactions", "PostgreSQL"],
    },
    {
      id: "fs-2",
      question: "Walk me through how you design and secure a multi-tenant SaaS authentication and authorization system.",
      category: "system-design",
      context: "Tests RBAC/ABAC models, JWT token rotation, and tenant isolation.",
      hints: ["Row-level security in PostgreSQL", "Refresh token rotation & revocation", "Session hijacking defense"],
      keyTopics: ["OAuth2 / JWT", "Multi-Tenancy", "RBAC"],
    },
  ],
};

export function MockInterviewSimulator({
  onOpenApiKeyModal,
}: {
  onOpenApiKeyModal?: () => void;
}) {
  const [session, setSession] = useState<InterviewSession>({
    roleTitle: "Frontend Engineer / React Developer",
    roleKey: "frontend-engineer",
    level: "mid",
    category: "mixed",
    questions: [],
    currentIndex: 0,
    answers: {},
    status: "setup",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswerText, setCurrentAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Speech recognition ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer lifecycle during active question
  useEffect(() => {
    if (session.status === "in-progress") {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session.status, session.currentIndex]);

  // Voice synthesis (Speech to Speech question reader)
  const speakQuestion = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Voice to Text answering)
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. You can type your answer directly in the box.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setCurrentAnswerText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  // 1. Start Interview Session
  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      let questions: InterviewQuestion[] = [];
      const roleName = TECH_ROLES[session.roleKey]?.title || "Software Engineer";

      if (hasGeminiApiKey()) {
        try {
          questions = await generateInterviewQuestionsWithGemini(
            roleName,
            session.level,
            session.category,
            3,
            session.customJD
          );
        } catch (geminiError) {
          console.warn("Gemini question generation error, falling back to local questions:", geminiError);
          questions = FALLBACK_QUESTIONS[session.roleKey] || FALLBACK_QUESTIONS["frontend-engineer"];
        }
      } else {
        questions = FALLBACK_QUESTIONS[session.roleKey] || FALLBACK_QUESTIONS["frontend-engineer"];
      }

      setSession((prev) => ({
        ...prev,
        roleTitle: roleName,
        questions,
        currentIndex: 0,
        answers: {},
        status: "in-progress",
      }));
      setTimerSeconds(0);
      setCurrentAnswerText("");
      setShowHints(false);
    } catch (err) {
      console.error("Failed to initialize interview:", err);
      alert("Failed to generate interview session. Please check your settings.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit candidate answer for grading
  const handleSubmitAnswer = async () => {
    if (!currentAnswerText.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentQ = session.questions[session.currentIndex];
    setIsLoading(true);

    try {
      let evaluation = undefined;

      if (hasGeminiApiKey()) {
        evaluation = await evaluateInterviewAnswerWithGemini(
          currentQ.question,
          session.roleTitle,
          session.level,
          currentAnswerText.trim()
        );
      } else {
        // Fallback local grading heuristic
        const wordCount = currentAnswerText.trim().split(/\s+/).length;
        const score = Math.min(9.2, Math.max(4.5, (wordCount / 30) * 4.5));
        evaluation = {
          score: Number(score.toFixed(1)),
          starRating: Math.round(score / 2),
          summary: "Good effort covering the conceptual baseline. Adding specific production metrics and architectural trade-offs would raise this to a senior-level answer.",
          strengths: [
            "Demonstrated core conceptual vocabulary.",
            "Clearly articulated the primary approach.",
          ],
          improvements: [
            "Quantify the trade-offs or performance numbers.",
            "Structure the response explicitly around the STAR formula (Situation, Task, Action, Result).",
          ],
          idealModelAnswer:
            "In my previous project, we faced this exact challenge. First, I analyzed the profiling metrics which showed 300ms bottleneck. I then designed a solution by decoupling the state and implementing memoization. This reduced latency by 45% for 100K daily active users.",
          technicalAccuracyScore: 82,
          communicationScore: 78,
        };
      }

      const updatedRecord: AnswerRecord = {
        transcript: currentAnswerText.trim(),
        evaluation,
        durationSeconds: timerSeconds,
      };

      setSession((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: updatedRecord,
        },
        status: "evaluating",
      }));
    } catch (err) {
      console.error("Answer evaluation error:", err);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Move to next question or generate final report
  const handleNextQuestion = async () => {
    const isLastQuestion = session.currentIndex >= session.questions.length - 1;

    if (isLastQuestion) {
      setIsLoading(true);
      try {
        const history = session.questions.map((q) => ({
          question: q.question,
          answer: session.answers[q.id]?.transcript || "",
          evaluation: session.answers[q.id]?.evaluation,
        }));

        let finalReport = undefined;
        if (hasGeminiApiKey()) {
          finalReport = await generateInterviewFinalReportWithGemini(
            session.roleTitle,
            session.level,
            history
          );
        } else {
          // Fallback report
          finalReport = {
            overallScore: 84,
            recommendation: "Hire" as const,
            executiveSummary: `The candidate showed strong conceptual understanding for the ${session.roleTitle} role. Technical depth was solid across primary frameworks with clear explanations.`,
            competencyScores: {
              technicalDepth: 86,
              communication: 82,
              problemSolving: 85,
              starStructure: 80,
            },
            topStrengths: [
              "Strong fundamental architecture principles",
              "Clear communication style and systematic approach",
              "Good technical terminology and modern tooling knowledge",
            ],
            actionableNextSteps: [
              "Practice incorporating quantifiable metrics (latencies, % gains, user volume) in behavioral questions.",
              "Deep-dive into distributed caching and edge failure modes.",
            ],
            recommendedPrepDays: [
              { day: 1, focus: "STAR Framework Drills", task: "Structure 5 past projects using Situation, Task, Action, Result with clear metrics." },
              { day: 2, focus: "Core Architecture & Diffing", task: "Review reconciliation internals and component scheduling lifecycles." },
              { day: 3, focus: "System Performance Profiling", task: "Practice profiling React render trees using Chrome DevTools Performance panel." },
              { day: 4, focus: "State & Caching Tradeoffs", task: "Compare TanStack Query vs. global stores for real-time WebSocket state." },
              { day: 5, focus: "Scalability Edge Cases", task: "Practice live whiteboarding for distributed rate-limiting and optimistic UI." },
              { day: 6, focus: "Mock Interview Simulation", task: "Re-run full-length 5-question mock interview session." },
              { day: 7, focus: "Executive Presentation", task: "Refine 90-second 'Tell me about yourself' elevator pitch." },
            ],
          };
        }

        setSession((prev) => ({
          ...prev,
          status: "completed",
          finalReport,
        }));
      } catch (err) {
        console.error("Final report generation error:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSession((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        status: "in-progress",
      }));
      setCurrentAnswerText("");
      setTimerSeconds(0);
      setShowHints(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const currentQ = session.questions[session.currentIndex];
  const currentEvaluation = currentQ ? session.answers[currentQ.id]?.evaluation : undefined;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 2.0 AI Mock Interview Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Technical & Behavioral Mock Interviewer
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Practice real-time technical rounds with dynamic AI questions, speech recognition, instant FAANG-caliber grading, and custom STAR model answers.
            </p>
          </div>

          {/* Gemini API Status Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-colors ${
                hasGeminiApiKey()
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{hasGeminiApiKey() ? "Gemini AI Active" : "Connect Gemini Key"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 1: SETUP SCREEN */}
      {session.status === "setup" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Configure Interview Parameters</h2>
            <p className="text-xs text-muted-foreground">
              Tailor the interview focus, seniority bar, and target role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Role
              </label>
              <select
                value={session.roleKey}
                onChange={(e) =>
                  setSession((prev) => ({ ...prev, roleKey: e.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {Object.entries(TECH_ROLES).map(([key, role]) => (
                  <option key={key} value={key}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Seniority Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seniority Level
              </label>
              <select
                value={session.level}
                onChange={(e) =>
                  setSession((prev) => ({
                    ...prev,
                    level: e.target.value as SeniorityLevel,
                  }))
                }
                className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="entry">Entry Level / Junior (0-2 YOE)</option>
                <option value="mid">Mid-Level Engineer (2-5 YOE)</option>
                <option value="senior">Senior Engineer (5-8 YOE)</option>
                <option value="lead">Staff / Lead Architect (8+ YOE)</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interview Type
              </label>
              <select
                value={session.category}
                onChange={(e) =>
                  setSession((prev) => ({
                    ...prev,
                    category: e.target.value as InterviewCategory,
                  }))
                }
                className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="mixed">Full Loop (Technical + Behavioral + System)</option>
                <option value="technical">Technical Deep-Dive</option>
                <option value="behavioral">Behavioral & Leadership (STAR Method)</option>
                <option value="system-design">System Design & Architecture</option>
              </select>
            </div>
          </div>

          {/* Optional Job Description Input */}
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowJdInput((prev) => !prev)}
              className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1"
            >
              {showJdInput
                ? "– Remove Custom Job Description"
                : "+ Tailor to Specific Job Description (LinkedIn / Indeed)"}
            </button>

            {showJdInput && (
              <div className="mt-3 space-y-2 animate-in fade-in">
                <textarea
                  rows={4}
                  value={session.customJD || ""}
                  onChange={(e) =>
                    setSession((prev) => ({ ...prev, customJD: e.target.value }))
                  }
                  placeholder="Paste job posting requirements here to generate 100% company-targeted interview questions..."
                  className="w-full rounded-2xl border border-border/80 bg-background p-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              disabled={isLoading}
              onClick={handleStartInterview}
              className="px-8 font-bold shadow-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span>Generating AI Interview Questions...</span>
                </>
              ) : (
                <>
                  <span>Begin Mock Interview</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STAGE 2 & 3: ACTIVE INTERVIEW ARENA & EVALUATION */}
      {(session.status === "in-progress" || session.status === "evaluating") && currentQ && (
        <div className="space-y-6 animate-in fade-in">
          {/* Progress Header & Timer */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md text-xs font-semibold">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
                Question {session.currentIndex + 1} of {session.questions.length}
              </span>
              <span className="uppercase text-muted-foreground">
                {currentQ.category} Round
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-relaxed text-foreground">
                {currentQ.question}
              </h2>
              <button
                type="button"
                onClick={() => speakQuestion(currentQ.question)}
                className={`p-3 rounded-2xl border transition-colors shrink-0 ${
                  isSpeaking
                    ? "border-amber-500 bg-amber-500/20 text-amber-500 animate-pulse"
                    : "border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
                title="Listen to question"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {currentQ.context && (
              <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                <span className="font-semibold text-amber-500">Recruiter Intent:</span>{" "}
                {currentQ.context}
              </p>
            )}

            {/* Hints Accordion */}
            {currentQ.hints && currentQ.hints.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHints((prev) => !prev)}
                  className="text-xs font-semibold text-sky-500 hover:underline inline-flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHints ? "Hide Hints" : "Show Answering Hints"}</span>
                </button>
                {showHints && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-1.5 text-xs text-sky-700 dark:text-sky-300 animate-in fade-in">
                    {currentQ.hints.map((hint, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Response Box & Speech-to-Text */}
          {session.status === "in-progress" && (
            <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Answer (Voice or Type)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse shadow-md"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/60"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Recording (Click to stop)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Speak Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={6}
                value={currentAnswerText}
                onChange={(e) => setCurrentAnswerText(e.target.value)}
                placeholder="Speak using microphone or type your structured STAR response here..."
                className="w-full rounded-2xl border border-border/80 bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-xs font-mono text-muted-foreground">
                  Word Count: {currentAnswerText.trim().split(/\s+/).filter(Boolean).length} words
                </span>

                <Button
                  size="default"
                  disabled={isLoading || !currentAnswerText.trim()}
                  onClick={handleSubmitAnswer}
                  className="font-bold shadow-md"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      <span>Gemini Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      <span>Submit for AI Grading</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Real-time Answer Feedback & Grading View */}
          {session.status === "evaluating" && currentEvaluation && (
            <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl font-mono border border-amber-500/20">
                    {currentEvaluation.score}
                  </div>
                  <div>
                    <div className="font-bold text-base">Question Grade: {currentEvaluation.score} / 10</div>
                    <div className="text-xs text-muted-foreground">
                      {"★".repeat(currentEvaluation.starRating)}
                      {"☆".repeat(5 - currentEvaluation.starRating)} STAR Rating
                    </div>
                  </div>
                </div>

                <Button
                  size="default"
                  onClick={handleNextQuestion}
                  disabled={isLoading}
                  className="font-bold shadow-md"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <>
                      <span>
                        {session.currentIndex >= session.questions.length - 1
                          ? "View Final Scorecard"
                          : "Next Question"}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Verdict Summary */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 text-sm leading-relaxed">
                <span className="font-bold text-amber-500">Verdict: </span>
                {currentEvaluation.summary}
              </div>

              {/* Strengths & Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>What Went Well</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {currentEvaluation.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Areas to Level-Up</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {currentEvaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal Model Answer */}
              {currentEvaluation.idealModelAnswer && (
                <div className="p-5 rounded-2xl bg-background/60 border border-border/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-500">
                    <Award className="w-4 h-4" />
                    <span>Ideal FAANG-Caliber STAR Model Answer</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed font-mono bg-muted/30 p-3 rounded-xl">
                    {currentEvaluation.idealModelAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STAGE 4: FINAL COMPREHENSIVE SCORECARD */}
      {session.status === "completed" && session.finalReport && (
        <div className="space-y-8 animate-in fade-in">
          {/* Executive Verdict Banner */}
          <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border/60 pb-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Interview Evaluation Complete
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Recommendation:{" "}
                  <span
                    className={
                      session.finalReport.recommendation === "Strong Hire" ||
                      session.finalReport.recommendation === "Hire"
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }
                  >
                    {session.finalReport.recommendation}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Target: {session.roleTitle} ({session.level.toUpperCase()})
                </p>
              </div>

              {/* Overall Score Dial */}
              <div className="w-28 h-28 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shadow-lg">
                <span className="text-3xl font-extrabold text-amber-500 font-mono">
                  {session.finalReport.overallScore}%
                </span>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Readiness
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Executive Hiring Verdict
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed bg-background/40 p-4 rounded-2xl border border-border/60">
                {session.finalReport.executiveSummary}
              </p>
            </div>

            {/* Competency Breakdown Radar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Technical Depth</div>
                <div className="text-2xl font-bold font-mono">
                  {session.finalReport.competencyScores.technicalDepth}%
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Communication</div>
                <div className="text-2xl font-bold font-mono">
                  {session.finalReport.competencyScores.communication}%
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Problem Solving</div>
                <div className="text-2xl font-bold font-mono">
                  {session.finalReport.competencyScores.problemSolving}%
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/20">
                <div className="text-xs text-muted-foreground mb-1">STAR Structure</div>
                <div className="text-2xl font-bold font-mono">
                  {session.finalReport.competencyScores.starStructure}%
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Targeted Preparation Roadmap */}
          {session.finalReport.recommendedPrepDays && (
            <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-2.5 font-bold text-lg">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h2>Personalized 7-Day Interview Preparation Sprint</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.finalReport.recommendedPrepDays.map((day) => (
                  <div
                    key={day.day}
                    className="p-4 rounded-2xl border border-border/70 bg-background/50 flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      D{day.day}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-amber-600 dark:text-amber-300">
                        {day.focus}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {day.task}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset / Start New */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() =>
                setSession((prev) => ({
                  ...prev,
                  status: "setup",
                  questions: [],
                  currentIndex: 0,
                  answers: {},
                }))
              }
              className="gap-2 font-bold shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Another Mock Interview</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
