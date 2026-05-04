import { GameState, BattleAction } from '@/app/types/battle';
import { GameCharacter } from '@/types/game';
import { MAX_PLAYER_HP } from '@/lib/gameConfig';

export const initialState: GameState = {
  phase: 'character-selection',
  turn: 'player',
  turnCount: 1,
  player: {
    hp: MAX_PLAYER_HP,
    hand: [],
    field: [null, null, null],
    deck: [],
    graveyard: [],
    lastSwapTurn: 0,
    wildcardUsed: false,
  },
  opponent: {
    hp: MAX_PLAYER_HP,
    hand: [],
    field: [null, null, null],
    deck: [],
    graveyard: [],
    lastSwapTurn: 0,
    wildcardUsed: false,
  },
  battleLog: [],
  wildcardAlert: null,
};

export function gameReducer(state: GameState, action: BattleAction): GameState {
  switch (action.type) {
    case 'SETUP_GAME': {
      const { playerDeck, opponentDeck } = action.payload;

      const playerField = [playerDeck[0], playerDeck[1], playerDeck[2]];
      const playerHand = playerDeck.slice(3, 5);

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
    case 'LOAD_GAME': {
      return action.payload.gameState;
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
        battleLog: ['Battle Started!'],
      };
    }
    case 'PLAY_CARD': {
      const { card, position } = action.payload;
      const isPlayer = state.turn === 'player';

      if (isPlayer) {
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
      } else {
        const newHand = state.opponent.hand.filter(c => c.instanceId !== card.instanceId);
        const newField = [...state.opponent.field];
        newField[position] = card;
        return {
          ...state,
          opponent: {
            ...state.opponent,
            hand: newHand,
            field: newField,
          },
        };
      }
    }
    case 'SWAP_CARDS': {
      const { handCard, fieldPosition } = action.payload;
      const isPlayer = state.turn === 'player';

      // Cooldown check
      const currentState = isPlayer ? state.player : state.opponent;
      const canSwap = state.turnCount >= 3 && (state.turnCount - currentState.lastSwapTurn) >= 3;

      if (!canSwap) {
        return {
          ...state,
          battleLog: [...state.battleLog, `Cannot swap yet! Wait for cooldown.`],
        };
      }

      if (isPlayer) {
        const fieldCard = state.player.field[fieldPosition];

        // Remove hand card
        const newHand = state.player.hand.filter(c => c.instanceId !== handCard.instanceId);

        // Add field card to hand if it exists
        if (fieldCard) {
          newHand.push(fieldCard);
        }

        // Place hand card on field
        const newField = [...state.player.field];
        newField[fieldPosition] = handCard;

        return {
          ...state,
          player: {
            ...state.player,
            hand: newHand,
            field: newField,
            lastSwapTurn: state.turnCount,
          },
          battleLog: [...state.battleLog, `Player swapped ${handCard.name} with ${fieldCard?.name || 'Empty Slot'}!`],
        };
      } else {
        // Opponent logic
        return state;
      }
    }
    case 'DRAW_WILDCARD': {
      const isPlayer = state.turn === 'player';

      if (isPlayer && state.player.wildcardUsed) return state;
      if (!isPlayer && state.opponent.wildcardUsed) return state;

      const { wildcards } = action.payload;

      if (isPlayer) {
        return {
          ...state,
          player: {
            ...state.player,
            hand: [...state.player.hand, ...wildcards],
            wildcardUsed: true,
          },
          wildcardAlert: "PLAYER",
          battleLog: [...state.battleLog, "A desperate prayer is answered! Two Heroes join your hand!"],
        };
      } else {
        return {
          ...state,
          opponent: {
            ...state.opponent,
            hand: [...state.opponent.hand, ...wildcards],
            wildcardUsed: true,
          },
          wildcardAlert: "OPPONENT",
          battleLog: [...state.battleLog, "The Opponent calls for reinforcements! New challengers approach!"],
        };
      }
    }
    case 'CLEAR_WILDCARD_ALERT': {
      return {
        ...state,
        wildcardAlert: null,
      }
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
      const damage = Math.max(1, attacker.stats.power - target.stats.defense);

      const newPlayer = { ...player };
      const newOpponent = { ...opponent };
      let logMessage = '';
      let phase = state.phase;

      // Check if target is in opponent's field (Player Attacking)
      const opponentTargetIndex = newOpponent.field.findIndex(c => c?.instanceId === target.instanceId);

      if (opponentTargetIndex !== -1) {
        // Handle damage to Opponent Card and Opponent HP
        const updatedTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - damage } };
        const newOpponentField = [...newOpponent.field];
        const newOpponentGraveyard = [...newOpponent.graveyard];

        newOpponent.hp -= damage;
        logMessage = `${attacker.name} dealt ${damage} damage to ${target.name}.`;

        if (updatedTarget.stats.hp <= 0) {
          newOpponentGraveyard.push(updatedTarget);
          newOpponentField[opponentTargetIndex] = null;
          logMessage += ` ${target.name} was defeated!`;
        } else {
          newOpponentField[opponentTargetIndex] = updatedTarget;
        }
        newOpponent.field = newOpponentField;
        newOpponent.graveyard = newOpponentGraveyard;

        // Mark only the attacker as hasAttacked (each card can attack once per turn)
        newPlayer.field = newPlayer.field.map(c =>
          c && c.instanceId === attacker.instanceId ? { ...c, hasAttacked: true } : c
        );

        if (newOpponent.hp <= 0) {
          logMessage += " Player wins the battle!";
          phase = 'game-over';
        }

      } else {
        // Check if target is in player's field (Opponent Attacking)
        const playerTargetIndex = newPlayer.field.findIndex(c => c?.instanceId === target.instanceId);

        if (playerTargetIndex !== -1) {
          // Handle damage to Player Card and Player HP
          const updatedTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - damage } };
          const newPlayerField = [...newPlayer.field];
          const newPlayerGraveyard = [...newPlayer.graveyard];

          newPlayer.hp -= damage;
          logMessage = `Opponent's ${attacker.name} dealt ${damage} damage to your ${target.name}.`;

          if (updatedTarget.stats.hp <= 0) {
            newPlayerGraveyard.push(updatedTarget);
            newPlayerField[playerTargetIndex] = null;
            logMessage += ` Your ${target.name} was defeated!`;
          } else {
            newPlayerField[playerTargetIndex] = updatedTarget;
          }
          newPlayer.field = newPlayerField;
          newPlayer.graveyard = newPlayerGraveyard;

          // Mark only the attacker as hasAttacked (each card can attack once per turn)
          newOpponent.field = newOpponent.field.map(c =>
            c && c.instanceId === attacker.instanceId ? { ...c, hasAttacked: true } : c
          );

          if (newPlayer.hp <= 0) {
            logMessage += " You lost the battle!";
            phase = 'game-over';
          }
        }
      }

      // Check for Card Wipeout (No cards on field AND empty hand)
      if (phase !== 'game-over') {
        const playerHasCards = newPlayer.field.some(c => c !== null) || newPlayer.hand.length > 0;
        const opponentHasCards = newOpponent.field.some(c => c !== null) || newOpponent.hand.length > 0;

        if (!playerHasCards) {
          if (!newPlayer.wildcardUsed) {
            logMessage += " You have no combatants left! Draw your Wildcard or accept defeat!";
          } else {
            logMessage += " You ran out of combatants! You Lost!";
            phase = 'game-over';
          }
        } else if (!opponentHasCards) {
          if (!newOpponent.wildcardUsed) {
            logMessage += " Opponent is cornered! They are drawing their Wildcard!";
          } else {
            logMessage += " Opponent ran out of combatants! You Win!";
            phase = 'game-over';
          }
        }
      }

      return {
        ...state,
        phase,
        player: newPlayer,
        opponent: newOpponent,
        selectedAttacker: undefined,
        selectedTarget: undefined,
        battleLog: [...state.battleLog, logMessage],
      };
    }

    case 'END_TURN': {
      const newPlayerField = state.player.field.map(c => c ? { ...c, hasAttacked: false } : null);
      const newOpponentField = state.opponent.field.map(c => c ? { ...c, hasAttacked: false } : null);

      const newTurn = state.turn === 'player' ? 'opponent' : 'player';
      const newTurnCount = newTurn === 'player' ? state.turnCount + 1 : state.turnCount;

      return {
        ...state,
        turn: newTurn,
        turnCount: newTurnCount,
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