'use client';

import { Card as GameCard } from '@memory/game-logic';
import { Card } from '@/components/ui/card';
import { getCardDisplay } from '@memory/game-logic';
import { cn } from '@/lib/utils';

interface GameCardProps {
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
}

export function PlayingCard({ card, onClick, disabled = false }: GameCardProps) {
  const isRevealed = card.isFaceUp || card.claimedByPlayer !== -1;
  const isClaimed = card.claimedByPlayer !== -1;

  const getPlayerColor = (playerIndex: number) => {
    const colors = [
      'border-blue-500 bg-blue-50',
      'border-red-500 bg-red-50',
      'border-green-500 bg-green-50',
      'border-yellow-500 bg-yellow-50',
    ];
    return colors[playerIndex] || 'border-gray-500 bg-gray-50';
  };

  return (
    <Card
      onClick={!disabled && !isRevealed ? onClick : undefined}
      className={cn(
        'relative flex h-24 w-16 cursor-pointer items-center justify-center text-2xl transition-all duration-300 sm:h-32 sm:w-24',
        {
          'hover:scale-105 hover:shadow-lg': !disabled && !isRevealed,
          'cursor-not-allowed opacity-50': disabled && !isRevealed,
          [getPlayerColor(card.claimedByPlayer)]: isClaimed,
          'border-2': isClaimed,
        }
      )}
    >
      {isRevealed ? (
        <span className={cn('text-3xl sm:text-4xl', { 'opacity-50': isClaimed })}>
          {getCardDisplay(card)}
        </span>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <span className="text-4xl">?</span>
        </div>
      )}
    </Card>
  );
}
