# Game Logic API Documentation

The `@memory/game-logic` package contains all the core game mechanics and AI logic. It's platform-agnostic and can be used in web, mobile, and CLI applications.

## Installation

Within the monorepo:

```typescript
import { createGame, flipCard, ... } from '@memory/game-logic';
```

## Core Concepts

### Game Configuration

Define how the game should be set up:

```typescript
import { GameConfig, PlayerType } from '@memory/game-logic';

const config: GameConfig = {
  matchSize: 2, // 2, 3, or 4 cards must match
  numRanks: 13, // 13 or 26 unique ranks
  numPlayers: 2, // 2-4 players
  players: [
    { index: 0, name: 'Player 1', type: PlayerType.Human },
    { index: 1, name: 'AI', type: PlayerType.AI },
  ],
};
```

### Game State

The game state is immutable and contains everything needed to represent the current game:

```typescript
interface GameState {
  config: GameConfig;
  cards: Card[];
  players: Player[];
  currentPlayerIndex: number;
  currentlyFlippedCards: string[];
  moves: Move[];
  startTime: number;
  endTime: number | null;
  status: GameStatus;
}
```

## API Reference

### Game Management

#### `createGame(config: GameConfig): GameState`

Creates a new game with the specified configuration.

```typescript
import { createGame } from '@memory/game-logic';

const game = createGame({
  matchSize: 2,
  numRanks: 13,
  numPlayers: 2,
  players: [
    { index: 0, name: 'Alice', type: PlayerType.Human },
    { index: 1, name: 'Bob', type: PlayerType.AI },
  ],
});
```

#### `flipCard(state: GameState, cardId: string): FlipResult`

Flips a card face up. Returns the updated state or an error.

```typescript
import { flipCard } from '@memory/game-logic';

const result = flipCard(gameState, 'A-hearts-0');

if (result.success) {
  const newState = result.updatedState;
  // Continue with the new state
} else {
  console.error(result.reason);
}
```

#### `checkAndProcessMatch(state: GameState): GameState`

Checks if the currently flipped cards form a match and processes the result.

```typescript
import { checkAndProcessMatch } from '@memory/game-logic';

// After flipping the required number of cards
const processedState = checkAndProcessMatch(gameState);
```

#### `resetCurrentTurn(state: GameState): GameState`

Flips all currently face-up cards back down (useful for timeouts or cancellations).

```typescript
import { resetCurrentTurn } from '@memory/game-logic';

const resetState = resetCurrentTurn(gameState);
```

### Game Statistics

#### `getGameStats(state: GameState)`

Returns comprehensive game statistics.

```typescript
import { getGameStats } from '@memory/game-logic';

const stats = getGameStats(gameState);
// {
//   totalMoves: number,
//   elapsedTime: number,
//   totalPairs: number,
//   playerStats: Array<{...}>,
//   winner: Player | null
// }
```

### Serialization

#### `serializeGameState(state: GameState): string`

Converts game state to JSON string for storage or network transfer.

```typescript
import { serializeGameState } from '@memory/game-logic';

const json = serializeGameState(gameState);
localStorage.setItem('savedGame', json);
```

#### `deserializeGameState(json: string): GameState`

Restores game state from JSON string.

```typescript
import { deserializeGameState } from '@memory/game-logic';

const json = localStorage.getItem('savedGame');
const gameState = deserializeGameState(json);
```

### Helper Functions

#### `getCurrentPlayer(state: GameState): Player`

Returns the current player.

```typescript
import { getCurrentPlayer } from '@memory/game-logic';

const currentPlayer = getCurrentPlayer(gameState);
console.log(`${currentPlayer.name}'s turn`);
```

#### `isPlayerTurn(state: GameState, playerIndex: number): boolean`

Checks if it's a specific player's turn.

```typescript
import { isPlayerTurn } from '@memory/game-logic';

if (isPlayerTurn(gameState, 0)) {
  // Player 0's turn
}
```

#### `getVisibleCards(state: GameState): Card[]`

Returns all cards that are currently visible (face up or claimed).

```typescript
import { getVisibleCards } from '@memory/game-logic';

const visibleCards = getVisibleCards(gameState);
```

#### `getUnclaimedCards(state: GameState): Card[]`

Returns all cards that haven't been claimed yet.

```typescript
import { getUnclaimedCards } from '@memory/game-logic';

const remainingCards = getUnclaimedCards(gameState);
```

## AI Logic

### AI Memory

The AI uses a memory system to track cards it has seen:

```typescript
import { createAIMemory, AIMemory } from '@memory/game-logic';

