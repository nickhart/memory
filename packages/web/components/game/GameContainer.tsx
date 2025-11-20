'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  GameConfig,
  Card,
  createGame,
  flipCard,
  checkAndProcessMatch,
  createAIMemory,
  syncMemoryWithGameState,
  getAIMove,
  getCardIdsFromPositions,
  AIMemory,
  PlayerType,
} from '@memory/game-logic';
import { GameSetup } from './GameSetup';
import { GameBoard } from './GameBoard';

export function GameContainer() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [aiMemory, setAiMemory] = useState<AIMemory>(createAIMemory());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartGame = useCallback((config: GameConfig) => {
    const newGame = createGame(config);
    setGameState(newGame);
    setAiMemory(createAIMemory());
  }, []);

  const handleNewGame = useCallback(() => {
    setGameState(null);
    setAiMemory(createAIMemory());
  }, []);

  const processCardFlip = useCallback(
    (card: Card) => {
      if (!gameState || isProcessing) return;

      // Don't allow flipping if we've already flipped the maximum number of cards
      if (gameState.currentlyFlippedCards.length >= gameState.config.matchSize) {
        return;
      }

      setIsProcessing(true);

      // Flip the card
      const flipResult = flipCard(gameState, card.id);
      if (!flipResult.success || !flipResult.updatedState) {
        console.error('Failed to flip card:', flipResult.reason);
        setIsProcessing(false);
        return;
      }

      const currentState = flipResult.updatedState;

      // Update the state immediately so the UI reflects the flipped card
      setGameState(currentState);

      // Update AI memory with the newly revealed card
      const updatedMemory = syncMemoryWithGameState(currentState, aiMemory);
      setAiMemory(updatedMemory);

      // Check if we need to process a match
      if (currentState.currentlyFlippedCards.length === currentState.config.matchSize) {
        // Wait a bit before processing the match so user can see the cards
        setTimeout(() => {
          const processedState = checkAndProcessMatch(currentState);
          setGameState(processedState);

          // Update AI memory after processing
          const finalMemory = syncMemoryWithGameState(processedState, updatedMemory);
          setAiMemory(finalMemory);

          setIsProcessing(false);
        }, 1500);
      } else {
        setIsProcessing(false);
      }
    },
    [gameState, aiMemory, isProcessing]
  );

  // AI turn logic
  useEffect(() => {
    if (!gameState || isProcessing || gameState.status === 'completed') return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type !== PlayerType.AI) return;

    // AI makes a move
    const makeAIMove = async () => {
      setIsProcessing(true);

      // Wait a bit to simulate thinking
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const positions = getAIMove(gameState, aiMemory);
      const cardIds = getCardIdsFromPositions(gameState, positions);

      if (cardIds.length === 0) {
        console.error('AI could not find cards to flip');
        setIsProcessing(false);
        return;
      }

      // Flip cards one by one
      let currentState = gameState;
      for (const cardId of cardIds) {
        const result = flipCard(currentState, cardId);
        if (result.success && result.updatedState) {
          currentState = result.updatedState;
          // Update AI memory
          const updatedMemory = syncMemoryWithGameState(currentState, aiMemory);
          setAiMemory(updatedMemory);
          setGameState(currentState);

          // Wait between card flips
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Wait before processing the match
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Process the match
      const processedState = checkAndProcessMatch(currentState);
      setGameState(processedState);

      // Update AI memory after processing
      const finalMemory = syncMemoryWithGameState(processedState, aiMemory);
      setAiMemory(finalMemory);

      setIsProcessing(false);
    };

    makeAIMove();
  }, [gameState, aiMemory, isProcessing]);

  if (!gameState) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <GameBoard
      gameState={gameState}
      onCardClick={processCardFlip}
      onNewGame={handleNewGame}
      isProcessing={isProcessing}
    />
  );
}
