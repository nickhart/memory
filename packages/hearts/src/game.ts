import { createStandardDeck, shuffle, Rank, Suit } from '@memory/card-game-core';
import { GameState, GamePhase, HeartsCard, Player, PassDirection, Trick } from './types';
import { determineTrickWinner, isValidPlay, trickContainsHearts } from './trick';
import { applyScores } from './scoring';

/**
 * Create a shuffled Hearts deck
 */
export function createHeartsDeck(): HeartsCard[] {
  const baseDeck = createStandardDeck();
  const heartsDeck: HeartsCard[] = baseDeck.map((card) => ({
    ...card,
    isFaceUp: false,
  }));

  return shuffle(heartsDeck);
}

/**
 * Get the pass direction for a given hand number
 */
export function getPassDirection(handNumber: number): PassDirection {
  const directions = [
    PassDirection.Left,
    PassDirection.Right,
    PassDirection.Across,
    PassDirection.None,
  ];
  return directions[handNumber % 4];
}

/**
 * Create initial players
 */
function createPlayers(playerNames: string[]): Player[] {
  if (playerNames.length !== 4) {
    throw new Error('Hearts requires exactly 4 players');
  }

  return playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    hand: [],
    tricksTaken: [],
    score: 0,
    handScore: 0,
    selectedCards: [],
    isReady: false,
  }));
}

/**
 * Create a new Hearts game
 */
export function createGame(playerNames: string[]): GameState {
  const players = createPlayers(playerNames);
  const passDirection = getPassDirection(0);

  return {
    phase: GamePhase.Dealing,
    players,
    currentPlayerIndex: 0,
    currentTrick: {
      cards: [],
      leadingSuit: null,
      winnerId: null,
    },
    completedTricks: [],
    passDirection,
    heartsBroken: false,
    firstTrick: true,
    handNumber: 0,
    deck: createHeartsDeck(),
  };
}

/**
 * Deal cards to all players (13 cards each)
 */
export function dealCards(state: GameState): GameState {
  if (state.phase !== GamePhase.Dealing) {
    throw new Error('Can only deal when in dealing phase');
  }

  const deck = [...state.deck];
  const players = state.players.map((player) => ({
    ...player,
    hand: [] as HeartsCard[],
  }));

  // Deal 13 cards to each player
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 4; j++) {
      const card = deck.pop()!;
      players[j].hand.push({ ...card, isFaceUp: true });
    }
  }

  // Sort each player's hand by suit then rank
  players.forEach((player) => {
    player.hand.sort((a, b) => {
      if (a.suit !== b.suit) {
        // Sort by suit order: Clubs, Diamonds, Spades, Hearts
        const suitOrder = [Suit.Clubs, Suit.Diamonds, Suit.Spades, Suit.Hearts];
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      }
      // Within same suit, sort by rank
      const rankOrder = [
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
      ];
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
  });

  // Find who has 2 of clubs - they go first
  let starterIndex = 0;
  for (let i = 0; i < players.length; i++) {
    const hasTwoOfClubs = players[i].hand.some((c) => c.rank === Rank.Two && c.suit === Suit.Clubs);
    if (hasTwoOfClubs) {
      starterIndex = i;
      break;
    }
  }

  // Determine next phase based on pass direction
  const nextPhase =
    state.passDirection === PassDirection.None ? GamePhase.Playing : GamePhase.Passing;

  return {
    ...state,
    players,
    currentPlayerIndex: starterIndex,
    deck,
    phase: nextPhase,
  };
}

/**
 * Select a card to pass during passing phase
 */
export function selectCardToPass(state: GameState, playerId: string, cardId: string): GameState {
  if (state.phase !== GamePhase.Passing) {
    throw new Error('Can only select cards during passing phase');
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }

  const player = state.players[playerIndex];
  const cardExists = player.hand.some((c) => c.id === cardId);
  if (!cardExists) {
    throw new Error('Card not in player hand');
  }

  const alreadySelected = player.selectedCards.includes(cardId);
  let selectedCards: string[];

  if (alreadySelected) {
    // Deselect the card
    selectedCards = player.selectedCards.filter((id) => id !== cardId);
  } else {
    // Can only select 3 cards
    if (player.selectedCards.length >= 3) {
      throw new Error('Can only select 3 cards to pass');
    }
    selectedCards = [...player.selectedCards, cardId];
  }

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...player,
    selectedCards,
    isReady: selectedCards.length === 3,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}

/**
 * Execute the pass - exchange cards between players
 */
export function executePass(state: GameState): GameState {
  if (state.phase !== GamePhase.Passing) {
    throw new Error('Can only pass during passing phase');
  }

  // Check all players are ready
  if (!state.players.every((p) => p.isReady)) {
    throw new Error('Not all players are ready to pass');
  }

  // Determine which player sends cards to this player
  const getSender = (index: number): number => {
    switch (state.passDirection) {
      case PassDirection.Left:
        // I receive from the right (player - 1)
        return (index + 3) % 4;
      case PassDirection.Right:
        // I receive from the left (player + 1)
        return (index + 1) % 4;
      case PassDirection.Across:
        // I receive from across (player + 2)
        return (index + 2) % 4;
      default:
        return index;
    }
  };

  // Collect cards to pass from each player
  const passedCards: HeartsCard[][] = state.players.map((player) => {
    return player.selectedCards.map((cardId) => {
      const card = player.hand.find((c) => c.id === cardId)!;
      return card;
    });
  });

  // Update players with passed cards
  const updatedPlayers = state.players.map((player, index) => {
    // Remove cards being passed
    const newHand = player.hand.filter((c) => !player.selectedCards.includes(c.id));

    // Add received cards from the sender
    const senderIndex = getSender(index);
    const receivedCards = passedCards[senderIndex];
    newHand.push(...receivedCards);

    // Sort hand
    newHand.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = [Suit.Clubs, Suit.Diamonds, Suit.Spades, Suit.Hearts];
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      }
      const rankOrder = [
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
      ];
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });

    return {
      ...player,
      hand: newHand,
      selectedCards: [],
      isReady: false,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    phase: GamePhase.Playing,
  };
}

