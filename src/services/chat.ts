import { ref, push, onValue, set, remove, update, serverTimestamp as rtdbTimestamp } from "firebase/database";
import { rtdb } from "../firebase/config";
import type { ChatMessage, MessageType } from "../types";

const PROFANITY = ["spam", "hack", "cheat"];

function filterProfanity(text: string): string {
  let result = text;
  for (const word of PROFANITY) {
    result = result.replace(new RegExp(word, "gi"), "***");
  }
  return result;
}

export async function sendMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  content: string,
  type: MessageType = "TEXT",
  replyTo?: string
): Promise<void> {
  const filtered = filterProfanity(content);
  const chatRef = ref(rtdb, `room_chats/${roomId}`);
  const msgRef = push(chatRef);
  const msg: Omit<ChatMessage, "id"> = {
    roomId,
    senderId,
    senderName,
    senderAvatar,
    type,
    content: filtered,
    isPinned: false,
    isDeleted: false,
    isEdited: false,
    timestamp: Date.now(),
    ...(replyTo ? { replyTo } : {}),
  };
  await set(msgRef, msg);
}

export function subscribeToChat(
  roomId: string,
  cb: (messages: ChatMessage[]) => void
): () => void {
  const chatRef = ref(rtdb, `room_chats/${roomId}`);
  return onValue(chatRef, (snap) => {
    if (!snap.exists()) { cb([]); return; }
    const msgs: ChatMessage[] = [];
    snap.forEach((child) => {
      msgs.push({ id: child.key!, ...child.val() });
    });
    cb(msgs.sort((a, b) => a.timestamp - b.timestamp));
  });
}

export async function deleteMessage(roomId: string, messageId: string): Promise<void> {
  await update(ref(rtdb, `room_chats/${roomId}/${messageId}`), { isDeleted: true, content: "[Message deleted]" });
}

export async function editMessage(roomId: string, messageId: string, content: string): Promise<void> {
  await update(ref(rtdb, `room_chats/${roomId}/${messageId}`), { content: filterProfanity(content), isEdited: true });
}

export async function pinMessage(roomId: string, messageId: string): Promise<void> {
  await update(ref(rtdb, `room_chats/${roomId}/${messageId}`), { isPinned: true });
}

export async function clearRoomChat(roomId: string): Promise<void> {
  await remove(ref(rtdb, `room_chats/${roomId}`));
}

export function setTypingStatus(roomId: string, uid: string, isTyping: boolean): void {
  const r = ref(rtdb, `typing_status/${roomId}/${uid}`);
  if (isTyping) set(r, { uid, timestamp: Date.now() });
  else remove(r);
}

export function subscribeToTyping(roomId: string, cb: (typers: string[]) => void): () => void {
  return onValue(ref(rtdb, `typing_status/${roomId}`), (snap) => {
    if (!snap.exists()) { cb([]); return; }
    const typers: string[] = [];
    snap.forEach((c) => { typers.push(c.val().uid); });
    cb(typers);
  });
}

export async function sendSystemMessage(roomId: string, content: string): Promise<void> {
  const chatRef = ref(rtdb, `room_chats/${roomId}`);
  const msgRef = push(chatRef);
  await set(msgRef, {
    roomId,
    senderId: "system",
    senderName: "System",
    senderAvatar: "",
    type: "SYSTEM",
    content,
    isPinned: false,
    isDeleted: false,
    isEdited: false,
    timestamp: Date.now(),
  });
}
