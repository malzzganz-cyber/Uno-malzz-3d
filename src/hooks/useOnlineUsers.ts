import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config";

export function useOnlineCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const r = ref(rtdb, "online_users");
    return onValue(r, (snap) => {
      setCount(snap.exists() ? Object.keys(snap.val()).length : 0);
    });
  }, []);
  return count;
}
