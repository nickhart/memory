import { GameState, Card, AIMemory } from './types';
import { getUnclaimedCards } from './game';

/**
 * Creates a new AI memory instance
 */
export function createAIMemory(): AIMemory {
  return {
    seenCards: new Map<number, string>(),
  };
}

/**
 * Updates AI memory with newly revealed cards
 */
export function updateAIMemory(memory: AIMemory, cards: Card[]): AIMemory {
  const newSeenCards = new Map(memory.seenCards);

  cards.forEach((card) => {
    if (card.hasBeenSeen && card.claimedByPlayer === -1) {
      newSeenCards.set(card.position, `${card.rank}:${card.suit}`);
    }
  });

  return {
    seenCards: newSeenCards,
  };
}

/**
 * Removes claimed cards from AI memory
 */
export function removeClaimedFromMemory(memory: AIMemory, cards: Card[]): AIMemory {
  const newSeenCards = new Map(memory.seenCards);

  cards.forEach((card) => {
    if (card.claimedByPlayer !== -1) {
      newSeenCards.delete(card.position);
    }
  });

  return {
    seenCards: newSeenCards,
  };
}

/**
 * Gets the card identity from memory
 */
function getCardIdentity(card: Card): string {
  return `${card.rank}:${card.suit}`;
}

/**
 * Gets the rank from a card identity
 */
function getRankFromIdentity(identity: string): string {
  return identity.split(':')[0];
}

/**
 * Finds a complete match in AI memory
 * Returns positions of cards that form a match, or null if no match is found
 */
export function findKnownMatch(state: GameState, memory: AIMemory): number[] | null {
  const { matchSize } = state.config;
  const unclaimedCards = getUnclaimedCards(state);

  // Group seen cards by rank
  const rankGroups = new Map<string, number[]>();

  memory.seenCards.forEach((identity, position) => {
    const rank = getRankFromIdentity(identity);
    const positions = rankGroups.get(rank) || [];
    positions.push(position);
    rankGroups.set(rank, positions);
  });

  // Find a rank that has enough cards for a match
  for (const [rank, positions] of rankGroups.entries()) {
    if (positions.length >= matchSize) {
      // Verify all positions are still valid (cards not claimed)
      const validPositions = positions.filter((pos) =>
        unclaimedCards.some((c) => c.position === pos && !c.isFaceUp)
      );

      if (validPositions.length >= matchSize) {
        return validPositions.slice(0, matchSize);
      }
    }
  }

  return null;
}

/**
 * Selects random unclaimed cards that haven't been flipped yet
 */
export function selectRandomCards(state: GameState, memory: AIMemory, count: number): number[] {
  const unclaimedCards = getUnclaimedCards(state);
  const unflippedCards = unclaimedCards.filter((c) => !c.isFaceUp);

  // Prefer cards we haven't seen yet
  const unseenCards = unflippedCards.filter((c) => !memory.seenCards.has(c.position));

  const cardsToChooseFrom = unseenCards.length > 0 ? unseenCards : unflippedCards;

  if (cardsToChooseFrom.length === 0) {
    return [];
  }

  // Shuffle and take the first 'count' cards
  const shuffled = [...cardsToChooseFrom].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((c) => c.position);
}

/**
 * Determines the AI's next move
 * Returns positions of cards to flip
 */
export function getAIMove(state: GameState, memory: AIMemory): number[] {
  const { matchSize } = state.config;

  // First, check if we already have some cards flipped this turn
  const alreadyFlipped = state.currentlyFlippedCards.length;
  const neededCards = matchSize - alreadyFlipped;

  if (neededCards === 0) {
    return [];
  }

  // If we have cards flipped, try to complete the match
  if (alreadyFlipped > 0) {
    const flippedCards = state.currentlyFlippedCards
      .map((id) => state.cards.find((c) => c.id === id))
      .filter((c): c is Card => c !== undefined);

    if (flippedCards.length === 0) {
      return selectRandomCards(state, memory, neededCards);
    }

    const targetRank = flippedCards[0].rank;

    // Look for matching cards in memory
    const matchingPositions: number[] = [];
    memory.seenCards.forEach((identity, position) => {
      const rank = getRankFromIdentity(identity);
      if (rank === targetRank) {
        const card = state.cards.find((c) => c.position === position);
        if (card && !card.isFaceUp && card.claimedByPlayer === -1) {
          matchingPositions.push(position);
        }
      }
    });

    if (matchingPositions.length >= neededCards) {
      return matchingPositions.slice(0, neededCards);
    }

    // If we don't have enough matching cards in memory, pick random
    return selectRandomCards(state, memory, neededCards);
  }

  // No cards flipped yet, try to find a complete match
  const knownMatch = findKnownMatch(state, memory);
  if (knownMatch) {
    return knownMatch;
  }

  // No known match, explore by picking random cards
  return selectRandomCards(state, memory, matchSize);
}

/**
 * Synchronizes AI memory with the current game state
 * This should be called after any cards are revealed
 */
export function syncMemoryWithGameState(state: GameState, memory: AIMemory): AIMemory {
  let updatedMemory = updateAIMemory(memory, state.cards);
  updatedMemory = removeClaimedFromMemory(updatedMemory, state.cards);
  return updatedMemory;
}

/**
 * Gets card IDs from positions
 */
export function getCardIdsFromPositions(state: GameState, positions: number[]): string[] {
  return positions
    .map((pos) => state.cards.find((c) => c.position === pos)?.id)
    .filter((id): id is string => id !== undefined);
}
