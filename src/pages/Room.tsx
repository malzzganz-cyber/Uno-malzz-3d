import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Copy, Crown, Play, UserX, MessageCircle, ArrowLeft } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { RoomChat } from "../components/chat/RoomChat";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuthStore } from "../store/authStore";
import { subscribeToRoom, setPlayerReady, kickPlayer, startGame, leaveRoom } from "../services/rooms";
import { sendSystemMessage as chatSystemMsg } from "../services/chat";
import type { GameRoom, Player } from "../types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function Room() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const roomId = params.id;
  const { user } = useAuthStore();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    if (!roomId) { setLocation("/dashboard"); return; }

    const unsub = subscribeToRoom(roomId, (r) => {
      if (!r) { setLocation("/dashboard"); return; }
      setRoom(r);
      if (r.status === "PLAYING") {
        setLocation(`/match/${roomId}`);
      }
    });
    return unsub;
  }, [roomId, user]);

  async function handleReady() {
    if (!user || !room) return;
    const isReady = room.players[user.uid]?.isReady ?? false;
    await setPlayerReady(roomId, user.uid, !isReady);
  }

  async function handleStart() {
    if (!room || !user || room.ownerId !== user.uid) return;
    const players = Object.values(room.players);
    if (players.length < 2) { toast.error("Need at least 2 players"); return; }
    const allReady = players.every((p) => p.uid === user.uid || p.isReady);
    if (!allReady) { toast.error("Not all players are ready"); return; }
    setLoading(true);
    try {
      const playerOrder = Object.keys(room.players);
      await startGame(roomId, room.mode, playerOrder);
      await chatSystemMsg(roomId, "The game has started! Good luck!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setLoading(false);
    }
  }

  async function handleKick(targetUid: string) {
    if (!room || !user || room.ownerId !== user.uid) return;
    await kickPlayer(roomId, targetUid);
    await chatSystemMsg(roomId, `A player was kicked from the room.`);
    toast.success("Player kicked");
  }

  async function handleLeave() {
    if (!user) return;
    await leaveRoom(roomId, user.uid);
    setLocation("/dashboard");
  }

  async function copyCode() {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    toast.success("Room code copied!");
  }

  if (!room || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  const players = Object.values(room.players);
  const isOwner = room.ownerId === user.uid;
  const myPlayer = room.players[user.uid];
  const allReady = players.every((p) => p.uid === user.uid || p.isReady);
  const canStart = isOwner && players.length >= 2 && allReady;

  const modeColors: Record<string, string> = { CLASSIC: "from-purple-600 to-indigo-600", FLIP: "from-pink-600 to-purple-600", NO_MERCY: "from-red-600 to-orange-600" };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="ml-16 md:ml-56 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleLeave} className="text-white/40 hover:text-white transition-colors" data-testid="button-leave-room">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white">{room.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${modeColors[room.mode]} text-white`}>
                    {room.mode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-mono"
                    data-testid="button-copy-code"
                  >
                    <Copy size={14} /> {room.code}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Players */}
              <div className="md:col-span-2 space-y-3">
                <h2 className="text-white/70 text-sm font-medium">Players ({players.length}/{room.maxPlayers})</h2>
                {players.map((player) => (
                  <motion.div
                    key={player.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-4 flex items-center gap-4"
                  >
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`}
                      alt={player.username}
                      className="w-10 h-10 rounded-full bg-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold truncate">{player.username}</p>
                        {room.ownerId === player.uid && <Crown size={14} className="text-yellow-400 flex-shrink-0" />}
                        {player.uid === user.uid && <span className="text-cyan-400 text-xs">(you)</span>}
                      </div>
                      <p className="text-white/40 text-xs">Lv.{player.level} · {player.xp} XP</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.uid !== user.uid ? (
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          player.isReady ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
                        )}>
                          {player.isReady ? "Ready" : "Not Ready"}
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReady}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                            myPlayer?.isReady
                              ? "bg-green-600/30 text-green-400 border border-green-500/40"
                              : "bg-white/10 text-white/60 border border-white/20 hover:border-green-500/40"
                          )}
                          data-testid="button-ready"
                        >
                          {myPlayer?.isReady ? "Ready!" : "Ready?"}
                        </motion.button>
                      )}
                      {isOwner && player.uid !== user.uid && (
                        <button
                          onClick={() => handleKick(player.uid)}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                          data-testid={`button-kick-${player.uid}`}
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {players.length < room.maxPlayers && (
                  <div className="glass rounded-2xl p-4 border border-dashed border-white/10 flex items-center justify-center text-white/20 text-sm">
                    Waiting for {room.maxPlayers - players.length} more player(s)...
                  </div>
                )}

                {isOwner && (
                  <motion.button
                    whileHover={{ scale: canStart ? 1.02 : 1 }}
                    whileTap={{ scale: canStart ? 0.98 : 1 }}
                    onClick={handleStart}
                    disabled={!canStart || loading}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                      canStart ? "gradient-hero text-white neon-purple" : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                    data-testid="button-start-game"
                  >
                    <Play size={20} />
                    {loading ? "Starting..." : canStart ? "Start Game!" : "Waiting for all players to be ready..."}
                  </motion.button>
                )}
              </div>

              {/* Chat */}
              <div>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full mb-3 glass rounded-2xl py-2.5 text-white/60 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors md:hidden"
                  data-testid="button-toggle-chat"
                >
                  <MessageCircle size={16} /> {showChat ? "Hide Chat" : "Show Chat"}
                </button>
                <div className={cn("h-80 md:h-[calc(100vh-14rem)]", !showChat && "hidden md:block")}>
                  <RoomChat roomId={roomId} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
