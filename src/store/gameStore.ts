import { create } from "zustand";
import type { GameState, GameRoom, UnoCard, CardColor } from "../types";

interface GameStore {
  room: GameRoom | null;
  gameState: GameState | null;
  myHand: UnoCard[];
  selectedCard: UnoCard | null;
  showColorPicker: boolean;
  pendingWildCard: UnoCard | null;
  isMyTurn: boolean;
  setRoom: (room: GameRoom | null) => void;
  setGameState: (state: GameState | null) => void;
  setMyHand: (hand: UnoCard[]) => void;
  setSelectedCard: (card: UnoCard | null) => void;
  setShowColorPicker: (v: boolean) => void;
  setPendingWildCard: (card: UnoCard | null) => void;
  setIsMyTurn: (v: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  gameState: null,
  myHand: [],
  selectedCard: null,
  showColorPicker: false,
  pendingWildCard: null,
  isMyTurn: false,
  setRoom: (room) => set({ room }),
  setGameState: (gameState) => set({ gameState }),
  setMyHand: (myHand) => set({ myHand }),
  setSelectedCard: (selectedCard) => set({ selectedCard }),
  setShowColorPicker: (showColorPicker) => set({ showColorPicker }),
  setPendingWildCard: (pendingWildCard) => set({ pendingWildCard }),
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
}));
