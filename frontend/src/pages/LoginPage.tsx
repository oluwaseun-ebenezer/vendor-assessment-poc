import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/utils";
import { ShieldCheck, Zap, FileText } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1C1C2E] flex-col justify-between p-12">
        <div>
          <img src="/carlsberg-logo.svg" alt="Carlsberg" className="h-12" />
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              AI Vendor Assessment
              <span className="block text-[#D4002A]">Platform</span>
            </h1>
            <p className="mt-4 text-white/60 text-lg leading-relaxed">
              From 45 days to under 10 minutes. Automated, consistent, and
              defensible vendor vetting powered by AI.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: "8-dimension risk scoring engine" },
              { icon: Zap, text: "LLM-powered document analysis" },
              { icon: FileText, text: "Instant PDF reports with action items" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D4002A]/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#D4002A]" />
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#D4002A]">45</p>
                <p className="text-white/40 text-xs mt-1">days manual</p>
              </div>
              <div className="flex-1 h-px bg-white/20 relative">
                <span className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">
                  vs
                </span>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">&lt;10</p>
                <p className="text-white/40 text-xs mt-1">mins automated</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-white/20 text-xs">
          © 2026 Carlsberg Group · Internal Tool · Confidential
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#F4F5F7] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <img src="/carlsberg-logo.svg" alt="Carlsberg" className="h-10" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-8">
              Sign in to your Carlsberg account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@carlsberg.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/30 focus:border-[#D4002A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/30 focus:border-[#D4002A] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
