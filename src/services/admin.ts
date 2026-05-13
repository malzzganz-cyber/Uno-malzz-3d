import { collection, getDocs, query, orderBy, limit, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, onValue, set, remove } from "firebase/database";
import { db, rtdb } from "../firebase/config";
import type { UserProfile, GameRoom } from "../types";
import { deleteRoom } from "./rooms";

export async function banPlayer(uid: string, reason: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isBanned: true, banReason: reason });
}

export async function unbanPlayer(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isBanned: false, banReason: null });
}

export async function mutePlayer(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isMuted: true });
}

export async function unmutePlayer(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isMuted: false });
}

export async function getAllUsers(limitCount = 50): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(limitCount)));
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function getAllRooms(): Promise<GameRoom[]> {
  const snap = await getDocs(query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(50)));
  return snap.docs.map((d) => d.data() as GameRoom);
}

export function subscribeToOnlineUsers(cb: (users: Record<string, unknown>) => void): () => void {
  return onValue(ref(rtdb, "online_users"), (snap) => {
    cb(snap.exists() ? snap.val() : {});
  });
}

export function subscribeToActiveRooms(cb: (rooms: Record<string, unknown>) => void): () => void {
  return onValue(ref(rtdb, "active_rooms"), (snap) => {
    cb(snap.exists() ? snap.val() : {});
  });
}

export async function broadcastAnnouncement(message: string): Promise<void> {
  await set(ref(rtdb, "broadcast"), { message, timestamp: Date.now() });
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  await set(ref(rtdb, "maintenance"), { enabled, timestamp: Date.now() });
}

export async function forceDeleteRoom(roomId: string): Promise<void> {
  await deleteRoom(roomId);
}
