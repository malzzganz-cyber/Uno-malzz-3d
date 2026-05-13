import {
  collection, doc, setDoc, getDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, limit, getDocs,
  serverTimestamp, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { ref, set, onValue, remove } from "firebase/database";
import { db, rtdb } from "../firebase/config";
import type { GameRoom, GameState, Player, GameMode, UnoCard, CardColor } from "../types";
import { buildDeck, generateRoomCode, shuffle, canPlay, getDrawCount } from "../utils/deck";

export async function createRoom(
  ownerId: string,
  ownerPlayer: Player,
  name: string,
  mode: GameMode,
  maxPlayers: number,
  isPublic: boolean
): Promise<GameRoom> {
  const code = generateRoomCode();
  const roomId = `room_${code}`;
  const room: GameRoom = {
    id: roomId,
    code,
    name,
    ownerId,
    mode,
    status: "WAITING",
    players: { [ownerId]: ownerPlayer },
    maxPlayers,
    isPublic,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "rooms", roomId), { ...room, createdAt: serverTimestamp() });
  await set(ref(rtdb, `active_rooms/${roomId}`), { id: roomId, code, name, mode, status: "WAITING", playerCount: 1, maxPlayers });
  return room;
}

export async function joinRoom(roomId: string, player: Player): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) throw new Error("Room not found");
  const room = snap.data() as GameRoom;
  if (room.status !== "WAITING") throw new Error("Game already started");
  if (Object.keys(room.players).length >= room.maxPlayers) throw new Error("Room is full");
  if (room.players[player.uid]) throw new Error("Already in room");
  await updateDoc(roomRef, { [`players.${player.uid}`]: player });
  await set(ref(rtdb, `active_rooms/${roomId}/playerCount`), Object.keys(room.players).length + 1);
}

export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const room = snap.data() as GameRoom;
  const players = { ...room.players };
  delete players[uid];
  if (Object.keys(players).length === 0) {
    await deleteDoc(roomRef);
    await remove(ref(rtdb, `active_rooms/${roomId}`));
    return;
  }
  let newOwnerId = room.ownerId;
  if (room.ownerId === uid) {
    newOwnerId = Object.keys(players)[0];
  }
  await updateDoc(roomRef, { players, ownerId: newOwnerId });
}

export async function findRoomByCode(code: string): Promise<GameRoom | null> {
  const q = query(collection(db, "rooms"), where("code", "==", code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as GameRoom;
}

export async function getPublicRooms(): Promise<GameRoom[]> {
  const q = query(
    collection(db, "rooms"),
    where("isPublic", "==", true),
    where("status", "==", "WAITING"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GameRoom);
}

export function subscribeToRoom(roomId: string, cb: (room: GameRoom | null) => void): () => void {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    cb(snap.exists() ? (snap.data() as GameRoom) : null);
  });
}

export async function setPlayerReady(roomId: string, uid: string, ready: boolean): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { [`players.${uid}.isReady`]: ready });
}

export async function kickPlayer(roomId: string, uid: string): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const room = snap.data() as GameRoom;
  const players = { ...room.players };
  delete players[uid];
  await updateDoc(roomRef, { players });
}

export async function startGame(roomId: string, mode: GameMode, playerOrder: string[]): Promise<void> {
  const deck = buildDeck(mode);
  const hands: Record<string, UnoCard[]> = {};
  let deckIndex = 0;
  for (const uid of playerOrder) {
    hands[uid] = deck.slice(deckIndex, deckIndex + 7);
    deckIndex += 7;
  }
  let topCard = deck[deckIndex++];
  while (topCard.type !== "NUMBER") {
    deck.push(topCard);
    topCard = deck[deckIndex++];
  }
  const drawPile = deck.slice(deckIndex);
  const gameState: GameState = {
    roomId,
    mode,
    currentSide: "LIGHT",
    currentTurn: playerOrder[0],
    direction: 1,
    drawPileCount: drawPile.length,
    discardPile: [topCard],
    playerHands: hands,
    playerOrder,
    status: "PLAYING",
    currentColor: topCard.color,
    pendingDrawCount: 0,
    turnStartedAt: Date.now(),
    turnTimeout: 30000,
    stackCount: 0,
  };
  await updateDoc(doc(db, "rooms", roomId), { status: "PLAYING" });
  await set(ref(rtdb, `live_matches/${roomId}`), {
    ...gameState,
    drawPile,
  });
  await set(ref(rtdb, `active_rooms/${roomId}/status`), "PLAYING");
}

export function subscribeToGameState(roomId: string, cb: (state: (GameState & { drawPile: UnoCard[] }) | null) => void): () => void {
  const r = ref(rtdb, `live_matches/${roomId}`);
  return onValue(r, (snap) => {
    cb(snap.exists() ? snap.val() : null);
  });
}

