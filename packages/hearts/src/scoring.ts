import { Suit, Rank } from '@memory/card-game-core';
import { HeartsCard, Player, GameState, GamePhase } from './types';

/**
 * Get the point value of a card in Hearts
 * Hearts = 1 point each, Queen of Spades = 13 points, all others = 0
 */
export function getPointValue(card: HeartsCard): number {
  if (card.suit === Suit.Hearts) {
    return 1;
  }
  if (card.suit === Suit.Spades && card.rank === Rank.Queen) {
    return 13;
  }
  return 0;
}

/**
 * Calculate the score for a set of tricks taken
 */
export function calculateHandScore(tricksTaken: HeartsCard[][]): number {
  let total = 0;
  for (const trick of tricksTaken) {
    for (const card of trick) {
      total += getPointValue(card);
    }
  }
  return total;
}

/**
 * Check if any player shot the moon (took all 26 points)
 * Returns the player ID of the shooter, or null if no one shot the moon
 */
export function checkShootMoon(players: Player[]): string | null {
  for (const player of players) {
    const score = calculateHandScore(player.tricksTaken);
    if (score === 26) {
      return player.id;
    }
  }
  return null;
}

/**
 * Apply scores at the end of a hand
 * Handles shoot the moon logic
 */
export function applyScores(state: GameState): GameState {
  // Calculate hand scores for each player
  const players = state.players.map((player) => ({
    ...player,
    handScore: calculateHandScore(player.tricksTaken),
  }));

  // Check for shoot the moon
  const moonShooter = checkShootMoon(players);

  // Apply scores
  const updatedPlayers = players.map((player) => {
    if (moonShooter) {
      // If someone shot the moon, they get 0 and everyone else gets 26
      if (player.id === moonShooter) {
        return {
          ...player,
          score: player.score, // No change
          handScore: 0,
        };
      } else {
        return {
          ...player,
          score: player.score + 26,
          handScore: 26,
        };
      }
    } else {
      // Normal scoring
      return {
        ...player,
        score: player.score + player.handScore,
      };
    }
  });

  // Check if game should end (anyone at 100+ points)
  const gameOver = updatedPlayers.some((p) => p.score >= 100);

  return {
    ...state,
    players: updatedPlayers,
    phase: gameOver ? GamePhase.GameOver : GamePhase.HandComplete,
  };
}
