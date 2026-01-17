import { useReducer, useMemo } from 'react';
import { gameReducer, initialState } from './useGame';
import { GameCharacter } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

export function useBattle() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = useMemo(() => ({
    setupGame: (playerDeck: GameCharacter[], opponentDeck: GameCharacter[]) => {
      const playerDeckWithIds = playerDeck.map(c => ({ ...c, instanceId: uuidv4() }));
      const opponentDeckWithIds = opponentDeck.map(c => ({ ...c, instanceId: uuidv4() }));
      dispatch({ type: 'SETUP_GAME', payload: { playerDeck: playerDeckWithIds, opponentDeck: opponentDeckWithIds } });
    },
    startBattle: () => dispatch({ type: 'START_BATTLE' }),
    beginFight: () => dispatch({ type: 'BEGIN_FIGHT' }),
    playCard: (card: GameCharacter, position: number) => dispatch({ type: 'PLAY_CARD', payload: { card, position } }),
    swapCard: (handCard: GameCharacter, fieldPosition: number) => dispatch({ type: 'SWAP_CARDS', payload: { handCard, fieldPosition } }),
    selectAttacker: (attacker: GameCharacter) => dispatch({ type: 'SELECT_ATTACKER', payload: { attacker } }),
    selectTarget: (target: GameCharacter) => dispatch({ type: 'SELECT_TARGET', payload: { target } }),
    attack: () => dispatch({ type: 'ATTACK' }),
    endTurn: () => dispatch({ type: 'END_TURN' }),
  }), [dispatch]);

  return { state, actions };
}
