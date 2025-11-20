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

  if (numRanks === 13) {
    // Standard: 13 ranks, each rank appears matchSize times
    // Distribute across all 4 suits evenly
    ALL_RANKS.forEach((rank) => {
      // For each rank, pick matchSize different suits
      const suitsForThisRank = [...ALL_SUITS].sort(() => Math.random() - 0.5).slice(0, matchSize);
      suitsForThisRank.forEach((suit, index) => {
        cards.push(createCard(rank, suit, 0, index)); // position will be set after shuffle
      });
    });
  } else {
    // Hard: 26 ranks (13 ranks × 2 repetitions), each appears matchSize times
    // Use all 4 suits to ensure variety
    const allSuits = ALL_SUITS;
    let cardCounter = 0;

    // First set of 13 ranks
    ALL_RANKS.forEach((rank) => {
      for (let i = 0; i < matchSize; i++) {
        const suit = allSuits[i % 4];
        cards.push(createCard(rank, suit, 0, cardCounter++));
      }
    });

    // Second set of 13 ranks (using different suits)
    ALL_RANKS.forEach((rank) => {
      for (let i = 0; i < matchSize; i++) {
        const suit = allSuits[(i + matchSize) % 4]; // Offset to use different suits
        cards.push(createCard(rank, suit, 0, cardCounter++));
      }
    });
  }

  // Shuffle the cards
  const shuffled = shuffle(cards);

  // Reassign positions after shuffle
  shuffled.forEach((card, index) => {
    card.position = index;
  });

  return shuffled;
}
