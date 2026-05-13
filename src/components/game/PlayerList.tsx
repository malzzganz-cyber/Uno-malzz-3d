import { motion } from "framer-motion";
import { Crown, Wifi, WifiOff } from "lucide-react";
import type { Player, GameState } from "../../types";
import { CardBack } from "../UnoCard";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  players: Record<string, Player>;
  playerOrder: string[];
  gameState: GameState | null;
  myUid: string;
}

export function PlayerList({ players, playerOrder, gameState, myUid }: PlayerListProps) {
  const orderedPlayers = playerOrder.map((uid) => players[uid]).filter(Boolean);

  return (
    <div className="space-y-2">
      {orderedPlayers.map((player) => {
        const isCurrentTurn = gameState?.currentTurn === player.uid;
        const cardCount = gameState?.playerHands[player.uid]?.length ?? player.cardCount;
        const isMe = player.uid === myUid;

        return (
          <motion.div
            key={player.uid}
            animate={isCurrentTurn ? { scale: 1.02 } : { scale: 1 }}
            className={cn(
              "glass rounded-2xl p-3 flex items-center gap-3 transition-all",
              isCurrentTurn && "border border-purple-500/60 neon-purple",
              isMe && "border border-cyan-500/40"
            )}
          >
            <div className="relative flex-shrink-0">
              <img
                src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`}
                alt={player.username}
                className="w-9 h-9 rounded-full bg-white/10"
              />
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-slate-900",
                player.isOnline ? "bg-green-400" : "bg-gray-500"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-white text-xs font-semibold truncate">{player.username}</p>
                {isMe && <span className="text-cyan-400 text-[10px]">(you)</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {isCurrentTurn && (
                  <span className="text-purple-400 text-[10px] font-medium animate-pulse">Your turn</span>
                )}
                {player.hasCalledUno && cardCount === 1 && (
                  <span className="text-red-400 text-[10px] font-bold">UNO!</span>
                )}
                {player.isEliminated && (
                  <span className="text-gray-500 text-[10px]">Eliminated</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
                <CardBack key={i} size="sm" className="w-5 h-7" />
              ))}
              {cardCount > 5 && (
                <span className="text-white/60 text-xs">+{cardCount - 5}</span>
              )}
              {cardCount === 0 && gameState?.winner === player.uid && (
                <Crown className="text-yellow-400 w-5 h-5" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
