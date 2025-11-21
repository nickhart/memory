import { Suit, Rank } from '@memory/card-game-core';
import { HeartsCard, GameState, Trick } from './types';
import { getPointValue } from './scoring';

/**
 * Check if a hand can follow the given suit
 */
export function canFollowSuit(hand: HeartsCard[], suit: Suit): boolean {
  return hand.some((card) => card.suit === suit);
}

/**
 * Check if hearts can be led
 * Hearts can only be led after hearts have been broken or if the player has only hearts
 */
export function canLeadHearts(state: GameState, hand: HeartsCard[]): boolean {
  // If hearts are already broken, can lead hearts
  if (state.heartsBroken) {
    return true;
  }

  // If player only has hearts, can lead hearts
  const onlyHasHearts = hand.every((card) => card.suit === Suit.Hearts);
  return onlyHasHearts;
}

/**
 * Determine which cards are valid plays for the current player
 */
export function getValidPlays(state: GameState, playerId: string): HeartsCard[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return [];
  }

  const { currentTrick, firstTrick } = state;
  const hand = player.hand;

  // If this is the first card of the trick (leading)
  if (currentTrick.cards.length === 0) {
    // On the very first trick of the hand, must lead 2 of clubs
    if (firstTrick) {
      const twoOfClubs = hand.find((c) => c.rank === Rank.Two && c.suit === Suit.Clubs);
      return twoOfClubs ? [twoOfClubs] : [];
    }

    // Can't lead hearts unless broken or only have hearts
    if (!canLeadHearts(state, hand)) {
      const nonHearts = hand.filter((c) => c.suit !== Suit.Hearts);
      if (nonHearts.length > 0) {
        return nonHearts;
      }
    }

    // Can lead any card
    return hand;
  }

  // Must follow suit if possible
  const leadingSuit = currentTrick.leadingSuit!;
  if (canFollowSuit(hand, leadingSuit)) {
    return hand.filter((c) => c.suit === leadingSuit);
  }

  // Can't follow suit - can play any card except on first trick
  if (firstTrick) {
    // On first trick, can't play hearts or Queen of Spades when breaking suit
    const forbidden = hand.filter(
      (c) => c.suit === Suit.Hearts || (c.suit === Suit.Spades && c.rank === Rank.Queen)
    );
    const allowed = hand.filter(
      (c) => !(c.suit === Suit.Hearts || (c.suit === Suit.Spades && c.rank === Rank.Queen))
    );

    // If player only has forbidden cards, they can play them
    return allowed.length > 0 ? allowed : forbidden;
  }

  // Can play any card
  return hand;
}

/**
 * Check if a play is valid
 */
export function isValidPlay(state: GameState, playerId: string, card: HeartsCard): boolean {
  const validPlays = getValidPlays(state, playerId);
  return validPlays.some((c) => c.id === card.id);
}

/**
 * Get the rank order for comparing cards (higher number = higher rank)
 */
function getRankOrder(rank: Rank): number {
  const order: Record<Rank, number> = {
    [Rank.Two]: 2,
    [Rank.Three]: 3,
    [Rank.Four]: 4,
    [Rank.Five]: 5,
    [Rank.Six]: 6,
    [Rank.Seven]: 7,
    [Rank.Eight]: 8,
    [Rank.Nine]: 9,
    [Rank.Ten]: 10,
    [Rank.Jack]: 11,
    [Rank.Queen]: 12,
    [Rank.King]: 13,
    [Rank.Ace]: 14,
  };
  return order[rank];
}

/**
 * Determine the winner of a trick
 * Returns the player ID of the winner
 */
export function determineTrickWinner(trick: Trick): string | null {
  if (trick.cards.length === 0 || !trick.leadingSuit) {
    return null;
  }

  // Find the highest card of the leading suit
  let winningCard = trick.cards[0];
  let winningRank = getRankOrder(winningCard.card.rank);

  for (let i = 1; i < trick.cards.length; i++) {
    const { card } = trick.cards[i];

    // Only cards of the leading suit can win
    if (card.suit === trick.leadingSuit) {
      const rank = getRankOrder(card.rank);
      if (rank > winningRank) {
        winningCard = trick.cards[i];
        winningRank = rank;
      }
    }
  }

  return winningCard.playerId;
}

/**
 * Check if the trick contains any hearts
 */
export function trickContainsHearts(trick: Trick): boolean {
  return trick.cards.some((c) => c.card.suit === Suit.Hearts);
}

/**
 * Check if the trick contains any point cards
 */
export function trickContainsPoints(trick: Trick): boolean {
  return trick.cards.some((c) => getPointValue(c.card) > 0);
}
