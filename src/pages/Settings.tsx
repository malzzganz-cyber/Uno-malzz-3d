import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Bell, Shield, Palette } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuthStore } from "../store/authStore";
import { signOut } from "../services/auth";
import { useLocation } from "wouter";
import toast from "react-hot-toast";

export default function Settings() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [muted, setMuted] = useState(false);
  const [notifications, setNotifications] = useState(true);

  async function handleDeleteAccount() {
    const confirmed = window.confirm("Are you sure? This cannot be undone.");
    if (!confirmed) return;
    toast.error("Account deletion is not available. Contact support.");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="ml-16 md:ml-56 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-white mb-6">Settings</h1>

            <div className="space-y-4">
              <GlassCard>
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Volume2 size={18} className="text-purple-400" /> Audio
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Sound Effects", desc: "Card plays, UNO calls, game sounds", state: !muted, toggle: () => setMuted(!muted) },
                  ].map(({ label, desc, state, toggle }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-white/40 text-xs">{desc}</p>
                      </div>
                      <button
                        onClick={toggle}
                        data-testid={`toggle-${label.toLowerCase().replace(/\s/g, "-")}`}
                        className={`w-12 h-6 rounded-full transition-all relative ${state ? "bg-purple-600" : "bg-white/20"}`}
                      >
                        <motion.div
                          animate={{ x: state ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Bell size={18} className="text-cyan-400" /> Notifications
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">In-game Notifications</p>
                    <p className="text-white/40 text-xs">Turn alerts, game events</p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    data-testid="toggle-notifications"
                    className={`w-12 h-6 rounded-full transition-all relative ${notifications ? "bg-cyan-600" : "bg-white/20"}`}
                  >
                    <motion.div
                      animate={{ x: notifications ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
                    />
                  </button>
                </div>
              </GlassCard>

              <GlassCard>
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-red-400" /> Account
                </h2>
                <div className="space-y-3">
                  {user && (
                    <div className="glass rounded-2xl p-4 text-sm">
                      <p className="text-white/50">Signed in as</p>
                      <p className="text-white font-semibold">{user.email}</p>
                      <p className="text-purple-400 text-xs mt-1">UID: {user.uid.slice(0, 12)}...</p>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    className="w-full py-2.5 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium border border-red-500/30 transition-all"
                    data-testid="button-delete-account"
                  >
                    Delete Account
                  </motion.button>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
