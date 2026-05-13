import { motion } from "framer-motion";
import type { CardColor } from "../../types";

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
  onClose: () => void;
}

const colors: { color: CardColor; bg: string; label: string }[] = [
  { color: "RED", bg: "bg-red-600 neon-red", label: "Red" },
  { color: "BLUE", bg: "bg-blue-600 neon-blue", label: "Blue" },
  { color: "GREEN", bg: "bg-green-600 neon-green", label: "Green" },
  { color: "YELLOW", bg: "bg-yellow-500 neon-yellow", label: "Yellow" },
];

export function ColorPicker({ onSelect, onClose }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-8 text-center"
      >
        <h3 className="text-white font-bold text-xl mb-6">Choose a Color</h3>
        <div className="grid grid-cols-2 gap-4">
          {colors.map(({ color, bg, label }) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(color)}
              className={`${bg} w-24 h-24 rounded-2xl text-white font-bold text-lg flex items-center justify-center border-2 border-white/30`}
              data-testid={`button-color-${color.toLowerCase()}`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
