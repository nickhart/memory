import { Suit, Rank } from '@memory/card-game-core';
import { HeartsCard, GameState, GamePhase, PassDirection, Trick } from '../src/types';
import {
  canFollowSuit,
  canLeadHearts,
  getValidPlays,
  isValidPlay,
  determineTrickWinner,
  trickContainsHearts,
  trickContainsPoints,
} from '../src/trick';

describe('canFollowSuit', () => {
  it('should return true if hand contains suit', () => {
    const hand: HeartsCard[] = [
      { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
      { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true },
      { id: 'dK', rank: Rank.King, suit: Suit.Diamonds, isFaceUp: true },
    ];

    expect(canFollowSuit(hand, Suit.Clubs)).toBe(true);
    expect(canFollowSuit(hand, Suit.Hearts)).toBe(true);
    expect(canFollowSuit(hand, Suit.Diamonds)).toBe(true);
  });

  it('should return false if hand does not contain suit', () => {
    const hand: HeartsCard[] = [
      { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
      { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true },
    ];

    expect(canFollowSuit(hand, Suit.Spades)).toBe(false);
    expect(canFollowSuit(hand, Suit.Diamonds)).toBe(false);
  });

  it('should handle empty hand', () => {
    expect(canFollowSuit([], Suit.Hearts)).toBe(false);
  });
});

describe('canLeadHearts', () => {
  const createMockState = (heartsBroken: boolean, hand: HeartsCard[]): GameState => ({
    phase: GamePhase.Playing,
    players: [
      {
        id: 'p1',
        name: 'Player 1',
        hand,
        tricksTaken: [],
        score: 0,
        handScore: 0,
        selectedCards: [],
        isReady: false,
      },
    ],
    currentPlayerIndex: 0,
    currentTrick: { cards: [], leadingSuit: null, winnerId: null },
    completedTricks: [],
    passDirection: PassDirection.Left,
    heartsBroken,
    firstTrick: false,
    handNumber: 0,
    deck: [],
  });

  it('should allow leading hearts if hearts are broken', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true },
    ];

    const state = createMockState(true, hand);
    expect(canLeadHearts(state, hand)).toBe(true);
  });

  it('should not allow leading hearts if not broken and have other cards', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true },
    ];

    const state = createMockState(false, hand);
    expect(canLeadHearts(state, hand)).toBe(false);
  });

  it('should allow leading hearts if only have hearts', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true },
      { id: 'hK', rank: Rank.King, suit: Suit.Hearts, isFaceUp: true },
    ];

    const state = createMockState(false, hand);
    expect(canLeadHearts(state, hand)).toBe(true);
  });
});

