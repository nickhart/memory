// Types
export * from './types';

// Card utilities
export {
  createCard,
  createCardId,
  getCardDisplay,
  getSuitEmoji,
  isMatch,
  shuffle,
  createDeck,
  ALL_RANKS,
  ALL_SUITS,
} from './card';

// Game logic
export {
  createGame,
  flipCard,
  checkAndProcessMatch,
  resetCurrentTurn,
  getGameStats,
  serializeGameState,
  deserializeGameState,
  getCurrentPlayer,
  isPlayerTurn,
  getVisibleCards,
  getUnclaimedCards,
} from './game';

// AI logic
export {
  createAIMemory,
  updateAIMemory,
  removeClaimedFromMemory,
  findKnownMatch,
  selectRandomCards,
  getAIMove,
  syncMemoryWithGameState,
  getCardIdsFromPositions,
} from './ai';
