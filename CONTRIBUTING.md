# Contributing to Memory

Thank you for your interest in contributing to Memory! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/memory.git
cd memory
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/nickhart/memory.git
```

4. Install dependencies:

```bash
pnpm install
```

### VSCode Setup (Recommended)

This project includes VSCode settings and recommended extensions. When you open the project in VSCode, you'll be prompted to install recommended extensions:

- Prettier
- ESLint
- Tailwind CSS IntelliSense
- Jest Runner
- TypeScript

## Development Workflow

### Creating a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/my-feature
# or
git checkout -b fix/my-bugfix
```

### Making Changes

1. Make your changes in the appropriate package
2. Write or update tests as needed
3. Run tests locally: `pnpm test`
4. Check formatting: `pnpm format:check`
5. Run linter: `pnpm lint`

### Running the Project

```bash
# Start development server
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Run specific package
pnpm --filter @memory/game-logic test
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types for function parameters and return values
- Avoid `any` types
- Use meaningful variable and function names
- Document complex logic with comments

### Code Style

This project uses Prettier and ESLint to enforce code style:

- **Prettier**: Auto-formats code on save (if using VSCode settings)
- **ESLint**: Catches common errors and enforces best practices
- **Husky**: Runs pre-commit hooks to ensure code quality

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check

# Lint all packages
pnpm lint
```

### File Structure

```
packages/
├── game-logic/
│   ├── src/
│   │   ├── types.ts           # Type definitions
│   │   ├── card.ts            # Card utilities
│   │   ├── game.ts            # Game logic
│   │   ├── ai.ts              # AI logic
│   │   └── index.ts           # Public API
│   └── __tests__/             # Test files
└── web/
    ├── app/                   # Next.js app directory
    ├── components/            # React components
    └── lib/                   # Utilities
```

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage (target: 80%+)
- Use descriptive test names
- Follow the AAA pattern: Arrange, Act, Assert

```typescript
describe('Feature', () => {
  it('should do something specific', () => {
    // Arrange
    const input = createTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedOutput);
  });
});
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

### Coverage Requirements

- **Minimum coverage**: 80% for all metrics (lines, functions, branches, statements)
- New features should maintain or improve coverage
- Tests should be meaningful, not just for coverage

## Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(game-logic): add support for triplet matches
fix(web): correct card flip animation timing
docs(readme): update installation instructions
test(ai): add tests for memory synchronization
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass: `pnpm test`
2. ✅ Code is formatted: `pnpm format`
3. ✅ No linting errors: `pnpm lint`
4. ✅ Build succeeds: `pnpm build`
5. ✅ Documentation is updated (if needed)

### Submitting a PR

1. Push your branch to your fork
2. Open a PR against `main` branch
3. Fill out the PR template completely
4. Link any related issues
5. Request review from maintainers

### PR Title Format

```
type(scope): Brief description
```

Example: `feat(web): Add game statistics dashboard`

### PR Description

Include:

- **What**: What changes does this PR make?
- **Why**: Why are these changes needed?
- **How**: How were the changes implemented?
- **Testing**: How were the changes tested?
- **Screenshots**: (if UI changes)

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged
- Your contribution will be acknowledged in release notes

## Questions or Problems?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Reach out to maintainers for guidance

Thank you for contributing to Memory! 🎉