const memory: AIMemory = createAIMemory();
```

### AI Functions

#### `syncMemoryWithGameState(state: GameState, memory: AIMemory): AIMemory`

Updates AI memory based on the current game state.

```typescript
import { syncMemoryWithGameState } from '@memory/game-logic';

const updatedMemory = syncMemoryWithGameState(gameState, memory);
```

#### `getAIMove(state: GameState, memory: AIMemory): number[]`

Determines the AI's next move. Returns positions of cards to flip.

```typescript
import { getAIMove, getCardIdsFromPositions } from '@memory/game-logic';

const positions = getAIMove(gameState, aiMemory);
const cardIds = getCardIdsFromPositions(gameState, positions);

// Flip the cards
for (const cardId of cardIds) {
  const result = flipCard(gameState, cardId);
  // ...
}
```

#### `findKnownMatch(state: GameState, memory: AIMemory): number[] | null`

Finds a complete match in the AI's memory, or null if none exists.

```typescript
import { findKnownMatch } from '@memory/game-logic';

const match = findKnownMatch(gameState, aiMemory);
if (match) {
  console.log('AI knows where a match is!');
}
```

## Card Utilities

### Card Display

#### `getCardDisplay(card: Card): string`

Returns a user-friendly display string for a card.

```typescript
import { getCardDisplay } from '@memory/game-logic';

const display = getCardDisplay(card);
// "A♥️", "K♠️", etc.
```

#### `getSuitEmoji(suit: Suit): string`

Returns the emoji for a suit.

```typescript
import { getSuitEmoji, Suit } from '@memory/game-logic';

const emoji = getSuitEmoji(Suit.Hearts);
// "♥️"
```

### Deck Creation

#### `createDeck(numRanks: 13 | 26, matchSize: 2 | 3 | 4): Card[]`

Creates and shuffles a deck based on configuration.

```typescript
import { createDeck } from '@memory/game-logic';

const deck = createDeck(13, 2);
// 26 cards (13 ranks × 2 suits), shuffled
```

## Type Definitions

### Card

```typescript
interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  hasBeenSeen: boolean;
  isFaceUp: boolean;
  claimedByPlayer: number; // -1 if unclaimed
  position: number;
}
```

### Player

```typescript
interface Player {
  index: number;
  name: string;
  type: PlayerType;
  matchesClaimed: number;
  claimedCards: string[];
}
```

### Move

```typescript
interface Move {
  playerIndex: number;
  cardIds: string[];
  isMatch: boolean;
  timestamp: number;
}
```

## Examples

### Basic Game Flow

```typescript
import {
  createGame,
  flipCard,
  checkAndProcessMatch,
  GameConfig,
  PlayerType,
} from '@memory/game-logic';

// 1. Create game
const config: GameConfig = {
  matchSize: 2,
  numRanks: 13,
  numPlayers: 2,
  players: [
    { index: 0, name: 'Alice', type: PlayerType.Human },
    { index: 1, name: 'Bob', type: PlayerType.Human },
  ],
};

let gameState = createGame(config);

// 2. Player flips first card
let result = flipCard(gameState, gameState.cards[0].id);
if (result.success) {
  gameState = result.updatedState!;
}

// 3. Player flips second card
result = flipCard(gameState, gameState.cards[1].id);
if (result.success) {
  gameState = result.updatedState!;
}

// 4. Check for match
gameState = checkAndProcessMatch(gameState);

// 5. Check if game is complete
if (gameState.status === 'completed') {
  const stats = getGameStats(gameState);
  console.log(`Winner: ${stats.winner?.name}`);
}
```

### AI Game Flow

```typescript
import {
  createGame,
  flipCard,
  checkAndProcessMatch,
  createAIMemory,
  syncMemoryWithGameState,
  getAIMove,
  getCardIdsFromPositions,
  PlayerType,
} from '@memory/game-logic';

let gameState = createGame({
  matchSize: 2,
  numRanks: 13,
  numPlayers: 2,
  players: [
    { index: 0, name: 'Human', type: PlayerType.Human },
    { index: 1, name: 'AI', type: PlayerType.AI },
  ],
});

let aiMemory = createAIMemory();

// When it's the AI's turn
if (gameState.players[gameState.currentPlayerIndex].type === PlayerType.AI) {
  // Get AI move
  const positions = getAIMove(gameState, aiMemory);
  const cardIds = getCardIdsFromPositions(gameState, positions);

  // Flip cards
  for (const cardId of cardIds) {
    const result = flipCard(gameState, cardId);
    if (result.success) {
      gameState = result.updatedState!;
    }
  }

  // Process match
  gameState = checkAndProcessMatch(gameState);

  // Update AI memory
  aiMemory = syncMemoryWithGameState(gameState, aiMemory);
}
```
