import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Users, Trophy, Settings, LogOut, Shield, User } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { signOut } from "../services/auth";
import { useOnlineCount } from "../hooks/useOnlineUsers";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Navbar() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuthStore();
  const onlineCount = useOnlineCount();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 bottom-0 w-16 md:w-56 glass-strong border-r border-white/10 flex flex-col z-40"
    >
      <div className="p-3 md:p-4 border-b border-white/10">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-2xl gradient-hero flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">U</span>
            </div>
            <div className="hidden md:block">
              <p className="text-white font-black text-sm gradient-text">UNO 3D</p>
              <p className="text-white/40 text-[10px]">{onlineCount} online</p>
            </div>
          </div>
        </Link>
      </div>

      {user && (
        <div className="p-3 md:p-4 border-b border-white/10">
          <Link href="/profile">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                alt={user.username}
                className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0"
              />
              <div className="hidden md:block min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.username}</p>
                <p className="text-purple-400 text-[10px]">Lv.{user.level} · {user.xp} XP</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="flex-1 p-2 md:p-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <motion.div
              whileHover={{ x: 4 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer",
                location === path
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="hidden md:block text-sm font-medium">{label}</span>
            </motion.div>
          </Link>
        ))}
        {isAdmin() && (
          <Link href="/admin">
            <motion.div
              whileHover={{ x: 4 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer",
                location === "/admin"
                  ? "bg-red-600/30 text-red-300 border border-red-500/30"
                  : "text-red-400/70 hover:text-red-300 hover:bg-red-500/10"
              )}
            >
              <Shield size={18} className="flex-shrink-0" />
              <span className="hidden md:block text-sm font-medium">Admin</span>
            </motion.div>
          </Link>
        )}
      </div>

      <div className="p-2 md:p-3 border-t border-white/10">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          data-testid="button-signout"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="hidden md:block text-sm font-medium">Sign Out</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
