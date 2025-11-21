import { BaseCard, Suit, Rank } from '@memory/card-game-core';

export { Suit, Rank };

export interface HeartsCard extends BaseCard {
  isSelected?: boolean; // For passing phase
}

export enum GamePhase {
  Dealing = 'dealing',
  Passing = 'passing',
  Playing = 'playing',
  HandComplete = 'hand_complete',
  GameOver = 'game_over',
}

export enum PassDirection {
  Left = 'left',
  Right = 'right',
  Across = 'across',
  None = 'none', // Every 4th hand
}

export interface Player {
  id: string;
  name: string;
  hand: HeartsCard[];
  tricksTaken: HeartsCard[][]; // Array of tricks won this hand
  score: number; // Total score across all hands
  handScore: number; // Score for current hand
  selectedCards: string[]; // Card IDs selected for passing
  isReady: boolean; // Ready to pass cards
}

export interface Trick {
  cards: Array<{ playerId: string; card: HeartsCard }>;
  leadingSuit: Suit | null;
  winnerId: string | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[]; // Always 4 players
  currentPlayerIndex: number;
  currentTrick: Trick;
  completedTricks: Trick[];
  passDirection: PassDirection;
  heartsBroken: boolean;
  firstTrick: boolean;
  handNumber: number;
  deck: HeartsCard[];
}
