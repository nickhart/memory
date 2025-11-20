'use client';

import {
  GameState,
  GamePhase,
  GameResult,
  PlayerAction,
  BlackjackCard,
  getResultMessage,
} from '@memory/blackjack';
import { getCardDisplay } from '@memory/card-game-core';
import { Card as GenericCard } from '@memory/card-game-ui';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlackjackBoardProps {
  gameState: GameState;
  onAction: (action: PlayerAction) => void;
  onNewGame: () => void;
}

export function BlackjackBoard({ gameState, onAction, onNewGame }: BlackjackBoardProps) {
  const isGameOver = gameState.phase === GamePhase.GameOver;
  const isPlayerTurn = gameState.phase === GamePhase.PlayerTurn;

  const renderHand = (cards: BlackjackCard[], title: string, total: number, isSoft: boolean) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg">
              {total}
            </Badge>
            {isSoft && total < 21 && (
              <Badge variant="outline" className="text-sm">
                Soft
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
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
              size="large"
              disabled
            />
          ))}
        </div>
      </div>
    );
  };

  const getResultBadgeVariant = (result: GameResult | null) => {
    if (!result) return 'secondary';
    if (result === GameResult.PlayerWin || result === GameResult.PlayerBlackjack) return 'default';
    if (result === GameResult.DealerWin) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <UICard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blackjack</CardTitle>
            <Button onClick={onNewGame} variant="outline">
              New Game
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Dealer's Hand */}
          {renderHand(
            gameState.dealerHand.cards,
            'Dealer',
            gameState.dealerHand.total,
            gameState.dealerHand.isSoft
          )}

          {/* Player's Hand */}
          {renderHand(
            gameState.playerHand.cards,
            'Player',
            gameState.playerHand.total,
            gameState.playerHand.isSoft
          )}

          {/* Action Buttons */}
          {isPlayerTurn && (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => onAction(PlayerAction.Hit)}
                size="lg"
                className="w-32"
                disabled={gameState.playerHand.isBust}
              >
                Hit
              </Button>
              <Button
                onClick={() => onAction(PlayerAction.Stand)}
                size="lg"
                variant="secondary"
                className="w-32"
              >
                Stand
              </Button>
            </div>
          )}

          {/* Game Result */}
          {isGameOver && gameState.result && (
            <div className="flex justify-center">
              <Badge
                variant={getResultBadgeVariant(gameState.result)}
                className="text-lg py-2 px-4"
              >
                {getResultMessage(gameState.result)}
              </Badge>
            </div>
          )}
        </CardContent>
      </UICard>
    </div>
  );
}
