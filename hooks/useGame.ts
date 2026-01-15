import { GameState, BattleAction } from '@/app/types/battle';
import { GameCharacter } from '@/types/game';

export const initialState: GameState = {
  phase: 'character-selection',
  turn: 'player',
  player: {
    hp: 6900,
    hand: [],
    field: [null, null, null],
    deck: [],
    graveyard: [],
  },
  opponent: {
    hp: 6900,
    hand: [],
    field: [null, null, null],
    deck: [],
    graveyard: [],
  },
};

export function gameReducer(state: GameState, action: BattleAction): GameState {
  switch (action.type) {
    case 'SETUP_GAME': {
      const { playerDeck, opponentDeck } = action.payload;
      
      const playerField = [playerDeck[0], playerDeck[1], playerDeck[2]];
      const playerHand = playerDeck.slice(3, 5); // Assuming 5 cards total selected, so 2 in hand
      
      const opponentField = [opponentDeck[0], opponentDeck[1], opponentDeck[2]];
      const opponentHand = opponentDeck.slice(3, 5);

      return {
        ...initialState,
        phase: 'reveal',
        player: {
          ...initialState.player,
          deck: playerDeck,
          hand: playerHand,
          field: playerField,
        },
        opponent: {
          ...initialState.opponent,
          deck: opponentDeck,
          hand: opponentHand,
          field: opponentField,
        },
      };
    }
    case 'START_BATTLE': {
        return {
            ...state,
            phase: 'setup',
        }
    }
    case 'BEGIN_FIGHT': {
      return {
        ...state,
        phase: 'battle',
      };
    }
    case 'PLAY_CARD': {
      const { card, position } = action.payload;
      const newHand = state.player.hand.filter(c => c.instanceId !== card.instanceId);
      const newField = [...state.player.field];
      newField[position] = card;

      return {
        ...state,
        player: {
          ...state.player,
          hand: newHand,
          field: newField,
        },
      };
    }
    case 'SELECT_ATTACKER': {
        return {
          ...state,
          selectedAttacker: action.payload.attacker,
        };
      }
  
    case 'SELECT_TARGET': {
    return {
        ...state,
        selectedTarget: action.payload.target,
    };
    }
    case 'ATTACK': {
        let { selectedAttacker, selectedTarget, player, opponent } = state;
      
        if (!selectedAttacker || !selectedTarget) {
          return state; // No attacker or target selected
        }
      
        const attacker = selectedAttacker;
        const target = selectedTarget;
      
        const damage = Math.max(0, attacker.stats.power - target.stats.defense);
      
        // Update target's HP or player's HP if it's a direct attack
        let newOpponentHp = opponent.hp;
        let newOpponentField = [...opponent.field];
        let newOpponentGraveyard = [...opponent.graveyard];
      
        const targetIndex = newOpponentField.findIndex(c => c?.instanceId === target.instanceId);
      
        if (targetIndex !== -1) {
          const updatedTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - damage } };
      
          if (updatedTarget.stats.hp <= 0) {
            newOpponentGraveyard.push(updatedTarget);
            newOpponentField[targetIndex] = null;
            const overflowDamage = Math.abs(updatedTarget.stats.hp);
            newOpponentHp -= overflowDamage;
          } else {
            newOpponentField[targetIndex] = updatedTarget;
          }
        }
      
        // Reset hasAttacked for the next turn and update attacker
        const newPlayerField = player.field.map(c => 
          c ? { ...c, hasAttacked: c.instanceId === attacker.instanceId ? true : c.hasAttacked } : c
        );
      
        return {
          ...state,
          player: {
            ...player,
            field: newPlayerField,
          },
          opponent: {
            ...opponent,
            hp: newOpponentHp,
            field: newOpponentField,
            graveyard: newOpponentGraveyard,
          },
          selectedAttacker: undefined,
          selectedTarget: undefined,
        };
      }
      
    case 'END_TURN': {
      // Reset attack status for all characters on the field
      const newPlayerField = state.player.field.map(c => c ? { ...c, hasAttacked: false } : null);
      const newOpponentField = state.opponent.field.map(c => c ? { ...c, hasAttacked: false } : null);

      return {
        ...state,
        turn: state.turn === 'player' ? 'opponent' : 'player',
        player: {
          ...state.player,
          field: newPlayerField,
        },
        opponent: {
          ...state.opponent,
          field: newOpponentField,
        },
      };
    }
    default:
      return state;
  }
}
