import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signIn } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import toast from "react-hot-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const profile = await signIn(email, password);
      setUser(profile);
      toast.success(`Welcome back, ${profile.username}!`);
      if (profile.role === "ADMIN") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg.includes("user-not-found") || msg.includes("wrong-password")
        ? "Invalid email or password"
        : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <FloatingParticles />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-black gradient-text cursor-pointer">UNO 3D</h1>
          </Link>
          <p className="text-white/50 mt-2">Sign in to continue playing</p>
        </div>

        <div className="glass-strong rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/10 border border-white/20 focus:border-purple-500/70 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none transition-colors"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/10 border border-white/20 focus:border-purple-500/70 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/30 outline-none transition-colors"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gradient-hero text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="button-login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-white/40 text-sm">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer">Create one</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
