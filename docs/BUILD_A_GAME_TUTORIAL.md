# Tutorial: Building "War" Card Game with the Framework

This is a complete, step-by-step tutorial showing how to build a simple card game using this framework. We'll build "War" - the classic two-player game where highest card wins.

## Game Rules (War)

- 2 players, each get half the deck
- Each turn, both players flip their top card
- Highest card wins both cards
- On a tie ("war"), each player plays 3 cards face down, then 1 face up
- Winner takes all cards from the war
- Game ends when one player has all cards

## Part 1: Setup Your New Repo

```bash
# Create new Next.js project
npx create-next-app@latest war-card-game
cd war-card-game

# Link the framework (from memory repo)
npm link ../memory/packages/card-game-core
npm link ../memory/packages/card-game-ui

# Install dependencies
npm install
```

## Part 2: Create Game Logic Package

### Step 2.1: Define Types

```typescript
// lib/war/types.ts
import { BaseCard } from '@memory/card-game-core';

export interface WarCard extends BaseCard {
  // War doesn't need extra fields, but we create the type for consistency
}

export interface Player {
  id: string;
  name: string;
  deck: WarCard[];
  wonCards: WarCard[];
}

export enum GamePhase {
  Ready = 'ready',
  Battle = 'battle',
  War = 'war',
  GameOver = 'game_over',
}

export interface Battle {
  player1Card: WarCard | null;
  player2Card: WarCard | null;
  warPile: WarCard[]; // Cards played during war
}

export interface GameState {
  players: [Player, Player];
  currentBattle: Battle;
  phase: GamePhase;
  winner: string | null;
}
```

### Step 2.2: Create Game Functions

```typescript
// lib/war/game.ts
import { createStandardDeck, shuffle } from '@memory/card-game-core';
import { GameState, GamePhase, Player, WarCard } from './types';

export function createGame(player1Name: string, player2Name: string): GameState {
  const deck = shuffle(createStandardDeck()) as WarCard[];

  // Split deck in half
  const halfDeck = Math.floor(deck.length / 2);

  const player1: Player = {
    id: 'player1',
    name: player1Name,
    deck: deck.slice(0, halfDeck),
    wonCards: [],
  };

  const player2: Player = {
    id: 'player2',
    name: player2Name,
    deck: deck.slice(halfDeck),
    wonCards: [],
  };

  return {
    players: [player1, player2],
    currentBattle: {
      player1Card: null,
      player2Card: null,
      warPile: [],
    },
    phase: GamePhase.Ready,
    winner: null,
  };
}

/**
 * Get the numeric value of a rank for comparison
 */
function getCardValue(card: WarCard): number {
  const rankValues: Record<string, number> = {
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
  return rankValues[card.rank] || 0;
}

/**
 * Start a battle - both players play their top card
 */
export function playBattle(state: GameState): GameState {
  if (state.phase === GamePhase.GameOver) {
    return state;
  }

  const [player1, player2] = state.players;

  // Check if either player is out of cards
  if (player1.deck.length === 0 && player1.wonCards.length === 0) {
    return { ...state, phase: GamePhase.GameOver, winner: player2.name };
  }
  if (player2.deck.length === 0 && player2.wonCards.length === 0) {
    return { ...state, phase: GamePhase.GameOver, winner: player1.name };
  }

  // Shuffle won cards back into deck if needed
  const newPlayer1 = shuffleWonCardsIfNeeded(player1);
  const newPlayer2 = shuffleWonCardsIfNeeded(player2);

  // Play top card from each player
  const player1Card = { ...newPlayer1.deck[0], isFaceUp: true };
  const player2Card = { ...newPlayer2.deck[0], isFaceUp: true };

  const newPlayer1Deck = newPlayer1.deck.slice(1);
  const newPlayer2Deck = newPlayer2.deck.slice(1);

  const player1Value = getCardValue(player1Card);
  const player2Value = getCardValue(player2Card);

  // Determine phase
  const isWar = player1Value === player2Value;

  return {
    ...state,
    players: [
      { ...newPlayer1, deck: newPlayer1Deck },
      { ...newPlayer2, deck: newPlayer2Deck },
    ],
    currentBattle: {
      player1Card,
      player2Card,
      warPile: [],
    },
    phase: isWar ? GamePhase.War : GamePhase.Battle,
    winner: null,
  };
}

/**
 * Resolve the battle - winner takes all cards
 */
export function resolveBattle(state: GameState): GameState {
  if (state.phase === GamePhase.War) {
    // Need to play war first
    return state;
  }

  const { player1Card, player2Card, warPile } = state.currentBattle;
  if (!player1Card || !player2Card) {
    return state;
  }

  const [player1, player2] = state.players;

  const player1Value = getCardValue(player1Card);
  const player2Value = getCardValue(player2Card);

  // All cards in play
  const allCards = [player1Card, player2Card, ...warPile];

  let newPlayer1 = player1;
  let newPlayer2 = player2;

  if (player1Value > player2Value) {
    // Player 1 wins
    newPlayer1 = {
      ...player1,
      wonCards: [...player1.wonCards, ...allCards],
    };
  } else {
    // Player 2 wins
    newPlayer2 = {
      ...player2,
      wonCards: [...player2.wonCards, ...allCards],
    };
  }

  return {
    ...state,
    players: [newPlayer1, newPlayer2],
    currentBattle: {
      player1Card: null,
      player2Card: null,
      warPile: [],
    },
    phase: GamePhase.Ready,
  };
}

/**
 * Play war - each player plays 3 face-down cards
 */
export function playWar(state: GameState): GameState {
  if (state.phase !== GamePhase.War) {
    return state;
  }

  const [player1, player2] = state.players;

  // Each player needs at least 3 cards for war
  const p1 = shuffleWonCardsIfNeeded(player1);
  const p2 = shuffleWonCardsIfNeeded(player2);

  if (p1.deck.length < 3 || p2.deck.length < 3) {
    // Not enough cards, player with fewer cards loses
    const winner = p1.deck.length >= p2.deck.length ? player1.name : player2.name;
    return {
      ...state,
      phase: GamePhase.GameOver,
      winner,
    };
  }

  // Take 3 cards from each player (face down)
  const p1WarCards = p1.deck.slice(0, 3).map((c) => ({ ...c, isFaceUp: false }));
  const p2WarCards = p2.deck.slice(0, 3).map((c) => ({ ...c, isFaceUp: false }));

  const newP1Deck = p1.deck.slice(3);
  const newP2Deck = p2.deck.slice(3);

  return {
    ...state,
    players: [
      { ...p1, deck: newP1Deck },
      { ...p2, deck: newP2Deck },
    ],
    currentBattle: {
      ...state.currentBattle,
      warPile: [...state.currentBattle.warPile, ...p1WarCards, ...p2WarCards],
    },
    phase: GamePhase.Ready, // Ready to play battle again
  };
}

/**
 * Helper: Shuffle won cards back into deck if deck is empty
 */
function shuffleWonCardsIfNeeded(player: Player): Player {
  if (player.deck.length === 0 && player.wonCards.length > 0) {
    return {
      ...player,
      deck: shuffle(player.wonCards) as WarCard[],
      wonCards: [],
    };
  }
  return player;
}
```

