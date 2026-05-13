import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, set, onDisconnect } from "firebase/database";
import { auth, db, rtdb } from "../firebase/config";
import type { UserProfile, PlayerRole } from "../types";

const ADMIN_UIDS = (import.meta.env.VITE_ADMIN_UIDS || "").split(",").map((s: string) => s.trim()).filter(Boolean);

function getRole(uid: string): PlayerRole {
  return ADMIN_UIDS.includes(uid) ? "ADMIN" : "USER";
}

export async function register(email: string, password: string, username: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = cred.user;
  const role = getRole(uid);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`;
  const profile: UserProfile = {
    uid, username, email, avatar, role,
    xp: 0, level: 1, coins: 100,
    wins: 0, losses: 0, gamesPlayed: 0, winRate: 0,
    createdAt: Date.now(),
    isBanned: false, isMuted: false,
  };
  await setDoc(doc(db, "users", uid), { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  if (!snap.exists()) throw new Error("User profile not found");
  return snap.data() as UserProfile;
}

export async function signOut(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (uid) {
    await set(ref(rtdb, `online_users/${uid}`), null);
  }
  await fbSignOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
}

export function setOnlinePresence(uid: string, username: string): () => void {
  const presenceRef = ref(rtdb, `online_users/${uid}`);
  const data = { uid, username, online: true, lastSeen: Date.now() };
  set(presenceRef, data);
  onDisconnect(presenceRef).remove();
  return () => set(presenceRef, null);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
