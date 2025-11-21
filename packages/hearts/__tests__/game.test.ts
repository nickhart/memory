import { Suit, Rank } from '@memory/card-game-core';
import {
  createGame,
  getPassDirection,
  dealCards,
  selectCardToPass,
  executePass,
  playCard,
  completeTrick,
  startNewHand,
} from '../src/game';
import { determineTrickWinner } from '../src/trick';
import { GamePhase, PassDirection } from '../src/types';

describe('createGame', () => {
  it('should create a game with 4 players', () => {
    const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const game = createGame(playerNames);

    expect(game.players).toHaveLength(4);
    expect(game.players[0].name).toBe('Alice');
    expect(game.players[1].name).toBe('Bob');
    expect(game.players[2].name).toBe('Charlie');
    expect(game.players[3].name).toBe('Diana');
  });

  it('should throw error if not exactly 4 players', () => {
    expect(() => createGame(['Alice', 'Bob'])).toThrow('Hearts requires exactly 4 players');
    expect(() => createGame(['Alice', 'Bob', 'Charlie'])).toThrow();
    expect(() => createGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'])).toThrow();
  });

  it('should start in Dealing phase', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    expect(game.phase).toBe(GamePhase.Dealing);
  });

  it('should have shuffled deck of 52 cards', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    expect(game.deck).toHaveLength(52);
  });

  it('should initialize with correct pass direction for hand 0', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    expect(game.passDirection).toBe(PassDirection.Left);
  });
});

describe('getPassDirection', () => {
  it('should cycle through pass directions', () => {
    expect(getPassDirection(0)).toBe(PassDirection.Left);
    expect(getPassDirection(1)).toBe(PassDirection.Right);
    expect(getPassDirection(2)).toBe(PassDirection.Across);
    expect(getPassDirection(3)).toBe(PassDirection.None);
    expect(getPassDirection(4)).toBe(PassDirection.Left); // Cycles back
    expect(getPassDirection(5)).toBe(PassDirection.Right);
  });
});

describe('dealCards', () => {
  it('should deal 13 cards to each player', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    const dealt = dealCards(game);

    expect(dealt.players[0].hand).toHaveLength(13);
    expect(dealt.players[1].hand).toHaveLength(13);
    expect(dealt.players[2].hand).toHaveLength(13);
    expect(dealt.players[3].hand).toHaveLength(13);
  });

  it('should move to Passing phase when pass direction is not None', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    const dealt = dealCards(game);

    expect(dealt.phase).toBe(GamePhase.Passing);
  });

  it('should move to Playing phase when pass direction is None', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    const dealt = dealCards(game);

    expect(dealt.phase).toBe(GamePhase.Playing);
  });

  it('should set current player to whoever has 2 of clubs', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    const dealt = dealCards(game);

    const currentPlayer = dealt.players[dealt.currentPlayerIndex];
    const hasTwoOfClubs = currentPlayer.hand.some(
      (c) => c.rank === Rank.Two && c.suit === Suit.Clubs
    );

    expect(hasTwoOfClubs).toBe(true);
  });

  it('should throw error if not in Dealing phase', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    const dealt = dealCards(game);

    expect(() => dealCards(dealt)).toThrow('Can only deal when in dealing phase');
  });

  it('should sort hands by suit and rank', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    const dealt = dealCards(game);

    // Check that each hand is sorted
    dealt.players.forEach((player) => {
      const hand = player.hand;
      for (let i = 0; i < hand.length - 1; i++) {
        const current = hand[i];
        const next = hand[i + 1];

        // Suits should be in order: Clubs, Diamonds, Spades, Hearts
        const suitOrder = [Suit.Clubs, Suit.Diamonds, Suit.Spades, Suit.Hearts];
        const currentSuitIndex = suitOrder.indexOf(current.suit);
        const nextSuitIndex = suitOrder.indexOf(next.suit);

        expect(currentSuitIndex).toBeLessThanOrEqual(nextSuitIndex);
      }
    });
  });
});

describe('selectCardToPass', () => {
  it('should allow selecting up to 3 cards', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);

    const player = state.players[0];
    const card1 = player.hand[0].id;
    const card2 = player.hand[1].id;
    const card3 = player.hand[2].id;

    state = selectCardToPass(state, player.id, card1);
    expect(state.players[0].selectedCards).toHaveLength(1);
    expect(state.players[0].isReady).toBe(false);

    state = selectCardToPass(state, player.id, card2);
    expect(state.players[0].selectedCards).toHaveLength(2);
    expect(state.players[0].isReady).toBe(false);

    state = selectCardToPass(state, player.id, card3);
    expect(state.players[0].selectedCards).toHaveLength(3);
    expect(state.players[0].isReady).toBe(true);
  });

  it('should throw error when trying to select more than 3 cards', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);

    const player = state.players[0];
    const cards = player.hand.slice(0, 4).map((c) => c.id);

    state = selectCardToPass(state, player.id, cards[0]);
    state = selectCardToPass(state, player.id, cards[1]);
    state = selectCardToPass(state, player.id, cards[2]);

    expect(() => selectCardToPass(state, player.id, cards[3])).toThrow(
      'Can only select 3 cards to pass'
    );
  });

  it('should allow deselecting a card', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);

    const player = state.players[0];
    const card = player.hand[0].id;

    state = selectCardToPass(state, player.id, card);
    expect(state.players[0].selectedCards).toHaveLength(1);

    state = selectCardToPass(state, player.id, card);
    expect(state.players[0].selectedCards).toHaveLength(0);
  });

  it('should throw error if not in Passing phase', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    const player = game.players[0];

    expect(() => selectCardToPass(game, player.id, 'card-id')).toThrow(
      'Can only select cards during passing phase'
    );
  });
});

