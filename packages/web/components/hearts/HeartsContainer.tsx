'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  GameState,
  GamePhase,
  PassDirection,
  createGame,
  dealCards,
  selectCardToPass,
  executePass,
  playCard,
  completeTrick,
  startNewHand,
  getValidPlays,
  createDefaultAI,
} from '@memory/hearts';
import { HeartsBoard } from './HeartsBoard';

const HUMAN_PLAYER_INDEX = 0;
const AI_DELAY_MS = 1000; // Delay between AI moves

export function HeartsContainer() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const game = createGame(['You', 'West', 'North', 'East']);
    return dealCards(game);
  });
  const [ai] = useState(() => createDefaultAI());

  // Handle AI turns in passing phase
  useEffect(() => {
    if (gameState.phase !== GamePhase.Passing) return;

    // Check if all AI players need to select cards
    const aiPlayers = gameState.players.filter((_, idx) => idx !== HUMAN_PLAYER_INDEX);
    const aiPlayersNotReady = aiPlayers.filter((p) => !p.isReady);

    if (aiPlayersNotReady.length === 0) return;

    // AI players select cards after a delay
    const timer = setTimeout(() => {
      let newState = gameState;

      for (const player of aiPlayersNotReady) {
        const cardsToPass = ai.selectCardsToPass(player.hand, gameState.passDirection);

        // Select each card
        for (const card of cardsToPass) {
          newState = selectCardToPass(newState, player.id, card.id);
        }
      }

      setGameState(newState);
    }, AI_DELAY_MS);

    return () => clearTimeout(timer);
  }, [gameState, ai]);

  // Handle AI turns in playing phase
  useEffect(() => {
    if (gameState.phase !== GamePhase.Playing) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isAITurn = gameState.currentPlayerIndex !== HUMAN_PLAYER_INDEX;

    if (!isAITurn) return;

    // AI plays a card after a delay
    const timer = setTimeout(() => {
      const cardToPlay = ai.selectCardToPlay(gameState, currentPlayer.id);
      const newState = playCard(gameState, currentPlayer.id, cardToPlay.id);
      setGameState(newState);
    }, AI_DELAY_MS);

    return () => clearTimeout(timer);
  }, [gameState, ai]);

  // Auto-complete trick when all 4 cards are played
  useEffect(() => {
    if (gameState.phase !== GamePhase.Playing) return;
    if (gameState.currentTrick.cards.length !== 4) return;

    const timer = setTimeout(() => {
      const newState = completeTrick(gameState);
      setGameState(newState);
    }, AI_DELAY_MS * 1.5); // Longer delay to see the full trick

    return () => clearTimeout(timer);
  }, [gameState]);

  // Handle card selection for passing (human player only)
  const handleCardSelect = useCallback(
    (cardId: string) => {
      if (gameState.phase !== GamePhase.Passing) return;

      const humanPlayer = gameState.players[HUMAN_PLAYER_INDEX];
      if (humanPlayer.isReady) return; // Already confirmed

      const newState = selectCardToPass(gameState, humanPlayer.id, cardId);
      setGameState(newState);
    },
    [gameState]
  );

  // Handle confirming pass (human player only)
  const handleConfirmPass = useCallback(() => {
    if (gameState.phase !== GamePhase.Passing) return;
    if (gameState.passDirection === PassDirection.None) {
      // No passing, move directly to playing
      setGameState({ ...gameState, phase: GamePhase.Playing });
      return;
    }

    const humanPlayer = gameState.players[HUMAN_PLAYER_INDEX];
    if (!humanPlayer.isReady) return;

    // Check if all players are ready
    const allReady = gameState.players.every((p) => p.isReady);
    if (allReady) {
      const newState = executePass(gameState);
      setGameState(newState);
    }
  }, [gameState]);

  // Handle card play (human player only)
  const handleCardPlay = useCallback(
    (cardId: string) => {
      if (gameState.phase !== GamePhase.Playing) return;
      if (gameState.currentPlayerIndex !== HUMAN_PLAYER_INDEX) return;

      const humanPlayer = gameState.players[HUMAN_PLAYER_INDEX];
      const card = humanPlayer.hand.find((c) => c.id === cardId);
      if (!card) return;

      const validPlays = getValidPlays(gameState, humanPlayer.id);
      const isValid = validPlays.some((c) => c.id === cardId);
      if (!isValid) return;

      const newState = playCard(gameState, humanPlayer.id, cardId);
      setGameState(newState);
    },
    [gameState]
  );

  // Handle starting a new hand
  const handleNewHand = useCallback(() => {
    if (gameState.phase !== GamePhase.HandComplete) return;

    const newState = startNewHand(gameState);
    const dealtState = dealCards(newState);
    setGameState(dealtState);
  }, [gameState]);

  // Handle starting a new game
  const handleNewGame = useCallback(() => {
    const game = createGame(['You', 'West', 'North', 'East']);
    setGameState(dealCards(game));
  }, []);

  return (
    <HeartsBoard
      gameState={gameState}
      onCardSelect={handleCardSelect}
      onConfirmPass={handleConfirmPass}
      onCardPlay={handleCardPlay}
      onNewHand={handleNewHand}
      onNewGame={handleNewGame}
    />
  );
}
