"use client";

import React, { useState } from "react";
import {
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  hasGeminiApiKey,
  testGeminiConnection,
} from "@/lib/gemini";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onKeyChange }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(() => (isOpen ? getStoredGeminiApiKey() : ""));
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiApiKey(apiKey);
    onKeyChange?.();
    onClose();
  };

  const handleClear = () => {
    setStoredGeminiApiKey("");
    setApiKey("");
    setTestResult({ status: "idle" });
    onKeyChange?.();
  };

  const handleTestConnection = async () => {
    if (!apiKey || apiKey.trim().length < 8) {
      setTestResult({
        status: "error",
        message: "Please enter a valid Gemini API Key first.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: "idle" });

    try {
      const res = await testGeminiConnection(apiKey.trim());
      if (res.success) {
        setTestResult({
          status: "success",
          message: `Connection verified! Gemini AI (${res.model}) is ready.`,
        });
        setStoredGeminiApiKey(apiKey.trim());
        onKeyChange?.();
      } else {
        setTestResult({
          status: "error",
          message: res.error || "Failed to reach Gemini API. Please check your key in Google AI Studio.",
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to verify Gemini API key.";
      setTestResult({
        status: "error",
        message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Gemini AI Configuration</h2>
            <p className="text-xs text-muted-foreground">
              Power live ATS resume rewrites and interactive mock interviews.
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current Status:</span>
          {hasGeminiApiKey() ? (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              Gemini API Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-amber-500">
              <AlertCircle className="w-4 h-4" />
              Running in Fallback Mode
            </span>
          )}
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Google Gemini API Key</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full h-11 rounded-xl border border-border/80 bg-background px-3.5 pr-11 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Stored securely in browser localStorage.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Test Result Feedback */}
        {testResult.status === "success" && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testResult.message}</span>
          </div>
        )}

        {testResult.status === "error" && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {apiKey && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Key</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/80 text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isTesting ? "Testing..." : "Test Connection"}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
