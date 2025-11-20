/**
 * Card suits in a standard deck
 */
export enum Suit {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades',
}

/**
 * Card ranks in a standard deck
 */
export enum Rank {
  Ace = 'A',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
}

/**
 * Base playing card interface for any card game
 */
export interface BaseCard {
  /** Unique identifier for this card instance */
  id: string;
  /** Card rank */
  rank: Rank;
  /** Card suit */
  suit: Suit;
  /** Whether this card is currently face up */
  isFaceUp: boolean;
}