/**
 * Play a card
 */
export function playCard(state: GameState, playerId: string, cardId: string): GameState {
  if (state.phase !== GamePhase.Playing) {
    throw new Error('Can only play cards during playing phase');
  }

  // Verify it's the player's turn
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error('Not your turn');
  }

  // Find the card
  const card = currentPlayer.hand.find((c) => c.id === cardId);
  if (!card) {
    throw new Error('Card not in hand');
  }

  // Validate the play
  if (!isValidPlay(state, playerId, card)) {
    throw new Error('Invalid play');
  }

  // Remove card from player's hand
  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentPlayerIndex] = {
    ...currentPlayer,
    hand: currentPlayer.hand.filter((c) => c.id !== cardId),
  };

  // Add card to current trick
  const currentTrick: Trick = {
    ...state.currentTrick,
    cards: [...state.currentTrick.cards, { playerId, card }],
    leadingSuit: state.currentTrick.leadingSuit || card.suit,
  };

  // Check if hearts was played (for breaking hearts)
  const heartsBroken = state.heartsBroken || trickContainsHearts(currentTrick);

  // Move to next player
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % 4;

  return {
    ...state,
    players: updatedPlayers,
    currentTrick,
    currentPlayerIndex: nextPlayerIndex,
    heartsBroken,
  };
}

/**
 * Complete the current trick and move to next trick or end hand
 */
export function completeTrick(state: GameState): GameState {
  if (state.currentTrick.cards.length !== 4) {
    throw new Error('Trick is not complete');
  }

  // Determine winner
  const winnerId = determineTrickWinner(state.currentTrick);
  if (!winnerId) {
    throw new Error('Could not determine trick winner');
  }

  const completedTrick: Trick = {
    ...state.currentTrick,
    winnerId,
  };

  // Add trick to winner's taken tricks
  const updatedPlayers = state.players.map((player) => {
    if (player.id === winnerId) {
      const trickCards = completedTrick.cards.map((c) => c.card);
      return {
        ...player,
        tricksTaken: [...player.tricksTaken, trickCards],
      };
    }
    return player;
  });

  // Winner leads next trick
  const winnerIndex = updatedPlayers.findIndex((p) => p.id === winnerId);

  // Check if hand is over (all 13 tricks played)
  const completedTricks = [...state.completedTricks, completedTrick];
  const handOver = completedTricks.length === 13;

  if (handOver) {
    // Apply scores and check for game over
    const stateWithScores = applyScores({
      ...state,
      players: updatedPlayers,
      completedTricks,
    });

    return stateWithScores;
  }

  // Start next trick
  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: winnerIndex,
    currentTrick: {
      cards: [],
      leadingSuit: null,
      winnerId: null,
    },
    completedTricks,
    firstTrick: false, // First trick is over after the first trick completes
  };
}

/**
 * Start a new hand
 */
export function startNewHand(state: GameState): GameState {
  if (state.phase !== GamePhase.HandComplete) {
    throw new Error('Can only start new hand when current hand is complete');
  }

  const handNumber = state.handNumber + 1;
  const passDirection = getPassDirection(handNumber);

  // Reset players for new hand
  const players = state.players.map((player) => ({
    ...player,
    hand: [],
    tricksTaken: [],
    handScore: 0,
    selectedCards: [],
    isReady: false,
  }));

  return {
    ...state,
    phase: GamePhase.Dealing,
    players,
    currentPlayerIndex: 0,
    currentTrick: {
      cards: [],
      leadingSuit: null,
      winnerId: null,
    },
    completedTricks: [],
    passDirection,
    heartsBroken: false,
    firstTrick: true,
    handNumber,
    deck: createHeartsDeck(),
  };
}
