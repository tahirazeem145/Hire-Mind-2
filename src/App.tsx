import { useState, useEffect } from "react";
import { AuthUI } from "@/components/ui/auth-ui";
import { Moon, Sun } from "lucide-react";

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
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <button
        onClick={() => setIsDark((prev) => !prev)}
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-md shadow-md transition-all hover:scale-105 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Toggle theme"
        title="Toggle Light / Dark Mode"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700" />
        )}
      </button>

      {/* Auth UI Component */}
      <AuthUI />
    </div>
  );
}

export default App;