### Step 2.3: Write Tests

```typescript
// lib/war/__tests__/game.test.ts
import { createGame, playBattle, resolveBattle, playWar } from '../game';
import { GamePhase } from '../types';

describe('War Game', () => {
  describe('createGame', () => {
    it('should create initial game state', () => {
      const state = createGame('Alice', 'Bob');

      expect(state.players).toHaveLength(2);
      expect(state.players[0].name).toBe('Alice');
      expect(state.players[1].name).toBe('Bob');
      expect(state.players[0].deck.length).toBe(26);
      expect(state.players[1].deck.length).toBe(26);
      expect(state.phase).toBe(GamePhase.Ready);
    });
  });

  describe('playBattle', () => {
    it('should play a battle', () => {
      const state = createGame('Alice', 'Bob');
      const newState = playBattle(state);

      expect(newState.currentBattle.player1Card).not.toBeNull();
      expect(newState.currentBattle.player2Card).not.toBeNull();
      expect(newState.phase).toMatch(/battle|war/);
    });
  });

  describe('resolveBattle', () => {
    it('should award cards to winner', () => {
      let state = createGame('Alice', 'Bob');
      state = playBattle(state);

      if (state.phase === GamePhase.Battle) {
        const newState = resolveBattle(state);

        // One player should have won cards
        const totalWonCards =
          newState.players[0].wonCards.length + newState.players[1].wonCards.length;
        expect(totalWonCards).toBeGreaterThan(0);
        expect(newState.phase).toBe(GamePhase.Ready);
      }
    });
  });
});
```

## Part 3: Create React UI

### Step 3.1: Container Component

```typescript
// app/war/WarContainer.tsx
'use client';

import { useState } from 'react';
import { createGame, playBattle, resolveBattle, playWar } from '@/lib/war/game';
import { GamePhase } from '@/lib/war/types';
import { WarBoard } from './WarBoard';

export function WarContainer() {
  const [gameState, setGameState] = useState(() => createGame('You', 'Computer'));
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePlayBattle = async () => {
    if (isAnimating || gameState.phase === GamePhase.GameOver) return;

    setIsAnimating(true);

    // Play battle
    const battleState = playBattle(gameState);
    setGameState(battleState);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Handle war if needed
    if (battleState.phase === GamePhase.War) {
      const warState = playWar(battleState);
      setGameState(warState);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Play battle after war
      const nextBattleState = playBattle(warState);
      setGameState(nextBattleState);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Resolve the war battle
      if (nextBattleState.phase === GamePhase.Battle) {
        const resolvedState = resolveBattle(nextBattleState);
        setGameState(resolvedState);
      }
    } else if (battleState.phase === GamePhase.Battle) {
      // Resolve normal battle
      const resolvedState = resolveBattle(battleState);
      setGameState(resolvedState);
    }

    setIsAnimating(false);
  };

  const handleNewGame = () => {
    setGameState(createGame('You', 'Computer'));
    setIsAnimating(false);
  };

  return (
    <WarBoard
      gameState={gameState}
      onPlayBattle={handlePlayBattle}
      onNewGame={handleNewGame}
      isAnimating={isAnimating}
    />
  );
}
```

