import {
  createAIMemory,
  updateAIMemory,
  removeClaimedFromMemory,
  findKnownMatch,
  selectRandomCards,
  getAIMove,
  syncMemoryWithGameState,
  getCardIdsFromPositions,
} from '../src/ai';
import { createGame, flipCard, checkAndProcessMatch } from '../src/game';
import { createCard } from '../src/card';
import { GameConfig, PlayerType, Rank, Suit, Card } from '../src/types';

describe('AI Module', () => {
  const createTestConfig = (): GameConfig => ({
    matchSize: 2,
    numRanks: 13,
    numPlayers: 2,
    players: [
      { index: 0, name: 'Player 1', type: PlayerType.Human },
      { index: 1, name: 'AI', type: PlayerType.AI },
    ],
  });

  describe('createAIMemory', () => {
    it('should create empty memory', () => {
      const memory = createAIMemory();
      expect(memory.seenCards.size).toBe(0);
    });
  });

  describe('updateAIMemory', () => {
    it('should add newly seen cards to memory', () => {
      const memory = createAIMemory();
      const cards: Card[] = [
        { ...createCard(Rank.Ace, Suit.Hearts, 0), hasBeenSeen: true, claimedByPlayer: -1 },
        { ...createCard(Rank.King, Suit.Spades, 1), hasBeenSeen: true, claimedByPlayer: -1 },
      ];

      const updated = updateAIMemory(memory, cards);

      expect(updated.seenCards.size).toBe(2);
      expect(updated.seenCards.get(0)).toBe('A:hearts');
      expect(updated.seenCards.get(1)).toBe('K:spades');
    });

    it('should not add claimed cards to memory', () => {
      const memory = createAIMemory();
      const cards: Card[] = [
        { ...createCard(Rank.Ace, Suit.Hearts, 0), hasBeenSeen: true, claimedByPlayer: 0 },
      ];

      const updated = updateAIMemory(memory, cards);

      expect(updated.seenCards.size).toBe(0);
    });

    it('should not add unseen cards to memory', () => {
      const memory = createAIMemory();
      const cards: Card[] = [
        { ...createCard(Rank.Ace, Suit.Hearts, 0), hasBeenSeen: false, claimedByPlayer: -1 },
      ];

      const updated = updateAIMemory(memory, cards);

      expect(updated.seenCards.size).toBe(0);
    });
  });

  describe('removeClaimedFromMemory', () => {
    it('should remove claimed cards from memory', () => {
      const memory = createAIMemory();
      memory.seenCards.set(0, 'A:hearts');
      memory.seenCards.set(1, 'K:spades');

      const cards: Card[] = [{ ...createCard(Rank.Ace, Suit.Hearts, 0), claimedByPlayer: 0 }];

      const updated = removeClaimedFromMemory(memory, cards);

      expect(updated.seenCards.size).toBe(1);
      expect(updated.seenCards.has(0)).toBe(false);
      expect(updated.seenCards.has(1)).toBe(true);
    });
  });

  describe('findKnownMatch', () => {
    it('should find a match when AI has seen matching cards', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Add two cards of the same rank to memory
      memory.seenCards.set(0, 'A:hearts');
      memory.seenCards.set(5, 'A:diamonds');

      const match = findKnownMatch(game, memory);

      expect(match).not.toBeNull();
      expect(match?.length).toBe(2);
      expect(match).toContain(0);
      expect(match).toContain(5);
    });

    it('should return null when no complete match is found', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Add only one card
      memory.seenCards.set(0, 'A:hearts');

      const match = findKnownMatch(game, memory);

      expect(match).toBeNull();
    });

    it('should not return claimed cards as a match', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Add cards to memory
      memory.seenCards.set(0, 'A:hearts');
      memory.seenCards.set(5, 'A:diamonds');

      // Claim one of the cards
      game.cards.find((c) => c.position === 0)!.claimedByPlayer = 0;

      const match = findKnownMatch(game, memory);

      expect(match).toBeNull();
    });

    it('should work with triplets', () => {
      const config = createTestConfig();
      config.matchSize = 3;
      const game = createGame(config);
      const memory = createAIMemory();

      memory.seenCards.set(0, 'A:hearts');
      memory.seenCards.set(5, 'A:diamonds');
      memory.seenCards.set(10, 'A:clubs');

      const match = findKnownMatch(game, memory);

      expect(match).not.toBeNull();
      expect(match?.length).toBe(3);
    });
  });

  describe('selectRandomCards', () => {
    it('should select the requested number of cards', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      const selected = selectRandomCards(game, memory, 2);

      expect(selected.length).toBe(2);
    });

    it('should not select face-up cards', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Flip a card face up
      game.cards[0].isFaceUp = true;

      const selected = selectRandomCards(game, memory, 5);

      expect(selected).not.toContain(game.cards[0].position);
    });

    it('should not select claimed cards', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Claim a card
      game.cards[0].claimedByPlayer = 0;

      const selected = selectRandomCards(game, memory, 5);

      expect(selected).not.toContain(game.cards[0].position);
    });

    it('should prefer unseen cards over seen cards', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Mark some cards as seen
      memory.seenCards.set(0, 'A:hearts');
      memory.seenCards.set(1, 'K:spades');

      // Request more cards than unseen available
      const selected = selectRandomCards(game, memory, 10);

      // Should prioritize unseen cards
      expect(selected.length).toBe(10);

      // Count how many are unseen
      const unseenCount = selected.filter((pos) => !memory.seenCards.has(pos)).length;
      expect(unseenCount).toBeGreaterThan(0);
    });

    it('should return empty array when no cards available', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Claim all cards
      game.cards.forEach((card) => {
        card.claimedByPlayer = 0;
      });

      const selected = selectRandomCards(game, memory, 2);

      expect(selected).toEqual([]);
    });
  });

  describe('getAIMove', () => {
    it('should return known match if available', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Add a known match to memory
      memory.seenCards.set(0, 'A:hearts');
      memory.seenCards.set(5, 'A:diamonds');

      const move = getAIMove(game, memory);

      expect(move.length).toBe(2);
      expect(move).toContain(0);
      expect(move).toContain(5);
    });

    it('should return random cards when no match is known', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      const move = getAIMove(game, memory);

      expect(move.length).toBe(2);
    });

    it('should complete partial turn by finding matching card', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Flip one card (simulating partial turn)
      const firstCard = game.cards.find((c) => c.rank === Rank.Ace)!;
      game.currentlyFlippedCards = [firstCard.id];
      firstCard.isFaceUp = true;

      // AI knows where another Ace is
      const secondAce = game.cards.find((c) => c.rank === Rank.Ace && c.id !== firstCard.id)!;
      memory.seenCards.set(secondAce.position, `${secondAce.rank}:${secondAce.suit}`);

      const move = getAIMove(game, memory);

      expect(move.length).toBe(1);
      expect(move[0]).toBe(secondAce.position);
    });

    it('should return empty array when turn is complete', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Simulate complete turn
      game.currentlyFlippedCards = ['card1', 'card2'];

      const move = getAIMove(game, memory);

      expect(move).toEqual([]);
    });
  });

  describe('syncMemoryWithGameState', () => {
    it('should update memory with visible cards', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Mark some cards as seen
      game.cards[0].hasBeenSeen = true;
      game.cards[1].hasBeenSeen = true;

      const synced = syncMemoryWithGameState(game, memory);

      expect(synced.seenCards.size).toBe(2);
    });

    it('should remove claimed cards from memory', () => {
      const game = createGame(createTestConfig());
      const memory = createAIMemory();

      // Find cards at specific positions
      const cardAtPos0 = game.cards.find((c) => c.position === 0)!;
      const cardAtPos1 = game.cards.find((c) => c.position === 1)!;

      // Add cards to memory
      memory.seenCards.set(0, `${cardAtPos0.rank}:${cardAtPos0.suit}`);
      memory.seenCards.set(1, `${cardAtPos1.rank}:${cardAtPos1.suit}`);

      // Claim the card at position 0
      cardAtPos0.claimedByPlayer = 0;

      const synced = syncMemoryWithGameState(game, memory);

      expect(synced.seenCards.size).toBe(1);
      expect(synced.seenCards.has(0)).toBe(false);
      expect(synced.seenCards.has(1)).toBe(true);
    });
  });

  describe('getCardIdsFromPositions', () => {
    it('should convert positions to card IDs', () => {
      const game = createGame(createTestConfig());
      const positions = [0, 5, 10];

      const ids = getCardIdsFromPositions(game, positions);

      expect(ids.length).toBe(3);
      ids.forEach((id) => {
        expect(game.cards.some((c) => c.id === id)).toBe(true);
      });
    });

    it('should filter out invalid positions', () => {
      const game = createGame(createTestConfig());
      const positions = [0, 999, 10];

      const ids = getCardIdsFromPositions(game, positions);

      expect(ids.length).toBe(2);
    });
  });

  describe('integration tests', () => {
    it('AI should be able to learn and make matches', () => {
      const game = createGame(createTestConfig());
      let memory = createAIMemory();

      // Find two matching cards
      const firstCard = game.cards[0];
      const matchingCard = game.cards.find(
        (c) => c.rank === firstCard.rank && c.id !== firstCard.id
      )!;

      // Simulate human player revealing these cards
      let state = game;
      state = flipCard(state, firstCard.id).updatedState!;
      state = flipCard(state, matchingCard.id).updatedState!;

      // Update AI memory
      memory = syncMemoryWithGameState(state, memory);

      // Process the match (they don't match suits in this test, but they match ranks)
      // Actually, let's process it
      state = checkAndProcessMatch(state);

      // Update memory again after processing
      memory = syncMemoryWithGameState(state, memory);

      // Now it's player 2's (AI) turn if the match failed
      // If it was a match, player 1 goes again
      // Let's test that AI can find a match it has seen
      const thirdCard = game.cards.find(
        (c) => c.rank !== firstCard.rank && c.claimedByPlayer === -1
      )!;
      const fourthCard = game.cards.find(
        (c) => c.rank === thirdCard.rank && c.id !== thirdCard.id && c.claimedByPlayer === -1
      )!;

      // Simulate revealing these cards
      state.cards.forEach((card) => {
        if (card.id === thirdCard.id || card.id === fourthCard.id) {
          card.hasBeenSeen = true;
        }
      });

      memory = syncMemoryWithGameState(state, memory);

      // AI should now know about a match
      const match = findKnownMatch(state, memory);
      expect(match).not.toBeNull();
    });
  });
});
