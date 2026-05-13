import type { UnoCard, CardColor, CardType, GameMode, GameSide } from "../types";

let cardIdCounter = 0;
function mkCard(color: CardColor, type: CardType, value?: number, side?: GameSide): UnoCard {
  return { id: `card_${++cardIdCounter}_${Math.random().toString(36).slice(2)}`, color, type, value, side };
}

export function buildClassicDeck(): UnoCard[] {
  const colors: CardColor[] = ["RED", "BLUE", "GREEN", "YELLOW"];
  const deck: UnoCard[] = [];
  for (const color of colors) {
    deck.push(mkCard(color, "NUMBER", 0));
    for (let n = 1; n <= 9; n++) {
      deck.push(mkCard(color, "NUMBER", n));
      deck.push(mkCard(color, "NUMBER", n));
    }
    deck.push(mkCard(color, "SKIP"));
    deck.push(mkCard(color, "SKIP"));
    deck.push(mkCard(color, "REVERSE"));
    deck.push(mkCard(color, "REVERSE"));
    deck.push(mkCard(color, "DRAW_TWO"));
    deck.push(mkCard(color, "DRAW_TWO"));
  }
  for (let i = 0; i < 4; i++) deck.push(mkCard("WILD", "WILD"));
  for (let i = 0; i < 4; i++) deck.push(mkCard("WILD", "WILD_DRAW_FOUR"));
  return shuffle(deck);
}

export function buildFlipDeck(): UnoCard[] {
  const lightColors: CardColor[] = ["RED", "BLUE", "GREEN", "YELLOW"];
  const darkColors: CardColor[] = ["PINK", "ORANGE", "TEAL", "PURPLE"];
  const deck: UnoCard[] = [];
  for (const color of lightColors) {
    deck.push(mkCard(color, "NUMBER", 0, "LIGHT"));
    for (let n = 1; n <= 9; n++) {
      deck.push(mkCard(color, "NUMBER", n, "LIGHT"));
      deck.push(mkCard(color, "NUMBER", n, "LIGHT"));
    }
    deck.push(mkCard(color, "DRAW_ONE", undefined, "LIGHT"));
    deck.push(mkCard(color, "DRAW_ONE", undefined, "LIGHT"));
    deck.push(mkCard(color, "REVERSE", undefined, "LIGHT"));
    deck.push(mkCard(color, "REVERSE", undefined, "LIGHT"));
    deck.push(mkCard(color, "SKIP", undefined, "LIGHT"));
    deck.push(mkCard(color, "SKIP", undefined, "LIGHT"));
    deck.push(mkCard(color, "FLIP", undefined, "LIGHT"));
    deck.push(mkCard(color, "FLIP", undefined, "LIGHT"));
  }
  deck.push(mkCard("WILD", "WILD", undefined, "LIGHT"));
  deck.push(mkCard("WILD", "WILD", undefined, "LIGHT"));
  deck.push(mkCard("WILD", "WILD_DRAW_TWO", undefined, "LIGHT"));
  deck.push(mkCard("WILD", "WILD_DRAW_TWO", undefined, "LIGHT"));
  for (const color of darkColors) {
    deck.push(mkCard(color, "NUMBER", 0, "DARK"));
    for (let n = 1; n <= 9; n++) {
      deck.push(mkCard(color, "NUMBER", n, "DARK"));
      deck.push(mkCard(color, "NUMBER", n, "DARK"));
    }
    deck.push(mkCard(color, "DRAW_FIVE", undefined, "DARK"));
    deck.push(mkCard(color, "DRAW_FIVE", undefined, "DARK"));
    deck.push(mkCard(color, "REVERSE", undefined, "DARK"));
    deck.push(mkCard(color, "REVERSE", undefined, "DARK"));
    deck.push(mkCard(color, "SKIP_EVERYONE", undefined, "DARK"));
    deck.push(mkCard(color, "SKIP_EVERYONE", undefined, "DARK"));
    deck.push(mkCard(color, "FLIP", undefined, "DARK"));
    deck.push(mkCard(color, "FLIP", undefined, "DARK"));
  }
  deck.push(mkCard("WILD", "WILD", undefined, "DARK"));
  deck.push(mkCard("WILD", "WILD", undefined, "DARK"));
  deck.push(mkCard("WILD", "WILD_DRAW_COLOR", undefined, "DARK"));
  deck.push(mkCard("WILD", "WILD_DRAW_COLOR", undefined, "DARK"));
  return shuffle(deck);
}

export function buildNoMercyDeck(): UnoCard[] {
  const colors: CardColor[] = ["RED", "BLUE", "GREEN", "YELLOW"];
  const deck: UnoCard[] = [];
  for (const color of colors) {
    deck.push(mkCard(color, "NUMBER", 0));
    for (let n = 1; n <= 9; n++) {
      deck.push(mkCard(color, "NUMBER", n));
      deck.push(mkCard(color, "NUMBER", n));
    }
    deck.push(mkCard(color, "SKIP"));
    deck.push(mkCard(color, "SKIP"));
    deck.push(mkCard(color, "REVERSE"));
    deck.push(mkCard(color, "REVERSE"));
    deck.push(mkCard(color, "DRAW_TWO"));
    deck.push(mkCard(color, "DRAW_TWO"));
    deck.push(mkCard(color, "DRAW_TWO"));
  }
  for (let i = 0; i < 4; i++) deck.push(mkCard("WILD", "WILD"));
  for (let i = 0; i < 4; i++) deck.push(mkCard("WILD", "WILD_DRAW_FOUR"));
  for (let i = 0; i < 3; i++) deck.push(mkCard("WILD", "DRAW_SIX" as CardType));
  for (let i = 0; i < 2; i++) deck.push(mkCard("WILD", "DRAW_TEN" as CardType));
  for (let i = 0; i < 3; i++) deck.push(mkCard("WILD", "WILD_DRAW_COLOR"));
  return shuffle(deck);
}

export function buildDeck(mode: GameMode): UnoCard[] {
  if (mode === "CLASSIC") return buildClassicDeck();
  if (mode === "FLIP") return buildFlipDeck();
  return buildNoMercyDeck();
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function canPlay(card: UnoCard, topCard: UnoCard, currentColor: string, currentSide: GameSide, mode: GameMode): boolean {
  if (card.type === "WILD" || card.type === "WILD_DRAW_FOUR" || card.type === "WILD_DRAW_COLOR" || card.type === "WILD_DRAW_TWO") return true;
  if (mode === "FLIP" && card.side !== currentSide) return false;
  if (card.color === "WILD") return true;
  if (card.color === currentColor) return true;
  if (topCard.color !== "WILD" && card.color === topCard.color) return true;
  if (card.type === topCard.type) return true;
  if (card.type === "NUMBER" && topCard.type === "NUMBER" && card.value === topCard.value) return true;
  return false;
}

export function getDrawCount(card: UnoCard, mode: GameMode): number {
  switch (card.type) {
    case "DRAW_TWO": return 2;
    case "WILD_DRAW_FOUR": return 4;
    case "DRAW_ONE": return 1;
    case "DRAW_FIVE": return 5;
    case "WILD_DRAW_TWO": return 2;
    case "WILD_DRAW_COLOR": return mode === "NO_MERCY" ? 999 : 4;
    case "DRAW_SIX": return 6;
    case "DRAW_TEN": return 10;
    default: return 0;
  }
}

export function generateRoomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
