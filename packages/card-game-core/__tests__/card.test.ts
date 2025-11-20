import {
  Rank,
  Suit,
  ALL_RANKS,
  ALL_SUITS,
  createCardId,
  getSuitEmoji,
  getCardDisplay,
  shuffle,
  createStandardDeck,
} from '../src';

describe('Card Constants', () => {
  it('should have 13 ranks', () => {
    expect(ALL_RANKS).toHaveLength(13);
    expect(ALL_RANKS).toContain(Rank.Ace);
    expect(ALL_RANKS).toContain(Rank.King);
  });

  it('should have 4 suits', () => {
    expect(ALL_SUITS).toHaveLength(4);
    expect(ALL_SUITS).toContain(Suit.Hearts);
    expect(ALL_SUITS).toContain(Suit.Diamonds);
    expect(ALL_SUITS).toContain(Suit.Clubs);
    expect(ALL_SUITS).toContain(Suit.Spades);
  });
});

describe('createCardId', () => {
  it('should create unique card ID with instance index', () => {
    expect(createCardId(Rank.Ace, Suit.Hearts, 0)).toBe('A-hearts-0');
    expect(createCardId(Rank.King, Suit.Spades, 1)).toBe('K-spades-1');
  });

  it('should default instance index to 0', () => {
    expect(createCardId(Rank.Queen, Suit.Diamonds)).toBe('Q-diamonds-0');
  });
});

describe('getSuitEmoji', () => {
  it('should return correct emoji for each suit', () => {
    expect(getSuitEmoji(Suit.Hearts)).toBe('♥️');
    expect(getSuitEmoji(Suit.Diamonds)).toBe('♦️');
    expect(getSuitEmoji(Suit.Clubs)).toBe('♣️');
    expect(getSuitEmoji(Suit.Spades)).toBe('♠️');
  });
});

describe('getCardDisplay', () => {
  it('should format card display with rank and suit emoji', () => {
    expect(getCardDisplay({ rank: Rank.Ace, suit: Suit.Hearts })).toBe('A♥️');
    expect(getCardDisplay({ rank: Rank.King, suit: Suit.Spades })).toBe('K♠️');
    expect(getCardDisplay({ rank: Rank.Ten, suit: Suit.Diamonds })).toBe('10♦️');
  });
});

describe('shuffle', () => {
  it('should return array with same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled).toHaveLength(original.length);
  });

  it('should contain all original elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should not mutate original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it('should shuffle (probabilistic test)', () => {
    const original = Array.from({ length: 20 }, (_, i) => i);
    const shuffled = shuffle(original);
    // It's highly unlikely that shuffle returns the same order
    expect(shuffled).not.toEqual(original);
  });

  it('should handle empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('should handle single element array', () => {
    expect(shuffle([1])).toEqual([1]);
  });
});

describe('createStandardDeck', () => {
  it('should create 52 cards', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(52);
  });

  it('should have one card for each rank-suit combination', () => {
    const deck = createStandardDeck();
    const expectedCombinations = ALL_RANKS.length * ALL_SUITS.length;
    expect(deck).toHaveLength(expectedCombinations);
  });

  it('should have all unique IDs', () => {
    const deck = createStandardDeck();
    const ids = deck.map((card) => card.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(52);
  });

  it('should have cards with all ranks', () => {
    const deck = createStandardDeck();
    const ranks = deck.map((card) => card.rank);
    ALL_RANKS.forEach((rank) => {
      expect(ranks.filter((r) => r === rank)).toHaveLength(4); // 4 suits
    });
  });

  it('should have cards with all suits', () => {
    const deck = createStandardDeck();
    const suits = deck.map((card) => card.suit);
    ALL_SUITS.forEach((suit) => {
      expect(suits.filter((s) => s === suit)).toHaveLength(13); // 13 ranks
    });
  });

  it('should have cards with rank and suit properties', () => {
    const deck = createStandardDeck();
    deck.forEach((card) => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('rank');
      expect(card).toHaveProperty('suit');
      expect(ALL_RANKS).toContain(card.rank);
      expect(ALL_SUITS).toContain(card.suit);
    });
  });
});
