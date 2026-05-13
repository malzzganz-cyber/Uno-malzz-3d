import { motion, AnimatePresence } from "framer-motion";
import { UnoCard } from "../UnoCard";
import { CardBack } from "../UnoCard";
import type { UnoCard as UnoCardType } from "../../types";

interface DiscardPileDisplayProps {
  topCard: UnoCardType | null;
  drawPileCount: number;
  currentColor: string;
  canDraw: boolean;
  onDraw: () => void;
}

export function DiscardPileDisplay({ topCard, drawPileCount, currentColor, canDraw, onDraw }: DiscardPileDisplayProps) {
  const colorBorderMap: Record<string, string> = {
    RED: "border-red-500 shadow-red-500/50",
    BLUE: "border-blue-500 shadow-blue-500/50",
    GREEN: "border-green-500 shadow-green-500/50",
    YELLOW: "border-yellow-500 shadow-yellow-500/50",
    WILD: "border-purple-500 shadow-purple-500/50",
    PINK: "border-pink-500 shadow-pink-500/50",
    ORANGE: "border-orange-500 shadow-orange-500/50",
    TEAL: "border-teal-500 shadow-teal-500/50",
    PURPLE: "border-purple-600 shadow-purple-600/50",
  };

  return (
    <div className="flex items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-xs text-white/40 mb-2">Draw Pile</div>
        <motion.div
          whileHover={canDraw ? { y: -8, scale: 1.05 } : undefined}
          whileTap={canDraw ? { scale: 0.95 } : undefined}
          onClick={canDraw ? onDraw : undefined}
          className={canDraw ? "cursor-pointer" : "cursor-default"}
          data-testid="button-draw-card"
        >
          <div className="relative">
            {[2, 1, 0].map((offset) => (
              <div key={offset} className="absolute" style={{ top: -offset * 2, left: -offset * 2 }}>
                <CardBack size="lg" />
              </div>
            ))}
            <CardBack size="lg" className="relative z-10" />
          </div>
        </motion.div>
        <div className="text-xs text-white/50 mt-2">{drawPileCount} cards</div>
      </div>

      <div className="text-center">
        <div className="text-xs text-white/40 mb-2">Discard Pile</div>
        <div className={`rounded-2xl border-4 shadow-2xl ${colorBorderMap[currentColor] || "border-purple-500"}`}>
          <AnimatePresence mode="popLayout">
            {topCard && (
              <motion.div
                key={topCard.id}
                initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <UnoCard card={topCard} size="lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-xs text-white/50 mt-2 capitalize">
          Color: <span className="text-white font-medium">{currentColor}</span>
        </div>
      </div>
    </div>
  );
}
