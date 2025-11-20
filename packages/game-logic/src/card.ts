import { ALL_RANKS, ALL_SUITS, createCardId, getSuitEmoji, shuffle } from '@memory/card-game-core';
import { Card, Rank, Suit } from './types';

// Re-export utilities for convenience
export { ALL_RANKS, ALL_SUITS, createCardId, getSuitEmoji, shuffle };

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
