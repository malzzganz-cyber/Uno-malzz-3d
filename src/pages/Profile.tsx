import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Coins, Star, Edit2, Save } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuthStore } from "../store/authStore";
import { updateUserProfile } from "../services/auth";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const winRate = user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;
  const xpToNextLevel = user.level * 500;
  const xpProgress = Math.min((user.xp % xpToNextLevel) / xpToNextLevel * 100, 100);

  async function handleSave() {
    if (!username.trim() || username.trim().length < 3) { toast.error("Username too short"); return; }
    setSaving(true);
    try {
      await updateUserProfile(user!.uid, { username: username.trim() });
      setUser({ ...user!, username: username.trim() });
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    { label: "Games Played", value: user.gamesPlayed, icon: Star, color: "text-purple-400" },
    { label: "Wins", value: user.wins, icon: Trophy, color: "text-yellow-400" },
    { label: "Losses", value: user.losses, icon: Star, color: "text-red-400" },
    { label: "Win Rate", value: `${winRate}%`, icon: Zap, color: "text-green-400" },
    { label: "Total XP", value: user.xp.toLocaleString(), icon: Zap, color: "text-cyan-400" },
    { label: "Coins", value: user.coins.toLocaleString(), icon: Coins, color: "text-yellow-300" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="ml-16 md:ml-56 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Profile Header */}
            <GlassCard className="mb-6">
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-20 h-20 rounded-3xl bg-white/10"
                    data-testid="img-avatar"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full px-2 py-0.5 text-white text-[10px] font-black">
                    Lv.{user.level}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="flex gap-2 mb-2">
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm outline-none flex-1 focus:border-purple-500/70"
                        data-testid="input-edit-username"
                        maxLength={20}
                      />
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-xl text-sm flex items-center gap-1"
                        data-testid="button-save-profile"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button onClick={() => { setEditing(false); setUsername(user.username); }}
                        className="text-white/40 hover:text-white px-2 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-black text-white" data-testid="text-username">{user.username}</h1>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                        {user.role}
                      </span>
                      <button
                        onClick={() => setEditing(true)}
                        className="text-white/30 hover:text-white transition-colors ml-1"
                        data-testid="button-edit-profile"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-white/40 text-sm mb-3">{user.email}</p>

                  {/* XP Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Level {user.level}</span>
                      <span>{user.xp % xpToNextLevel} / {xpToNextLevel} XP</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <GlassCard key={label} className="text-center !p-4">
                  <Icon className={`${color} w-5 h-5 mx-auto mb-2`} />
                  <div className={`text-xl font-black ${color}`} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</div>
                  <div className="text-white/40 text-xs mt-1">{label}</div>
                </GlassCard>
              ))}
            </div>

            {/* Achievements Placeholder */}
            <GlassCard>
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" /> Achievements
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { icon: "🎴", label: "First Win", unlocked: user.wins > 0 },
                  { icon: "🔥", label: "On Fire", unlocked: user.wins >= 5 },
                  { icon: "🌟", label: "Pro", unlocked: user.wins >= 20 },
                  { icon: "👑", label: "Legend", unlocked: user.wins >= 50 },
                  { icon: "⚡", label: "Speed", unlocked: user.gamesPlayed >= 10 },
                  { icon: "🎮", label: "Veteran", unlocked: user.gamesPlayed >= 100 },
                ].map(({ icon, label, unlocked }) => (
                  <div key={label} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${unlocked ? "glass" : "opacity-30 glass"}`}>
                    <div className="text-2xl">{icon}</div>
                    <p className="text-[10px] text-white/60 text-center">{label}</p>
                    {unlocked && <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
