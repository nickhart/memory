'use client';

import { Card as GameCard } from '@memory/game-logic';
import { getCardDisplay } from '@memory/game-logic';
import { cn } from '@/lib/utils';

interface GameCardProps {
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
}

export function PlayingCard({ card, onClick, disabled = false }: GameCardProps) {
  const isRevealed = card.isFaceUp;
  const isClaimed = card.claimedByPlayer !== -1;

  // Don't render claimed cards - they'll be shown in the player's collection
  if (isClaimed) {
    return <div className="h-24 w-16 opacity-0 transition-all duration-500 sm:h-32 sm:w-24" />;
  }

  return (
    <div
      onClick={!disabled && !isRevealed ? onClick : undefined}
      className={cn(
        'group relative h-24 w-16 sm:h-32 sm:w-24',
        'cursor-pointer transition-transform duration-300',
        {
          'hover:scale-105': !disabled && !isRevealed,
          'cursor-not-allowed': disabled && !isRevealed,
        }
      )}
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-500',
          'transform-style-3d',
          {
            'rotate-y-180': isRevealed,
          }
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back of card (face down) */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg',
            'backface-hidden',
            { 'opacity-50': disabled }
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-4xl">?</span>
        </div>

        {/* Front of card (face up) */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white shadow-lg backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-3xl sm:text-4xl">{getCardDisplay(card)}</span>
        </div>
      </div>
    </div>
  );
}
