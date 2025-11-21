import { HeartsCard, GameState, PassDirection, Suit, Rank } from './types';
import { getValidPlays, trickContainsPoints } from './trick';

/**
 * Get numeric value of a rank for comparison
 */
function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
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
  return values[rank];
}

/**
 * AI Strategy interface
 */
export interface AIStrategy {
  selectCardsToPass(hand: HeartsCard[], direction: PassDirection): HeartsCard[];
  selectCardToPlay(state: GameState, playerId: string): HeartsCard;
}

/**
 * Simple AI - pass high hearts, avoid taking tricks with points
 */
export class SimpleAI implements AIStrategy {
  /**
   * Pass highest hearts and dangerous cards (Queen of Spades, high cards)
   */
  selectCardsToPass(hand: HeartsCard[], _direction: PassDirection): HeartsCard[] {
    // Sort cards by danger level
    const sortedByDanger = [...hand].sort((a, b) => {
      // Queen of Spades is most dangerous
      if (a.rank === Rank.Queen && a.suit === Suit.Spades) return -1;
      if (b.rank === Rank.Queen && b.suit === Suit.Spades) return 1;

      // Then high hearts (Ace, King, Queen)
      const aIsHighHeart = a.suit === Suit.Hearts && getRankValue(a.rank) >= 12;
      const bIsHighHeart = b.suit === Suit.Hearts && getRankValue(b.rank) >= 12;
      if (aIsHighHeart && !bIsHighHeart) return -1;
      if (!aIsHighHeart && bIsHighHeart) return 1;

      // Then other high cards (Ace, King)
      if (a.rank !== b.rank) return getRankValue(b.rank) - getRankValue(a.rank);

      // Finally sort by suit (prefer passing hearts)
      if (a.suit === Suit.Hearts && b.suit !== Suit.Hearts) return -1;
      if (a.suit !== Suit.Hearts && b.suit === Suit.Hearts) return 1;

      return 0;
    });

    return sortedByDanger.slice(0, 3);
  }

  /**
   * Play card trying to avoid taking tricks with points
   */
  selectCardToPlay(state: GameState, playerId: string): HeartsCard {
    const validPlays = getValidPlays(state, playerId);

    if (validPlays.length === 0) {
      throw new Error('No valid plays available');
    }

    if (validPlays.length === 1) {
      return validPlays[0];
    }

    const currentTrick = state.currentTrick;
    const isLeading = currentTrick.cards.length === 0;

    if (isLeading) {
      // Lead with lowest safe card (prefer non-hearts, then low hearts)
      return (
        validPlays.find((c) => c.suit !== Suit.Hearts && c.rank === Rank.Two) ||
        validPlays.find((c) => c.suit !== Suit.Hearts && getRankValue(c.rank) <= 5) ||
        validPlays.find((c) => c.suit !== Suit.Hearts) ||
        validPlays.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))[0]
      );
    }

    // Following: try to play low card to avoid taking trick
    const trickHasPoints = trickContainsPoints(currentTrick);

    if (trickHasPoints) {
      // Try to play low card to avoid taking trick
      const sortedLowToHigh = [...validPlays].sort((a, b) => {
        // Avoid Queen of Spades if possible
        if (a.rank === Rank.Queen && a.suit === Suit.Spades) return 1;
        if (b.rank === Rank.Queen && b.suit === Suit.Spades) return -1;

        return getRankValue(a.rank) - getRankValue(b.rank);
      });
      return sortedLowToHigh[0];
    }

    // No points in trick yet, play highest card to try to avoid taking it later
    const sortedHighToLow = [...validPlays].sort(
      (a, b) => getRankValue(b.rank) - getRankValue(a.rank)
    );
    return sortedHighToLow[0];
  }
}

/**
 * Random AI - selects cards randomly from valid options (fallback/testing)
 */
export class RandomAI implements AIStrategy {
  /**
   * Randomly select 3 cards to pass
   */
  selectCardsToPass(hand: HeartsCard[], _direction: PassDirection): HeartsCard[] {
    const shuffled = [...hand].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  /**
   * Randomly select a valid card to play
   */
  selectCardToPlay(state: GameState, playerId: string): HeartsCard {
    const validPlays = getValidPlays(state, playerId);

    if (validPlays.length === 0) {
      throw new Error('No valid plays available');
    }

    const randomIndex = Math.floor(Math.random() * validPlays.length);
    return validPlays[randomIndex];
  }
}

/**
 * Create a default AI strategy
 */
export function createDefaultAI(): AIStrategy {
  return new SimpleAI();
}
