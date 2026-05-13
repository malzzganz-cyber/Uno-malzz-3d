import { motion } from "framer-motion";
import { Crown, RotateCcw, Home } from "lucide-react";
import type { Player } from "../../types";
import { useLocation } from "wouter";

interface WinnerModalProps {
  winner: Player | null;
  isMe: boolean;
  onPlayAgain: () => void;
}

export function WinnerModal({ winner, isMe, onPlayAgain }: WinnerModalProps) {
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-strong rounded-3xl p-10 text-center max-w-sm w-full mx-4"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          className="text-6xl mb-4"
        >
          {isMe ? "🎉" : "😢"}
        </motion.div>
        <Crown className="text-yellow-400 w-12 h-12 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-white mb-2">
          {isMe ? "You Won!" : "Game Over"}
        </h2>
        <p className="text-white/60 mb-2">
          {isMe ? "Congratulations!" : `${winner?.username || "Someone"} wins!`}
        </p>
        {winner && (
          <div className="flex items-center justify-center gap-3 mb-6 mt-4 glass rounded-2xl p-4">
            <img
              src={winner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.uid}`}
              alt={winner.username}
              className="w-12 h-12 rounded-full"
            />
            <div className="text-left">
              <p className="text-white font-bold">{winner.username}</p>
              <p className="text-yellow-400 text-sm">Winner!</p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2"
            data-testid="button-play-again"
          >
            <RotateCcw size={16} /> Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setLocation("/dashboard")}
            className="flex-1 glass text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2"
            data-testid="button-go-home"
          >
            <Home size={16} /> Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
