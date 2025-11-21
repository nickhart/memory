# Quick Reference: Card Game Framework

Fast lookup for common tasks when building a card game with this framework.

## Installation (Local Development)

```bash
# In memory repo
cd /Users/nickhart/Developer/memory
pnpm --filter @memory/card-game-core build
pnpm --filter @memory/card-game-ui build
cd packages/card-game-core && npm link
cd ../card-game-ui && npm link

# In your game repo
npm link @memory/card-game-core
npm link @memory/card-game-ui
```

## Essential Imports

```typescript
// Core types and utilities
import {
  BaseCard,
  Suit,
  Rank,
  createStandardDeck,
  shuffle,
  getCardDisplay,
  getSuitEmoji,
  ALL_RANKS,
  ALL_SUITS,
} from '@memory/card-game-core';

// UI component
import { Card } from '@memory/card-game-ui';
import type { CardProps } from '@memory/card-game-ui';
```

## Card Operations

### Create and Shuffle Deck

```typescript
const deck = shuffle(createStandardDeck());
// Returns array of 52 BaseCard objects
```

### Deal Cards

```typescript
// Deal 5 cards to player
const hand = deck.slice(0, 5);
const remaining = deck.slice(5);

// Deal to multiple players
const hands = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];
```

### Card Manipulation

```typescript
// Flip face up
const revealed = { ...card, isFaceUp: true };

// Flip face down
const hidden = { ...card, isFaceUp: false };

// Find card
const card = hand.find((c) => c.id === cardId);

// Remove card
const newHand = hand.filter((c) => c.id !== cardId);

// Add card
const newHand = [...hand, card];

// Sort by rank
const sorted = hand.sort((a, b) => {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
});
```

## Card Component Usage

### Basic Card

```typescript
<Card
  card={myCard}
  frontContent={<div>{getCardDisplay(myCard)}</div>}
/>
```

### Interactive Card

```typescript
<Card
  card={myCard}
  frontContent={<div className="text-2xl">{getCardDisplay(myCard)}</div>}
  backContent={<div className="bg-blue-600">🂠</div>}
  onClick={() => handleCardClick(myCard.id)}
  size="medium"
/>
```

### Disabled Card

```typescript
<Card
  card={myCard}
  frontContent={<div>{getCardDisplay(myCard)}</div>}
  disabled={true}
/>
```

### All Size Options

```typescript
size = 'small'; // 80x112px
size = 'medium'; // 100x140px (default)
size = 'large'; // 120x168px
```

## Game State Pattern

### Define State

```typescript
interface GameState {
  deck: BaseCard[];
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
}

enum GamePhase {
  Setup = 'setup',
  Playing = 'playing',
  GameOver = 'game_over',
}
```

### Pure Functions

```typescript
export function playCard(state: GameState, playerId: string, cardId: string): GameState {
  // Validate
  if (state.phase !== GamePhase.Playing) {
    return state; // or throw error
  }

  // Calculate new state
  const player = state.players.find((p) => p.id === playerId);
  const newHand = player.hand.filter((c) => c.id !== cardId);

  // Return new state (immutable)
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, hand: newHand } : p)),
  };
}
```

## React Integration

### Container Component

```typescript
'use client';
import { useState } from 'react';
import { createGame, playCard } from './game';

export function GameContainer() {
  const [gameState, setGameState] = useState(() => createGame());

  const handleCardClick = (cardId: string) => {
    const newState = playCard(gameState, 'player1', cardId);
    setGameState(newState);
  };

  return <GameBoard gameState={gameState} onCardClick={handleCardClick} />;
}
```

### Board Component

```typescript
interface GameBoardProps {
  gameState: GameState;
  onCardClick: (cardId: string) => void;
}

export function GameBoard({ gameState, onCardClick }: GameBoardProps) {
  return (
    <div>
      {gameState.players[0].hand.map(card => (
        <Card
          key={card.id}
          card={card}
          frontContent={<div>{getCardDisplay(card)}</div>}
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </div>
  );
}
```

## Common Patterns

### Check Card Value

```typescript
function getCardValue(card: BaseCard): number {
  const values: Record<string, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return values[card.rank];
}
```

### Check Suit

```typescript
if (card.suit === Suit.Hearts) {
  // It's a heart
}

const isRed = card.suit === Suit.Hearts || card.suit === Suit.Diamonds;
const isBlack = card.suit === Suit.Clubs || card.suit === Suit.Spades;
```

### Group by Suit

```typescript
const bySuit = hand.reduce(
  (acc, card) => {
    acc[card.suit] = acc[card.suit] || [];
    acc[card.suit].push(card);
    return acc;
  },
  {} as Record<Suit, BaseCard[]>
);
```

### Find Highest Card

```typescript
const highest = hand.reduce((max, card) => (getCardValue(card) > getCardValue(max) ? card : max));
```

## Testing

### Basic Test Structure

```typescript
import { createGame, playCard } from '../game';

describe('Game Logic', () => {
  it('should create initial state', () => {
    const state = createGame();
    expect(state.deck).toHaveLength(52);
  });

  it('should play a card', () => {
    const state = createGame();
    const cardId = state.players[0].hand[0].id;

    const newState = playCard(state, 'player1', cardId);

    expect(newState.players[0].hand).toHaveLength(state.players[0].hand.length - 1);
  });
});
```

## Type Reference

### BaseCard

```typescript
interface BaseCard {
  id: string; // "A-hearts" or "2-spades-0"
  rank: Rank; // 'A', '2', ..., 'K'
  suit: Suit; // 'hearts', 'diamonds', 'clubs', 'spades'
  isFaceUp: boolean; // true = show front, false = show back
}
```

### Suit Enum

```typescript
enum Suit {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades',
}
```

### Rank Type

```typescript
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
```

## Troubleshooting

### "Cannot find module"

```bash
# Rebuild and relink
cd /Users/nickhart/Developer/memory
pnpm --filter @memory/card-game-core build
cd /path/to/your-game
npm link @memory/card-game-core
```

### Changes not reflecting

```bash
# Rebuild the framework
cd /Users/nickhart/Developer/memory
pnpm --filter @memory/card-game-core build

# Restart your dev server
npm run dev
```

### TypeScript errors with React

```bash
# Check versions match
npm list react react-dom
# Should be 18.x or 19.x
```

## Examples in This Repo

| Game      | Complexity | Learn About                                       |
| --------- | ---------- | ------------------------------------------------- |
| Memory    | Simple     | Basic state, card matching, flip animations       |
| Blackjack | Medium     | Phases, scoring, AI opponent                      |
| Hearts    | Complex    | Multi-player, turns, complex rules, AI strategies |

## File Locations

```
packages/
├── card-game-core/          Core types & utilities
│   ├── src/card.ts          Deck operations
│   ├── src/types.ts         BaseCard, Suit, Rank
│   └── README.md            Full API docs
├── card-game-ui/            React components
│   ├── src/components/Card.tsx
│   └── README.md            Component docs
├── game-logic/              Memory game example
├── blackjack/               Blackjack example
└── hearts/                  Hearts example
```

## Next Steps

1. Read `FOR_NEW_CLAUDE.md` for detailed overview
2. Follow `BUILD_A_GAME_TUTORIAL.md` for step-by-step guide
3. Study example games in this repo
4. Start with a simple game (War, Go Fish, Crazy Eights)
5. Add complexity gradually

## Quick Links

- Core API: `packages/card-game-core/README.md`
- UI API: `packages/card-game-ui/README.md`
- External Usage: `docs/EXTERNAL_USAGE.md`
- Architecture: `docs/ARCHITECTURE.md`
