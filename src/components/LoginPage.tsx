import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formattedUsername = username.trim();
      // Handle ID mapping: "Storefries" -> "storefries@storefries.com", or let standard emails pass-through.
      const email = formattedUsername.toLowerCase().includes("@")
        ? formattedUsername
        : `${formattedUsername.toLowerCase()}@storefries.com`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        triggerShake();
        toast.error(`Access Denied: ${error.message}`);
        setIsLoading(false);
      } else {
        toast.success("Welcome back! Loading dashboard...");
        // Brief timeout for standard smooth transitions
        setTimeout(() => {
          onLoginSuccess();
        }, 600);
      }
    } catch (err) {
      console.error("Authentication Error: ", err);
      setErrorMessage("An unexpected authentication error occurred");
      triggerShake();
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-foreground),_transparent_45%)] opacity-10 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-[440px] px-6 py-12 z-10 flex flex-col items-center">
        {/* Branding header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
            <img
              src="/app-logo.png"
              alt="Storefries Logo"
              className="h-16 w-auto rounded-xl object-contain bg-slate-900/50 p-1"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Storefries Sales</h1>
          <p className="text-sm text-slate-400 mt-1.5">Outbound department secure access gateway</p>
        </div>

        {/* Login Card */}
        <div
          className={`w-full rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            shake ? "animate-bounce" : ""
          }`}
          style={
            shake
              ? {
                  animation: "shake 0.5s ease-in-out",
                }
              : undefined
          }
        >
          <h2 className="text-lg font-bold text-white mb-6">Staff Authentication</h2>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300" htmlFor="username">
                Department ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your ID"
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300" htmlFor="password">
                Secure Key
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:shadow-emerald-950/20 active:scale-[0.98] transition-all duration-200 mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <span>Access Dashboard</span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Storefries · Outbound Call Center Management.
          <br />
          Unauthorized access is strictly monitored.
        </p>
      </div>

      {/* Embedded style tag for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
