'use client';

import { Card as GameCard } from '@memory/game-logic';
import { getCardDisplay } from '@memory/game-logic';
import { cn } from '@/lib/utils';

interface GameCardProps {
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function PlayingCard({ card, onClick, disabled = false, size = 'medium' }: GameCardProps) {
  const isRevealed = card.isFaceUp;
  const isClaimed = card.claimedByPlayer !== -1;

  // Size configurations
  const sizeClasses = {
    small: 'h-16 w-12 sm:h-20 sm:w-14',
    medium: 'h-20 w-14 sm:h-24 sm:w-16',
    large: 'h-24 w-16 sm:h-28 sm:w-20',
  };

  const fontSizes = {
    small: { back: 'text-2xl sm:text-3xl', front: 'text-xl sm:text-2xl' },
    medium: { back: 'text-3xl sm:text-4xl', front: 'text-2xl sm:text-3xl' },
    large: { back: 'text-4xl sm:text-5xl', front: 'text-3xl sm:text-4xl' },
  };

  // Animate claimed cards - fade and scale down
  if (isClaimed) {
    return (
      <div className={sizeClasses[size]}>
        <div className="h-full w-full scale-50 opacity-0 transition-all duration-700" />
      </div>
    );
  }

  return (
    <div
      onClick={!disabled && !isRevealed ? onClick : undefined}
      className={cn(
        'group relative',
        sizeClasses[size],
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
            'absolute inset-0 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md',
            'backface-hidden',
            { 'opacity-50': disabled }
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className={fontSizes[size].back}>?</span>
        </div>

        {/* Front of card (face up) */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md border border-gray-300 bg-white shadow-md backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className={fontSizes[size].front}>{getCardDisplay(card)}</span>
        </div>
      </div>
    </div>
  );
}
