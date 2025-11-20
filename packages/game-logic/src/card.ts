import { Card, Rank, Suit } from './types';

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
export function createCardId(rank: Rank, suit: Suit, instanceIndex: number): string {
  return `${rank}-${suit}-${instanceIndex}`;
}

/**
 * Creates a new card
 */
export function createCard(
  rank: Rank,
  suit: Suit,
  position: number,
  instanceIndex: number = 0
): Card {
  return {
    id: createCardId(rank, suit, instanceIndex),
    rank,
    suit,
    hasBeenSeen: false,
    isFaceUp: false,
    claimedByPlayer: -1,
    position,
  };
}

/**
 * Gets the display name for a card
 */
export function getCardDisplay(card: Card): string {
  return `${card.rank}${getSuitEmoji(card.suit)}`;
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
 * Checks if cards form a valid match (same rank)
 */
export function isMatch(cards: Card[]): boolean {
  if (cards.length < 2) {
    return false;
  }

  const firstRank = cards[0].rank;
  return cards.every((card) => card.rank === firstRank);
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
 * Creates a deck of cards based on game configuration
 */
export function createDeck(numRanks: 13 | 26, matchSize: 2 | 3 | 4): Card[] {
  const cards: Card[] = [];
  const ranksToUse = numRanks === 13 ? ALL_RANKS : [...ALL_RANKS, ...ALL_RANKS];
  const suitsToUse = ALL_SUITS.slice(0, matchSize);

  let position = 0;
  ranksToUse.forEach((rank) => {
    suitsToUse.forEach((suit, suitIndex) => {
      cards.push(createCard(rank, suit, position, suitIndex));
      position++;
    });
  });

  return shuffle(cards);
}
