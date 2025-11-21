# Using Card Game Packages in External Projects

This guide explains how to use `@memory/card-game-core` and `@memory/card-game-ui` in your own projects.

## Installation Methods

### Method 1: npm link (recommended for local development)

Best for active development where you want changes to reflect immediately.

```bash
# In the memory repo
cd /path/to/memory
pnpm install
pnpm --filter @memory/card-game-core build
pnpm --filter @memory/card-game-ui build

# Link the packages globally
cd packages/card-game-core
npm link

cd ../card-game-ui
npm link

# In your external project
cd /path/to/your-project
npm link @memory/card-game-core
npm link @memory/card-game-ui
```

To unlink later:

```bash
cd /path/to/your-project
npm unlink @memory/card-game-core @memory/card-game-ui
```

### Method 2: file: protocol (for testing)

Good for testing without global linking.

```bash
# In your external project's package.json
{
  "dependencies": {
    "@memory/card-game-core": "file:../memory/packages/card-game-core",
    "@memory/card-game-ui": "file:../memory/packages/card-game-ui"
  }
}
```

Then:

```bash
npm install
```

**Note**: You need to rebuild and reinstall after changes in the memory repo.

### Method 3: Publish to npm (for production)

When ready to share publicly:

```bash
# Login to npm
npm login

# Publish card-game-core
cd packages/card-game-core
npm publish --access public

# Publish card-game-ui
cd ../card-game-ui
npm publish --access public
```

Then install normally:

```bash
npm install @memory/card-game-core @memory/card-game-ui
```

### Method 4: Private npm registry

For private use without public publishing:

- Use GitHub Packages
- Use Verdaccio (local npm registry)
- Use npm private packages

## Quick Start Example

Here's a complete example of building a simple card game in a new Next.js project:

```bash
# Create new Next.js project
npx create-next-app@latest my-card-game
cd my-card-game

# Link the packages (assuming memory repo is at ../memory)
npm link ../memory/packages/card-game-core
npm link ../memory/packages/card-game-ui

# Or use file: protocol
npm install ../memory/packages/card-game-core ../memory/packages/card-game-ui
```

Then create a simple game:

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import { createStandardDeck, shuffle, getCardDisplay } from '@memory/card-game-core';
import { Card } from '@memory/card-game-ui';
import type { BaseCard } from '@memory/card-game-core';

export default function SimpleCardGame() {
  const [deck, setDeck] = useState<BaseCard[]>(() =>
    shuffle(createStandardDeck()).map(card => ({ ...card, isFaceUp: false }))
  );

  const handleCardClick = (cardId: string) => {
    setDeck(prev => prev.map(card =>
      card.id === cardId ? { ...card, isFaceUp: !card.isFaceUp } : card
    ));
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Simple Card Game</h1>
      <div className="flex gap-2 flex-wrap">
        {deck.slice(0, 10).map(card => (
          <Card
            key={card.id}
            card={card}
            size="medium"
            frontContent={
              <div className="flex items-center justify-center h-full w-full bg-white text-2xl font-bold">
                {getCardDisplay(card)}
              </div>
            }
            backContent={
              <div className="flex items-center justify-center h-full w-full bg-blue-600 text-white text-xl">
                🂠
              </div>
            }
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </main>
  );
}
```

## Development Workflow

When using npm link, changes in the memory repo require rebuilding:

```bash
# In memory repo after making changes
cd /path/to/memory
pnpm --filter @memory/card-game-core build
pnpm --filter @memory/card-game-ui build

# Your external project will automatically see the changes
# Just refresh your browser (with Fast Refresh enabled)
```

For continuous development:

```bash
# Terminal 1: Watch and rebuild on changes
cd /path/to/memory
pnpm --filter @memory/card-game-core dev

# Terminal 2: Watch and rebuild on changes
pnpm --filter @memory/card-game-ui dev

# Terminal 3: Your external project
cd /path/to/your-project
npm run dev
```

## TypeScript Configuration

Ensure your `tsconfig.json` can resolve the packages:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "resolvePackageJsonExports": true,
    "resolvePackageJsonImports": true,
    "baseUrl": ".",
    "paths": {
      "@memory/card-game-core": ["node_modules/@memory/card-game-core"],
      "@memory/card-game-ui": ["node_modules/@memory/card-game-ui"]
    }
  }
}
```

## Common Issues

### Issue: "Cannot find module '@memory/card-game-core'"

**Solution**:

1. Ensure packages are built: `pnpm --filter @memory/card-game-core build`
2. Check link: `npm list -g --depth=0 | grep @memory`
3. Re-link: `npm link @memory/card-game-core`

### Issue: Changes not reflecting

**Solution**:

1. Rebuild the package: `pnpm --filter @memory/card-game-core build`
2. Restart your dev server
3. Clear Next.js cache: `rm -rf .next`

### Issue: Type errors with React

**Solution**: Ensure peer dependencies match:

```bash
npm list react react-dom
```

Both your project and the UI package should use compatible React versions (18 or 19).

## Production Considerations

Before publishing to npm:

1. **Version**: Update version in package.json
2. **Build**: Run `pnpm build` to ensure clean build
3. **Test**: Run `pnpm test` to ensure all tests pass
4. **License**: Ensure LICENSE file exists
5. **Repository**: Update repository URLs in package.json
6. **Author**: Add author information
7. **Keywords**: Add relevant keywords for npm search
8. **README**: Ensure READMEs are complete and accurate

## Examples

See the `packages/web` directory in the memory repo for complete examples:

- **Memory Game**: Simple flip and match game
- **Blackjack**: Card game with state management
- **Hearts**: Complex multi-player trick-taking game

## Need Help?

- Open an issue in the GitHub repository
- Check the test files for usage examples
- Review the source code for detailed implementation