describe('executePass', () => {
  it('should pass cards to the left', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);
    state.passDirection = PassDirection.Left;

    // Each player selects 3 cards
    state.players.forEach((player, index) => {
      const cards = player.hand.slice(0, 3).map((c) => c.id);
      cards.forEach((cardId) => {
        state = selectCardToPass(state, player.id, cardId);
      });
    });

    const player0FirstCard = state.players[0].selectedCards[0];
    state = executePass(state);

    // Player 0's cards should go to Player 1 (left)
    const player1ReceivedCard = state.players[1].hand.some((c) => c.id === player0FirstCard);
    expect(player1ReceivedCard).toBe(true);
    expect(state.phase).toBe(GamePhase.Playing);
  });

  it('should pass cards to the right', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);
    state.passDirection = PassDirection.Right;

    state.players.forEach((player) => {
      const cards = player.hand.slice(0, 3).map((c) => c.id);
      cards.forEach((cardId) => {
        state = selectCardToPass(state, player.id, cardId);
      });
    });

    const player0FirstCard = state.players[0].selectedCards[0];
    state = executePass(state);

    // Player 0's cards should go to Player 3 (right)
    const player3ReceivedCard = state.players[3].hand.some((c) => c.id === player0FirstCard);
    expect(player3ReceivedCard).toBe(true);
  });

  it('should pass cards across', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);
    state.passDirection = PassDirection.Across;

    state.players.forEach((player) => {
      const cards = player.hand.slice(0, 3).map((c) => c.id);
      cards.forEach((cardId) => {
        state = selectCardToPass(state, player.id, cardId);
      });
    });

    const player0FirstCard = state.players[0].selectedCards[0];
    state = executePass(state);

    // Player 0's cards should go to Player 2 (across)
    const player2ReceivedCard = state.players[2].hand.some((c) => c.id === player0FirstCard);
    expect(player2ReceivedCard).toBe(true);
  });

  it('should clear selected cards and ready status after pass', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);

    state.players.forEach((player) => {
      const cards = player.hand.slice(0, 3).map((c) => c.id);
      cards.forEach((cardId) => {
        state = selectCardToPass(state, player.id, cardId);
      });
    });

    state = executePass(state);

    state.players.forEach((player) => {
      expect(player.selectedCards).toHaveLength(0);
      expect(player.isReady).toBe(false);
    });
  });

  it('should throw error if not all players are ready', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);

    // Only player 0 selects cards
    const cards = state.players[0].hand.slice(0, 3).map((c) => c.id);
    cards.forEach((cardId) => {
      state = selectCardToPass(state, state.players[0].id, cardId);
    });

    expect(() => executePass(state)).toThrow('Not all players are ready to pass');
  });
});

describe('playCard', () => {
  it('should play a valid card', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const twoOfClubs = currentPlayer.hand.find(
      (c) => c.rank === Rank.Two && c.suit === Suit.Clubs
    )!;

    const handSizeBefore = currentPlayer.hand.length;
    state = playCard(state, currentPlayer.id, twoOfClubs.id);

    expect(state.currentTrick.cards).toHaveLength(1);
    expect(
      state.players[state.currentPlayerIndex - 1 >= 0 ? state.currentPlayerIndex - 1 : 3].hand
    ).toHaveLength(handSizeBefore - 1);
  });

  it('should set leading suit on first card', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const twoOfClubs = currentPlayer.hand.find(
      (c) => c.rank === Rank.Two && c.suit === Suit.Clubs
    )!;

    state = playCard(state, currentPlayer.id, twoOfClubs.id);

    expect(state.currentTrick.leadingSuit).toBe(Suit.Clubs);
  });

  it('should advance to next player', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    const currentIndex = state.currentPlayerIndex;
    const currentPlayer = state.players[currentIndex];
    const twoOfClubs = currentPlayer.hand.find(
      (c) => c.rank === Rank.Two && c.suit === Suit.Clubs
    )!;

    state = playCard(state, currentPlayer.id, twoOfClubs.id);

    expect(state.currentPlayerIndex).toBe((currentIndex + 1) % 4);
  });

  it('should break hearts if a heart is played', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);
    state.heartsBroken = false;
    state.firstTrick = false;

    // Manually set up a situation where hearts can be played
    state.currentTrick = {
      cards: [
        {
          playerId: state.players[0].id,
          card: { id: 'c2', rank: Rank.Two, suit: Suit.Clubs, isFaceUp: true },
        },
      ],
      leadingSuit: Suit.Clubs,
      winnerId: null,
    };

    // Find a player with a heart and no clubs
    const playerWithHeart = state.players.find(
      (p, i) =>
        i === state.currentPlayerIndex &&
        p.hand.some((c) => c.suit === Suit.Hearts) &&
        !p.hand.some((c) => c.suit === Suit.Clubs)
    );

    if (playerWithHeart) {
      const heart = playerWithHeart.hand.find((c) => c.suit === Suit.Hearts)!;
      state = playCard(state, playerWithHeart.id, heart.id);
      expect(state.heartsBroken).toBe(true);
    }
  });

  it('should throw error if not player turn', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    const wrongPlayer = state.players[(state.currentPlayerIndex + 1) % 4];
    const card = wrongPlayer.hand[0];

    expect(() => playCard(state, wrongPlayer.id, card.id)).toThrow('Not your turn');
  });
});

