# Setup Guide

This guide will help you set up the Memory game project for development.

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm**: >= 8.0.0
- **Git**: Latest version

### Install pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
# or
corepack enable
corepack prepare pnpm@latest --activate
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nickhart/memory.git
cd memory
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo.

### 3. Build Packages

Build the game-logic package (required for the web app):

```bash
pnpm --filter @memory/game-logic build
```

Or build all packages:

```bash
pnpm build
```

## Running the Project

### Development Mode

Start all packages in development mode:

```bash
pnpm dev
```

This will:

- Build the game-logic package in watch mode
- Start the Next.js dev server at http://localhost:3000

### Start Individual Packages

```bash
# Only the web app
pnpm --filter @memory/web dev

# Only the game-logic package (in watch mode)
pnpm --filter @memory/game-logic dev
```

## IDE Setup

### VSCode (Recommended)

1. Open the project in VSCode
2. Install recommended extensions when prompted
3. The workspace settings will automatically:
   - Format code on save with Prettier
   - Fix ESLint issues on save
   - Enable TypeScript validation

### Other IDEs

For other IDEs, ensure you have:

- TypeScript language support
- Prettier formatter
- ESLint integration

## Verifying the Setup

### 1. Run Tests

```bash
pnpm test
```

All tests should pass.

### 2. Build All Packages

```bash
pnpm build
```

Should complete without errors.

### 3. Check Code Quality

```bash
# Format check
pnpm format:check

# Lint check
pnpm lint
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process (use the PID from above)
kill -9 <PID>

# Or use a different port
pnpm --filter @memory/web dev -- -p 3001
```

### Module Not Found Errors

If you see module not found errors:

```bash
# Clean everything and reinstall
pnpm clean
pnpm install
pnpm build
```

### TypeScript Errors

Ensure you're using the workspace TypeScript version:

- In VSCode: Cmd+Shift+P → "TypeScript: Select TypeScript Version" → "Use Workspace Version"

### Git Hooks Not Working

If husky hooks aren't running:

```bash
pnpm prepare
```

## Next Steps

- Read the [Architecture documentation](./ARCHITECTURE.md)
- Check out the [Game Logic API](./GAME_LOGIC.md)
- See [Contributing Guide](../CONTRIBUTING.md) for development workflow

## Getting Help

- Open an issue on GitHub
- Check existing documentation
- Review the codebase and tests for examples
