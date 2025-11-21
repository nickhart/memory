import { Suit, Rank } from '@memory/card-game-core';
import { HeartsCard, Player, GameState, GamePhase, PassDirection } from '../src/types';
import { getPointValue, calculateHandScore, checkShootMoon, applyScores } from '../src/scoring';

describe('getPointValue', () => {
  it('should return 1 for all hearts', () => {
    const hearts: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true },
      { id: 'hA', rank: Rank.Ace, suit: Suit.Hearts, isFaceUp: true },
    ];

    hearts.forEach((card) => {
      expect(getPointValue(card)).toBe(1);
    });
  });

  it('should return 13 for Queen of Spades', () => {
    const queenOfSpades: HeartsCard = {
      id: 'sQ',
      rank: Rank.Queen,
      suit: Suit.Spades,
      isFaceUp: true,
    };

    expect(getPointValue(queenOfSpades)).toBe(13);
  });

  it('should return 0 for non-point cards', () => {
    const nonPoints: HeartsCard[] = [
      { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
      { id: 'dK', rank: Rank.King, suit: Suit.Diamonds, isFaceUp: true },
      { id: 'sA', rank: Rank.Ace, suit: Suit.Spades, isFaceUp: true },
      { id: 'sK', rank: Rank.King, suit: Suit.Spades, isFaceUp: true },
    ];

    nonPoints.forEach((card) => {
      expect(getPointValue(card)).toBe(0);
    });
  });
});

