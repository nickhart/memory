'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  GamePhase,
  PlayerAction,
  createGame,
  dealInitialCards,
  performAction,
} from '@memory/blackjack';
import { BlackjackBoard } from './BlackjackBoard';

export function BlackjackContainer() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const game = createGame();
    return dealInitialCards(game);
  });

  const handleAction = useCallback(
    (action: PlayerAction) => {
      if (gameState.phase !== GamePhase.PlayerTurn) return;

      const newState = performAction(gameState, action);
      setGameState(newState);
    },
    [gameState]
  );

  const handleNewGame = useCallback(() => {
    const game = createGame();
    setGameState(dealInitialCards(game));
  }, []);

  return <BlackjackBoard gameState={gameState} onAction={handleAction} onNewGame={handleNewGame} />;
}
