'use client';

import { GameState, GamePhase, Player, HeartsCard } from '@memory/hearts';
import { getCardDisplay } from '@memory/card-game-core';
import { Card as GenericCard } from '@memory/card-game-ui';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeartsBoardProps {
  gameState: GameState;
  onCardPlay: (cardId: string) => void;
  onNewGame: () => void;
}

export function HeartsBoard({ gameState, onNewGame }: HeartsBoardProps) {
  const renderPlayer = (player: Player, _position: string) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{player.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Score: {player.score}
            </Badge>
            {player.handScore > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{player.handScore}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {player.hand.length} cards • {player.tricksTaken.length} tricks
        </div>
      </div>
    );
  };

  const humanPlayer = gameState.players[0];

  const renderHand = (cards: HeartsCard[]) => {
    return (
      <div className="flex gap-2 flex-wrap justify-center">
        {cards.map((card) => (
          <GenericCard
            key={card.id}
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
            disabled
          />
        ))}
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
                Hand #{gameState.handNumber} • {gameState.phase}
                {gameState.heartsBroken && ' • Hearts Broken'}
              </p>
            </div>
            <Button onClick={onNewGame} variant="outline">
              New Game
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Other Players */}
          <div className="grid grid-cols-3 gap-4">
            {gameState.players.slice(1).map((player, idx) => (
              <div key={player.id}>{renderPlayer(player, ['Left', 'Across', 'Right'][idx])}</div>
            ))}
          </div>

          {/* Current Trick */}
          {gameState.currentTrick.cards.length > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-center">Current Trick</h3>
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

          {/* Status Messages */}
          {gameState.phase === GamePhase.Passing && (
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm py-2 px-4">
                Passing phase - Pass direction: {gameState.passDirection}
              </Badge>
            </div>
          )}

          {gameState.phase === GamePhase.HandComplete && (
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                Hand Complete - Click New Game to continue
              </Badge>
            </div>
          )}

          {gameState.phase === GamePhase.GameOver && (
            <div className="flex justify-center flex-col items-center gap-2">
              <Badge variant="default" className="text-lg py-2 px-4">
                Game Over
              </Badge>
              <p className="text-sm text-muted-foreground">
                Winner: {gameState.players.reduce((min, p) => (p.score < min.score ? p : min)).name}
              </p>
            </div>
          )}
        </CardContent>
      </UICard>

      {/* Info Card */}
      <UICard className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Coming Soon</p>
            <p>
              Full Hearts gameplay is under development. The game logic is implemented but the
              interactive UI for card passing and playing is still being built.
            </p>
          </div>
        </CardContent>
      </UICard>
    </div>
  );
}
