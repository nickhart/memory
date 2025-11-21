# @memory/card-game-core

Core types and utilities for building card games with TypeScript.

## Features

- 🎴 Standard 52-card deck support
- ♠️ Suit and Rank enums with type safety
- 🔀 Shuffle utility with Fisher-Yates algorithm
- 🎨 Card display utilities (emoji suits, formatted strings)
- 📦 Tree-shakeable ES modules
- 📘 Full TypeScript support

## Installation

### From npm (if published)

```bash
npm install @memory/card-game-core
# or
pnpm add @memory/card-game-core
# or
yarn add @memory/card-game-core
```

### Local development

```bash
# Clone the repository
git clone https://github.com/yourusername/memory.git
cd memory

# Install dependencies
pnpm install

# Build the package
pnpm --filter @memory/card-game-core build

# Link to your project
cd your-project
pnpm link ../memory/packages/card-game-core
```

## Usage

### Creating a deck

```typescript
import { createStandardDeck, shuffle } from '@memory/card-game-core';

// Create a standard 52-card deck
const deck = createStandardDeck();

// Shuffle the deck
const shuffledDeck = shuffle(deck);
```

### Working with cards

```typescript
import { Suit, Rank, getCardDisplay, getSuitEmoji } from '@memory/card-game-core';

// Card objects have id, rank, suit, and isFaceUp properties
const card = deck[0];

console.log(card.rank); // 'A', '2', ... 'K'
console.log(card.suit); // 'hearts', 'diamonds', 'clubs', 'spades'

// Display formatted card
console.log(getCardDisplay(card)); // "A♥"

// Get suit emoji
console.log(getSuitEmoji(Suit.Hearts)); // "♥"
```

### Type-safe card creation

```typescript
import { createCardId, Rank, Suit, BaseCard } from '@memory/card-game-core';

const aceOfSpades: BaseCard = {
  id: createCardId(Rank.Ace, Suit.Spades),
  rank: Rank.Ace,
  suit: Suit.Spades,
  isFaceUp: true,
};
```

## API Reference

### Types

#### `Suit`

```typescript
enum Suit {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades',
}
```

#### `Rank`

```typescript
enum Rank {
  Ace = 'A',
  Two = '2',
  Three = '3',
  // ... through King = 'K'
}
```

#### `BaseCard`

```typescript
interface BaseCard {
  id: string; // Unique identifier
  rank: Rank; // Card rank
  suit: Suit; // Card suit
  isFaceUp: boolean; // Whether card is face up
}
```

### Functions

#### `createStandardDeck(): BaseCard[]`

Creates a standard 52-card deck in order.

#### `shuffle<T>(array: T[]): T[]`

Shuffles an array using Fisher-Yates algorithm. Returns a new array.

#### `createCardId(rank: Rank, suit: Suit, instance?: number): string`

Creates a unique card identifier. Use `instance` for games with multiple decks.

#### `getCardDisplay(card: BaseCard): string`

Returns formatted card string (e.g., "A♥", "10♠").

#### `getSuitEmoji(suit: Suit): string`

Returns suit emoji: ♥ ♦ ♣ ♠

### Constants

#### `ALL_RANKS: readonly Rank[]`

Array of all ranks in order.

#### `ALL_SUITS: readonly Suit[]`

Array of all suits.

## License

MIT

## Contributing

Contributions welcome! This package is part of a monorepo. See the root README for development setup.
