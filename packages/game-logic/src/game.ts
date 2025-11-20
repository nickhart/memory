import { createDeck, isMatch } from './card';
import {
  GameState,
  GameConfig,
  GameStatus,
  Player,
  PlayerType,
  FlipResult,
  Move,
  Card,
} from './types';

/**
 * Creates initial game state from configuration
 */
export function createGame(config: GameConfig): GameState {
  // Validate configuration
  if (config.numPlayers < 2 || config.numPlayers > 4) {
    throw new Error('Number of players must be between 2 and 4');
  }

  if (config.players.length !== config.numPlayers) {
    throw new Error('Player configuration must match number of players');
  }

  // Create players with initial state
  const players: Player[] = config.players.map((p) => ({
    ...p,
    matchesClaimed: 0,
    claimedCards: [],
  }));

  // Create and shuffle deck
  const cards = createDeck(config.numRanks, config.matchSize);

  return {
    config,
    cards,
    players,
    currentPlayerIndex: 0,
    currentlyFlippedCards: [],
    moves: [],
    startTime: Date.now(),
    endTime: null,
    status: GameStatus.InProgress,
  };
}

/**
 * Flips a card face up
 */
export function flipCard(state: GameState, cardId: string): FlipResult {
  // Validate game is in progress
  if (state.status !== GameStatus.InProgress) {
    return { success: false, reason: 'Game is not in progress' };
  }

  // Find the card
  const cardIndex = state.cards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    return { success: false, reason: 'Card not found' };
  }

  const card = state.cards[cardIndex];

  // Validate card can be flipped
  if (card.isFaceUp) {
    return { success: false, reason: 'Card is already face up' };
  }

  if (card.claimedByPlayer !== -1) {
    return { success: false, reason: 'Card has already been claimed' };
  }

  // Check if we've already flipped the maximum number of cards for this turn
  if (state.currentlyFlippedCards.length >= state.config.matchSize) {
    return { success: false, reason: 'Maximum cards already flipped for this turn' };
  }

  // Create new state with flipped card
  const newCards = [...state.cards];
  newCards[cardIndex] = {
    ...card,
    isFaceUp: true,
    hasBeenSeen: true,
  };

  const newState: GameState = {
    ...state,
    cards: newCards,
    currentlyFlippedCards: [...state.currentlyFlippedCards, cardId],
  };

  return { success: true, updatedState: newState };
}

/**
 * Checks if currently flipped cards form a match and processes the result
 */
export function checkAndProcessMatch(state: GameState): GameState {
  // Only check if we have the right number of cards flipped
  if (state.currentlyFlippedCards.length !== state.config.matchSize) {
    return state;
  }

  const flippedCards = state.currentlyFlippedCards
    .map((id) => state.cards.find((c) => c.id === id))
    .filter((c): c is Card => c !== undefined);

  const matched = isMatch(flippedCards);
  const currentPlayer = state.players[state.currentPlayerIndex];

  let newCards = [...state.cards];
  let newPlayers = [...state.players];

  if (matched) {
    // Mark cards as claimed
    newCards = newCards.map((card) => {
      if (state.currentlyFlippedCards.includes(card.id)) {
        return {
          ...card,
          claimedByPlayer: state.currentPlayerIndex,
        };
      }
      return card;
    });

    // Update player stats
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      matchesClaimed: currentPlayer.matchesClaimed + 1,
      claimedCards: [...currentPlayer.claimedCards, ...state.currentlyFlippedCards],
    };
  } else {
    // Flip cards back face down
    newCards = newCards.map((card) => {
      if (state.currentlyFlippedCards.includes(card.id)) {
        return {
          ...card,
          isFaceUp: false,
        };
      }
      return card;
    });
  }

  // Record the move
  const move: Move = {
    playerIndex: state.currentPlayerIndex,
    cardIds: [...state.currentlyFlippedCards],
    isMatch: matched,
    timestamp: Date.now(),
  };

  // Determine next player (stay on same player if matched, otherwise rotate)
  const nextPlayerIndex = matched
    ? state.currentPlayerIndex
    : (state.currentPlayerIndex + 1) % state.config.numPlayers;

  // Check if game is complete
  const allClaimed = newCards.every((card) => card.claimedByPlayer !== -1);
  const newStatus = allClaimed ? GameStatus.Completed : GameStatus.InProgress;

  return {
    ...state,
    cards: newCards,
    players: newPlayers,
    currentPlayerIndex: nextPlayerIndex,
    currentlyFlippedCards: [],
    moves: [...state.moves, move],
    endTime: allClaimed ? Date.now() : null,
    status: newStatus,
  };
}

/**
 * Flips all currently face-up cards back down (for resetting turn)
 */
export function resetCurrentTurn(state: GameState): GameState {
  const newCards = state.cards.map((card) => {
    if (state.currentlyFlippedCards.includes(card.id)) {
      return {
        ...card,
        isFaceUp: false,
      };
    }
    return card;
  });

  return {
    ...state,
    cards: newCards,
    currentlyFlippedCards: [],
  };
}

/**
 * Gets game statistics
 */
export function getGameStats(state: GameState) {
  const totalMoves = state.moves.length;
  const elapsedTime = (state.endTime || Date.now()) - state.startTime;
  const totalPairs = state.cards.length / state.config.matchSize;

  const playerStats = state.players.map((player) => ({
    ...player,
    score: player.matchesClaimed,
    percentage: totalPairs > 0 ? (player.matchesClaimed / totalPairs) * 100 : 0,
  }));

  const winner =
    state.status === GameStatus.Completed
      ? playerStats.reduce((prev, current) =>
          current.matchesClaimed > prev.matchesClaimed ? current : prev
        )
      : null;

  return {
    totalMoves,
    elapsedTime,
    totalPairs,
    playerStats,
    winner,
  };
}

/**
 * Serializes game state to JSON
 */
export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

/**
 * Deserializes game state from JSON
 */
export function deserializeGameState(json: string): GameState {
  return JSON.parse(json) as GameState;
}

/**
 * Gets the current player
 */
export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

/**
 * Checks if it's a specific player's turn
 */
export function isPlayerTurn(state: GameState, playerIndex: number): boolean {
  return state.currentPlayerIndex === playerIndex && state.status === GameStatus.InProgress;
}

/**
 * Gets all cards that are currently visible (face up or claimed)
 */
export function getVisibleCards(state: GameState): Card[] {
  return state.cards.filter((card) => card.isFaceUp || card.claimedByPlayer !== -1);
}

/**
 * Gets all unclaimed cards that are face down
 */
export function getUnclaimedCards(state: GameState): Card[] {
  return state.cards.filter((card) => card.claimedByPlayer === -1);
}
