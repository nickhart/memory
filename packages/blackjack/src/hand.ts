import { Rank } from '@memory/card-game-core';
import { BlackjackCard, Hand } from './types';

/**
 * Gets the numerical value of a card in blackjack
 * Ace = 11 (can be adjusted to 1 later)
 * Face cards = 10
 * Number cards = pip value
 */
export function getCardValue(card: BlackjackCard): number {
  switch (card.rank) {
    case Rank.Ace:
      return 11;
    case Rank.King:
    case Rank.Queen:
    case Rank.Jack:
      return 10;
    case Rank.Ten:
      return 10;
    case Rank.Nine:
      return 9;
    case Rank.Eight:
      return 8;
    case Rank.Seven:
      return 7;
    case Rank.Six:
      return 6;
    case Rank.Five:
      return 5;
    case Rank.Four:
      return 4;
    case Rank.Three:
      return 3;
    case Rank.Two:
      return 2;
  }
}

/**
 * Evaluates a hand and returns the best total
 * Handles "soft" aces (ace counted as 11 vs 1)
 */
export function evaluateHand(cards: BlackjackCard[]): Hand {
  // Only evaluate visible cards
  const visibleCards = cards.filter((card) => !card.isHidden);

  let total = 0;
  let aces = 0;

  // Calculate total, counting aces as 11
  for (const card of visibleCards) {
    const value = getCardValue(card);
    total += value;
    if (card.rank === Rank.Ace) {
      aces++;
    }
  }

  // Adjust aces from 11 to 1 if needed to avoid busting
  while (total > 21 && aces > 0) {
    total -= 10; // Convert ace from 11 to 1
    aces--;
  }

  // Check if we have a soft hand (ace counted as 11)
  const isSoft = aces > 0 && total <= 21;

  // Blackjack is 21 with exactly 2 cards
  const isBlackjack = total === 21 && visibleCards.length === 2;

  // Bust is over 21
  const isBust = total > 21;

  return {
    cards,
    total,
    isSoft,
    isBlackjack,
    isBust,
  };
}

/**
 * Creates an empty hand
 */
export function createEmptyHand(): Hand {
  return {
    cards: [],
    total: 0,
    isSoft: false,
    isBlackjack: false,
    isBust: false,
  };
}

/**
 * Adds a card to a hand and re-evaluates
 */
export function addCardToHand(hand: Hand, card: BlackjackCard): Hand {
  const newCards = [...hand.cards, card];
  return evaluateHand(newCards);
}
