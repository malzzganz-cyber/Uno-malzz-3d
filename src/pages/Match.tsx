import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { MessageCircle, ArrowLeft, Wifi } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import { subscribeToRoom, subscribeToGameState, playCard, drawCard, callUno } from "../services/rooms";
import { sendSystemMessage } from "../services/chat";
import { PlayerHand } from "../components/game/PlayerHand";
import { DiscardPileDisplay } from "../components/game/DiscardPileDisplay";
import { PlayerList } from "../components/game/PlayerList";
import { ColorPicker } from "../components/game/ColorPicker";
import { WinnerModal } from "../components/game/WinnerModal";
import { RoomChat } from "../components/chat/RoomChat";
import type { GameState, GameRoom, UnoCard, CardColor, Player } from "../types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function Match() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const roomId = params.id;
  const { user } = useAuthStore();
  const { showColorPicker, setShowColorPicker, pendingWildCard, setPendingWildCard } = useGameStore();

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [gameState, setGameState] = useState<(GameState & { drawPile: UnoCard[] }) | null>(null);
  const [myHand, setMyHand] = useState<UnoCard[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [unoCalledRecently, setUnoCalledRecently] = useState(false);

  useEffect(() => {
    if (!user || !roomId) { setLocation("/dashboard"); return; }

    const unsubRoom = subscribeToRoom(roomId, setRoom);
    const unsubGame = subscribeToGameState(roomId, (state) => {
      setGameState(state);
      if (state && user) {
        setMyHand(state.playerHands[user.uid] || []);
      }
    });
    return () => { unsubRoom(); unsubGame(); };
  }, [roomId, user]);

  const isMyTurn = gameState?.currentTurn === user?.uid;
  const hasPendingDraw = (gameState?.pendingDrawCount ?? 0) > 0;

  async function handlePlayCard(card: UnoCard) {
    if (!user || !gameState || actionLoading) return;
    if (card.type === "WILD" || card.type === "WILD_DRAW_FOUR" || card.type === "WILD_DRAW_COLOR" || card.type === "WILD_DRAW_TWO") {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }
    setActionLoading(true);
    try {
      await playCard(roomId, user.uid, card);
      if (myHand.length === 2) {
        toast("You should call UNO!", { icon: "🚨" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to play card");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleColorPick(color: CardColor) {
    if (!user || !pendingWildCard || !gameState || actionLoading) return;
    setShowColorPicker(false);
    setActionLoading(true);
    try {
      await playCard(roomId, user.uid, pendingWildCard, color);
      setPendingWildCard(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to play card");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDraw() {
    if (!user || !gameState || !isMyTurn || actionLoading) return;
    setActionLoading(true);
    try {
      await drawCard(roomId, user.uid);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to draw card");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCallUno() {
    if (!user || !roomId || unoCalledRecently) return;
    setUnoCalledRecently(true);
    await callUno(roomId, user.uid);
    await sendSystemMessage(roomId, `${user.username} called UNO!`);
    toast("UNO! Called!", { icon: "🎴" });
    setTimeout(() => setUnoCalledRecently(false), 5000);
  }

  function handlePlayAgain() {
    setLocation(`/room/${roomId}`);
  }

  if (!user || !gameState || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading game...</p>
        </div>
      </div>
    );
  }

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const players = room.players;
  const playerOrder = gameState.playerOrder;
  const otherPlayers = playerOrder.filter((uid) => uid !== user.uid);
  const winnerPlayer = gameState.winner ? players[gameState.winner] : null;
  const isWinner = gameState.winner === user.uid;
  const canDraw = isMyTurn && !actionLoading;

  const modeTagColors: Record<string, string> = { CLASSIC: "bg-purple-600/30 text-purple-300", FLIP: "bg-pink-600/30 text-pink-300", NO_MERCY: "bg-red-600/30 text-red-300" };
  const directionLabel = gameState.direction === 1 ? "→" : "←";

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ background: "radial-gradient(ellipse at top, hsl(258 40% 8%) 0%, hsl(224 30% 5%) 60%, hsl(187 40% 7%) 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 glass flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/dashboard")} className="text-white/40 hover:text-white" data-testid="button-leave-match">
            <ArrowLeft size={18} />
          </button>
          <span className={`text-xs px-2 py-1 rounded-full ${modeTagColors[gameState.mode]}`}>{gameState.mode}</span>
          {gameState.currentSide === "DARK" && <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">Dark Side</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">{directionLabel}</span>
          {hasPendingDraw && (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
              className="bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
              +{gameState.pendingDrawCount} Draw!
            </motion.div>
          )}
          <Wifi size={16} className="text-green-400" />
          <button onClick={() => setShowChat(!showChat)} className="text-white/40 hover:text-white transition-colors" data-testid="button-toggle-chat">
            <MessageCircle size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Other Players */}
          <div className="p-3 overflow-x-auto flex-shrink-0">
            <div className="flex gap-3 min-w-max">
              {otherPlayers.map((uid) => {
                const p = players[uid];
                if (!p) return null;
                const handCount = gameState.playerHands[uid]?.length ?? 0;
                const isTurn = gameState.currentTurn === uid;
                return (
                  <motion.div
                    key={uid}
                    animate={isTurn ? { scale: 1.05 } : { scale: 1 }}
                    className={cn("glass rounded-2xl p-3 flex flex-col items-center gap-1 min-w-[80px]", isTurn && "border border-purple-500/60")}
                  >
                    <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`}
                      alt={p.username} className="w-8 h-8 rounded-full bg-white/10" />
                    <p className="text-white text-[10px] font-medium truncate max-w-[70px]">{p.username}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(handCount, 7) }).map((_, i) => (
                        <div key={i} className="w-3 h-5 rounded-sm bg-purple-800 border border-white/20" />
                      ))}
                    </div>
                    <p className="text-white/40 text-[10px]">{handCount} cards</p>
                    {p.hasCalledUno && handCount === 1 && (
                      <span className="text-red-400 text-[10px] font-black">UNO!</span>
                    )}
                    {isTurn && <span className="text-purple-400 text-[10px] animate-pulse">Playing...</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Game Area */}
          <div className="flex-1 flex items-center justify-center p-4">
            <DiscardPileDisplay
              topCard={topCard}
              drawPileCount={gameState.drawPileCount}
              currentColor={gameState.currentColor}
              canDraw={canDraw}
              onDraw={handleDraw}
            />
          </div>

          {/* UNO Button */}
          {isMyTurn && myHand.length <= 2 && (
            <div className="flex justify-center pb-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCallUno}
                disabled={unoCalledRecently}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-lg px-8 py-3 rounded-3xl neon-red"
                data-testid="button-call-uno"
              >
                UNO!
              </motion.button>
            </div>
          )}

          {/* My Hand */}
          <div className="flex-shrink-0 pb-4 pt-2 border-t border-white/10 mt-1">
            {isMyTurn && !hasPendingDraw && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-center text-purple-400 text-xs font-medium mb-2"
              >
                Your turn — play a card or draw
              </motion.div>
            )}
            {isMyTurn && hasPendingDraw && (
              <div className="text-center text-red-400 text-xs font-medium mb-2">
                You must draw {gameState.pendingDrawCount} cards!
              </div>
            )}
            <PlayerHand
              hand={myHand}
              gameState={gameState}
              isMyTurn={isMyTurn}
              onPlayCard={handlePlayCard}
            />
          </div>
        </div>

        {/* Side Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 overflow-hidden flex-shrink-0 h-full"
            >
              <RoomChat roomId={roomId} onClose={() => setShowChat(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Picker */}
      <AnimatePresence>
        {showColorPicker && (
          <ColorPicker
            onSelect={handleColorPick}
            onClose={() => { setShowColorPicker(false); setPendingWildCard(null); }}
          />
        )}
      </AnimatePresence>

      {/* Winner Modal */}
      <AnimatePresence>
        {gameState.status === "FINISHED" && gameState.winner && (
          <WinnerModal
            winner={winnerPlayer || null}
            isMe={isWinner}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
