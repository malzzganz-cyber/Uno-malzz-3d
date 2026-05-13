import { motion } from "framer-motion";
import { UnoCard } from "../UnoCard";
import type { UnoCard as UnoCardType, GameState } from "../../types";
import { canPlay } from "../../utils/deck";

interface PlayerHandProps {
  hand: UnoCardType[];
  gameState: GameState;
  isMyTurn: boolean;
  onPlayCard: (card: UnoCardType) => void;
}

export function PlayerHand({ hand, gameState, isMyTurn, onPlayCard }: PlayerHandProps) {
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const hasPendingDraw = gameState.pendingDrawCount > 0;

  return (
    <div className="w-full">
      <div className="text-center text-xs text-white/50 mb-2">
        Your Hand ({hand.length} cards)
      </div>
      <div
        className="flex items-end justify-center gap-1 overflow-x-auto pb-2 px-2 min-h-[90px]"
        style={{ scrollbarWidth: "thin" }}
      >
        {hand.map((card, idx) => {
          const playable = isMyTurn && !hasPendingDraw &&
            canPlay(card, topCard, gameState.currentColor, gameState.currentSide, gameState.mode);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex-shrink-0"
            >
              <UnoCard
                card={card}
                isPlayable={playable}
                onClick={playable ? () => onPlayCard(card) : undefined}
                size="md"
              />
            </motion.div>
          );
        })}
        {hand.length === 0 && (
          <div className="text-white/30 text-sm">No cards</div>
        )}
      </div>
    </div>
  );
}
