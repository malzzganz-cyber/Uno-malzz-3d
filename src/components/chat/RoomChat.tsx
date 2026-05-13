import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, X, Pin, Trash2, Edit2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  sendMessage, subscribeToChat, deleteMessage, editMessage,
  pinMessage, setTypingStatus, subscribeToTyping, sendSystemMessage
} from "../../services/chat";
import type { ChatMessage } from "../../types";
import { cn } from "@/lib/utils";

interface RoomChatProps {
  roomId: string;
  onClose?: () => void;
}

export function RoomChat({ roomId, onClose }: RoomChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typers, setTypers] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    const unsub = subscribeToChat(roomId, setMessages);
    const unsubTyping = subscribeToTyping(roomId, setTypers);
    return () => { unsub(); unsubTyping(); };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleInput(v: string) {
    setInput(v);
    if (!user) return;
    setTypingStatus(roomId, user.uid, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTypingStatus(roomId, user!.uid, false);
    }, 2000);
  }

  async function handleSend() {
    if (!input.trim() || !user || user.isMuted) return;
    await sendMessage(roomId, user.uid, user.username, user.avatar, input.trim(), "TEXT", replyTo?.id);
    setInput("");
    setReplyTo(null);
    setTypingStatus(roomId, user.uid, false);
  }

  async function handleEdit() {
    if (!editingId || !editContent.trim()) return;
    await editMessage(roomId, editingId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  }

  const otherTypers = typers.filter((uid) => uid !== user?.uid);

  return (
    <div className="flex flex-col h-full glass rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-sm">Room Chat</h3>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-2 group",
                msg.type === "SYSTEM" || msg.type === "GAME_EVENT" ? "justify-center" : "",
                msg.senderId === user?.uid ? "flex-row-reverse" : ""
              )}
            >
              {(msg.type === "SYSTEM" || msg.type === "GAME_EVENT") ? (
                <div className="text-xs text-white/40 bg-white/5 rounded-full px-3 py-1 italic">
                  {msg.content}
                </div>
              ) : msg.type === "ADMIN_ANNOUNCEMENT" ? (
                <div className="w-full bg-purple-500/20 border border-purple-500/30 rounded-2xl px-4 py-2 text-purple-300 text-sm font-medium">
                  📢 {msg.content}
                </div>
              ) : (
                <>
                  {msg.senderId !== user?.uid && (
                    <img src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                      alt={msg.senderName} className="w-7 h-7 rounded-full flex-shrink-0 bg-white/10" />
                  )}
                  <div className="max-w-[75%]">
                    {msg.senderId !== user?.uid && (
                      <p className="text-xs text-white/50 mb-1 ml-1">{msg.senderName}</p>
                    )}
                    {msg.replyTo && (
                      <div className="text-xs text-white/30 bg-white/5 rounded-lg px-2 py-1 mb-1 border-l-2 border-purple-500/50">
                        Replying to message
                      </div>
                    )}
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm break-words",
                      msg.senderId === user?.uid
                        ? "bg-purple-600/70 text-white rounded-tr-sm"
                        : "bg-white/10 text-white/90 rounded-tl-sm",
                      msg.isPinned && "border border-yellow-500/40"
                    )}>
                      {msg.isDeleted ? <span className="italic text-white/30">Deleted</span> : msg.content}
                      {msg.isEdited && !msg.isDeleted && <span className="text-white/30 text-xs ml-1">(edited)</span>}
                    </div>
                    <div className={cn("flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                      msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                      <button onClick={() => setReplyTo(msg)}
                        className="text-white/40 hover:text-white/80 text-xs">reply</button>
                      {msg.senderId === user?.uid && !msg.isDeleted && (
                        <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }}
                          className="text-white/40 hover:text-white/80"><Edit2 size={10} /></button>
                      )}
                      {(msg.senderId === user?.uid || isAdmin()) && !msg.isDeleted && (
                        <button onClick={() => deleteMessage(roomId, msg.id)}
                          className="text-white/40 hover:text-red-400"><Trash2 size={10} /></button>
                      )}
                      {isAdmin() && (
                        <button onClick={() => pinMessage(roomId, msg.id)}
                          className="text-white/40 hover:text-yellow-400"><Pin size={10} /></button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {otherTypers.length > 0 && (
          <div className="text-xs text-white/40 italic px-2">
            {otherTypers.length === 1 ? "Someone is typing..." : "Several people are typing..."}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="px-3 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-white/50 truncate">Replying to: {replyTo.content.slice(0, 40)}</div>
          <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white/70 ml-2"><X size={12} /></button>
        </div>
      )}

      {editingId && (
        <div className="px-3 py-2 bg-blue-500/10 border-t border-white/10">
          <div className="flex gap-2">
            <input value={editContent} onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 bg-white/10 rounded-xl px-3 py-1 text-sm text-white outline-none border border-white/20"
              onKeyDown={(e) => e.key === "Enter" && handleEdit()} />
            <button onClick={handleEdit} className="text-purple-400 hover:text-purple-300 text-xs font-medium">Save</button>
            <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white/70 text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-white/10">
        {user?.isMuted && (
          <div className="text-center text-xs text-red-400 mb-2">You are muted</div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => { handleInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={user?.isMuted ? "You are muted" : "Type a message..."}
            disabled={!!user?.isMuted}
            rows={1}
            className="flex-1 bg-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-white/30 outline-none border border-white/10 focus:border-purple-500/50 resize-none min-h-[36px] max-h-[100px]"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || !!user?.isMuted}
            className="w-9 h-9 flex-shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-colors"
            data-testid="button-send-message"
          >
            <Send size={14} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
