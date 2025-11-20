import {
  createGame,
  flipCard,
  checkAndProcessMatch,
  resetCurrentTurn,
  getGameStats,
  serializeGameState,
  deserializeGameState,
  getCurrentPlayer,
  isPlayerTurn,
  getVisibleCards,
  getUnclaimedCards,
} from '../src/game';
import { GameConfig, GameStatus, PlayerType, Rank, Suit } from '../src/types';

describe('Game Module', () => {
  const createTestConfig = (matchSize: 2 | 3 | 4 = 2, numRanks: 13 | 26 = 13): GameConfig => ({
    matchSize,
    numRanks,
    numPlayers: 2,
    players: [
      { index: 0, name: 'Player 1', type: PlayerType.Human },
      { index: 1, name: 'Player 2', type: PlayerType.AI },
    ],
  });

  describe('createGame', () => {
    it('should create a valid initial game state', () => {
      const config = createTestConfig();
      const game = createGame(config);

      expect(game.config).toEqual(config);
      expect(game.cards.length).toBe(26); // 13 ranks × 2 cards
      expect(game.players.length).toBe(2);
      expect(game.currentPlayerIndex).toBe(0);
      expect(game.currentlyFlippedCards).toEqual([]);
      expect(game.moves).toEqual([]);
      expect(game.status).toBe(GameStatus.InProgress);
      expect(game.endTime).toBeNull();
    });

    it('should initialize players with zero matches', () => {
      const config = createTestConfig();
      const game = createGame(config);

      game.players.forEach((player) => {
        expect(player.matchesClaimed).toBe(0);
        expect(player.claimedCards).toEqual([]);
      });
    });

    it('should initialize all cards as face down and unclaimed', () => {
      const config = createTestConfig();
      const game = createGame(config);

      game.cards.forEach((card) => {
        expect(card.isFaceUp).toBe(false);
        expect(card.hasBeenSeen).toBe(false);
        expect(card.claimedByPlayer).toBe(-1);
      });
    });

    it('should throw error for invalid number of players', () => {
      const config = createTestConfig();
      config.numPlayers = 5;

      expect(() => createGame(config)).toThrow('Number of players must be between 2 and 4');
    });

    it('should throw error for mismatched player configuration', () => {
      const config = createTestConfig();
      config.numPlayers = 3;

      expect(() => createGame(config)).toThrow('Player configuration must match number of players');
    });

    it('should create correct number of cards for different configurations', () => {
      expect(createGame(createTestConfig(2, 13)).cards.length).toBe(26);
      expect(createGame(createTestConfig(3, 13)).cards.length).toBe(39);
      expect(createGame(createTestConfig(4, 13)).cards.length).toBe(52);
      expect(createGame(createTestConfig(2, 26)).cards.length).toBe(52);
    });
  });

  describe('flipCard', () => {
    it('should flip a card face up', () => {
      const game = createGame(createTestConfig());
      const cardId = game.cards[0].id;

      const result = flipCard(game, cardId);

      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();

      const flippedCard = result.updatedState!.cards.find((c) => c.id === cardId);
      expect(flippedCard?.isFaceUp).toBe(true);
      expect(flippedCard?.hasBeenSeen).toBe(true);
    });

    it('should add card to currently flipped cards', () => {
      const game = createGame(createTestConfig());
      const cardId = game.cards[0].id;

      const result = flipCard(game, cardId);

      expect(result.updatedState?.currentlyFlippedCards).toContain(cardId);
    });

    it('should not flip a card that is already face up', () => {
      const game = createGame(createTestConfig());
      const cardId = game.cards[0].id;

      let result = flipCard(game, cardId);
      result = flipCard(result.updatedState!, cardId);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Card is already face up');
    });

    it('should not flip a claimed card', () => {
      const game = createGame(createTestConfig());
      const cardId = game.cards[0].id;

      // Manually claim the card
      game.cards[0].claimedByPlayer = 0;

      const result = flipCard(game, cardId);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Card has already been claimed');
    });

    it('should not flip more than matchSize cards', () => {
      const game = createGame(createTestConfig(2, 13));

      let currentState = game;
      const result1 = flipCard(currentState, game.cards[0].id);
      currentState = result1.updatedState!;

      const result2 = flipCard(currentState, game.cards[1].id);
      currentState = result2.updatedState!;

      const result3 = flipCard(currentState, game.cards[2].id);

      expect(result3.success).toBe(false);
      expect(result3.reason).toBe('Maximum cards already flipped for this turn');
    });

    it('should not flip card when game is not in progress', () => {
      const game = createGame(createTestConfig());
      game.status = GameStatus.Completed;

      const result = flipCard(game, game.cards[0].id);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Game is not in progress');
    });

    it('should return error for non-existent card', () => {
      const game = createGame(createTestConfig());

      const result = flipCard(game, 'non-existent-id');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Card not found');
    });
  });

  describe('checkAndProcessMatch', () => {
    it('should do nothing if not enough cards are flipped', () => {
      const game = createGame(createTestConfig(2, 13));
      const result = flipCard(game, game.cards[0].id);

      const processed = checkAndProcessMatch(result.updatedState!);

      expect(processed.currentlyFlippedCards.length).toBe(1);
      expect(processed.moves.length).toBe(0);
    });

    it('should process a successful match', () => {
      const game = createGame(createTestConfig(2, 13));

      // Find two cards with the same rank
      const firstCard = game.cards[0];
      const matchingCard = game.cards.find(
        (c) => c.rank === firstCard.rank && c.id !== firstCard.id
      )!;

      let currentState = game;
      currentState = flipCard(currentState, firstCard.id).updatedState!;
      currentState = flipCard(currentState, matchingCard.id).updatedState!;

      const processed = checkAndProcessMatch(currentState);

      expect(processed.moves.length).toBe(1);
      expect(processed.moves[0].isMatch).toBe(true);
      expect(processed.players[0].matchesClaimed).toBe(1);
      expect(processed.currentlyFlippedCards).toEqual([]);
      expect(processed.currentPlayerIndex).toBe(0); // Same player continues

      const card1 = processed.cards.find((c) => c.id === firstCard.id);
      const card2 = processed.cards.find((c) => c.id === matchingCard.id);
      expect(card1?.claimedByPlayer).toBe(0);
      expect(card2?.claimedByPlayer).toBe(0);
    });

    it('should process a failed match', () => {
      const game = createGame(createTestConfig(2, 13));

      // Find two cards with different ranks
      const firstCard = game.cards[0];
      const nonMatchingCard = game.cards.find((c) => c.rank !== firstCard.rank)!;

      let currentState = game;
      currentState = flipCard(currentState, firstCard.id).updatedState!;
      currentState = flipCard(currentState, nonMatchingCard.id).updatedState!;

      const processed = checkAndProcessMatch(currentState);

      expect(processed.moves.length).toBe(1);
      expect(processed.moves[0].isMatch).toBe(false);
      expect(processed.players[0].matchesClaimed).toBe(0);
      expect(processed.currentlyFlippedCards).toEqual([]);
      expect(processed.currentPlayerIndex).toBe(1); // Next player's turn

      const card1 = processed.cards.find((c) => c.id === firstCard.id);
      const card2 = processed.cards.find((c) => c.id === nonMatchingCard.id);
      expect(card1?.isFaceUp).toBe(false);
      expect(card2?.isFaceUp).toBe(false);
      expect(card1?.claimedByPlayer).toBe(-1);
      expect(card2?.claimedByPlayer).toBe(-1);
    });

    it('should mark game as completed when all cards are claimed', () => {
      const game = createGame(createTestConfig(2, 13));

      // Manually mark all cards as claimed
      game.cards.forEach((card, index) => {
        card.claimedByPlayer = index % 2;
      });

      // Simulate the last move
      game.currentlyFlippedCards = [game.cards[0].id, game.cards[1].id];

      const processed = checkAndProcessMatch(game);

      expect(processed.status).toBe(GameStatus.Completed);
      expect(processed.endTime).not.toBeNull();
    });
  });

  describe('resetCurrentTurn', () => {
    it('should flip all currently face-up cards back down', () => {
      const game = createGame(createTestConfig());

      let currentState = game;
      currentState = flipCard(currentState, game.cards[0].id).updatedState!;
      currentState = flipCard(currentState, game.cards[1].id).updatedState!;

      const reset = resetCurrentTurn(currentState);

      expect(reset.currentlyFlippedCards).toEqual([]);
      reset.cards.forEach((card) => {
        expect(card.isFaceUp).toBe(false);
      });
    });
  });

  describe('getGameStats', () => {
    it('should calculate correct statistics', () => {
      const game = createGame(createTestConfig(2, 13));
      game.players[0].matchesClaimed = 8;
      game.players[1].matchesClaimed = 5;
      game.moves = [{}, {}, {}] as any; // Mock moves

      const stats = getGameStats(game);

      expect(stats.totalMoves).toBe(3);
      expect(stats.totalPairs).toBe(13);
      expect(stats.playerStats[0].score).toBe(8);
      expect(stats.playerStats[1].score).toBe(5);
      expect(stats.playerStats[0].percentage).toBeCloseTo(61.54, 1);
      expect(stats.playerStats[1].percentage).toBeCloseTo(38.46, 1);
    });

    it('should identify winner when game is completed', () => {
      const game = createGame(createTestConfig());
      game.status = GameStatus.Completed;
      game.players[0].matchesClaimed = 10;
      game.players[1].matchesClaimed = 3;

      const stats = getGameStats(game);

      expect(stats.winner).toBeDefined();
      expect(stats.winner?.index).toBe(0);
      expect(stats.winner?.matchesClaimed).toBe(10);
    });

    it('should not identify winner when game is in progress', () => {
      const game = createGame(createTestConfig());
      game.players[0].matchesClaimed = 5;
      game.players[1].matchesClaimed = 3;

      const stats = getGameStats(game);

      expect(stats.winner).toBeNull();
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize game state', () => {
      const game = createGame(createTestConfig());
      const serialized = serializeGameState(game);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized).toEqual(game);
    });

    it('should preserve game state after serialization roundtrip', () => {
      const game = createGame(createTestConfig());

      // Make some moves
      let currentState = game;
      currentState = flipCard(currentState, game.cards[0].id).updatedState!;
      currentState = flipCard(currentState, game.cards[1].id).updatedState!;
      currentState = checkAndProcessMatch(currentState);

      const serialized = serializeGameState(currentState);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.currentPlayerIndex).toBe(currentState.currentPlayerIndex);
      expect(deserialized.moves.length).toBe(currentState.moves.length);
      expect(deserialized.cards).toEqual(currentState.cards);
    });
  });

  describe('helper functions', () => {
    it('getCurrentPlayer should return current player', () => {
      const game = createGame(createTestConfig());
      const currentPlayer = getCurrentPlayer(game);

      expect(currentPlayer.index).toBe(0);
      expect(currentPlayer.name).toBe('Player 1');
    });

    it("isPlayerTurn should check if it is a specific player's turn", () => {
      const game = createGame(createTestConfig());

      expect(isPlayerTurn(game, 0)).toBe(true);
      expect(isPlayerTurn(game, 1)).toBe(false);
    });

    it('isPlayerTurn should return false when game is not in progress', () => {
      const game = createGame(createTestConfig());
      game.status = GameStatus.Completed;

      expect(isPlayerTurn(game, 0)).toBe(false);
    });

    it('getVisibleCards should return face up and claimed cards', () => {
      const game = createGame(createTestConfig());
      game.cards[0].isFaceUp = true;
      game.cards[1].claimedByPlayer = 0;

      const visible = getVisibleCards(game);

      expect(visible.length).toBe(2);
      expect(visible).toContain(game.cards[0]);
      expect(visible).toContain(game.cards[1]);
    });

    it('getUnclaimedCards should return only unclaimed cards', () => {
      const game = createGame(createTestConfig());
      game.cards[0].claimedByPlayer = 0;
      game.cards[1].claimedByPlayer = 1;

      const unclaimed = getUnclaimedCards(game);

      expect(unclaimed.length).toBe(24);
      expect(unclaimed).not.toContain(game.cards[0]);
      expect(unclaimed).not.toContain(game.cards[1]);
    });
  });
});
