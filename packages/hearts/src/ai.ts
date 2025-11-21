import { HeartsCard, GameState, PassDirection } from './types';
import { getValidPlays } from './trick';

/**
 * AI Strategy interface
 */
export interface AIStrategy {
  selectCardsToPass(hand: HeartsCard[], direction: PassDirection): HeartsCard[];
  selectCardToPlay(state: GameState, playerId: string): HeartsCard;
}

/**
 * Random AI - selects cards randomly from valid options
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
  return new RandomAI();
}