export async function playCard(
  roomId: string,
  uid: string,
  card: UnoCard,
  chosenColor?: CardColor
): Promise<void> {
  const r = ref(rtdb, `live_matches/${roomId}`);
  const snap = await new Promise<GameState & { drawPile: UnoCard[] }>((resolve) => {
    onValue(r, (s) => resolve(s.val()), { onlyOnce: true });
  });
  const state = snap;
  if (state.currentTurn !== uid) throw new Error("Not your turn");
  const topCard = state.discardPile[state.discardPile.length - 1];
  if (!canPlay(card, topCard, state.currentColor, state.currentSide, state.mode)) {
    throw new Error("Card cannot be played");
  }
  const hand = state.playerHands[uid].filter((c) => c.id !== card.id);
  const newDiscardPile = [...state.discardPile, card];
  let newColor: CardColor = chosenColor || card.color;
  if (card.color === "WILD") newColor = chosenColor || "RED";
  let newDirection = state.direction;
  const playerOrder = state.playerOrder;
  const currentIdx = playerOrder.indexOf(uid);
  let nextIdx = currentIdx;
  let pendingDraw = 0;
  let skipExtra = false;
  let newSide = state.currentSide;
  let newStackCount = 0;

  const drawCount = getDrawCount(card, state.mode);

  switch (card.type) {
    case "REVERSE":
      newDirection = (state.direction === 1 ? -1 : 1) as 1 | -1;
      if (playerOrder.length === 2) skipExtra = true;
      break;
    case "SKIP":
    case "SKIP_EVERYONE":
      skipExtra = true;
      break;
    case "DRAW_TWO":
    case "WILD_DRAW_FOUR":
    case "DRAW_ONE":
    case "DRAW_FIVE":
    case "WILD_DRAW_TWO":
    case "DRAW_SIX":
    case "DRAW_TEN":
      pendingDraw = state.pendingDrawCount + drawCount;
      newStackCount = state.stackCount + 1;
      break;
    case "FLIP":
      newSide = state.currentSide === "LIGHT" ? "DARK" : "LIGHT";
      break;
  }

  nextIdx = (currentIdx + newDirection + playerOrder.length) % playerOrder.length;
  if (skipExtra) {
    nextIdx = (nextIdx + newDirection + playerOrder.length) % playerOrder.length;
    if (card.type === "SKIP_EVERYONE") {
      nextIdx = currentIdx;
    }
  }

  const updates: Record<string, unknown> = {
    [`playerHands/${uid}`]: hand,
    discardPile: newDiscardPile,
    currentColor: newColor,
    currentTurn: playerOrder[nextIdx],
    direction: newDirection,
    pendingDrawCount: pendingDraw,
    currentSide: newSide,
    stackCount: newStackCount,
    turnStartedAt: Date.now(),
  };

  if (hand.length === 0) {
    updates["status"] = "FINISHED";
    updates["winner"] = uid;
    await updateDoc(doc(db, "rooms", roomId), { status: "FINISHED" });
  }

  const { update } = await import("firebase/database");
  await update(r, updates);
}

export async function drawCard(roomId: string, uid: string): Promise<void> {
  const r = ref(rtdb, `live_matches/${roomId}`);
  const snap = await new Promise<GameState & { drawPile: UnoCard[] }>((resolve) => {
    onValue(r, (s) => resolve(s.val()), { onlyOnce: true });
  });
  const state = snap;
  if (state.currentTurn !== uid) return;

  let drawPile = [...state.drawPile];
  let drawCount = state.pendingDrawCount > 0 ? state.pendingDrawCount : 1;

  if (drawPile.length < drawCount) {
    const reshuffled = shuffle([...state.discardPile.slice(0, -1)]);
    drawPile = [...drawPile, ...reshuffled];
  }

  const drawn = drawPile.slice(0, drawCount);
  const newPile = drawPile.slice(drawCount);
  const newHand = [...state.playerHands[uid], ...drawn];

  const playerOrder = state.playerOrder;
  const currentIdx = playerOrder.indexOf(uid);
  const nextIdx = (currentIdx + state.direction + playerOrder.length) % playerOrder.length;

  const { update } = await import("firebase/database");
  await update(r, {
    [`playerHands/${uid}`]: newHand,
    drawPile: newPile,
    drawPileCount: newPile.length,
    pendingDrawCount: 0,
    stackCount: 0,
    currentTurn: playerOrder[nextIdx],
    turnStartedAt: Date.now(),
  });
}

export async function callUno(roomId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { [`players.${uid}.hasCalledUno`]: true });
}

export async function deleteRoom(roomId: string): Promise<void> {
  await deleteDoc(doc(db, "rooms", roomId));
  await remove(ref(rtdb, `live_matches/${roomId}`));
  await remove(ref(rtdb, `active_rooms/${roomId}`));
}
