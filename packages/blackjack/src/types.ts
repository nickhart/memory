import { BaseCard } from '@memory/card-game-core';

/**
 * Represents a card in a blackjack game
 */
export interface BlackjackCard extends BaseCard {
  /** Whether this card is currently hidden (dealer's hole card) */
  isHidden: boolean;
}

/**
 * Represents a hand of cards in blackjack
 */
export interface Hand {
  /** Cards in this hand */
  cards: BlackjackCard[];
  /** Current total value of the hand */
  total: number;
  /** Whether the hand has a "soft" ace (ace counted as 11) */
  isSoft: boolean;
  /** Whether the hand is blackjack (21 with 2 cards) */
  isBlackjack: boolean;
  /** Whether the hand is bust (over 21) */
  isBust: boolean;
}

/**
 * Game phases
 */
export enum GamePhase {
  NotStarted = 'not_started',
  Betting = 'betting',
  Dealing = 'dealing',
  PlayerTurn = 'player_turn',
  DealerTurn = 'dealer_turn',
  GameOver = 'game_over',
}

/**
 * Game result
 */
export enum GameResult {
  PlayerWin = 'player_win',
  DealerWin = 'dealer_win',
  Push = 'push',
  PlayerBlackjack = 'player_blackjack',
}

/**
 * Player actions
 */
export enum PlayerAction {
  Hit = 'hit',
  Stand = 'stand',
}

/**
 * Game state
 */
export interface GameState {
  /** Current game phase */
  phase: GamePhase;
  /** Player's hand */
  playerHand: Hand;
  /** Dealer's hand */
  dealerHand: Hand;
  /** Remaining cards in the deck */
  deck: BlackjackCard[];
  /** Game result (null if game is ongoing) */
  result: GameResult | null;
}
