# For New Claude Instances: Using the Card Game Framework

This document helps you (another Claude instance) quickly understand and use this card game framework to build a new card game in a different repository.

## Quick Context

You're looking at a modular card game framework with two core packages:

- **@memory/card-game-core**: Types, utilities, deck creation (no UI)
- **@memory/card-game-ui**: React Card component with flip animations

## What's Already Built

This repo contains three example games:

1. **Memory**: Simple matching game (in `packages/game-logic`)
2. **Blackjack**: Single-player vs dealer (in `packages/blackjack`)
3. **Hearts**: 4-player trick-taking game (in `packages/hearts`)

Each game demonstrates different patterns you can learn from.

## Architecture Overview

```
@memory/card-game-core (Zero dependencies)
├── Types: Suit, Rank, BaseCard
├── Deck utilities: createStandardDeck(), shuffle()
└── Display helpers: getCardDisplay(), getSuitEmoji()

@memory/card-game-ui (Depends on: core + React)
├── Card component (flip animations, click handlers)
└── Styling utilities

Your Game Package (Depends on: core)
├── Game state types
├── Game logic functions (pure, testable)
└── Tests

Your UI Package (Depends on: core + ui + your game)
├── Container component (React state)
├── Board component (presentation)
└── Integration with Card component
```

## Key Design Patterns

### 1. Pure Game Logic

All game logic is **pure functions** that take state and return new state:

```typescript
// From packages/hearts/src/game.ts
export function playCard(state: GameState, playerId: string, cardId: string): GameState {
  // Validate move
  // Calculate new state
  // Return new state (immutable)
}
```

### 2. Separation of Concerns

- **Game package**: Logic only (no React, no UI)
- **UI package**: React components only (no game rules)
- **Container component**: Bridges logic and UI (manages state)

### 3. Type Extension

Extend `BaseCard` for game-specific needs:

```typescript
// packages/hearts/src/types.ts
import { BaseCard } from '@memory/card-game-core';

export interface HeartsCard extends BaseCard {
  // BaseCard has: id, rank, suit, isFaceUp
  // Add nothing extra, or add game-specific fields
}
```

### 4. State Management Pattern

```typescript
// Container: Manages state with hooks
const [gameState, setGameState] = useState<GameState>(initialState);

// User action triggers state change
const handleAction = (params) => {
  const newState = gameLogicFunction(gameState, params);
  setGameState(newState);
};

// Board receives state and callbacks
return <Board gameState={gameState} onAction={handleAction} />;
```

## How to Build Your Game

### Step 1: Link the Framework Locally

In this repo:

```bash
cd /Users/nickhart/Developer/memory
pnpm install
pnpm --filter @memory/card-game-core build
pnpm --filter @memory/card-game-ui build

cd packages/card-game-core
npm link

cd ../card-game-ui
npm link
```

In your new game repo:

```bash
npm link @memory/card-game-core
npm link @memory/card-game-ui
```

### Step 2: Create Game Logic Package

```typescript
// your-game/src/types.ts
import { BaseCard } from '@memory/card-game-core';

export interface GameState {
  deck: BaseCard[];
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  // ... your game state
}

export enum GamePhase {
  Setup = 'setup',
  Playing = 'playing',
  GameOver = 'game_over',
}
```

```typescript
// your-game/src/game.ts
import { createStandardDeck, shuffle } from '@memory/card-game-core';
import { GameState } from './types';

export function createGame(): GameState {
  const deck = shuffle(createStandardDeck());
  return {
    deck,
    players: [],
    currentPlayerIndex: 0,
    phase: GamePhase.Setup,
  };
}

export function dealCards(state: GameState): GameState {
  // Pure function - no mutations
  // Return new state with dealt cards
}

export function playCard(state: GameState, cardId: string): GameState {
  // Validate move
  // Calculate new state
  // Return new state
}
```

### Step 3: Write Tests First

```typescript
// your-game/__tests__/game.test.ts
import { createGame, dealCards, playCard } from '../src/game';

describe('createGame', () => {
  it('should create initial game state', () => {
    const state = createGame();
    expect(state.deck).toHaveLength(52);
    expect(state.phase).toBe('setup');
  });
});
```

### Step 4: Create UI Components

```typescript
// your-game-ui/components/YourGameContainer.tsx
'use client';
import { useState } from 'react';
import { createGame, dealCards, playCard } from 'your-game-logic';
import { YourGameBoard } from './YourGameBoard';

export function YourGameContainer() {
  const [gameState, setGameState] = useState(() => {
    const game = createGame();
    return dealCards(game);
  });

  const handleCardClick = (cardId: string) => {
    const newState = playCard(gameState, cardId);
    setGameState(newState);
  };

  return <YourGameBoard gameState={gameState} onCardClick={handleCardClick} />;
}
```

```typescript
// your-game-ui/components/YourGameBoard.tsx
import { Card } from '@memory/card-game-ui';
import { getCardDisplay } from '@memory/card-game-core';
import { GameState } from 'your-game-logic';

interface YourGameBoardProps {
  gameState: GameState;
  onCardClick: (cardId: string) => void;
}

export function YourGameBoard({ gameState, onCardClick }: YourGameBoardProps) {
  return (
    <div>
      {gameState.players[0].hand.map(card => (
        <Card
          key={card.id}
          card={card}
          frontContent={
            <div className="text-2xl">{getCardDisplay(card)}</div>
          }
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </div>
  );
}
```

## Learning from Examples

### Simple Game: Study Memory

**File**: `packages/game-logic/src/game.ts`

Good for learning:

- Basic state management
- Simple card matching logic
- Flip animations with `isFaceUp`

Key functions:

- `initializeGame()`: Setup with shuffled deck
- `revealCard()`: Flip a card face up
- `checkMatch()`: Compare two cards

