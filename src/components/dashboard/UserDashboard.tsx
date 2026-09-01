"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  Sparkles,
  Bot,
  FileText,
  Briefcase,
  Award,
  CheckCircle2,
  Database,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/auth-ui";
import { InteractiveCharacter } from "@/components/ui/interactive-character";
import { InteractiveDotGrid } from "@/components/ui/interactive-dot-grid";

export function UserDashboard() {
  const { user, userProfile, logout, isFirebaseConfigured } = useAuth();

  const candidateName = userProfile?.displayName || user?.displayName || "Candidate";
  const candidateEmail = userProfile?.email || user?.email || "candidate@hiremind.ai";

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Interactive Dot Grid Background */}
      <InteractiveDotGrid dotSpacing={32} baseRadius={1.2} maxRadius={4.5} influenceRadius={160} />

      {/* Ambient background auroras */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-500/10 dark:bg-yellow-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-border/70 backdrop-blur-md bg-card/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg flex items-center gap-2">
                <span>HireMind AI</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  2.0 Beta
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Intelligent Career Preparation Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Firebase connection status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              <span>{isFirebaseConfigured ? "Firebase Connected" : "Local Demo Session"}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2 border-border/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-8 sm:p-10 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentication Verified</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">{candidateName}</span>!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Your AI-powered career assistant is ready. Prepare for live interviews, analyze your resume, and track your skills roadmap.
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
          {/* Card 1: AI Mock Interview */}
          <div className="group relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-md hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">AI Mock Interviewer</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Real-time voice and technical interview practice tailored to your target job role.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Launch Interview
            </Button>
          </div>

          {/* Card 2: AI Resume Optimizer */}
          <div className="group relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-md hover:border-sky-500/40 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Resume Intelligence</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Instant ATS score feedback, keyword optimization, and custom tailoring.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Analyze Resume
            </Button>
          </div>

          {/* Card 3: Job Readiness Roadmap */}
          <div className="group relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-md hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Job Match Engine</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Match your candidate profile against top engineering positions with gap analysis.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Matches
            </Button>
          </div>
        </div>

        {/* Firebase Setup Notice (if not yet configured) */}
        {!isFirebaseConfigured && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4 text-xs sm:text-sm text-amber-700 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Ready to connect your own live Firebase Project?</span>
              <p className="text-muted-foreground text-xs">
                Add your Firebase project credentials into the <code className="bg-background px-1.5 py-0.5 rounded font-mono">.env</code> file (<code className="bg-background px-1.5 py-0.5 rounded font-mono">VITE_FIREBASE_API_KEY</code>, etc.) to switch from demo storage to live Cloud Firestore.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Companion Assistant at Bottom */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Click your companion for assistance
          </p>
          <InteractiveCharacter className="max-w-[220px]" />
        </div>
      </main>
    </div>
  );
}