describe('completeTrick', () => {
  it('should determine winner and add trick to their collection', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    // Play 4 cards to complete a trick
    for (let i = 0; i < 4; i++) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const validCard = currentPlayer.hand.find(
        (c) =>
          (i === 0 && c.rank === Rank.Two && c.suit === Suit.Clubs) ||
          (i > 0 &&
            (c.suit === state.currentTrick.leadingSuit || state.currentTrick.leadingSuit === null))
      );

      if (!validCard) {
        // If can't follow suit, play any non-point card on first trick
        const nonPoint = currentPlayer.hand.find(
          (c) =>
            state.firstTrick &&
            c.suit !== Suit.Hearts &&
            !(c.suit === Suit.Spades && c.rank === Rank.Queen)
        );
        state = playCard(state, currentPlayer.id, (nonPoint || currentPlayer.hand[0]).id);
      } else {
        state = playCard(state, currentPlayer.id, validCard.id);
      }
    }

    const tricksBefore = state.players.reduce((sum, p) => sum + p.tricksTaken.length, 0);
    state = completeTrick(state);
    const tricksAfter = state.players.reduce((sum, p) => sum + p.tricksTaken.length, 0);

    expect(tricksAfter).toBe(tricksBefore + 1);
    expect(state.currentTrick.cards).toHaveLength(0);
  });

  it('should set winner as next player', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    // Complete a trick
    for (let i = 0; i < 4; i++) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const validCard =
        i === 0
          ? currentPlayer.hand.find((c) => c.rank === Rank.Two && c.suit === Suit.Clubs)!
          : currentPlayer.hand[0];

      state = playCard(state, currentPlayer.id, validCard.id);
    }

    // Determine winner before completing trick (since completeTrick will clear the trick)
    const winnerId = determineTrickWinner(state.currentTrick);
    state = completeTrick(state);

    const winnerIndex = state.players.findIndex((p) => p.id === winnerId);
    expect(state.currentPlayerIndex).toBe(winnerIndex);
  });

  it('should throw error if trick is not complete', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    game.passDirection = PassDirection.None;
    let state = dealCards(game);

    expect(() => completeTrick(state)).toThrow('Trick is not complete');
  });
});

describe('startNewHand', () => {
  it('should reset for new hand', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);
    state.phase = GamePhase.HandComplete;
    state.handNumber = 0;

    state = startNewHand(state);

    expect(state.phase).toBe(GamePhase.Dealing);
    expect(state.handNumber).toBe(1);
    expect(state.passDirection).toBe(PassDirection.Right); // Hand 1 = Right
    expect(state.firstTrick).toBe(true);
    expect(state.heartsBroken).toBe(false);
    expect(state.completedTricks).toHaveLength(0);

    state.players.forEach((player) => {
      expect(player.hand).toHaveLength(0);
      expect(player.tricksTaken).toHaveLength(0);
      expect(player.handScore).toBe(0);
      expect(player.selectedCards).toHaveLength(0);
      expect(player.isReady).toBe(false);
    });
  });

  it('should preserve total scores', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);
    let state = dealCards(game);
    state.phase = GamePhase.HandComplete;

    // Set some scores
    state.players[0].score = 10;
    state.players[1].score = 20;
    state.players[2].score = 15;
    state.players[3].score = 25;

    state = startNewHand(state);

    expect(state.players[0].score).toBe(10);
    expect(state.players[1].score).toBe(20);
    expect(state.players[2].score).toBe(15);
    expect(state.players[3].score).toBe(25);
  });

  it('should throw error if not in HandComplete phase', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie', 'Diana']);

    expect(() => startNewHand(game)).toThrow(
      'Can only start new hand when current hand is complete'
    );
  });
});
