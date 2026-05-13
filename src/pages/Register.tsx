import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { register } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import toast from "react-hot-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email || !password) return;
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (username.trim().length < 3) { toast.error("Username must be at least 3 characters"); return; }
    setLoading(true);
    try {
      const profile = await register(email, password, username.trim());
      setUser(profile);
      toast.success(`Welcome, ${profile.username}! Ready to play UNO?`);
      setLocation("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg.includes("email-already-in-use") ? "Email already in use" : msg);
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
          <p className="text-white/50 mt-2">Create your account and start playing</p>
        </div>

        <div className="glass-strong rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CoolPlayer123"
                required
                minLength={3}
                maxLength={20}
                className="w-full bg-white/10 border border-white/20 focus:border-purple-500/70 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none transition-colors"
                data-testid="input-username"
              />
            </div>
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
                  minLength={6}
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

            <div className="glass rounded-2xl p-3 text-xs text-white/40">
              By registering, you start with 100 coins and Level 1.
              Play games to earn XP and level up!
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gradient-hero text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="button-register-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-white/40 text-sm">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer">Sign in</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
