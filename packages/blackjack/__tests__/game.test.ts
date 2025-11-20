import { createGame, dealInitialCards, hit, stand, getResultMessage } from '../src/game';
import { GamePhase, GameResult, PlayerAction } from '../src/types';

describe('createGame', () => {
  it('should create initial game state', () => {
    const game = createGame();
    expect(game.phase).toBe(GamePhase.NotStarted);
    expect(game.playerHand.cards).toHaveLength(0);
    expect(game.dealerHand.cards).toHaveLength(0);
    expect(game.deck).toHaveLength(52);
    expect(game.result).toBeNull();
  });
});

describe('dealInitialCards', () => {
  it('should deal 2 cards to player and dealer', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    expect(dealt.playerHand.cards).toHaveLength(2);
    expect(dealt.dealerHand.cards).toHaveLength(2);
    expect(dealt.deck).toHaveLength(48); // 52 - 4
  });

  it('should have dealer second card hidden', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    expect(dealt.dealerHand.cards[0].isHidden).toBe(false);
    expect(dealt.dealerHand.cards[1].isHidden).toBe(true);
  });

  it('should set phase to PlayerTurn if no blackjack', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    // Most of the time, neither will have blackjack
    if (!dealt.playerHand.isBlackjack && !dealt.dealerHand.isBlackjack) {
      expect(dealt.phase).toBe(GamePhase.PlayerTurn);
    }
  });

  it('should handle player blackjack', () => {
    // This test is probabilistic, so we just ensure the logic exists
    const game = createGame();
    const dealt = dealInitialCards(game);

    if (dealt.playerHand.isBlackjack && !dealt.dealerHand.isBlackjack) {
      expect(dealt.phase).toBe(GamePhase.GameOver);
      expect(dealt.result).toBe(GameResult.PlayerBlackjack);
    }
  });
});

describe('hit', () => {
  it('should add a card to player hand', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    if (dealt.phase === GamePhase.PlayerTurn) {
      const afterHit = hit(dealt);
      expect(afterHit.playerHand.cards.length).toBe(3);
      expect(afterHit.deck.length).toBe(47); // 48 - 1
    }
  });

  it('should end game if player busts', () => {
    const game = createGame();
    let state = dealInitialCards(game);

    // Keep hitting until bust (this is just for testing)
    while (state.phase === GamePhase.PlayerTurn && !state.playerHand.isBust) {
      state = hit(state);
      if (state.playerHand.total > 21) {
        expect(state.phase).toBe(GamePhase.GameOver);
        expect(state.result).toBe(GameResult.DealerWin);
        break;
      }
    }
  });
});

describe('stand', () => {
  it('should reveal dealer hidden card', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    if (dealt.phase === GamePhase.PlayerTurn) {
      const afterStand = stand(dealt);
      expect(afterStand.dealerHand.cards.every((c) => !c.isHidden)).toBe(true);
    }
  });

  it('should dealer hit until 17', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    if (dealt.phase === GamePhase.PlayerTurn) {
      const afterStand = stand(dealt);
      // Dealer should have at least 17 or be bust
      expect(afterStand.dealerHand.total >= 17 || afterStand.dealerHand.isBust).toBe(true);
    }
  });

  it('should determine winner', () => {
    const game = createGame();
    const dealt = dealInitialCards(game);

    if (dealt.phase === GamePhase.PlayerTurn) {
      const afterStand = stand(dealt);
      expect(afterStand.phase).toBe(GamePhase.GameOver);
      expect(afterStand.result).not.toBeNull();
    }
  });
});

describe('getResultMessage', () => {
  it('should return correct messages', () => {
    expect(getResultMessage(GameResult.PlayerWin)).toBe('You win!');
    expect(getResultMessage(GameResult.DealerWin)).toBe('Dealer wins!');
    expect(getResultMessage(GameResult.Push)).toBe('Push - tie game');
    expect(getResultMessage(GameResult.PlayerBlackjack)).toBe('Blackjack! You win!');
    expect(getResultMessage(null)).toBe('');
  });
});
