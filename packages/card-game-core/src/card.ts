import { BaseCard, Rank, Suit } from './types';

/**
 * All ranks in a standard deck
 */
export const ALL_RANKS: Rank[] = [
  Rank.Ace,
  Rank.Two,
  Rank.Three,
  Rank.Four,
  Rank.Five,
  Rank.Six,
  Rank.Seven,
  Rank.Eight,
  Rank.Nine,
  Rank.Ten,
  Rank.Jack,
  Rank.Queen,
  Rank.King,
];

/**
 * All suits in a standard deck
 */
export const ALL_SUITS: Suit[] = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];

/**
 * Creates a unique card ID
 */
export function createCardId(rank: Rank, suit: Suit, instanceIndex: number = 0): string {
  return `${rank}-${suit}-${instanceIndex}`;
}

/**
 * Gets emoji representation for a suit
 */
export function getSuitEmoji(suit: Suit): string {
  switch (suit) {
    case Suit.Hearts:
      return '♥️';
    case Suit.Diamonds:
      return '♦️';
    case Suit.Clubs:
      return '♣️';
    case Suit.Spades:
      return '♠️';
  }
}

/**
 * Gets the display name for a card
 */
export function getCardDisplay(card: Pick<BaseCard, 'rank' | 'suit'>): string {
  return `${card.rank}${getSuitEmoji(card.suit)}`;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a standard 52-card deck
 */
export function createStandardDeck(): Omit<BaseCard, 'isFaceUp'>[] {
  const cards: Omit<BaseCard, 'isFaceUp'>[] = [];

  ALL_RANKS.forEach((rank) => {
    ALL_SUITS.forEach((suit) => {
      cards.push({
        id: createCardId(rank, suit, 0),
        rank,
        suit,
      });
    });
  });

  return cards;
}
