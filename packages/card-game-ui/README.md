# @memory/card-game-ui

Reusable React components for building card game UIs.

## Features

- 🎴 Flexible Card component with flip animations
- ⚡ Customizable front/back content
- 🎨 Multiple size options
- 🖱️ Click handlers and disabled states
- 📦 Tree-shakeable ES modules
- 📘 Full TypeScript support
- ⚛️ Works with React 18 and 19

## Installation

### From npm (if published)

```bash
npm install @memory/card-game-ui @memory/card-game-core
# or
pnpm add @memory/card-game-ui @memory/card-game-core
# or
yarn add @memory/card-game-ui @memory/card-game-core
```

### Peer dependencies

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

### Local development

```bash
# Clone the repository
git clone https://github.com/yourusername/memory.git
cd memory

# Install dependencies
pnpm install

# Build the packages
pnpm --filter @memory/card-game-core build
pnpm --filter @memory/card-game-ui build

# Link to your project
cd your-project
pnpm link ../memory/packages/card-game-core
pnpm link ../memory/packages/card-game-ui
```

## Usage

### Basic Card

```typescript
import { Card } from '@memory/card-game-ui';
import { getCardDisplay } from '@memory/card-game-core';
import type { BaseCard } from '@memory/card-game-core';

function MyCardGame() {
  const card: BaseCard = {
    id: 'A-hearts',
    rank: 'A',
    suit: 'hearts',
    isFaceUp: true,
  };

  return (
    <Card
      card={card}
      frontContent={
        <div className="text-2xl">
          {getCardDisplay(card)}
        </div>
      }
      backContent={
        <div className="bg-blue-600 text-white">
          🂠
        </div>
      }
      onClick={() => console.log('Card clicked!')}
    />
  );
}
```

### Interactive Hand

```typescript
import { Card } from '@memory/card-game-ui';
import { getCardDisplay } from '@memory/card-game-core';
import type { BaseCard } from '@memory/card-game-core';

function PlayerHand({ cards, onCardClick }: {
  cards: BaseCard[];
  onCardClick: (cardId: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          size="medium"
          frontContent={
            <div className="text-xl font-bold">
              {getCardDisplay(card)}
            </div>
          }
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </div>
  );
}
```

### Face Down Cards

```typescript
<Card
  card={{ ...card, isFaceUp: false }}
  frontContent={<div>Front</div>}
  backContent={<div className="bg-blue-600">Back</div>}
  disabled
/>
```

### Different Sizes

```typescript
// Small card (80x112px)
<Card card={card} size="small" frontContent={<div>♠</div>} />

// Medium card (100x140px) - default
<Card card={card} size="medium" frontContent={<div>♠</div>} />

// Large card (120x168px)
<Card card={card} size="large" frontContent={<div>♠</div>} />
```

## API Reference

### `Card`

The main Card component for displaying playing cards.

#### Props

```typescript
interface CardProps {
  /** Card data from @memory/card-game-core */
  card: BaseCard;

  /** Content to display on card front (required) */
  frontContent: React.ReactNode;

  /** Content to display on card back (optional) */
  backContent?: React.ReactNode;

  /** Click handler */
  onClick?: () => void;

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Disable interactions */
  disabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

#### Features

- **Automatic flip**: Card flips based on `card.isFaceUp` prop
- **Smooth animations**: CSS transitions for flip effect
- **Responsive sizing**: Multiple size options
- **Accessible**: Proper button semantics when clickable
- **Customizable**: Full control over front/back content and styling

### `cn()`

Utility function for conditional className merging (re-exported from clsx).

```typescript
import { cn } from '@memory/card-game-ui';

<div className={cn('base-class', isActive && 'active-class')} />
```

## Styling

The Card component uses inline styles for core layout and positioning. You have full control over:

- **Content styling**: Style `frontContent` and `backContent` as needed
- **Container styling**: Use `className` prop for additional wrapper styles
- **Responsive design**: Cards use fixed pixel sizes but scale with your layout

### Example with Tailwind CSS

```typescript
<Card
  card={card}
  className="shadow-lg hover:shadow-xl transition-shadow"
  frontContent={
    <div className="flex items-center justify-center h-full w-full bg-white text-gray-900 rounded">
      {getCardDisplay(card)}
    </div>
  }
  backContent={
    <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded">
      🂠
    </div>
  }
/>
```

## Examples

See the main repository for complete examples:

- Memory game implementation
- Blackjack game
- Hearts game

## License

MIT

## Contributing

Contributions welcome! This package is part of a monorepo. See the root README for development setup.
