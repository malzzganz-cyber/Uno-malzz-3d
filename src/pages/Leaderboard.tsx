import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Zap, Star } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { GlassCard } from "../components/ui/GlassCard";
import { getLeaderboard } from "../services/leaderboard";
import { useAuthStore } from "../store/authStore";
import type { LeaderboardEntry } from "../types";

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard(50);
      setEntries(data);
    } catch {
      /* silently handle */
    } finally {
      setLoading(false);
    }
  }

  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const rankIcons = ["👑", "🥈", "🥉"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="ml-16 md:ml-56 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-yellow-400 w-7 h-7" />
              <h1 className="text-3xl font-black text-white">Leaderboard</h1>
            </div>

            {/* Top 3 */}
            {!loading && entries.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 0, 2].map((rankIdx) => {
                  const entry = entries[rankIdx];
                  if (!entry) return null;
                  const isFirst = rankIdx === 0;
                  return (
                    <motion.div
                      key={entry.uid}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: isFirst ? -8 : 0 }}
                      transition={{ delay: rankIdx * 0.1 }}
                      className={`glass rounded-3xl p-4 text-center ${isFirst ? "ring-2 ring-yellow-500/40" : ""}`}
                    >
                      <div className="text-3xl mb-2">{rankIcons[rankIdx]}</div>
                      <img
                        src={entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.uid}`}
                        alt={entry.username}
                        className="w-12 h-12 rounded-full mx-auto mb-2 bg-white/10"
                      />
                      <p className="text-white font-bold text-sm truncate">{entry.username}</p>
                      <p className={`${rankColors[rankIdx]} text-xs font-black mt-1`}>{entry.xp.toLocaleString()} XP</p>
                      <p className="text-white/40 text-[10px] mt-1">{entry.wins} wins · {Math.round(entry.winRate)}% wr</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <GlassCard className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-white font-bold">Global Rankings</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : entries.length === 0 ? (
                <div className="p-8 text-center text-white/30">No players yet. Be the first!</div>
              ) : (
                <div>
                  {entries.map((entry, idx) => {
                    const isMe = entry.uid === user?.uid;
                    return (
                      <motion.div
                        key={entry.uid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 ${isMe ? "bg-purple-600/10" : ""}`}
                        data-testid={`row-leaderboard-${entry.uid}`}
                      >
                        <div className={`w-8 text-center font-black text-sm ${idx < 3 ? rankColors[idx] : "text-white/30"}`}>
                          {idx < 3 ? rankIcons[idx] : `#${entry.rank}`}
                        </div>
                        <img
                          src={entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.uid}`}
                          alt={entry.username}
                          className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-semibold truncate">{entry.username}</p>
                            {isMe && <span className="text-cyan-400 text-[10px]">(you)</span>}
                          </div>
                          <p className="text-white/40 text-xs">Lv.{entry.level} · {entry.wins} wins</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-purple-400 font-bold text-sm">{entry.xp.toLocaleString()}</p>
                          <p className="text-white/30 text-xs">XP</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