### Step 3.2: Board Component

```typescript
// app/war/WarBoard.tsx
import { Card } from '@memory/card-game-ui';
import { getCardDisplay } from '@memory/card-game-core';
import { GameState, GamePhase } from '@/lib/war/types';
import { Button } from '@/components/ui/button';

interface WarBoardProps {
  gameState: GameState;
  onPlayBattle: () => void;
  onNewGame: () => void;
  isAnimating: boolean;
}

export function WarBoard({ gameState, onPlayBattle, onNewGame, isAnimating }: WarBoardProps) {
  const [player1, player2] = gameState.players;
  const { player1Card, player2Card } = gameState.currentBattle;

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">War Card Game</h1>
          {gameState.phase === GamePhase.GameOver && (
            <p className="text-2xl text-green-600">
              {gameState.winner} Wins!
            </p>
          )}
        </div>

        {/* Player Stats */}
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-xl font-semibold">{player1.name}</p>
            <p className="text-sm text-gray-600">
              {player1.deck.length} cards in deck
            </p>
            <p className="text-sm text-gray-600">
              {player1.wonCards.length} cards won
            </p>
          </div>

          <div className="text-center">
            <p className="text-xl font-semibold">{player2.name}</p>
            <p className="text-sm text-gray-600">
              {player2.deck.length} cards in deck
            </p>
            <p className="text-sm text-gray-600">
              {player2.wonCards.length} cards won
            </p>
          </div>
        </div>

        {/* Battle Area */}
        <div className="flex justify-center gap-8 items-center">
          {/* Player 1 Card */}
          <div className="text-center">
            {player1Card ? (
              <Card
                card={player1Card}
                size="large"
                frontContent={
                  <div className="flex items-center justify-center h-full w-full bg-white text-4xl font-bold">
                    {getCardDisplay(player1Card)}
                  </div>
                }
              />
            ) : (
              <div className="w-[120px] h-[168px] border-2 border-dashed border-gray-300 rounded" />
            )}
          </div>

          {/* VS */}
          <div className="text-4xl font-bold text-gray-400">VS</div>

          {/* Player 2 Card */}
          <div className="text-center">
            {player2Card ? (
              <Card
                card={player2Card}
                size="large"
                frontContent={
                  <div className="flex items-center justify-center h-full w-full bg-white text-4xl font-bold">
                    {getCardDisplay(player2Card)}
                  </div>
                }
              />
            ) : (
              <div className="w-[120px] h-[168px] border-2 border-dashed border-gray-300 rounded" />
            )}
          </div>
        </div>

        {/* War Indicator */}
        {gameState.phase === GamePhase.War && (
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 animate-pulse">
              WAR!
            </p>
            <p className="text-sm text-gray-600">
              {gameState.currentBattle.warPile.length} cards in the war pile
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={onPlayBattle}
            disabled={isAnimating || gameState.phase === GamePhase.GameOver}
            size="lg"
          >
            {isAnimating ? 'Playing...' : 'Play Battle'}
          </Button>

          <Button onClick={onNewGame} variant="outline" size="lg">
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Step 3.3: Page Component

```typescript
// app/war/page.tsx
import { WarContainer } from './WarContainer';

export default function WarPage() {
  return <WarContainer />;
}
```

## Part 4: Test Your Game

```bash
npm run dev
```

Visit `http://localhost:3000/war`

## What You Learned

1. **Pure game logic**: All game state changes in pure functions
2. **Type-first design**: Define types before implementation
3. **Separation of concerns**: Logic vs UI vs state management
4. **Using Card component**: Flexible display with frontContent
5. **Animation timing**: Use state + setTimeout for game flow
6. **Testing pure functions**: Easy to test without UI

## Next Steps

- Add sound effects
- Add score tracking across multiple games
- Add difficulty levels (computer cheats by peeking?)
- Add animations for card dealing
- Make it multiplayer with WebSockets

## Key Takeaways

The framework provided:

- ✅ Card types and deck creation (`createStandardDeck`, `shuffle`)
- ✅ Card display utilities (`getCardDisplay`)
- ✅ Flexible Card component with animations
- ✅ TypeScript types for type safety

You implemented:

- Game-specific state and logic
- Game rules as pure functions
- React state management
- UI layout and styling

This separation makes it easy to test, maintain, and extend your game!
