export type CardColor = "RED" | "BLUE" | "GREEN" | "YELLOW" | "WILD" | "PINK" | "ORANGE" | "TEAL" | "PURPLE";
export type CardType =
  | "NUMBER"
  | "SKIP"
  | "REVERSE"
  | "DRAW_TWO"
  | "WILD"
  | "WILD_DRAW_FOUR"
  | "DRAW_ONE"
  | "FLIP"
  | "WILD_DRAW_TWO"
  | "DRAW_FIVE"
  | "SKIP_EVERYONE"
  | "WILD_DRAW_COLOR"
  | "DRAW_SIX"
  | "DRAW_TEN"
  | "ATTACK";

export type GameMode = "CLASSIC" | "FLIP" | "NO_MERCY";
export type GameSide = "LIGHT" | "DARK";
export type PlayerRole = "OWNER" | "ADMIN" | "MODERATOR" | "USER";
export type GameStatus = "WAITING" | "PLAYING" | "FINISHED";
export type MessageType = "TEXT" | "EMOJI" | "GIF" | "SYSTEM" | "GAME_EVENT" | "ADMIN_ANNOUNCEMENT";

export interface UnoCard {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;
  side?: GameSide;
}

export interface Player {
  uid: string;
  username: string;
  avatar: string;
  role: PlayerRole;
  xp: number;
  level: number;
  coins: number;
  isReady: boolean;
  isOnline: boolean;
  cardCount: number;
  hasCalledUno: boolean;
  isEliminated: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  mode: GameMode;
  status: GameStatus;
  players: Record<string, Player>;
  maxPlayers: number;
  isPublic: boolean;
  createdAt: number;
  spectators?: string[];
}

export interface GameState {
  roomId: string;
  mode: GameMode;
  currentSide: GameSide;
  currentTurn: string;
  direction: 1 | -1;
  drawPileCount: number;
  discardPile: UnoCard[];
  playerHands: Record<string, UnoCard[]>;
  playerOrder: string[];
  status: GameStatus;
  currentColor: CardColor;
  pendingDrawCount: number;
  winner?: string;
  turnStartedAt: number;
  turnTimeout: number;
  stackCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  content: string;
  replyTo?: string;
  mentions?: string[];
  isPinned: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  timestamp: number;
  reactions?: Record<string, string[]>;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  role: PlayerRole;
  xp: number;
  level: number;
  coins: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  createdAt: number;
  isBanned: boolean;
  isMuted: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface LeaderboardEntry {
  uid: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  wins: number;
  winRate: number;
  rank: number;
}
