'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  GamePhase,
  createGame,
  dealCards,
  playCard,
  getValidPlays,
} from '@memory/hearts';
import { HeartsBoard } from './HeartsBoard';

export function HeartsContainer() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const game = createGame(['You', 'AI Player 1', 'AI Player 2', 'AI Player 3']);
    return dealCards(game);
  });

  const handleCardPlay = useCallback(
    (cardId: string) => {
      if (gameState.phase !== GamePhase.Playing) return;

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const card = currentPlayer.hand.find((c) => c.id === cardId);

      if (!card) return;

      const validPlays = getValidPlays(gameState, currentPlayer.id);
      const isValid = validPlays.some((c) => c.id === cardId);

      if (!isValid) return;

      const newState = playCard(gameState, currentPlayer.id, cardId);
      setGameState(newState);
    },
    [gameState]
  );

  const handleNewGame = useCallback(() => {
    const game = createGame(['You', 'AI Player 1', 'AI Player 2', 'AI Player 3']);
    setGameState(dealCards(game));
  }, []);

  return (
    <HeartsBoard gameState={gameState} onCardPlay={handleCardPlay} onNewGame={handleNewGame} />
  );
}
