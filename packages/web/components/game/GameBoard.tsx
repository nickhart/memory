'use client';

import { GameState, Card, getGameStats, getCardDisplay } from '@memory/game-logic';
import { PlayingCard } from './GameCard';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  onCardClick: (card: Card) => void;
  onNewGame: () => void;
  isProcessing: boolean;
}

export function GameBoard({ gameState, onCardClick, onNewGame, isProcessing }: GameBoardProps) {
  const stats = getGameStats(gameState);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameComplete = gameState.status === 'completed';

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPlayerColor = (playerIndex: number) => {
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'];
    return colors[playerIndex] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Memory Game</h1>
        <div className="flex gap-4">
          <Badge variant="secondary" className="text-base">
            Time: {formatTime(stats.elapsedTime)}
          </Badge>
          <Badge variant="secondary" className="text-base">
            Moves: {stats.totalMoves}
          </Badge>
        </div>
      </div>

      {/* Game Complete Banner */}
      {isGameComplete && (
        <UICard className="mb-6 border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg">
              🎉 <strong>{stats.winner?.name}</strong> wins with {stats.winner?.matchesClaimed}{' '}
              matches!
            </p>
            <Button onClick={onNewGame}>New Game</Button>
          </CardContent>
        </UICard>
      )}

      {/* Players */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {gameState.players.map((player, index) => {
          const collectedCards = gameState.cards.filter(
            (card) => card.claimedByPlayer === player.index
          );
          return (
            <UICard
              key={player.index}
              id={`player-box-${player.index}`}
              className={cn(
                'relative z-10 bg-white',
                currentPlayer.index === player.index && !isGameComplete
                  ? 'border-2 border-primary shadow-lg'
                  : ''
              )}
            >
              <CardContent className="p-4 bg-white">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getPlayerColor(index)}`} />
                  <span className="font-medium">{player.name}</span>
                  {player.type === 'ai' && (
                    <Badge variant="outline" className="text-xs">
                      AI
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{player.matchesClaimed}</p>
                  <p className="text-xs text-gray-500">
                    ({stats.playerStats[index].percentage.toFixed(0)}%)
                  </p>
                </div>
                {/* Show collected cards */}
                {collectedCards.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {collectedCards.slice(0, 6).map((card) => (
                      <div
                        key={card.id}
                        className="flex h-6 w-6 items-center justify-center rounded border bg-white text-xs shadow-sm"
                        title={getCardDisplay(card)}
                      >
                        {getCardDisplay(card)}
                      </div>
                    ))}
                    {collectedCards.length > 6 && (
                      <div className="flex h-6 w-6 items-center justify-center text-xs text-gray-500">
                        +{collectedCards.length - 6}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </UICard>
          );
        })}
      </div>

      {/* Current Turn Info */}
      {!isGameComplete && (
        <UICard className="mb-6 bg-blue-50">
          <CardContent className="p-4">
            {isProcessing &&
            gameState.currentlyFlippedCards.length === gameState.config.matchSize ? (
              <p className="text-lg">
                <strong>Checking for match...</strong>
              </p>
            ) : (
              <p className="text-lg">
                <strong>{currentPlayer.name}&apos;s</strong> turn
                {currentPlayer.type === 'ai' && <span className="ml-2">(AI is thinking...)</span>}
                {gameState.currentlyFlippedCards.length > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({gameState.currentlyFlippedCards.length}/{gameState.config.matchSize} cards
                    flipped)
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </UICard>
      )}

      {/* Game Board */}
      <div
        className={cn('mx-auto grid', {
          'gap-2': gameState.cards.length > 52,
          'gap-2.5': gameState.cards.length > 26 && gameState.cards.length <= 52,
          'gap-3': gameState.cards.length <= 26,
        })}
        style={{
          gridTemplateColumns:
            gameState.cards.length > 52
              ? 'repeat(auto-fit, minmax(3rem, 1fr))'
              : gameState.cards.length > 26
                ? 'repeat(auto-fit, minmax(3.5rem, 1fr))'
                : 'repeat(auto-fit, minmax(4rem, 1fr))',
          maxWidth: gameState.cards.length > 52 ? '1200px' : '1000px',
        }}
      >
        {gameState.cards
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              size={
                gameState.cards.length > 52
                  ? 'small'
                  : gameState.cards.length > 26
                    ? 'medium'
                    : 'medium'
              }
              playerBoxId={
                card.claimedByPlayer !== -1 ? `player-box-${card.claimedByPlayer}` : undefined
              }
              disabled={
                isProcessing ||
                currentPlayer.type === 'ai' ||
                isGameComplete ||
                gameState.currentlyFlippedCards.length >= gameState.config.matchSize
              }
            />
          ))}
      </div>

      {/* Debug Info (optional, can be removed) */}
      {process.env.NODE_ENV === 'development' && (
        <UICard className="mt-6 bg-gray-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">
              Flipped: {gameState.currentlyFlippedCards.length} / {gameState.config.matchSize}
            </p>
          </CardContent>
        </UICard>
      )}
    </div>
  );
}
