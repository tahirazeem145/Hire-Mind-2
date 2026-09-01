"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthUI } from "@/components/ui/auth-ui";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { Moon, Sun, Loader2 } from "lucide-react";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="relative w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shadow-lg">
          <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
        </div>
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Connecting to HireMind AI...
        </p>
      </div>
    );
  }

  return user ? <UserDashboard /> : <AuthUI />;
}

export function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Floating Theme Toggle */}
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/80 backdrop-blur-md shadow-md transition-all hover:scale-105 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Toggle theme"
          title="Toggle Light / Dark Mode"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>

        {/* Dynamic Authenticated / Unauthenticated View */}
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
