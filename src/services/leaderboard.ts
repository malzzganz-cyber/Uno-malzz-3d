import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import type { LeaderboardEntry, UserProfile } from "../types";

export async function getLeaderboard(limitCount = 50): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const u = d.data() as UserProfile;
    return {
      uid: u.uid,
      username: u.username,
      avatar: u.avatar,
      xp: u.xp,
      level: u.level,
      wins: u.wins,
      winRate: u.winRate,
      rank: i + 1,
    };
  });
}

export async function getMatchHistory(uid: string): Promise<unknown[]> {
  const { getDocs: gd, collection: col, query: q, where, orderBy: ob, limit: lim } = await import("firebase/firestore");
  const snap = await gd(q(col(db, "matches"), where("players", "array-contains", uid), ob("endedAt", "desc"), lim(20)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
