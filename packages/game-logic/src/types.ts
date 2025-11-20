import { BaseCard, Rank, Suit } from '@memory/card-game-core';

// Re-export core types for convenience
export { Rank, Suit };

/**
 * Represents a playing card in the memory game
 * Extends the base card with memory-specific properties
 */
export interface Card extends BaseCard {
  /** Whether this card has been revealed at least once */
  hasBeenSeen: boolean;
  /** Which player has claimed this card (-1 if unclaimed, 0-3 for player index) */
  claimedByPlayer: number;
  /** Position in the grid */
  position: number;
}

/**
 * Player types
 */
export enum PlayerType {
  Human = 'human',
  AI = 'ai',
}

/**
 * Represents a player in the game
 */
export interface Player {
  /** Player index (0-3) */
  index: number;
  /** Player name */
  name: string;
  /** Player type */
  type: PlayerType;
  /** Number of successful matches claimed */
  matchesClaimed: number;
  /** Cards claimed by this player */
  claimedCards: string[]; // Card IDs
}

/**
 * Game difficulty configuration
 */
export interface GameConfig {
  /** Number of cards that must match (2, 3, or 4) */
  matchSize: 2 | 3 | 4;
  /** Number of unique ranks to use (13 or 26) */
  numRanks: 13 | 26;
  /** Number of players (2-4) */
  numPlayers: number;
  /** Player configurations */
  players: Omit<Player, 'matchesClaimed' | 'claimedCards'>[];
}

/**
 * Represents a move in the game
 */
export interface Move {
  /** Player who made the move */
  playerIndex: number;
  /** Cards flipped in this move */
  cardIds: string[];
  /** Whether the move resulted in a match */
  isMatch: boolean;
  /** Timestamp of the move */
  timestamp: number;
}

/**
 * Game state
 */
export interface GameState {
  /** Game configuration */
  config: GameConfig;
  /** All cards in the game */
  cards: Card[];
  /** All players */
  players: Player[];
  /** Index of current player */
  currentPlayerIndex: number;
  /** Cards currently face up (not yet claimed) */
  currentlyFlippedCards: string[]; // Card IDs
  /** Move history */
  moves: Move[];
  /** Game start time */
  startTime: number;
  /** Game end time (null if ongoing) */
  endTime: number | null;
  /** Game status */
  status: GameStatus;
}

/**
 * Game status
 */
export enum GameStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
}

/**
 * Result of attempting to flip a card
 */
export interface FlipResult {
  success: boolean;
  reason?: string;
  updatedState?: GameState;
}

/**
 * AI memory for tracking seen cards
 */
export interface AIMemory {
  /** Map of card position to card identity (rank:suit) */
  seenCards: Map<number, string>;
}
