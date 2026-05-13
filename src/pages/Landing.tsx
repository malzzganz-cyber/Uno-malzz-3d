import { motion } from "framer-motion";
import { Link } from "wouter";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import { useOnlineCount } from "../hooks/useOnlineUsers";
import { useAuthStore } from "../store/authStore";

const demoCards = [
  { color: "RED", label: "7", rotate: -15, x: -120, y: 20 },
  { color: "BLUE", label: "+2", rotate: -5, x: -40, y: -10 },
  { color: "WILD", label: "W", rotate: 5, x: 40, y: 10 },
  { color: "GREEN", label: "⊘", rotate: 15, x: 120, y: 25 },
  { color: "YELLOW", label: "⇄", rotate: 25, x: 200, y: 40 },
];

const colorMap: Record<string, string> = {
  RED: "from-red-600 to-red-900",
  BLUE: "from-blue-600 to-blue-900",
  GREEN: "from-green-600 to-green-900",
  YELLOW: "from-yellow-500 to-yellow-900",
  WILD: "from-purple-600 to-purple-900",
};

export default function Landing() {
  const onlineCount = useOnlineCount();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8 relative h-48 flex items-center justify-center">
            {demoCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: card.y,
                  rotate: card.rotate,
                  x: card.x,
                }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                whileHover={{ y: card.y - 20, scale: 1.1, zIndex: 10 }}
                className={`absolute w-16 h-24 rounded-2xl bg-gradient-to-br ${colorMap[card.color]} border-2 border-white/30 flex items-center justify-center cursor-pointer shadow-2xl`}
                style={{ zIndex: i }}
              >
                <span className="text-white font-black text-xl drop-shadow-lg">{card.label}</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4">
              <span className="gradient-text">UNO 3D</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-2 font-light">
              Multiplayer · Realtime · Premium
            </p>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 mb-10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">{onlineCount} players online now</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-4 rounded-3xl gradient-hero text-white font-bold text-lg neon-purple"
                    data-testid="button-go-dashboard"
                  >
                    Play Now
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-10 py-4 rounded-3xl gradient-hero text-white font-bold text-lg neon-purple"
                      data-testid="button-register"
                    >
                      Play Free
                    </motion.button>
                  </Link>
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-10 py-4 rounded-3xl glass text-white font-bold text-lg border border-white/20"
                      data-testid="button-login"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-center text-white mb-12"
        >
          Why <span className="gradient-text">UNO 3D?</span>
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "⚡", title: "Real-Time Multiplayer", desc: "Firebase-powered instant synchronization. Every card play, every action synced in milliseconds." },
            { icon: "🎮", title: "3 Game Modes", desc: "Classic UNO, UNO Flip with dark side mechanics, and brutal UNO No Mercy." },
            { icon: "🏆", title: "XP & Leaderboard", desc: "Earn XP, level up, unlock achievements and compete globally on the leaderboard." },
            { icon: "💬", title: "Room Chat", desc: "Full realtime chat with emoji, GIF, reply, typing indicators and more." },
            { icon: "🎨", title: "Premium 3D Cards", desc: "Beautiful animated UNO cards with hover effects, glow and flip animations." },
            { icon: "🛡️", title: "Admin Panel", desc: "Full admin control: ban, mute, kick, monitor rooms, broadcast announcements." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-6 hover:border-purple-500/30 hover:border transition-all"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl max-w-2xl mx-auto p-12"
        >
          <h2 className="text-4xl font-black text-white mb-4">Ready to Play?</h2>
          <p className="text-white/50 mb-8">Join thousands of players in the most premium UNO experience online.</p>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-4 rounded-3xl gradient-hero text-white font-bold text-xl neon-purple"
              data-testid="button-cta-register"
            >
              Start Playing Free
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
