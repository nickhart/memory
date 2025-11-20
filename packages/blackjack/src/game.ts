import { createStandardDeck, shuffle } from '@memory/card-game-core';
import { GameState, GamePhase, BlackjackCard, PlayerAction, GameResult } from './types';
import { createEmptyHand, addCardToHand, evaluateHand } from './hand';

/**
 * Creates a shuffled blackjack deck
 */
export function createBlackjackDeck(): BlackjackCard[] {
  const baseDeck = createStandardDeck();
  const blackjackDeck: BlackjackCard[] = baseDeck.map((card) => ({
    ...card,
    isFaceUp: false,
    isHidden: false,
  }));

  return shuffle(blackjackDeck);
}

/**
 * Creates a new game state
 */
export function createGame(): GameState {
  return {
    phase: GamePhase.NotStarted,
    playerHand: createEmptyHand(),
    dealerHand: createEmptyHand(),
    deck: createBlackjackDeck(),
    result: null,
  };
}

/**
 * Deals initial cards (2 to player, 2 to dealer with one hidden)
 */
export function dealInitialCards(state: GameState): GameState {
  if (state.phase !== GamePhase.NotStarted) {
    throw new Error('Can only deal when game is not started');
  }

  const deck = [...state.deck];

  // Deal player's first card (face up)
  const playerCard1 = { ...deck.pop()!, isFaceUp: true, isHidden: false };
  // Deal dealer's first card (face up)
  const dealerCard1 = { ...deck.pop()!, isFaceUp: true, isHidden: false };
  // Deal player's second card (face up)
  const playerCard2 = { ...deck.pop()!, isFaceUp: true, isHidden: false };
  // Deal dealer's second card (face down/hidden)
  const dealerCard2 = { ...deck.pop()!, isFaceUp: false, isHidden: true };

  const playerHand = evaluateHand([playerCard1, playerCard2]);
  const dealerHand = evaluateHand([dealerCard1, dealerCard2]);

  // Check for blackjack
  let phase = GamePhase.PlayerTurn;
  let result: GameResult | null = null;

  if (playerHand.isBlackjack && dealerHand.isBlackjack) {
    // Both have blackjack - push
    phase = GamePhase.GameOver;
    result = GameResult.Push;
  } else if (playerHand.isBlackjack) {
    // Player blackjack wins
    phase = GamePhase.GameOver;
    result = GameResult.PlayerBlackjack;
  } else if (dealerHand.isBlackjack) {
    // Dealer blackjack wins
    phase = GamePhase.GameOver;
    result = GameResult.DealerWin;
  }

  return {
    ...state,
    phase,
    playerHand,
    dealerHand,
    deck,
    result,
  };
}

/**
 * Player hits (draws a card)
 */
export function hit(state: GameState): GameState {
  if (state.phase !== GamePhase.PlayerTurn) {
    throw new Error('Can only hit during player turn');
  }

  const deck = [...state.deck];
  const newCard = { ...deck.pop()!, isFaceUp: true, isHidden: false };
  const playerHand = addCardToHand(state.playerHand, newCard);

  // Check if player busts
  if (playerHand.isBust) {
    return {
      ...state,
      playerHand,
      deck,
      phase: GamePhase.GameOver,
      result: GameResult.DealerWin,
    };
  }

  return {
    ...state,
    playerHand,
    deck,
  };
}

/**
 * Player stands (ends turn, dealer plays)
 */
export function stand(state: GameState): GameState {
  if (state.phase !== GamePhase.PlayerTurn) {
    throw new Error('Can only stand during player turn');
  }

  // Reveal dealer's hidden card
  const dealerCards = state.dealerHand.cards.map((card) => ({
    ...card,
    isFaceUp: true,
    isHidden: false,
  }));

  let dealerHand = evaluateHand(dealerCards);
  const deck = [...state.deck];

  // Dealer hits until 17 or higher
  while (dealerHand.total < 17) {
    const newCard = { ...deck.pop()!, isFaceUp: true, isHidden: false };
    dealerHand = addCardToHand(dealerHand, newCard);
  }

  // Determine winner
  let result: GameResult;

  if (dealerHand.isBust) {
    result = GameResult.PlayerWin;
  } else if (state.playerHand.total > dealerHand.total) {
    result = GameResult.PlayerWin;
  } else if (dealerHand.total > state.playerHand.total) {
    result = GameResult.DealerWin;
  } else {
    result = GameResult.Push;
  }

  return {
    ...state,
    dealerHand,
    deck,
    phase: GamePhase.GameOver,
    result,
  };
}

/**
 * Performs a player action
 */
export function performAction(state: GameState, action: PlayerAction): GameState {
  switch (action) {
    case PlayerAction.Hit:
      return hit(state);
    case PlayerAction.Stand:
      return stand(state);
  }
}

/**
 * Gets the result message
 */
export function getResultMessage(result: GameResult | null): string {
  if (!result) return '';

  switch (result) {
    case GameResult.PlayerBlackjack:
      return 'Blackjack! You win!';
    case GameResult.PlayerWin:
      return 'You win!';
    case GameResult.DealerWin:
      return 'Dealer wins!';
    case GameResult.Push:
      return 'Push - tie game';
  }
}