describe('calculateHandScore', () => {
  it('should return 0 for no tricks', () => {
    expect(calculateHandScore([])).toBe(0);
  });

  it('should calculate score for tricks with hearts', () => {
    const tricks: HeartsCard[][] = [
      [
        { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
        { id: 'h3', rank: Rank.Three, suit: Suit.Hearts, isFaceUp: true },
        { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
        { id: 'dK', rank: Rank.King, suit: Suit.Diamonds, isFaceUp: true },
      ],
    ];

    expect(calculateHandScore(tricks)).toBe(2); // 2 hearts
  });

  it('should calculate score with Queen of Spades', () => {
    const tricks: HeartsCard[][] = [
      [
        { id: 'sQ', rank: Rank.Queen, suit: Suit.Spades, isFaceUp: true },
        { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
        { id: 'dK', rank: Rank.King, suit: Suit.Diamonds, isFaceUp: true },
        { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      ],
    ];

    expect(calculateHandScore(tricks)).toBe(14); // 13 + 1
  });

  it('should calculate score for all 26 points', () => {
    const allHearts: HeartsCard[] = [
      Rank.Two,
      Rank.Three,
      Rank.Four,
      Rank.Five,
      Rank.Six,
      Rank.Seven,
      Rank.Eight,
      Rank.Nine,
      Rank.Ten,
      Rank.Jack,
      Rank.Queen,
      Rank.King,
      Rank.Ace,
    ].map((rank) => ({ id: `h${rank}`, rank, suit: Suit.Hearts, isFaceUp: true }));

    const queenOfSpades: HeartsCard = {
      id: 'sQ',
      rank: Rank.Queen,
      suit: Suit.Spades,
      isFaceUp: true,
    };

    const tricks = [[...allHearts, queenOfSpades]];

    expect(calculateHandScore(tricks)).toBe(26); // 13 hearts + 13 queen
  });
});

describe('checkShootMoon', () => {
  const createPlayer = (id: string, tricks: HeartsCard[][]): Player => ({
    id,
    name: `Player ${id}`,
    hand: [],
    tricksTaken: tricks,
    score: 0,
    handScore: 0,
    selectedCards: [],
    isReady: false,
  });

  it('should return null when no one shot the moon', () => {
    const players: Player[] = [
      createPlayer('p1', []),
      createPlayer('p2', []),
      createPlayer('p3', []),
      createPlayer('p4', []),
    ];

    expect(checkShootMoon(players)).toBeNull();
  });

  it('should detect when a player shot the moon', () => {
    const allHearts: HeartsCard[] = [
      Rank.Two,
      Rank.Three,
      Rank.Four,
      Rank.Five,
      Rank.Six,
      Rank.Seven,
      Rank.Eight,
      Rank.Nine,
      Rank.Ten,
      Rank.Jack,
      Rank.Queen,
      Rank.King,
      Rank.Ace,
    ].map((rank) => ({ id: `h${rank}`, rank, suit: Suit.Hearts, isFaceUp: true }));

    const queenOfSpades: HeartsCard = {
      id: 'sQ',
      rank: Rank.Queen,
      suit: Suit.Spades,
      isFaceUp: true,
    };

    const players: Player[] = [
      createPlayer('p1', [[...allHearts, queenOfSpades]]),
      createPlayer('p2', []),
      createPlayer('p3', []),
      createPlayer('p4', []),
    ];

    expect(checkShootMoon(players)).toBe('p1');
  });

  it('should not detect shoot the moon with only 25 points', () => {
    const someHearts: HeartsCard[] = [
      Rank.Two,
      Rank.Three,
      Rank.Four,
      Rank.Five,
      Rank.Six,
      Rank.Seven,
      Rank.Eight,
      Rank.Nine,
      Rank.Ten,
      Rank.Jack,
      Rank.Queen,
      Rank.King,
    ].map((rank) => ({ id: `h${rank}`, rank, suit: Suit.Hearts, isFaceUp: true }));

    const queenOfSpades: HeartsCard = {
      id: 'sQ',
      rank: Rank.Queen,
      suit: Suit.Spades,
      isFaceUp: true,
    };

    const players: Player[] = [
      createPlayer('p1', [[...someHearts, queenOfSpades]]),
      createPlayer('p2', []),
      createPlayer('p3', []),
      createPlayer('p4', []),
    ];

    expect(checkShootMoon(players)).toBeNull();
  });
});

describe('applyScores', () => {
  const createMockState = (players: Player[]): GameState => ({
    phase: GamePhase.Playing,
    players,
    currentPlayerIndex: 0,
    currentTrick: { cards: [], leadingSuit: null, winnerId: null },
    completedTricks: [],
    passDirection: PassDirection.Left,
    heartsBroken: false,
    firstTrick: true,
    handNumber: 0,
    deck: [],
  });

  const createPlayer = (id: string, score: number, tricks: HeartsCard[][]): Player => ({
    id,
    name: `Player ${id}`,
    hand: [],
    tricksTaken: tricks,
    score,
    handScore: 0,
    selectedCards: [],
    isReady: false,
  });

  it('should apply normal scores when no one shot the moon', () => {
    const twoHearts: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'h3', rank: Rank.Three, suit: Suit.Hearts, isFaceUp: true },
    ];

    const threeHearts: HeartsCard[] = [
      { id: 'h4', rank: Rank.Four, suit: Suit.Hearts, isFaceUp: true },
      { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true },
      { id: 'h6', rank: Rank.Six, suit: Suit.Hearts, isFaceUp: true },
    ];

    const players: Player[] = [
      createPlayer('p1', 10, [twoHearts]),
      createPlayer('p2', 15, [threeHearts]),
      createPlayer('p3', 5, []),
      createPlayer('p4', 8, []),
    ];

    const state = createMockState(players);
    const result = applyScores(state);

    expect(result.players[0].score).toBe(12); // 10 + 2
    expect(result.players[1].score).toBe(18); // 15 + 3
    expect(result.players[2].score).toBe(5); // 5 + 0
    expect(result.players[3].score).toBe(8); // 8 + 0
    expect(result.phase).toBe(GamePhase.HandComplete);
  });

  it('should apply shoot the moon correctly', () => {
    const allHearts: HeartsCard[] = [
      Rank.Two,
      Rank.Three,
      Rank.Four,
      Rank.Five,
      Rank.Six,
      Rank.Seven,
      Rank.Eight,
      Rank.Nine,
      Rank.Ten,
      Rank.Jack,
      Rank.Queen,
      Rank.King,
      Rank.Ace,
    ].map((rank) => ({ id: `h${rank}`, rank, suit: Suit.Hearts, isFaceUp: true }));

    const queenOfSpades: HeartsCard = {
      id: 'sQ',
      rank: Rank.Queen,
      suit: Suit.Spades,
      isFaceUp: true,
    };

    const players: Player[] = [
      createPlayer('p1', 10, [[...allHearts, queenOfSpades]]),
      createPlayer('p2', 15, []),
      createPlayer('p3', 5, []),
      createPlayer('p4', 8, []),
    ];

    const state = createMockState(players);
    const result = applyScores(state);

    expect(result.players[0].score).toBe(10); // No change (shot the moon)
    expect(result.players[0].handScore).toBe(0);
    expect(result.players[1].score).toBe(41); // 15 + 26
    expect(result.players[1].handScore).toBe(26);
    expect(result.players[2].score).toBe(31); // 5 + 26
    expect(result.players[2].handScore).toBe(26);
    expect(result.players[3].score).toBe(34); // 8 + 26
    expect(result.players[3].handScore).toBe(26);
    expect(result.phase).toBe(GamePhase.HandComplete);
  });

  it('should end game when someone reaches 100 points', () => {
    const someHearts: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'h3', rank: Rank.Three, suit: Suit.Hearts, isFaceUp: true },
    ];

    const players: Player[] = [
      createPlayer('p1', 98, [someHearts]),
      createPlayer('p2', 50, []),
      createPlayer('p3', 60, []),
      createPlayer('p4', 70, []),
    ];

    const state = createMockState(players);
    const result = applyScores(state);

    expect(result.players[0].score).toBe(100); // 98 + 2
    expect(result.phase).toBe(GamePhase.GameOver);
  });

  it('should continue game when no one reaches 100 points', () => {
    const someHearts: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
    ];

    const players: Player[] = [
      createPlayer('p1', 50, [someHearts]),
      createPlayer('p2', 40, []),
      createPlayer('p3', 30, []),
      createPlayer('p4', 20, []),
    ];

    const state = createMockState(players);
    const result = applyScores(state);

    expect(result.players[0].score).toBe(51); // 50 + 1
    expect(result.phase).toBe(GamePhase.HandComplete);
  });
});
