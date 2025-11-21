'use client';

import { useState } from 'react';
import {
  GameState,
  GamePhase,
  Player,
  HeartsCard,
  getValidPlays,
  getTrickPoints,
  getPointValue,
} from '@memory/hearts';
import { getCardDisplay } from '@memory/card-game-core';
import { Card as GenericCard } from '@memory/card-game-ui';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeartsBoardProps {
  gameState: GameState;
  onCardSelect: (cardId: string) => void;
  onConfirmPass: () => void;
  onCardPlay: (cardId: string) => void;
  onNewHand: () => void;
  onNewGame: () => void;
}

const HUMAN_PLAYER_INDEX = 0;

export function HeartsBoard({
  gameState,
  onCardSelect,
  onConfirmPass,
  onCardPlay,
  onNewHand,
  onNewGame,
}: HeartsBoardProps) {
  const [showDetailedScores, setShowDetailedScores] = useState(false);
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);

  const renderPlayer = (player: Player, _position: string) => {
    const isCurrentPlayer = gameState.players[gameState.currentPlayerIndex]?.id === player.id;
    const trickPoints = player.tricksTaken.reduce(
      (sum, trickCards) => sum + trickCards.reduce((pts, card) => pts + getPointValue(card), 0),
      0
    );

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold ${isCurrentPlayer ? 'text-primary' : ''}`}>
            {player.name}
            {isCurrentPlayer && gameState.phase === GamePhase.Playing && ' ⭐'}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Score: {player.score}
            </Badge>
            {player.handScore > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{player.handScore}
              </Badge>
            )}
            {showDetailedScores && trickPoints > 0 && (
              <Badge variant="destructive" className="text-xs">
                {trickPoints} pts this hand
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {player.hand.length} cards • {player.tricksTaken.length} tricks
          {gameState.phase === GamePhase.Passing && player.isReady && ' • Ready'}
        </div>
      </div>
    );
  };

  const humanPlayer = gameState.players[HUMAN_PLAYER_INDEX];
  const isHumanTurn = gameState.currentPlayerIndex === HUMAN_PLAYER_INDEX;

  // Get valid plays for human player
  const validPlays =
    gameState.phase === GamePhase.Playing && isHumanTurn
      ? getValidPlays(gameState, humanPlayer.id)
      : [];
  const validPlayIds = new Set(validPlays.map((c) => c.id));

  const handleCardPlay = (cardId: string) => {
    setAnimatingCardId(cardId);
    // Delay the actual play to allow animation to start
    setTimeout(() => {
      onCardPlay(cardId);
      setAnimatingCardId(null);
    }, 300);
  };

  const renderHand = (cards: HeartsCard[]) => {
    return (
      <div className="flex gap-2 flex-wrap justify-center">
        {cards.map((card) => {
          const isSelected = humanPlayer.selectedCards.includes(card.id);
          const isValidPlay = validPlayIds.has(card.id);
          const isAnimating = animatingCardId === card.id;
          const isClickable =
            gameState.phase === GamePhase.Passing ||
            (gameState.phase === GamePhase.Playing && isHumanTurn && isValidPlay);

          return (
            <div
              key={card.id}
              className={`transition-all duration-300 ${isSelected ? '-translate-y-3' : ''} ${
                isAnimating ? 'opacity-0 scale-75 -translate-y-20' : ''
              } ${isClickable ? 'cursor-pointer hover:scale-105' : ''} ${
                !isClickable && gameState.phase === GamePhase.Playing ? 'opacity-50' : ''
              }`}
              onClick={() => {
                if (gameState.phase === GamePhase.Passing) {
                  onCardSelect(card.id);
                } else if (gameState.phase === GamePhase.Playing && isValidPlay && !isAnimating) {
                  handleCardPlay(card.id);
                }
              }}
            >
              <GenericCard
                card={card}
                frontContent={
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                    {getCardDisplay(card)}
                  </div>
                }
                backContent={
                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white text-xl">
                    🂠
                  </div>
                }
                size="medium"
                disabled={false}
              />
              {isSelected && (
                <div className="text-center text-xs mt-1 font-semibold text-primary">Selected</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <UICard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hearts</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Hand #{gameState.handNumber + 1} • {gameState.phase}
                {gameState.heartsBroken && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    ❤️ Broken
                  </Badge>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowDetailedScores(!showDetailedScores)}
                variant={showDetailedScores ? 'default' : 'outline'}
                size="sm"
              >
                {showDetailedScores ? '👁️ Hide' : '👁️ Show'} Details
              </Button>
              <Button onClick={onNewGame} variant="outline">
                New Game
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Other Players */}
          <div className="grid grid-cols-3 gap-4">
            {gameState.players.slice(1).map((player, idx) => (
              <div key={player.id}>{renderPlayer(player, ['West', 'North', 'East'][idx])}</div>
            ))}
          </div>

          {/* Current Trick */}
          {gameState.currentTrick.cards.length > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-center">Current Trick</h3>
                {getTrickPoints(gameState.currentTrick) > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {getTrickPoints(gameState.currentTrick)} pts
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                {gameState.currentTrick.cards.map(({ playerId, card }) => {
                  const player = gameState.players.find((p) => p.id === playerId);
                  return (
                    <div key={card.id} className="text-center">
                      <GenericCard
                        card={card}
                        frontContent={
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                            {getCardDisplay(card)}
                          </div>
                        }
                        size="medium"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">{player?.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Human Player */}
          <div className="space-y-4">
            {renderPlayer(humanPlayer, 'You')}
            {renderHand(humanPlayer.hand)}
          </div>

          {/* Status Messages & Actions */}
          {gameState.phase === GamePhase.Passing && (
            <div className="flex flex-col items-center gap-2">
              <Badge variant="outline" className="text-sm py-2 px-4">
                Pass {humanPlayer.selectedCards.length}/3 cards {gameState.passDirection}
              </Badge>
              {humanPlayer.selectedCards.length === 3 && humanPlayer.isReady && (
                <Button onClick={onConfirmPass} size="lg">
                  Confirm Pass
                </Button>
              )}
              {humanPlayer.selectedCards.length < 3 && (
                <Badge variant="secondary" className="text-xs py-1 px-3">
                  Select {3 - humanPlayer.selectedCards.length} more card
                  {3 - humanPlayer.selectedCards.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}

          {gameState.phase === GamePhase.Playing && !isHumanTurn && (
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm py-2 px-4">
                Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}...
              </Badge>
            </div>
          )}

          {gameState.phase === GamePhase.Playing && isHumanTurn && (
            <div className="flex justify-center">
              <Badge variant="default" className="text-sm py-2 px-4">
                Your turn! Click a card to play
              </Badge>
            </div>
          )}

          {gameState.phase === GamePhase.HandComplete && (
            <div className="flex flex-col items-center gap-4">
              <Badge variant="secondary" className="text-lg py-2 px-4">
                Hand Complete
              </Badge>
              <div className="text-center">
                <p className="text-sm font-semibold mb-2">Scores this hand:</p>
                {gameState.players.map((p) => (
                  <p key={p.id} className="text-sm">
                    {p.name}: +{p.handScore} points (Total: {p.score})
                  </p>
                ))}
              </div>
              <Button onClick={onNewHand} size="lg">
                Start Next Hand
              </Button>
            </div>
          )}

          {gameState.phase === GamePhase.GameOver && (
            <div className="flex justify-center flex-col items-center gap-4">
              <Badge variant="default" className="text-xl py-3 px-6">
                Game Over
              </Badge>
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Final Scores:</p>
                {gameState.players
                  .slice()
                  .sort((a, b) => a.score - b.score)
                  .map((p, idx) => (
                    <p
                      key={p.id}
                      className={`text-sm ${idx === 0 ? 'text-primary font-bold text-lg' : ''}`}
                    >
                      {idx === 0 && '🏆 '}
                      {p.name}: {p.score} points
                    </p>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </UICard>
    </div>
  );
}