describe('getValidPlays', () => {
  const createMockState = (
    currentTrick: Trick,
    firstTrick: boolean,
    heartsBroken: boolean,
    hand: HeartsCard[]
  ): GameState => ({
    phase: GamePhase.Playing,
    players: [
      {
        id: 'p1',
        name: 'Player 1',
        hand,
        tricksTaken: [],
        score: 0,
        handScore: 0,
        selectedCards: [],
        isReady: false,
      },
    ],
    currentPlayerIndex: 0,
    currentTrick,
    completedTricks: [],
    passDirection: PassDirection.Left,
    heartsBroken,
    firstTrick,
    handNumber: 0,
    deck: [],
  });

  it('should require 2 of clubs on first trick lead', () => {
    const hand: HeartsCard[] = [
      { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
      { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true },
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
    ];

    const state = createMockState(
      { cards: [], leadingSuit: null, winnerId: null },
      true,
      false,
      hand
    );
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(1);
    expect(validPlays[0].rank).toBe(Rank.Two);
    expect(validPlays[0].suit).toBe(Suit.Clubs);
  });

  it('should not allow leading hearts when not broken', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true },
      { id: 'd7', rank: Rank.Seven, suit: Suit.Diamonds, isFaceUp: true },
    ];

    const state = createMockState(
      { cards: [], leadingSuit: null, winnerId: null },
      false,
      false,
      hand
    );
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(2);
    expect(validPlays.every((c) => c.suit !== Suit.Hearts)).toBe(true);
  });

  it('should allow leading hearts when broken', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true },
    ];

    const state = createMockState(
      { cards: [], leadingSuit: null, winnerId: null },
      false,
      true,
      hand
    );
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(2);
  });

  it('should require following suit when possible', () => {
    const hand: HeartsCard[] = [
      { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
      { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true },
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'd7', rank: Rank.Seven, suit: Suit.Diamonds, isFaceUp: true },
    ];

    const currentTrick: Trick = {
      cards: [
        {
          playerId: 'p2',
          card: { id: 'c10', rank: Rank.Ten, suit: Suit.Clubs, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    const state = createMockState(currentTrick, false, false, hand);
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(2);
    expect(validPlays.every((c) => c.suit === Suit.Clubs)).toBe(true);
  });

  it('should allow any card when cannot follow suit (except on first trick)', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'd7', rank: Rank.Seven, suit: Suit.Diamonds, isFaceUp: true },
    ];

    const currentTrick: Trick = {
      cards: [
        {
          playerId: 'p2',
          card: { id: 'c10', rank: Rank.Ten, suit: Suit.Clubs, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    const state = createMockState(currentTrick, false, false, hand);
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(2);
  });

  it('should not allow hearts or Queen of Spades on first trick when breaking suit', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'sQ', rank: Rank.Queen, suit: Suit.Spades, isFaceUp: true },
      { id: 'd7', rank: Rank.Seven, suit: Suit.Diamonds, isFaceUp: true },
    ];

    const currentTrick: Trick = {
      cards: [
        {
          playerId: 'p2',
          card: { id: 'c10', rank: Rank.Ten, suit: Suit.Clubs, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    const state = createMockState(currentTrick, true, false, hand);
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(1);
    expect(validPlays[0].suit).toBe(Suit.Diamonds);
  });

  it('should allow hearts or Queen of Spades on first trick if only option', () => {
    const hand: HeartsCard[] = [
      { id: 'h2', rank: Rank.Two, suit: Suit.Hearts, isFaceUp: true },
      { id: 'sQ', rank: Rank.Queen, suit: Suit.Spades, isFaceUp: true },
    ];

    const currentTrick: Trick = {
      cards: [
        {
          playerId: 'p2',
          card: { id: 'c10', rank: Rank.Ten, suit: Suit.Clubs, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    const state = createMockState(currentTrick, true, false, hand);
    const validPlays = getValidPlays(state, 'p1');

    expect(validPlays).toHaveLength(2);
  });
});

describe('determineTrickWinner', () => {
  it('should return null for empty trick', () => {
    const trick: Trick = {
      cards: [],
      leadingSuit: null,
      winnerId: null,
    };

    expect(determineTrickWinner(trick)).toBeNull();
  });

  it('should determine winner based on highest card of leading suit', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        {
          playerId: 'p2',
          card: { id: 'c10', rank: Rank.Ten, suit: Suit.Clubs, isFaceUp: true },
        },
        { playerId: 'p3', card: { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true } },
        { playerId: 'p4', card: { id: 'cA', rank: Rank.Ace, suit: Suit.Clubs, isFaceUp: true } },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(determineTrickWinner(trick)).toBe('p4');
  });

  it('should ignore cards not of leading suit', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        {
          playerId: 'p2',
          card: { id: 'hA', rank: Rank.Ace, suit: Suit.Hearts, isFaceUp: true },
        },
        { playerId: 'p3', card: { id: 'c5', rank: Rank.Five, suit: Suit.Clubs, isFaceUp: true } },
        { playerId: 'p4', card: { id: 'sA', rank: Rank.Ace, suit: Suit.Spades, isFaceUp: true } },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(determineTrickWinner(trick)).toBe('p3');
  });

  it('should handle ace as highest card', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'hK', rank: Rank.King, suit: Suit.Hearts, isFaceUp: true } },
        { playerId: 'p2', card: { id: 'hA', rank: Rank.Ace, suit: Suit.Hearts, isFaceUp: true } },
        {
          playerId: 'p3',
          card: { id: 'hQ', rank: Rank.Queen, suit: Suit.Hearts, isFaceUp: true },
        },
        { playerId: 'p4', card: { id: 'hJ', rank: Rank.Jack, suit: Suit.Hearts, isFaceUp: true } },
      ],
      leadingSuit: Suit.Hearts,
      winnerId: null,
    };

    expect(determineTrickWinner(trick)).toBe('p2');
  });

  it('should handle two as lowest card', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'd2', rank: Rank.Two, suit: Suit.Diamonds, isFaceUp: true } },
        {
          playerId: 'p2',
          card: { id: 'd3', rank: Rank.Three, suit: Suit.Diamonds, isFaceUp: true },
        },
        {
          playerId: 'p3',
          card: { id: 'd4', rank: Rank.Four, suit: Suit.Diamonds, isFaceUp: true },
        },
        {
          playerId: 'p4',
          card: { id: 'd5', rank: Rank.Five, suit: Suit.Diamonds, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Diamonds,
      winnerId: null,
    };

    expect(determineTrickWinner(trick)).toBe('p4');
  });
});

describe('trickContainsHearts', () => {
  it('should return true if trick contains hearts', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        { playerId: 'p2', card: { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true } },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(trickContainsHearts(trick)).toBe(true);
  });

  it('should return false if trick has no hearts', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        {
          playerId: 'p2',
          card: { id: 'd5', rank: Rank.Five, suit: Suit.Diamonds, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(trickContainsHearts(trick)).toBe(false);
  });
});

describe('trickContainsPoints', () => {
  it('should return true if trick contains hearts', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        { playerId: 'p2', card: { id: 'h5', rank: Rank.Five, suit: Suit.Hearts, isFaceUp: true } },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(trickContainsPoints(trick)).toBe(true);
  });

  it('should return true if trick contains Queen of Spades', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        {
          playerId: 'p2',
          card: { id: 'sQ', rank: Rank.Queen, suit: Suit.Spades, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(trickContainsPoints(trick)).toBe(true);
  });

  it('should return false if trick has no points', () => {
    const trick: Trick = {
      cards: [
        { playerId: 'p1', card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true } },
        {
          playerId: 'p2',
          card: { id: 'd5', rank: Rank.Five, suit: Suit.Diamonds, isFaceUp: true },
        },
        { playerId: 'p3', card: { id: 'sK', rank: Rank.King, suit: Suit.Spades, isFaceUp: true } },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    expect(trickContainsPoints(trick)).toBe(false);
  });
});
