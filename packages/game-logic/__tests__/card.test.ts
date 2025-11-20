import {
  createCard,
  createCardId,
  getCardDisplay,
  getSuitEmoji,
  isMatch,
  shuffle,
  createDeck,
  ALL_RANKS,
  ALL_SUITS,
} from '../src/card';
import { Rank, Suit } from '../src/types';

describe('Card Module', () => {
  describe('createCardId', () => {
    it('should create unique card IDs', () => {
      const id1 = createCardId(Rank.Ace, Suit.Hearts, 0);
      const id2 = createCardId(Rank.Ace, Suit.Hearts, 1);
      const id3 = createCardId(Rank.King, Suit.Spades, 0);

      expect(id1).toBe('A-hearts-0');
      expect(id2).toBe('A-hearts-1');
      expect(id3).toBe('K-spades-0');
      expect(id1).not.toBe(id2);
    });
  });

  describe('createCard', () => {
    it('should create a card with default values', () => {
      const card = createCard(Rank.Ace, Suit.Hearts, 0);

      expect(card.rank).toBe(Rank.Ace);
      expect(card.suit).toBe(Suit.Hearts);
      expect(card.position).toBe(0);
      expect(card.hasBeenSeen).toBe(false);
      expect(card.isFaceUp).toBe(false);
      expect(card.claimedByPlayer).toBe(-1);
    });

    it('should create cards with different instance indices', () => {
      const card1 = createCard(Rank.Ace, Suit.Hearts, 0, 0);
      const card2 = createCard(Rank.Ace, Suit.Hearts, 1, 1);

      expect(card1.id).not.toBe(card2.id);
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
    it('should format card display correctly', () => {
      const card = createCard(Rank.Ace, Suit.Hearts, 0);
      expect(getCardDisplay(card)).toBe('A♥️');
    });

    it('should handle face cards', () => {
      const king = createCard(Rank.King, Suit.Spades, 0);
      expect(getCardDisplay(king)).toBe('K♠️');
    });
  });

  describe('isMatch', () => {
    it('should return false for less than 2 cards', () => {
      const card = createCard(Rank.Ace, Suit.Hearts, 0);
      expect(isMatch([card])).toBe(false);
      expect(isMatch([])).toBe(false);
    });

    it('should return true for matching ranks', () => {
      const cards = [createCard(Rank.Ace, Suit.Hearts, 0), createCard(Rank.Ace, Suit.Diamonds, 1)];
      expect(isMatch(cards)).toBe(true);
    });

    it('should return false for non-matching ranks', () => {
      const cards = [createCard(Rank.Ace, Suit.Hearts, 0), createCard(Rank.King, Suit.Diamonds, 1)];
      expect(isMatch(cards)).toBe(false);
    });

    it('should work with triplets', () => {
      const cards = [
        createCard(Rank.Queen, Suit.Hearts, 0),
        createCard(Rank.Queen, Suit.Diamonds, 1),
        createCard(Rank.Queen, Suit.Clubs, 2),
      ];
      expect(isMatch(cards)).toBe(true);
    });

    it('should work with quadruplets', () => {
      const cards = [
        createCard(Rank.Seven, Suit.Hearts, 0),
        createCard(Rank.Seven, Suit.Diamonds, 1),
        createCard(Rank.Seven, Suit.Clubs, 2),
        createCard(Rank.Seven, Suit.Spades, 3),
      ];
      expect(isMatch(cards)).toBe(true);
    });
  });

  describe('shuffle', () => {
    it('should return array with same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      expect(shuffled.length).toBe(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      shuffle(original);
      expect(original).toEqual(copy);
    });
  });

  describe('createDeck', () => {
    it('should create 26 cards for 13 ranks with pairs', () => {
      const deck = createDeck(13, 2);
      expect(deck.length).toBe(26);
    });

    it('should create 39 cards for 13 ranks with triplets', () => {
      const deck = createDeck(13, 3);
      expect(deck.length).toBe(39);
    });

    it('should create 52 cards for 13 ranks with quadruplets', () => {
      const deck = createDeck(13, 4);
      expect(deck.length).toBe(52);
    });

    it('should create 52 cards for 26 ranks with pairs', () => {
      const deck = createDeck(26, 2);
      expect(deck.length).toBe(52);
    });

    it('should create 78 cards for 26 ranks with triplets', () => {
      const deck = createDeck(26, 3);
      expect(deck.length).toBe(78);
    });

    it('should create 104 cards for 26 ranks with quadruplets', () => {
      const deck = createDeck(26, 4);
      expect(deck.length).toBe(104);
    });

    it('should create matching sets', () => {
      const deck = createDeck(13, 2);
      const rankCounts = new Map<Rank, number>();

      deck.forEach((card) => {
        rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
      });

      // Each rank should appear exactly twice
      rankCounts.forEach((count) => {
        expect(count).toBe(2);
      });
    });

    it('should assign sequential positions before shuffling', () => {
      const deck = createDeck(13, 2);
      const positions = deck.map((card) => card.position);
      const uniquePositions = new Set(positions);

      // All positions should be present (though shuffled)
      expect(uniquePositions.size).toBe(26);
      expect(Math.max(...positions)).toBe(25);
      expect(Math.min(...positions)).toBe(0);
    });

    it('should initialize cards with default state', () => {
      const deck = createDeck(13, 2);

      deck.forEach((card) => {
        expect(card.hasBeenSeen).toBe(false);
        expect(card.isFaceUp).toBe(false);
        expect(card.claimedByPlayer).toBe(-1);
      });
    });
  });
});
