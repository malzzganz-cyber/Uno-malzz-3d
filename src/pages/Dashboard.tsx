import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Plus, Search, Globe, Users, Zap, Trophy, Coins, Lock } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuthStore } from "../store/authStore";
import { createRoom, findRoomByCode, getPublicRooms, joinRoom } from "../services/rooms";
import type { GameRoom, GameMode, Player } from "../types";
import toast from "react-hot-toast";
import { FloatingParticles } from "../components/ui/FloatingParticles";

const gameModes: { mode: GameMode; label: string; desc: string; color: string }[] = [
  { mode: "CLASSIC", label: "Classic", desc: "108 cards, standard rules", color: "from-purple-600 to-indigo-600" },
  { mode: "FLIP", label: "Flip", desc: "Dual-sided cards with dark mode", color: "from-pink-600 to-purple-600" },
  { mode: "NO_MERCY", label: "No Mercy", desc: "Brutal stacking, +10 draws", color: "from-red-600 to-orange-600" },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [publicRooms, setPublicRooms] = useState<GameRoom[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [selectedMode, setSelectedMode] = useState<GameMode>("CLASSIC");
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    loadRooms();
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadRooms() {
    try {
      const rooms = await getPublicRooms();
      setPublicRooms(rooms);
    } catch { /* silently ignore */ }
  }

  async function handleCreateRoom() {
    if (!user || !roomName.trim()) return;
    setLoading(true);
    try {
      const player: Player = {
        uid: user.uid, username: user.username, avatar: user.avatar,
        role: user.role, xp: user.xp, level: user.level, coins: user.coins,
        isReady: false, isOnline: true, cardCount: 0, hasCalledUno: false, isEliminated: false,
      };
      const room = await createRoom(user.uid, player, roomName.trim(), selectedMode, maxPlayers, isPublic);
      toast.success("Room created!");
      setLocation(`/room/${room.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinByCode() {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    try {
      const room = await findRoomByCode(joinCode.trim().toUpperCase());
      if (!room) { toast.error("Room not found"); return; }
      const player: Player = {
        uid: user.uid, username: user.username, avatar: user.avatar,
        role: user.role, xp: user.xp, level: user.level, coins: user.coins,
        isReady: false, isOnline: true, cardCount: 0, hasCalledUno: false, isEliminated: false,
      };
      await joinRoom(room.id, player);
      toast.success("Joined room!");
      setLocation(`/room/${room.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinPublicRoom(room: GameRoom) {
    if (!user) return;
    setLoading(true);
    try {
      const player: Player = {
        uid: user.uid, username: user.username, avatar: user.avatar,
        role: user.role, xp: user.xp, level: user.level, coins: user.coins,
        isReady: false, isOnline: true, cardCount: 0, hasCalledUno: false, isEliminated: false,
      };
      await joinRoom(room.id, player);
      setLocation(`/room/${room.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <FloatingParticles />
      <Navbar />
      <main className="ml-16 md:ml-56 p-4 md:p-6 min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Zap, label: "XP", value: user.xp.toLocaleString(), color: "text-purple-400" },
              { icon: Trophy, label: "Level", value: user.level, color: "text-yellow-400" },
              { icon: Users, label: "Wins", value: user.wins, color: "text-green-400" },
              { icon: Coins, label: "Coins", value: user.coins.toLocaleString(), color: "text-cyan-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <GlassCard key={label} className="text-center py-4">
                <Icon className={`${color} w-6 h-6 mx-auto mb-2`} />
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-white/50 text-xs mt-1">{label}</div>
              </GlassCard>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create / Join */}
            <div className="space-y-4">
              {/* Join by code */}
              <GlassCard>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Search size={18} className="text-cyan-400" /> Join Room
                </h3>
                <div className="flex gap-3">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code..."
                    maxLength={6}
                    className="flex-1 bg-white/10 border border-white/20 focus:border-cyan-500/50 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 outline-none text-sm font-mono tracking-widest"
                    data-testid="input-room-code"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleJoinByCode}
                    disabled={loading || !joinCode.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm transition-colors"
                    data-testid="button-join-room"
                  >
                    Join
                  </motion.button>
                </div>
              </GlassCard>

              {/* Create Room */}
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Plus size={18} className="text-purple-400" /> Create Room
                  </h3>
                  <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="text-purple-400 text-sm hover:text-purple-300"
                    data-testid="button-toggle-create"
                  >
                    {showCreate ? "Collapse" : "Expand"}
                  </button>
                </div>
                <AnimatePresence>
                  {showCreate && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      <input
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Room name..."
                        maxLength={30}
                        className="w-full bg-white/10 border border-white/20 focus:border-purple-500/50 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 outline-none text-sm"
                        data-testid="input-room-name"
                      />
                      <div>
                        <p className="text-white/60 text-xs mb-2">Game Mode</p>
                        <div className="grid grid-cols-3 gap-2">
                          {gameModes.map(({ mode, label, color }) => (
                            <button
                              key={mode}
                              onClick={() => setSelectedMode(mode)}
                              className={`py-2 px-3 rounded-2xl text-xs font-semibold transition-all bg-gradient-to-br ${color} ${selectedMode === mode ? "opacity-100 ring-2 ring-white/40" : "opacity-50"}`}
                              data-testid={`button-mode-${mode.toLowerCase()}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <p className="text-white/60 text-xs mb-2">Max Players</p>
                          <select
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-white text-sm outline-none"
                            data-testid="select-max-players"
                          >
                            {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} players</option>)}
                          </select>
                        </div>
                        <div className="flex items-end pb-0.5">
                          <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${isPublic ? "bg-green-600/30 text-green-400 border border-green-500/30" : "bg-white/10 text-white/50"}`}
                            data-testid="button-toggle-public"
                          >
                            {isPublic ? <><Globe size={14} /> Public</> : <><Lock size={14} /> Private</>}
                          </button>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleCreateRoom}
                        disabled={loading || !roomName.trim()}
                        className="w-full gradient-hero text-white font-bold py-3 rounded-2xl disabled:opacity-40"
                        data-testid="button-create-room"
                      >
                        {loading ? "Creating..." : "Create Room"}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!showCreate && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreate(true)}
                    className="w-full gradient-hero text-white font-bold py-3 rounded-2xl"
                    data-testid="button-create-room-quick"
                  >
                    Create New Room
                  </motion.button>
                )}
              </GlassCard>
            </div>

            {/* Public Rooms */}
            <GlassCard className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <Globe size={18} className="text-green-400" />
                <h3 className="text-white font-bold">Public Rooms</h3>
                <span className="ml-auto text-white/30 text-sm">{publicRooms.length} rooms</span>
              </div>
              <div className="overflow-y-auto max-h-80">
                {publicRooms.length === 0 ? (
                  <div className="p-6 text-center text-white/30 text-sm">No public rooms. Create one!</div>
                ) : (
                  publicRooms.map((room) => {
                    const playerCount = Object.keys(room.players).length;
                    const modeColors: Record<string, string> = { CLASSIC: "text-purple-400", FLIP: "text-pink-400", NO_MERCY: "text-red-400" };
                    return (
                      <motion.div
                        key={room.id}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                        className="flex items-center gap-3 px-4 py-3 border-b border-white/5 cursor-pointer"
                        onClick={() => handleJoinPublicRoom(room)}
                        data-testid={`button-join-public-${room.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{room.name}</p>
                          <p className={`text-xs ${modeColors[room.mode]}`}>{room.mode}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white/60 text-xs">{playerCount}/{room.maxPlayers}</p>
                          <div className="flex gap-0.5 justify-end mt-1">
                            {Array.from({ length: room.maxPlayers }).map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${i < playerCount ? "bg-green-400" : "bg-white/20"}`} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
