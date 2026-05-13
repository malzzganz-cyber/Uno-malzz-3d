import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Home, Ban, Volume2, VolumeX, Trash2, Megaphone, Activity } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuthStore } from "../store/authStore";
import { useLocation } from "wouter";
import {
  getAllUsers, getAllRooms, banPlayer, unbanPlayer, mutePlayer,
  unmutePlayer, subscribeToOnlineUsers, subscribeToActiveRooms,
  broadcastAnnouncement, setMaintenanceMode, forceDeleteRoom
} from "../services/admin";
import type { UserProfile, GameRoom } from "../types";
import toast from "react-hot-toast";

export default function Admin() {
  const { user, isAdmin } = useAuthStore();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"overview" | "users" | "rooms">("overview");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, unknown>>({});
  const [activeRooms, setActiveRooms] = useState<Record<string, unknown>>({});
  const [announcement, setAnnouncement] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin()) { setLocation("/dashboard"); return; }
    const unsub1 = subscribeToOnlineUsers(setOnlineUsers);
    const unsub2 = subscribeToActiveRooms(setActiveRooms);
    loadUsers();
    loadRooms();
    return () => { unsub1(); unsub2(); };
  }, [user]);

  async function loadUsers() {
    try { setUsers(await getAllUsers()); } catch { /* ignore */ }
  }
  async function loadRooms() {
    try { setRooms(await getAllRooms()); } catch { /* ignore */ }
  }

  async function handleBan(uid: string, isBanned: boolean) {
    try {
      if (isBanned) await unbanPlayer(uid);
      else await banPlayer(uid, "Admin ban");
      toast.success(isBanned ? "Player unbanned" : "Player banned");
      loadUsers();
    } catch { toast.error("Failed to ban/unban"); }
  }

  async function handleMute(uid: string, isMuted: boolean) {
    try {
      if (isMuted) await unmutePlayer(uid);
      else await mutePlayer(uid);
      toast.success(isMuted ? "Player unmuted" : "Player muted");
      loadUsers();
    } catch { toast.error("Failed to mute/unmute"); }
  }

  async function handleDeleteRoom(roomId: string) {
    try {
      await forceDeleteRoom(roomId);
      toast.success("Room deleted");
      loadRooms();
    } catch { toast.error("Failed to delete room"); }
  }

  async function handleBroadcast() {
    if (!announcement.trim()) return;
    try {
      await broadcastAnnouncement(announcement.trim());
      setAnnouncement("");
      toast.success("Announcement broadcast!");
    } catch { toast.error("Failed to broadcast"); }
  }

  if (!user || !isAdmin()) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="ml-16 md:ml-56 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-red-400 w-7 h-7" />
              <h1 className="text-3xl font-black text-white">Admin Panel</h1>
              <span className="px-3 py-1 rounded-full text-xs bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
                {user.role}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Online Users", value: Object.keys(onlineUsers).length, color: "text-green-400" },
                { label: "Active Rooms", value: Object.keys(activeRooms).length, color: "text-cyan-400" },
                { label: "Total Users", value: users.length, color: "text-purple-400" },
                { label: "Total Rooms", value: rooms.length, color: "text-yellow-400" },
              ].map(({ label, value, color }) => (
                <GlassCard key={label} className="text-center !py-4">
                  <div className={`text-3xl font-black ${color}`}>{value}</div>
                  <div className="text-white/40 text-xs mt-1">{label}</div>
                </GlassCard>
              ))}
            </div>

            {/* Broadcast */}
            <GlassCard className="mb-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Megaphone size={18} className="text-yellow-400" /> Broadcast Announcement
              </h2>
              <div className="flex gap-3">
                <input
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Broadcast a message to all rooms..."
                  className="flex-1 bg-white/10 border border-white/20 focus:border-yellow-500/50 rounded-2xl px-4 py-2.5 text-white placeholder-white/30 outline-none text-sm"
                  data-testid="input-announcement"
                  onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleBroadcast}
                  disabled={!announcement.trim()}
                  className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm"
                  data-testid="button-broadcast"
                >
                  Send
                </motion.button>
              </div>
            </GlassCard>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["overview", "users", "rooms"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${tab === t ? "bg-purple-600/40 text-purple-300 border border-purple-500/40" : "text-white/40 hover:text-white/70"}`}
                  data-testid={`tab-${t}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Users Tab */}
            {tab === "users" && (
              <GlassCard className="!p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <Users size={16} /> Users ({users.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["User", "Role", "Level", "Wins", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.uid} className="border-b border-white/5 hover:bg-white/2">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt={u.username} className="w-7 h-7 rounded-full bg-white/10" />
                              <div>
                                <p className="text-white text-sm font-medium">{u.username}</p>
                                <p className="text-white/30 text-[10px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/60 text-sm">{u.role}</td>
                          <td className="px-4 py-3 text-white/60 text-sm">{u.level}</td>
                          <td className="px-4 py-3 text-white/60 text-sm">{u.wins}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {u.isBanned && <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">Banned</span>}
                              {u.isMuted && <span className="text-[10px] bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded-full">Muted</span>}
                              {!u.isBanned && !u.isMuted && <span className="text-[10px] bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleBan(u.uid, u.isBanned)}
                                className="text-red-400/60 hover:text-red-400 transition-colors"
                                data-testid={`button-ban-${u.uid}`}
                                title={u.isBanned ? "Unban" : "Ban"}>
                                <Ban size={14} />
                              </button>
                              <button onClick={() => handleMute(u.uid, u.isMuted)}
                                className="text-yellow-400/60 hover:text-yellow-400 transition-colors"
                                data-testid={`button-mute-${u.uid}`}
                                title={u.isMuted ? "Unmute" : "Mute"}>
                                {u.isMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

            {/* Rooms Tab */}
            {tab === "rooms" && (
              <GlassCard className="!p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <Home size={16} /> Rooms ({rooms.length})
                  </h2>
                </div>
                <div>
                  {rooms.map((room) => {
                    const playerCount = Object.keys(room.players).length;
                    return (
                      <div key={room.id} className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{room.name}</p>
                          <p className="text-white/40 text-xs">{room.code} · {room.mode} · {playerCount}/{room.maxPlayers} players</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${room.status === "PLAYING" ? "bg-green-600/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                          {room.status}
                        </span>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                          data-testid={`button-delete-room-${room.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {rooms.length === 0 && (
                    <div className="p-8 text-center text-white/30">No rooms found</div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Overview Tab */}
            {tab === "overview" && (
              <GlassCard>
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-green-400" /> Live Activity
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/50 text-xs mb-2">Online Users</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(onlineUsers).map((u: unknown) => {
                        const uu = u as { uid: string; username: string };
                        return (
                          <div key={uu.uid} className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            <span className="text-green-400 text-xs">{uu.username || "User"}</span>
                          </div>
                        );
                      })}
                      {Object.keys(onlineUsers).length === 0 && <span className="text-white/20 text-sm">No users online</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-2">Active Rooms</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(activeRooms).map((r: unknown) => {
                        const rr = r as { id: string; name: string; mode: string; status: string };
                        return (
                          <div key={rr.id} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                            <span className="text-purple-400 text-xs">{rr.name || rr.id} · {rr.mode}</span>
                          </div>
                        );
                      })}
                      {Object.keys(activeRooms).length === 0 && <span className="text-white/20 text-sm">No active rooms</span>}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
