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
        const { selectedAttacker, selectedTarget, player, opponent } = state;
      
        if (!selectedAttacker || !selectedTarget) {
          return state;
        }
      
        const attacker = selectedAttacker;
        const target = selectedTarget;
        const damage = Math.max(0, attacker.stats.power - target.stats.defense);

        let newPlayer = { ...player };
        let newOpponent = { ...opponent };

        // Check if target is in opponent's field (Player Attacking)
        const opponentTargetIndex = newOpponent.field.findIndex(c => c?.instanceId === target.instanceId);
        
        if (opponentTargetIndex !== -1) {
             // Handle damage to Opponent Card
             const updatedTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - damage } };
             let newOpponentField = [...newOpponent.field];
             let newOpponentGraveyard = [...newOpponent.graveyard];

             if (updatedTarget.stats.hp <= 0) {
                 newOpponentGraveyard.push(updatedTarget);
                 newOpponentField[opponentTargetIndex] = null;
                 const overflowDamage = Math.abs(updatedTarget.stats.hp);
                 newOpponent.hp -= overflowDamage;
             } else {
                 newOpponentField[opponentTargetIndex] = updatedTarget;
             }
             newOpponent.field = newOpponentField;
             newOpponent.graveyard = newOpponentGraveyard;

             // Mark Player Attacker as hasAttacked
             newPlayer.field = newPlayer.field.map(c => 
                 c?.instanceId === attacker.instanceId ? { ...c, hasAttacked: true } : c
             );

        } else {
             // Check if target is in player's field (Opponent Attacking)
             const playerTargetIndex = newPlayer.field.findIndex(c => c?.instanceId === target.instanceId);
             
             if (playerTargetIndex !== -1) {
                 // Handle damage to Player Card
                 const updatedTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - damage } };
                 let newPlayerField = [...newPlayer.field];
                 let newPlayerGraveyard = [...newPlayer.graveyard];

                 if (updatedTarget.stats.hp <= 0) {
                     newPlayerGraveyard.push(updatedTarget);
                     newPlayerField[playerTargetIndex] = null;
                     const overflowDamage = Math.abs(updatedTarget.stats.hp);
                     newPlayer.hp -= overflowDamage;
                 } else {
                     newPlayerField[playerTargetIndex] = updatedTarget;
                 }
                 newPlayer.field = newPlayerField;
                 newPlayer.graveyard = newPlayerGraveyard;

                 // Mark Opponent Attacker as hasAttacked
                 newOpponent.field = newOpponent.field.map(c => 
                     c?.instanceId === attacker.instanceId ? { ...c, hasAttacked: true } : c
                 );
             }
        }
      
        return {
          ...state,
          player: newPlayer,
          opponent: newOpponent,
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
