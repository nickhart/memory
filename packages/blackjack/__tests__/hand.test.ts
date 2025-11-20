import { Rank, Suit } from '@memory/card-game-core';
import { BlackjackCard } from '../src/types';
import { getCardValue, evaluateHand, createEmptyHand, addCardToHand } from '../src/hand';

describe('getCardValue', () => {
  it('should return 11 for Ace', () => {
    const card: BlackjackCard = {
      id: 'A-hearts-0',
      rank: Rank.Ace,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };
    expect(getCardValue(card)).toBe(11);
  });

  it('should return 10 for face cards', () => {
    const king: BlackjackCard = {
      id: 'K-hearts-0',
      rank: Rank.King,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };
    const queen: BlackjackCard = {
      id: 'Q-hearts-0',
      rank: Rank.Queen,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };
    const jack: BlackjackCard = {
      id: 'J-hearts-0',
      rank: Rank.Jack,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };

    expect(getCardValue(king)).toBe(10);
    expect(getCardValue(queen)).toBe(10);
    expect(getCardValue(jack)).toBe(10);
  });

  it('should return pip value for number cards', () => {
    const five: BlackjackCard = {
      id: '5-hearts-0',
      rank: Rank.Five,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };
    expect(getCardValue(five)).toBe(5);
  });
});

describe('evaluateHand', () => {
  it('should evaluate simple hand correctly', () => {
    const cards: BlackjackCard[] = [
      {
        id: '5-hearts-0',
        rank: Rank.Five,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: '7-hearts-0',
        rank: Rank.Seven,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(12);
    expect(hand.isSoft).toBe(false);
    expect(hand.isBlackjack).toBe(false);
    expect(hand.isBust).toBe(false);
  });

  it('should recognize blackjack (Ace + 10)', () => {
    const cards: BlackjackCard[] = [
      {
        id: 'A-hearts-0',
        rank: Rank.Ace,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: 'K-hearts-0',
        rank: Rank.King,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(21);
    expect(hand.isBlackjack).toBe(true);
    expect(hand.isSoft).toBe(true);
  });

  it('should recognize bust (over 21)', () => {
    const cards: BlackjackCard[] = [
      {
        id: 'K-hearts-0',
        rank: Rank.King,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: 'Q-hearts-0',
        rank: Rank.Queen,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: '5-hearts-0',
        rank: Rank.Five,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(25);
    expect(hand.isBust).toBe(true);
  });

  it('should handle soft ace (Ace + 6 = 17 soft)', () => {
    const cards: BlackjackCard[] = [
      {
        id: 'A-hearts-0',
        rank: Rank.Ace,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: '6-hearts-0',
        rank: Rank.Six,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(17);
    expect(hand.isSoft).toBe(true);
    expect(hand.isBlackjack).toBe(false);
  });

  it('should convert ace from 11 to 1 to avoid bust', () => {
    const cards: BlackjackCard[] = [
      {
        id: 'A-hearts-0',
        rank: Rank.Ace,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: '9-hearts-0',
        rank: Rank.Nine,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: '5-hearts-0',
        rank: Rank.Five,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(15); // Ace counts as 1
    expect(hand.isSoft).toBe(false);
    expect(hand.isBust).toBe(false);
  });

  it('should handle multiple aces', () => {
    const cards: BlackjackCard[] = [
      {
        id: 'A-hearts-0',
        rank: Rank.Ace,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: 'A-diamonds-0',
        rank: Rank.Ace,
        suit: Suit.Diamonds,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: '9-hearts-0',
        rank: Rank.Nine,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(21); // 11 + 1 + 9
    expect(hand.isSoft).toBe(true);
  });

  it('should not count hidden cards', () => {
    const cards: BlackjackCard[] = [
      {
        id: '5-hearts-0',
        rank: Rank.Five,
        suit: Suit.Hearts,
        isFaceUp: true,
        isHidden: false,
      },
      {
        id: 'K-hearts-0',
        rank: Rank.King,
        suit: Suit.Hearts,
        isFaceUp: false,
        isHidden: true, // Hidden card
      },
    ];

    const hand = evaluateHand(cards);
    expect(hand.total).toBe(5); // Only the 5 is counted
  });
});

describe('createEmptyHand', () => {
  it('should create an empty hand with zero total', () => {
    const hand = createEmptyHand();
    expect(hand.cards).toHaveLength(0);
    expect(hand.total).toBe(0);
    expect(hand.isSoft).toBe(false);
    expect(hand.isBlackjack).toBe(false);
    expect(hand.isBust).toBe(false);
  });
});

describe('addCardToHand', () => {
  it('should add card to hand and re-evaluate', () => {
    const initialHand = createEmptyHand();
    const card: BlackjackCard = {
      id: '7-hearts-0',
      rank: Rank.Seven,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };

    const newHand = addCardToHand(initialHand, card);
    expect(newHand.cards).toHaveLength(1);
    expect(newHand.total).toBe(7);
  });

  it('should not mutate original hand', () => {
    const initialHand = createEmptyHand();
    const card: BlackjackCard = {
      id: '7-hearts-0',
      rank: Rank.Seven,
      suit: Suit.Hearts,
      isFaceUp: true,
      isHidden: false,
    };

    addCardToHand(initialHand, card);
    expect(initialHand.cards).toHaveLength(0);
  });
});
