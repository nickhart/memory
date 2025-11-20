# Memory Card Game

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A modern, open-source Memory card game with configurable difficulty, AI opponents, and multiplayer support.

[Demo](#) • [Documentation](./docs) • [Contributing](CONTRIBUTING.md)

</div>

## ✨ Features

- 🎮 **Flexible Game Modes**: Play with pairs, triplets, or quadruplets
- 🤖 **AI Opponents**: Challenge AI players with perfect memory
- 👥 **Multiplayer**: 2-4 players (human or AI)
- ⚙️ **Configurable Difficulty**: Choose from 13 or 26 unique cards
- 📊 **Statistics Tracking**: Track moves, time, and scores
- 🎨 **Modern UI**: Built with Next.js, React, and Tailwind CSS
- 📦 **Monorepo Architecture**: Modular design for web, mobile, and CLI
- ✅ **Fully Tested**: Comprehensive unit tests with Jest
- 🔧 **Type-Safe**: Built with TypeScript in strict mode

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/nickhart/memory.git
cd memory

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The game will be available at [http://localhost:3000](http://localhost:3000)

## 📦 Monorepo Structure

```
memory/
├── packages/
│   ├── game-logic/       # Core game engine (platform-agnostic)
│   ├── web/              # Next.js web application
│   ├── mobile/           # React Native app (coming soon)
│   └── cli/              # CLI version (coming soon)
├── docs/                 # Documentation
└── .vscode/              # VSCode settings and extensions
```

## 🎯 Game Rules

Memory is a card matching game where players take turns flipping cards to find matching sets:

1. **Setup**: Choose your game configuration (match size, difficulty, players)
2. **Gameplay**: On your turn, flip cards to find matching ranks
3. **Matching**: If all flipped cards match, claim them and go again
4. **Winning**: The player with the most matches when all cards are claimed wins

### Configuration Options

- **Match Size**: Pairs (2), Triplets (3), or Quadruplets (4)
- **Difficulty**: Standard (13 ranks) or Hard (26 ranks)
- **Players**: 2-4 players (human or AI)

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev           # Start all packages in development mode
pnpm dev --filter @memory/web    # Start only the web app

# Building
pnpm build         # Build all packages
pnpm build --filter @memory/game-logic  # Build specific package

# Testing
pnpm test          # Run all tests
pnpm test --filter @memory/game-logic   # Run specific package tests

# Code Quality
pnpm lint          # Lint all packages
pnpm format        # Format code with Prettier
pnpm format:check  # Check formatting

# Cleanup
pnpm clean         # Remove all build artifacts and node_modules
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter @memory/game-logic test:watch

# Run tests with coverage
pnpm --filter @memory/game-logic test:coverage
```

## 🏗️ Architecture

### Game Logic Package

The `@memory/game-logic` package contains the core game engine:

- **Card Management**: Card creation, shuffling, and deck generation
- **Game State**: Immutable state management with full serialization
- **Move Validation**: Turn-based gameplay with match validation
- **AI Logic**: Perfect memory AI with strategic card selection
- **Statistics**: Move tracking, timing, and scoring

### Web Application

The `@memory/web` package is a Next.js application featuring:

- **App Router**: Modern Next.js 16 app directory structure
- **shadcn/ui**: Beautiful, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety throughout
- **Responsive Design**: Mobile-first, works on all devices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Format code: `pnpm format`
6. Commit changes: `git commit -m "Add my feature"`
7. Push to branch: `git push origin feature/my-feature`
8. Open a Pull Request

### Code Quality

This project uses:

- **Prettier** for code formatting
- **ESLint** for linting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks
- **Jest** for testing

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md)
- [Game Logic API](./docs/GAME_LOGIC.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing](./CONTRIBUTING.md)

## 🗺️ Roadmap

- [ ] React Native mobile app
- [ ] CLI version for ML training data generation
- [ ] Network multiplayer with API routes
- [ ] Leaderboards and statistics
- [ ] Custom card themes
- [ ] Sound effects and animations
- [ ] Accessibility improvements
- [ ] CI/CD pipeline

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Monorepo powered by [Turborepo](https://turbo.build/)
- Package management by [pnpm](https://pnpm.io/)

---

<div align="center">

Made with ❤️ by the Memory team

[⭐ Star us on GitHub](https://github.com/nickhart/memory)

</div>
