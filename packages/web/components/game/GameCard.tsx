'use client';

import { Card as GameCard } from '@memory/game-logic';
import { getCardDisplay } from '@memory/game-logic';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface GameCardProps {
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  playerBoxId?: string;
}

export function PlayingCard({
  card,
  onClick,
  disabled = false,
  size = 'medium',
  playerBoxId,
}: GameCardProps) {
  const isRevealed = card.isFaceUp;
  const isClaimed = card.claimedByPlayer !== -1;
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});

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

  // Handle animation when card is claimed
  useEffect(() => {
    console.log(`[Card ${card.id}] Animation effect triggered`, {
      isClaimed,
      isAnimating,
      playerBoxId,
      claimedByPlayer: card.claimedByPlayer,
    });

    if (isClaimed && !isAnimating && playerBoxId) {
      console.log(`[Card ${card.id}] Starting animation to ${playerBoxId}`);

      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        setIsAnimating(true);
        console.log(`[Card ${card.id}] Set isAnimating to true`);

        // Get the card's current position
        const cardElement = document.getElementById(`card-${card.id}`);
        const targetElement = document.getElementById(playerBoxId);

        console.log(`[Card ${card.id}] Elements found:`, {
          cardElement: !!cardElement,
          targetElement: !!targetElement,
        });

        if (cardElement && targetElement) {
          const cardRect = cardElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();

          console.log(`[Card ${card.id}] Positions:`, {
            card: {
              left: cardRect.left,
              top: cardRect.top,
              width: cardRect.width,
              height: cardRect.height,
            },
            target: {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
            },
          });

          // Calculate the translation needed
          const deltaX =
            targetRect.left - cardRect.left + targetRect.width / 2 - cardRect.width / 2;
          const deltaY =
            targetRect.top - cardRect.top + targetRect.height / 2 - cardRect.height / 2;

          console.log(`[Card ${card.id}] Deltas:`, { deltaX, deltaY });

          const style = {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(0.3)`,
            opacity: 0,
          };
          console.log(`[Card ${card.id}] Setting animation style:`, style);
          setAnimationStyle(style);
        } else {
          console.error(`[Card ${card.id}] Failed to find elements!`);
        }
      });
    } else {
      console.log(`[Card ${card.id}] Animation conditions not met`, {
        needsClaimed: isClaimed,
        needsNotAnimating: !isAnimating,
        needsPlayerBoxId: !!playerBoxId,
      });
    }
  }, [isClaimed, card.id, playerBoxId, isAnimating, card.claimedByPlayer]);

  // Animate claimed cards - fade and scale down
  if (isClaimed && !playerBoxId) {
    console.log(`[Card ${card.id}] Rendering: claimed but no playerBoxId, fading out`);
    return (
      <div className={sizeClasses[size]}>
        <div className="h-full w-full scale-50 opacity-0 transition-all duration-700" />
      </div>
    );
  }

  if (isClaimed && isAnimating) {
    console.log(`[Card ${card.id}] Rendering: claimed and animating complete, invisible`);
    return (
      <div className={sizeClasses[size]}>
        <div className="h-full w-full opacity-0" />
      </div>
    );
  }

  console.log(`[Card ${card.id}] Rendering: normal card`, { isRevealed, isClaimed, isAnimating });

  return (
    <div
      id={`card-${card.id}`}
      onClick={!disabled && !isRevealed ? onClick : undefined}
      className={cn(
        'group relative',
        sizeClasses[size],
        'cursor-pointer transition-transform duration-300',
        {
          'hover:scale-105': !disabled && !isRevealed && !isClaimed,
          'cursor-not-allowed': disabled && !isRevealed,
        }
      )}
      style={{
        perspective: '1000px',
        ...(isClaimed && isAnimating
          ? { zIndex: 50, transition: 'all 0.8s ease-in-out', ...animationStyle }
          : {}),
      }}
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