### Medium Complexity: Study Blackjack

**Files**: `packages/blackjack/src/game.ts`, `packages/blackjack/src/hand.ts`

Good for learning:

- Multiple phases (betting, playing, dealer turn)
- Scoring logic
- AI opponent (dealer rules)

Key functions:

- `startNewRound()`: Deal initial cards
- `hit()`: Add card to hand
- `stand()`: End player turn
- `calculateHandValue()`: Blackjack scoring

### Complex Game: Study Hearts

**Files**: `packages/hearts/src/*.ts`

Good for learning:

- Multi-player state management
- Turn-based gameplay
- Complex rules (trick-taking, passing)
- AI strategies

Key functions:

- `dealCards()`: Distribute to 4 players
- `selectCardToPass()`: Card passing phase
- `playCard()`: Play card to trick
- `completeTrick()`: Determine trick winner

## Common Patterns You'll Use

### Pattern 1: Deck Operations

```typescript
import { createStandardDeck, shuffle } from '@memory/card-game-core';

// Create and shuffle
const deck = shuffle(createStandardDeck());

// Deal cards (take from deck)
const hand = deck.slice(0, 5);
const remainingDeck = deck.slice(5);
```

### Pattern 2: Card Display

```typescript
import { Card } from '@memory/card-game-ui';
import { getCardDisplay } from '@memory/card-game-core';

<Card
  card={myCard}
  size="medium"
  frontContent={<div>{getCardDisplay(myCard)}</div>}
  backContent={<div className="bg-blue-600">🂠</div>}
  onClick={() => handleClick(myCard.id)}
/>
```

### Pattern 3: Face Up/Down

```typescript
// Show card face up
const revealedCard = { ...card, isFaceUp: true };

// Hide card (face down)
const hiddenCard = { ...card, isFaceUp: false };

// Card component automatically flips based on isFaceUp
```

### Pattern 4: Finding Cards

```typescript
// Find card in hand
const card = player.hand.find((c) => c.id === cardId);

// Remove card from hand
const newHand = player.hand.filter((c) => c.id !== cardId);

// Add card to hand
const newHand = [...player.hand, card];
```

## TypeScript Tips

### Use Enums for Phases

```typescript
export enum GamePhase {
  Dealing = 'dealing',
  Playing = 'playing',
  Scoring = 'scoring',
}
```

### Use Readonly Arrays

```typescript
export interface GameState {
  readonly deck: readonly BaseCard[];
  // Immutability enforced by TypeScript
}
```

### Type Guards for Validation

```typescript
function isValidMove(state: GameState, cardId: string): boolean {
  return state.currentPlayer.hand.some((c) => c.id === cardId);
}
```

## Testing Strategy

1. **Test game logic in isolation** (no UI)
2. **Test pure functions** (easy to test)
3. **Use snapshots for complex state**
4. **Test edge cases** (empty deck, last card, etc.)

```typescript
describe('playCard', () => {
  it('should remove card from hand', () => {
    const state = createTestState();
    const cardId = state.players[0].hand[0].id;

    const newState = playCard(state, cardId);

    expect(newState.players[0].hand).toHaveLength(state.players[0].hand.length - 1);
    expect(newState.players[0].hand.some((c) => c.id === cardId)).toBe(false);
  });
});
```

## Development Workflow

1. **Start with types** (`types.ts`)
2. **Write failing tests** (`__tests__/game.test.ts`)
3. **Implement game logic** (`game.ts`)
4. **Test manually in UI**
5. **Iterate and refine**

## Quick Reference

### Imports You'll Need

```typescript
// Core functionality
import {
  BaseCard,
  Suit,
  Rank,
  createStandardDeck,
  shuffle,
  getCardDisplay,
  getSuitEmoji,
} from '@memory/card-game-core';

// UI component
import { Card } from '@memory/card-game-ui';
import type { CardProps } from '@memory/card-game-ui';
```

### Card Component Props

```typescript
interface CardProps {
  card: BaseCard; // Required: card data
  frontContent: ReactNode; // Required: what shows on front
  backContent?: ReactNode; // Optional: what shows on back
  onClick?: () => void; // Optional: click handler
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}
```

### BaseCard Structure

```typescript
interface BaseCard {
  id: string; // "A-hearts" or "2-spades-0"
  rank: Rank; // 'A', '2', '3', ... 'K'
  suit: Suit; // 'hearts', 'diamonds', 'clubs', 'spades'
  isFaceUp: boolean; // true = show front, false = show back
}
```

## When You're Stuck

1. **Look at similar games**: Check how Blackjack or Hearts solved it
2. **Check the tests**: Tests show usage examples
3. **Read the source**: Core packages are small and well-commented
4. **Start simple**: Build minimum viable game first, add features later

## Common Questions

**Q: Do I need to copy the framework into my repo?**
A: No! Use `npm link` to link it locally. Changes in the framework repo will be available after rebuilding.

**Q: Can I modify BaseCard?**
A: Extend it! Create your own interface that extends BaseCard. Don't modify the core package.

**Q: How do I handle AI players?**
A: See `packages/hearts/src/ai.ts` for examples. Create AI strategy classes that implement game logic.

**Q: Should game logic be async?**
A: No! Keep game logic synchronous and pure. Handle async (API calls, timers) in the UI layer.

**Q: How do I add animations?**
A: The Card component has built-in flip animation. For other animations, use CSS transitions in your Board component.

## Next Steps

1. **Browse the examples** in this repo
2. **Link the packages** to your new repo
3. **Create a simple game** (start with something like "War" or "Go Fish")
4. **Test thoroughly** before adding complexity
5. **Iterate** based on what you learn

Good luck! The framework is designed to be simple and composable. Start small and build up.
