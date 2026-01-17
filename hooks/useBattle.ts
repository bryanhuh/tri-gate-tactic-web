import { useReducer, useMemo } from 'react';
import { gameReducer, initialState } from './useGame';
import { GameCharacter } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';
import { getRandomCharacter } from '@/lib/anilist-service';

const FALLBACK_WILDCARD: GameCharacter = {
    id: 9999,
    instanceId: 'fallback',
    name: "Unknown Reinforcement",
    image: "/assets/card.png",
    tier: "B",
    stats: { hp: 200, power: 150, defense: 100, speed: 100, skill: 50 }
};

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
    drawWildcard: async () => {
        // Fetch 2 random characters
        // We do this sequentially or parallel. Parallel is faster.
        const [c1, c2] = await Promise.all([
            getRandomCharacter().catch(() => null),
            getRandomCharacter().catch(() => null)
        ]);

        const w1 = c1 || { ...FALLBACK_WILDCARD, name: "Mystery Reinforcement A" };
        const w2 = c2 || { ...FALLBACK_WILDCARD, name: "Mystery Reinforcement B" };

        const wildcards = [
            { ...w1, instanceId: uuidv4() },
            { ...w2, instanceId: uuidv4() }
        ];
        dispatch({ type: 'DRAW_WILDCARD', payload: { wildcards } });
    },
    clearWildcardAlert: () => dispatch({ type: 'CLEAR_WILDCARD_ALERT' }),
    selectAttacker: (attacker: GameCharacter) => dispatch({ type: 'SELECT_ATTACKER', payload: { attacker } }),
    selectTarget: (target: GameCharacter) => dispatch({ type: 'SELECT_TARGET', payload: { target } }),
    attack: () => dispatch({ type: 'ATTACK' }),
    endTurn: () => dispatch({ type: 'END_TURN' }),
  }), [dispatch]);

  return { state, actions };
}