# Hearts Game Implementation Plan

## Overview

Hearts is a trick-taking card game for 4 players where the goal is to avoid taking hearts (1 point each) and the Queen of Spades (13 points). Players can "shoot the moon" by taking all penalty cards to give everyone else 26 points instead.

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

- `selectCardsToPass(hand: HeartsCard[], direction: PassDirection): HeartsCard[]`
- `selectCardToPlay(state: GameState, playerId: string): HeartsCard`
- Strategy considerations:
  - Avoid taking hearts/Q♠
  - Try to void a suit for future flexibility
  - Lead low cards when possible
  - Track which cards have been played

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

### Phase 2: Basic UI

- [ ] Create HandComponent in card-game-ui (fanned card display)
- [ ] Create HeartsContainer
- [ ] Create HeartsBoard with 4-player layout
- [ ] Implement PassingPhase UI
- [ ] Implement PlayingPhase UI
- [ ] Add to /hearts route

### Phase 3: AI & Polish

- [ ] Implement AI card selection (passing)
- [ ] Implement AI card play (trick-taking)
- [ ] Add animations (card passing, trick taking)
- [ ] Add sound effects (optional)
- [ ] Add game history/replay

### Phase 4: Advanced Features

- [ ] Configurable AI difficulty
- [ ] Statistics tracking
- [ ] Moon shooting detection and highlight
- [ ] Undo last card (in single-player)
- [ ] Game variants (Spot Hearts, etc.)

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

## Future Enhancements

- [ ] Multiplayer (WebSocket)
- [ ] Tournament mode
- [ ] Card counting helper (show what's been played)
- [ ] Advanced statistics
- [ ] Different AI personalities
- [ ] Voice announcements

## Success Metrics

- [ ] All game rules correctly implemented
- [ ] AI plays reasonably (doesn't make obvious mistakes)
- [ ] Game completes without bugs
- [ ] UI is intuitive and responsive
- [ ] Test coverage > 80%
- [ ] Performance: <100ms for AI moves
