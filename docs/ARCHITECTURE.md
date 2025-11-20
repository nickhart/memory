# Architecture

This document describes the architecture and design decisions of the Memory game project.

## Overview

The Memory game is built as a monorepo with a clear separation between game logic and UI layers. This architecture enables code reuse across multiple platforms (web, mobile, CLI).

## Monorepo Structure

```
memory/
├── packages/
│   ├── game-logic/        # Platform-agnostic game engine
│   └── web/               # Next.js web application
├── docs/                  # Documentation
├── .vscode/               # VSCode workspace settings
├── .husky/                # Git hooks
└── turbo.json             # Turborepo configuration
```

## Package Architecture

### @memory/game-logic

The core game engine, completely platform-agnostic.

#### Modules

**types.ts**

- Type definitions for all game entities
- Enums for suits, ranks, player types, game status
- Interfaces for cards, players, game state, moves

**card.ts**

- Card creation and manipulation
- Deck generation with shuffling
- Card display utilities (emojis, text)
- Match validation logic

**game.ts**

- Game state management
- Move validation and processing
- Turn management
- Statistics calculation
- Serialization/deserialization

**ai.ts**

- AI memory management
- Strategic move selection
- Match finding algorithms
- Memory synchronization with game state

#### Design Principles

1. **Immutability**: All state transformations return new state objects
2. **Pure Functions**: No side effects, predictable behavior
3. **Type Safety**: Strict TypeScript with comprehensive types
4. **Testability**: All functions are unit tested (80%+ coverage)
5. **Separation of Concerns**: Clear boundaries between modules

### @memory/web

Next.js web application using the App Router.

#### Structure

```
web/
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (game container)
│   └── globals.css        # Global styles
├── components/
│   ├── game/
│   │   ├── GameContainer.tsx  # State management & AI logic
│   │   ├── GameBoard.tsx      # Game UI & grid
│   │   ├── GameSetup.tsx      # Configuration screen
│   │   └── GameCard.tsx       # Individual card component
│   └── ui/                    # shadcn/ui components
└── lib/
    └── utils.ts           # Utilities (cn, etc.)
```

#### Component Hierarchy

```
GameContainer (state management)
└── GameSetup | GameBoard
    ├── PlayingCard (grid of cards)
    ├── Player stats
    └── Game controls
```

#### State Management

- **Local State**: React useState for UI state
- **Game State**: Imported from @memory/game-logic
- **AI Memory**: Managed in GameContainer, synchronized with game state

#### Styling

- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built, accessible components
- **Responsive Design**: Mobile-first approach

## Data Flow

### Game Initialization

```
User configures game
  → GameSetup component
  → createGame(config)
  → GameState initialized
  → GameBoard renders
```

### Human Player Turn

```
User clicks card
  → GameContainer.processCardFlip()
  → flipCard(state, cardId)
  → Update state
  → syncMemoryWithGameState() (for AI)
  → Check if turn complete
  → If complete: checkAndProcessMatch()
  → Update UI
```

### AI Player Turn

```
useEffect detects AI turn
  → getAIMove(state, memory)
  → Get card positions to flip
  → getCardIdsFromPositions()
  → For each card:
      → flipCard(state, cardId)
      → Update state
      → Delay for UX
  → checkAndProcessMatch()
  → syncMemoryWithGameState()
  → Update UI
```

## Key Design Decisions

### 1. Monorepo with Turborepo

**Why?**

- Code sharing between packages
- Efficient builds with caching
- Consistent tooling across packages
- Prepared for mobile and CLI versions

**Trade-offs:**

- More complex setup
- Learning curve for contributors

### 2. Immutable Game State

**Why?**

- Predictable state transitions
- Easier debugging (can replay states)
- Enables undo/redo (future feature)
- Simplified serialization

**Trade-offs:**

- More memory usage
- More object creation

### 3. Perfect Memory AI

**Why?**

- Demonstrates AI capability
- Provides real challenge
- Simple to implement and test
- Can be extended with difficulty levels

**Trade-offs:**

- May be too difficult for beginners
- Could add configurable memory accuracy

### 4. Emoji Card Representation

**Why?**

- Simple, no assets needed
- Works everywhere (unicode)
- Easy to implement
- Good for prototyping

**Trade-offs:**

- Less polished than custom graphics
- Can add custom themes later

## Testing Strategy

### Unit Tests (Jest)

- **game-logic package**: 74 tests, 80%+ coverage
- Test all core functions
- Edge cases and error conditions
- AI logic validation

### Integration Tests

- Future: E2E tests with Playwright
- Test full game flows
- AI vs Human gameplay
- State persistence

## Performance Considerations

### Game Logic

- **Shuffling**: Fisher-Yates algorithm (O(n))
- **Match Finding**: Linear search through memory (O(n))
- **AI Move**: Constant time for known matches, random selection otherwise

### UI Performance

- **Turbopack**: Fast development server
- **React**: Efficient re-renders with proper state management
- **Tailwind**: JIT compilation for smaller CSS bundles

## Future Architecture Plans

### React Native Mobile App

```
packages/mobile/
├── App.tsx
├── screens/
│   └── GameScreen.tsx
└── components/
    └── Card.tsx
```

- Reuse @memory/game-logic
- React Native UI components
- Touch-optimized interactions

### CLI Version

```
packages/cli/
├── index.ts
├── game.ts
└── ml-export.ts
```

- Reuse @memory/game-logic
- Terminal UI with blessed/ink
- Game state export for ML training

### API Routes (Multiplayer)

```
packages/web/app/api/
├── game/
│   ├── create/route.ts
│   ├── join/route.ts
│   └── move/route.ts
└── websocket/route.ts
```

- WebSocket for real-time play
- State synchronization
- Player matchmaking

## Development Workflow

### Adding a New Feature

1. **Game Logic**: Add function to appropriate module
2. **Tests**: Write unit tests (maintain 80%+ coverage)
3. **UI**: Create/update React components
4. **Integration**: Connect UI to game logic
5. **Documentation**: Update API docs if needed

### Making Changes

1. Create feature branch
2. Make changes
3. Run tests: `pnpm test`
4. Run linter: `pnpm lint`
5. Format code: `pnpm format`
6. Build: `pnpm build`
7. Commit (pre-commit hooks run)
8. Push and create PR

## Security Considerations

- **No Sensitive Data**: Game state contains no personal info
- **Client-Side Only**: Currently no backend/database
- **Future**: When adding multiplayer:
  - Validate all moves server-side
  - Rate limiting
  - Input sanitization

## Accessibility

### Current

- Semantic HTML
- Keyboard navigation (via shadcn/ui)
- Color contrast (Tailwind defaults)

### Future Improvements

- Screen reader support
- ARIA labels
- Keyboard shortcuts
- Reduced motion support
- High contrast themes

## Deployment

### Web App

- **Platform**: Vercel (recommended)
- **Build Command**: `pnpm build`
- **Output Directory**: `packages/web/.next`
- **Environment Variables**: None required

### CI/CD (Planned)

- GitHub Actions workflow
- Run tests on PR
- Build on merge to main
- Auto-deploy to Vercel
- Coverage reports

## Monitoring & Analytics (Planned)

- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics
- **Performance**: Web Vitals
- **User Metrics**: Play statistics

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.
