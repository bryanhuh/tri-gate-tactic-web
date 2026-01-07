
import { useReducer, useCallback } from 'react';
import { getCharacterDeck } from '@/lib/anilist-service';
import type { GameCharacter } from '@/types/game';

type GameState = {
  playerDeck: GameCharacter[];
  opponentDeck: GameCharacter[];
  playerCard: GameCharacter | null;
  opponentCard: GameCharacter | null;
  playerScore: number;
  opponentScore: number;
  gameStatus: 'initial' | 'loading' | 'playing' | 'round-result' | 'game-over';
  roundWinner: 'player' | 'opponent' | 'tie' | null;
  gameWinner: 'player' | 'opponent' | null;
};

type GameAction =
  | { type: 'START_GAME'; payload: { playerDeck: GameCharacter[]; opponentDeck: GameCharacter[] } }
  | { type: 'PLAY_ROUND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LOADING' };

const initialState: GameState = {
  playerDeck: [],
  opponentDeck: [],
  playerCard: null,
  opponentCard: null,
  playerScore: 0,
  opponentScore: 0,
  gameStatus: 'initial',
  roundWinner: null,
  gameWinner: null,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, gameStatus: 'loading' };
    case 'START_GAME':
      return {
        ...initialState,
        playerDeck: action.payload.playerDeck,
        opponentDeck: action.payload.opponentDeck,
        gameStatus: 'playing',
      };
    case 'PLAY_ROUND': {
      if (state.playerDeck.length === 0 || state.opponentDeck.length === 0) {
        return { ...state, gameStatus: 'game-over' };
      }

      const [playerCard, ...restPlayerDeck] = state.playerDeck;
      const [opponentCard, ...restOpponentDeck] = state.opponentDeck;

      let roundWinner: 'player' | 'opponent' | 'tie';
      let playerScore = state.playerScore;
      let opponentScore = state.opponentScore;

      if (playerCard.stats.power > opponentCard.stats.power) {
        roundWinner = 'player';
        playerScore++;
      } else if (opponentCard.stats.power > playerCard.stats.power) {
        roundWinner = 'opponent';
        opponentScore++;
      } else {
        roundWinner = 'tie';
      }

      const gameWinner = playerScore === 3 ? 'player' : opponentScore === 3 ? 'opponent' : null;

      return {
        ...state,
        playerDeck: restPlayerDeck,
        opponentDeck: restOpponentDeck,
        playerCard,
        opponentCard,
        playerScore,
        opponentScore,
        roundWinner,
        gameStatus: gameWinner ? 'game-over' : 'round-result',
        gameWinner,
      };
    }
    case 'NEXT_ROUND':
        return {
            ...state,
            playerCard: null,
            opponentCard: null,
            roundWinner: null,
            gameStatus: 'playing',
        };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
};

export const useGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(async () => {
    console.log('[useGame.ts] startGame called');
    dispatch({ type: 'SET_LOADING' });
    const deck = await getCharacterDeck(10);
    // shuffle and split the deck for player and opponent
    const shuffled = deck.sort(() => 0.5 - Math.random());
    const playerDeck = shuffled.slice(0, 5);
    const opponentDeck = shuffled.slice(5, 10);
    dispatch({ type: 'START_GAME', payload: { playerDeck, opponentDeck } });
  }, []);

  const playRound = useCallback(() => {
    dispatch({ type: 'PLAY_ROUND' });
  }, []);

  const nextRound = useCallback(() => {
    if (state.gameStatus === 'round-result') {
      dispatch({ type: 'NEXT_ROUND' });
    }
  }, [state.gameStatus]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    startGame,
    playRound,
    nextRound,
    resetGame,
  };
};
