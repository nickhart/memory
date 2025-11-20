import React from 'react';
import { BaseCard } from '@memory/card-game-core';
import { cn } from '../utils/cn';

export interface CardProps {
  /** The card data */
  card: Pick<BaseCard, 'id' | 'isFaceUp'>;
  /** Display content for the front of the card */
  frontContent: React.ReactNode;
  /** Display content for the back of the card (default: "?") */
  backContent?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes for the container */
  className?: string;
  /** Custom styles for card front */
  frontClassName?: string;
  /** Custom styles for card back */
  backClassName?: string;
}

/**
 * Generic playing card component with 3D flip animation
 */
export function Card({
  card,
  frontContent,
  backContent = '?',
  onClick,
  disabled = false,
  size = 'medium',
  className,
  frontClassName,
  backClassName,
}: CardProps) {
  const isRevealed = card.isFaceUp;

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

  return (
    <div
      id={`card-${card.id}`}
      onClick={!disabled && !isRevealed ? onClick : undefined}
      className={cn(
        'group relative',
        sizeClasses[size],
        'cursor-pointer transition-transform duration-300',
        {
          'hover:scale-105': !disabled && !isRevealed,
          'cursor-not-allowed': disabled && !isRevealed,
        },
        className
      )}
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn('relative h-full w-full transition-transform duration-500', {
          'rotate-y-180': isRevealed,
        })}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back of card (face down) */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md',
            'backface-hidden',
            { 'opacity-50': disabled },
            backClassName
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className={fontSizes[size].back}>{backContent}</span>
        </div>

        {/* Front of card (face up) */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-md border border-gray-300 bg-white shadow-md backface-hidden',
            frontClassName
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className={fontSizes[size].front}>{frontContent}</span>
        </div>
      </div>
    </div>
  );
}
