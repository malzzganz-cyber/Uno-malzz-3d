import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { onAuthChange, getUserProfile, setOnlinePresence } from "../services/auth";

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
        if (profile) {
          setOnlinePresence(profile.uid, profile.username);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, isLoading };
}
