# Hearts Game Implementation Plan

## Overview

Hearts is a trick-taking card game for 4 players where the goal is to avoid taking hearts (1 point each) and the Queen of Spades (13 points). Players can "shoot the moon" by taking all penalty cards to give everyone else 26 points instead.

**Current Status (Phase 2)**: Core game logic is fully implemented and tested. Basic UI exists at `/hearts` route but is read-only. Next step is to add interactivity and AI players.

## Why Hearts Tests Our Infrastructure

1. **Multi-phase gameplay** - Passing phase before trick-taking
2. **Trick-taking mechanics** - Following suit, determining trick winners
3. **Multi-player coordination** - 4 players taking turns
4. **Complex scoring** - Negative scoring with special rules
5. **Advanced hand display** - Need to show hands in a fanned layout

## Game Flow

### Phase 1: Dealing

- Shuffle and deal all 52 cards (13 cards per player)
- Determine pass direction for this round (left, right, across, none - rotates each hand)

### Phase 2: Passing

- Each player selects 3 cards to pass (unless it's a "no pass" round)
- Cards are passed simultaneously
- Players receive 3 cards from the corresponding player

### Phase 3: First Trick

- Player with 2♣ leads first trick
- Must play 2♣ on the first trick
- Cannot play hearts or Q♠ on first trick

### Phase 4: Playing Tricks

- Players must follow suit if possible
- If cannot follow suit, can play any card (except hearts on first trick, and Q♠ on first trick)
- Highest card of led suit wins the trick
- Winner leads next trick
- Hearts cannot be led until "hearts are broken" (someone has played a heart because they couldn't follow suit)

### Phase 5: Scoring

- Count points for each player (hearts = 1, Q♠ = 13)
- Check for "shooting the moon" (all 26 points)
  - If shot the moon: give 26 points to everyone else, shooter gets 0
  - Otherwise: normal scoring
- If anyone has 100+ points, game ends (lowest score wins)
- Otherwise, start new hand with rotated pass direction

## Architecture

### Package: @memory/hearts

#### Types (types.ts)

```typescript
export interface HeartsCard extends BaseCard {
  isSelected?: boolean; // For passing phase
}

export enum GamePhase {
  Dealing = 'dealing',
  Passing = 'passing',
  Playing = 'playing',
  HandComplete = 'hand_complete',
  GameOver = 'game_over',
}

export enum PassDirection {
  Left = 'left',
  Right = 'right',
  Across = 'across',
  None = 'none', // Every 4th hand
}

export interface Player {
  id: string;
  name: string;
  hand: HeartsCard[];
  tricksTaken: HeartsCard[][]; // Array of tricks won this hand
  score: number; // Total score across all hands
  handScore: number; // Score for current hand
}

export interface Trick {
  cards: Array<{ playerId: string; card: HeartsCard }>;
  leadingSuit: Suit | null;
  winnerId: string | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[]; // Always 4 players
  currentPlayerIndex: number;
  currentTrick: Trick;
  completedTricks: Trick[];
  passDirection: PassDirection;
  heartsBroken: boolean;
  firstTrick: boolean;
  handNumber: number;
}
```

#### Core Logic (game.ts)

- `createGame(playerNames: string[]): GameState` - Initialize game with 4 players
- `dealCards(state: GameState): GameState` - Deal 13 cards to each player
- `selectCardToPass(state: GameState, playerId: string, cardId: string): GameState`
- `confirmPass(state: GameState, playerId: string): boolean` - Check if player has selected 3 cards
- `executePass(state: GameState): GameState` - Pass cards when all players ready
- `playCard(state: GameState, playerId: string, cardId: string): GameState`
- `isValidPlay(state: GameState, playerId: string, card: HeartsCard): boolean`
- `completeTrick(state: GameState): GameState` - Determine winner, move to next trick

#### Trick Logic (trick.ts)

- `canFollowSuit(hand: HeartsCard[], suit: Suit): boolean`
- `determineTrickWinner(trick: Trick): string` - Returns playerId of winner
- `getValidPlays(state: GameState, playerId: string): HeartsCard[]`
- `canLeadHearts(state: GameState, hand: HeartsCard[]): boolean`

#### Scoring (scoring.ts)

- `calculateHandScore(tricksTaken: HeartsCard[][]): number`
- `checkShootMoon(players: Player[]): string | null` - Returns playerId if someone shot the moon
- `applyScores(state: GameState): GameState`
- `getPointValue(card: HeartsCard): number`

#### AI (ai.ts)

**Note**: See Phase 4 for detailed AI implementation plan with multiple strategies.

- `selectCardsToPass(hand: HeartsCard[], direction: PassDirection, strategy: AIStrategy): HeartsCard[]`
- `selectCardToPlay(state: GameState, playerId: string, strategy: AIStrategy): HeartsCard`
- Multiple strategies planned:
  - RandomAI (baseline)
  - BasicAI (defensive heuristics)
  - AggressiveAI (moon shooting)
  - DefensiveAI (risk minimization)
  - MLAI (machine learning)

### UI Components

#### HeartsContainer

- Manages overall game state
- Handles player actions (pass cards, play card)
- Manages AI player turns

#### HeartsBoard

- Shows all 4 players' positions (N, E, S, W style layout)
- Current trick in center
- Player's hand at bottom (fanned display)
- Other players show card backs/counts
- Score display
- Phase indicator

#### PassingPhase

- Shows player's hand
- Allows selecting 3 cards to pass
- Shows pass direction
- Confirm button

#### PlayingPhase

- Shows current trick
- Highlights whose turn it is
- Shows valid cards (slightly raised or highlighted)
- Shows trick winner animation

#### HandComponent (new in card-game-ui)

- Generic component for displaying a hand of cards
- Supports:
  - Fanned layout (arc of cards)
  - Linear layout (row of cards)
  - Selectable cards
  - Valid/invalid indicators
  - Face up/face down

#### ScoreBoard

- Shows current hand scores
- Shows total scores
- Highlights leader
- Shows "shot the moon" indicator

## Implementation Phases

### Phase 1: Core Game Logic ✓

- [x] Create @memory/hearts package structure
- [x] Implement types
- [x] Implement dealing and card passing logic
- [x] Implement trick-taking logic
- [x] Implement scoring logic
- [x] Write comprehensive tests (50+ tests)

### Phase 2: Basic UI (In Progress)

- [ ] Create HandComponent in card-game-ui (fanned card display)
- [x] Create HeartsContainer (basic version)
- [x] Create HeartsBoard with 4-player layout (read-only)
- [ ] Implement PassingPhase UI (interactive card selection)
- [ ] Implement PlayingPhase UI (interactive card playing)
- [x] Add to /hearts route
- [x] Add Hearts card to home page

**Current Status**: Route exists, shows game state, but lacks interactivity

### Phase 3: Game Flow Automation & Interactivity

- [ ] Add interactive card selection in PassingPhase
  - Click to select/deselect cards (3 card limit)
  - Visual indicators for selected cards
  - "Pass Cards" confirmation button
  - Integrate with `selectCardToPass()` and `executePass()`
- [ ] Add interactive card playing in PlayingPhase
  - Click to play cards from hand
  - Highlight valid plays using `getValidPlays()`
  - Disable invalid cards
  - Show current player's turn clearly
- [ ] Implement game flow orchestration
  - Auto-trigger AI moves after human plays
  - Auto-complete tricks when 4 cards played (call `completeTrick()`)
  - Add delays/animations between AI moves
  - Handle phase transitions automatically
  - Show trick winner before clearing to next trick
- [ ] Add animations
  - Card dealing animation
  - Card passing animation
  - Trick completion animation
  - Score updates
- [ ] **Claim the rest** feature
  - Analyze remaining cards to determine if player can lose any tricks
  - Show "Claim Rest" button when player cannot lose
  - Algorithm: Check if player has highest card in each remaining suit
  - Auto-play remaining tricks if claim is valid
  - Prevent claiming if any uncertainty exists

### Phase 4: AI Implementation

#### 4.1: Basic AI Strategies

- [ ] **RandomAI** (baseline)
  - Random valid card selection for passing
  - Random valid card play
- [ ] **BasicAI** (defensive heuristics)
  - Passing: High cards, high hearts, Queen of Spades
  - Playing: Avoid taking tricks with points, duck when possible
  - Lead low cards when safe
- [ ] **AggressiveAI** (moon shooting)
  - Evaluate moon shooting opportunity
  - Take calculated risks to capture all points
  - Switch to defensive if moon fails
- [ ] **DefensiveAI** (risk minimization)
  - Conservative passing (keep middle cards)
  - Always play safe cards
  - Track cards played to avoid surprises

#### 4.2: AI Infrastructure

- [ ] Create AI interface/strategy pattern
- [ ] Add configurable AI difficulty
- [ ] AI decision delay (realistic thinking time)
- [ ] AI decision explanation (debug mode)

### Phase 5: CLI Tools & Testing

- [ ] Create `@memory/hearts-cli` package
- [ ] **Play Modes**
  - Interactive: Human vs 3 AI players
  - Simulation: 4 AI players (watch or silent)
  - Batch: Run N games, collect statistics
- [ ] **Statistics Collection**
  - Win rates per AI strategy
  - Average scores
  - Moon shooting success rates
  - Card play patterns (suit led, tricks won, etc.)
  - Points taken per position
- [ ] **AI Comparison Tools**
  - Head-to-head strategy testing
  - Round-robin tournaments
  - Statistical significance testing
  - Strategy ranking leaderboard
- [ ] **Training Data Export**
  - JSON/CSV format for ML
  - Game state snapshots before each move
  - Move made + validation
  - Outcome tracking (trick result, hand result, game result)
  - Batch export for thousands of games

### Phase 6: Machine Learning AI

- [ ] **Data Collection**
  - Run 10,000+ games with BasicAI
  - Export training data
  - Label expert moves (from AggressiveAI + DefensiveAI)
- [ ] **Model Development**
  - Feature engineering (hand strength, position, cards played)
  - Model selection (neural network, decision tree, etc.)
  - Training pipeline
  - Validation against existing AI strategies
- [ ] **Integration**
  - Add `@memory/hearts-ml` package
  - Inference engine for move prediction
  - A/B testing vs rule-based AI
  - Continuous learning from games
- [ ] **Advanced Features**
  - Opponent modeling (learn other players' strategies)
  - Monte Carlo Tree Search (MCTS)
  - Reinforcement learning
  - Transfer learning from other card games

### Phase 7: Polish & Advanced Features

- [ ] Configurable game rules (variants)
- [ ] Undo last card (in single-player)
- [ ] Game history/replay viewer
- [ ] Sound effects
- [ ] Game variants (Spot Hearts, Omnibus Hearts, etc.)
- [ ] Card counting helper UI
- [ ] Voice announcements

## Testing Strategy

### Unit Tests

- Trick winner determination (all combinations)
- Valid play detection (following suit, hearts breaking, first trick rules)
- Passing logic (all directions)
- Scoring (normal, shoot the moon, edge cases)
- AI card selection

### Integration Tests

- Full hand playthrough
- Multi-hand game
- Shoot the moon scenario
- All pass directions

### UI Tests

- Card selection
- Pass confirmation
- Trick completion
- Score updates

## Technical Challenges

### 1. Trick-Taking State Management

Need to carefully manage:

- Current trick state
- Who's turn it is
- Valid plays based on game rules
- Trick completion and winner determination

**Solution**: Immutable state updates, clear phase transitions

### 2. Multi-Player Turn Management

With 3 AI players, need smooth turn progression:

- Wait for human input during their turn
- Auto-advance through AI turns with delays
- Allow user to see what AI played

**Solution**: useEffect hooks for AI turns with timeouts, clear turn indicators

### 3. Card Passing Synchronization

All players must pass simultaneously:

- Need to wait for all players to select cards
- Execute pass atomically
- Handle AI passing quickly

**Solution**: Separate "selecting" and "ready" states, execute pass when all ready

### 4. Complex Hand Layout

Traditional card games show fanned hands:

- Need CSS transforms for card positioning
- Smooth animations
- Responsive sizing

**Solution**: Create reusable HandComponent with configurable fan angle and radius

### 5. Shoot the Moon Detection

Need to detect and handle specially:

- Check after each hand
- Adjust all scores appropriately
- Show celebration/notification

**Solution**: Dedicated scoring function that checks before applying scores

## Data Structures

### Game State Size

- 4 players × 13 cards = 52 cards tracked
- Up to 13 tricks per hand
- Multiple hands per game

**Optimization**: Consider only storing card IDs, not full card objects, use lookup tables

### Performance Considerations

- Card animations (stagger for visual appeal)
- AI think time (add artificial delay)
- Trick winner calculation (optimize suit comparison)

## CLI Examples

Once Phase 5 is complete, here are example CLI commands:

```bash
# Interactive play against 3 AI
pnpm hearts play --ai basic,basic,basic

# Run simulation and watch
pnpm hearts simulate --games 1 --ai random,basic,aggressive,defensive --watch

# Run 1000 games silently and show stats
pnpm hearts simulate --games 1000 --ai random,basic,aggressive,defensive --stats

# Compare strategies over 100 games
pnpm hearts compare --strategies random,basic,aggressive --games 100

# Generate training data for ML
pnpm hearts train --games 10000 --output ./data/hearts-training.json --format json

# Tournament mode (round-robin)
pnpm hearts tournament --strategies random,basic,aggressive,defensive,ml --rounds 100

# Test a specific scenario
pnpm hearts test --scenario shoot-the-moon --games 100 --ai aggressive,defensive,defensive,defensive
```

## Future Enhancements

- [ ] Multiplayer (WebSocket/real-time)
- [ ] Tournament mode (UI)
- [ ] Card counting helper UI (show what's been played)
- [ ] Strategy marketplace (import/export AI strategies)
- [ ] Game replay with AI decision explanations
- [ ] Mobile app (React Native)
- [ ] Twitch integration (watch AI tournaments)
- [ ] Achievement system

## Training Data Format

For ML development (Phase 6), export format specification:

```typescript
interface TrainingExample {
  // Game context
  gameId: string;
  handNumber: number;
  trickNumber: number;

  // State snapshot
  phase: GamePhase;
  playerId: string;
  playerPosition: number; // 0-3
  hand: CardSnapshot[];
  currentTrick: TrickSnapshot;

  // Game knowledge
  cardsPlayed: CardSnapshot[];
  heartsBroken: boolean;
  scores: number[]; // All 4 players

  // Decision
  decision: {
    type: 'pass' | 'play';
    cardIds: string[]; // 3 cards for pass, 1 for play
  };

  // Outcome
  outcome: {
    trickWinner?: string;
    pointsTaken?: number;
    handScore: number;
    finalPosition: number; // 1-4 ranking
  };

  // Metadata
  aiStrategy: string;
  timestamp: string;
}
```

## Success Metrics

### Phase 1-2: Core & UI

- [x] All game rules correctly implemented
- [x] Test coverage > 80% for game logic
- [ ] UI is intuitive and responsive
- [ ] Game completes without bugs

### Phase 3: Interactivity

- [ ] Smooth game flow (no jarring transitions)
- [ ] Clear visual feedback on all actions
- [ ] Human can complete full game vs AI

### Phase 4: AI

- [ ] RandomAI plays valid moves 100% of time
- [ ] BasicAI wins >70% vs RandomAI
- [ ] AggressiveAI shoots moon >10% of games
- [ ] AI move calculation <100ms

### Phase 5: CLI

- [ ] Can simulate 1000 games in <5 minutes
- [ ] Statistics are accurate and comprehensive
- [ ] Training data export works for 10k+ games
- [ ] CLI is user-friendly

### Phase 6: ML

- [ ] MLAI wins >60% vs BasicAI
- [ ] MLAI inference <200ms per move
- [ ] Model size <50MB
- [ ] Can retrain model in <1 hour
