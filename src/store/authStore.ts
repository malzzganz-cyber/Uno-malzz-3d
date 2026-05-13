import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "../types";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (v: boolean) => void;
  isAdmin: () => boolean;
}

const ADMIN_UIDS = (import.meta.env.VITE_ADMIN_UIDS || "").split(",").map((s: string) => s.trim()).filter(Boolean);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      isAdmin: () => {
        const uid = get().user?.uid;
        return uid ? ADMIN_UIDS.includes(uid) : false;
      },
    }),
    { name: "uno-auth", partialize: (s) => ({ user: s.user }) }
  )
);
