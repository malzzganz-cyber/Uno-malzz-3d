import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UnoCard as UnoCardType } from "../types";

interface UnoCardProps {
  card: UnoCardType;
  isPlayable?: boolean;
  isSelected?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  className?: string;
}

const colorMap: Record<string, string> = {
  RED: "card-red neon-red",
  BLUE: "card-blue neon-blue",
  GREEN: "card-green neon-green",
  YELLOW: "card-yellow neon-yellow",
  WILD: "card-wild neon-purple",
  PINK: "card-pink",
  ORANGE: "card-orange",
  TEAL: "card-teal",
  PURPLE: "card-purple",
};

const sizeMap = {
  sm: "w-10 h-14 text-xs",
  md: "w-14 h-20 text-sm",
  lg: "w-20 h-28 text-lg",
};

function getLabel(card: UnoCardType): string {
  if (card.type === "NUMBER") return String(card.value ?? "");
  const labels: Record<string, string> = {
    SKIP: "⊘",
    REVERSE: "⇄",
    DRAW_TWO: "+2",
    WILD: "W",
    WILD_DRAW_FOUR: "+4",
    DRAW_ONE: "+1",
    FLIP: "↕",
    WILD_DRAW_TWO: "W+2",
    DRAW_FIVE: "+5",
    SKIP_EVERYONE: "⊘⊘",
    WILD_DRAW_COLOR: "W+C",
    DRAW_SIX: "+6",
    DRAW_TEN: "+10",
    ATTACK: "⚔",
  };
  return labels[card.type] || card.type;
}

export function UnoCard({ card, isPlayable, isSelected, isFaceDown, onClick, size = "md", style, className }: UnoCardProps) {
  const label = getLabel(card);
  const colorClass = colorMap[card.color] || "card-wild";

  if (isFaceDown) {
    return (
      <motion.div
        style={style}
        className={cn(
          "rounded-xl border-2 border-white/20 flex items-center justify-center cursor-default select-none",
          "bg-gradient-to-br from-purple-900 to-indigo-900",
          sizeMap[size],
          className
        )}
        whileHover={{ y: -2 }}
      >
        <span className="text-white/60 font-black text-xs">UNO</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      style={style}
      initial={{ opacity: 0, y: -20, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={isPlayable ? { y: -12, scale: 1.08, rotateZ: 2 } : { y: -4 }}
      whileTap={isPlayable ? { scale: 0.95 } : undefined}
      className={cn(
        "rounded-xl border-2 flex flex-col items-center justify-center relative select-none font-black",
        colorClass,
        sizeMap[size],
        isPlayable && "cursor-pointer playable-glow border-white/60",
        isSelected && "border-white ring-2 ring-white scale-110 -translate-y-4",
        !isPlayable && !isSelected && "border-white/20 opacity-80",
        className
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-white/10 pointer-events-none" />
      <div className="absolute top-1 left-1 text-white/90 font-black leading-none text-[10px] md:text-xs">{label}</div>
      <div className="text-white font-black text-center drop-shadow-lg" style={{ fontSize: size === "lg" ? "1.5rem" : size === "md" ? "1.1rem" : "0.75rem" }}>
        {label}
      </div>
      <div className="absolute bottom-1 right-1 text-white/90 font-black leading-none text-[10px] md:text-xs rotate-180">{label}</div>
      {/* Reflection */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}

export function CardBack({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border-2 border-white/20 flex items-center justify-center",
      "bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900",
      sizeMap[size],
      className
    )}>
      <div className="w-3/4 h-3/4 rounded-lg bg-gradient-to-br from-purple-800/40 to-indigo-800/40 border border-white/10 flex items-center justify-center">
        <span className="text-white/80 font-black" style={{ fontSize: size === "lg" ? "0.9rem" : "0.6rem" }}>UNO</span>
      </div>
    </div>
  );
}
