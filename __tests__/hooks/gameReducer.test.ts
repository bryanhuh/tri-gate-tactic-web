import { gameReducer, initialState } from '@/hooks/useGame';
import { GameState, BattleAction } from '@/app/types/battle';
import { GameCharacter } from '@/types/game';

const mockCharacter: GameCharacter = {
  id: 1,
  instanceId: 'char-1',
  name: 'Test Char',
  image: 'test.jpg',
  tier: 'B',
  stats: {
    hp: 100,
    power: 50,
    defense: 20,
    speed: 10,
    skill: 10,
  },
};

const weakCharacter: GameCharacter = {
    ...mockCharacter,
    instanceId: 'char-weak',
    name: 'Weak Char',
    stats: { ...mockCharacter.stats, hp: 10, defense: 0 }
};

const strongCharacter: GameCharacter = {
    ...mockCharacter,
    instanceId: 'char-strong',
    name: 'Strong Char',
    stats: { ...mockCharacter.stats, power: 100 }
};

describe('gameReducer', () => {
  it('should handle PLAY_CARD for player', () => {
    const startState: GameState = {
      ...initialState,
      turn: 'player',
      player: {
        ...initialState.player,
        hand: [mockCharacter],
        field: [null, null, null],
      },
    };

    const action: BattleAction = {
      type: 'PLAY_CARD',
      payload: { card: mockCharacter, position: 0 },
    };

    const newState = gameReducer(startState, action);

    expect(newState.player.hand).toHaveLength(0);
    expect(newState.player.field[0]).toEqual(mockCharacter);
  });

  it('should switch turns on END_TURN', () => {
    const startState: GameState = {
      ...initialState,
      turn: 'player',
      turnCount: 1,
    };

    const action: BattleAction = { type: 'END_TURN' };
    const newState = gameReducer(startState, action);

    expect(newState.turn).toBe('opponent');
    expect(newState.turnCount).toBe(1); // turn count increases when it goes back to player usually? 
    // Checking logic: const newTurnCount = newTurn === 'player' ? state.turnCount + 1 : state.turnCount;
    // So Player -> Opponent: count same. Opponent -> Player: count + 1.
  });

  it('should increment turn count when Opponent ends turn', () => {
      const startState: GameState = {
          ...initialState,
          turn: 'opponent',
          turnCount: 1,
      };

      const action: BattleAction = { type: 'END_TURN' };
      const newState = gameReducer(startState, action);

      expect(newState.turn).toBe('player');
      expect(newState.turnCount).toBe(2);
  });

  it('should calculate damage correctly on ATTACK', () => {
      // Player attacking Opponent
      const attacker = { ...strongCharacter }; // Power 100
      const target = { ...weakCharacter }; // HP 10, Def 0
      
      const startState: GameState = {
          ...initialState,
          turn: 'player',
          selectedAttacker: attacker,
          selectedTarget: target,
          player: {
              ...initialState.player,
              field: [attacker, null, null],
          },
          opponent: {
              ...initialState.opponent,
              hp: 1000,
              field: [target, null, null],
          },
      };

      const action: BattleAction = { type: 'ATTACK' };
      const newState = gameReducer(startState, action);
      
      const damage = attacker.stats.power - target.stats.defense; // 100 - 0 = 100
      
      expect(newState.opponent.hp).toBe(1000 - damage);
      // Target had 10 HP, took 100 dmg -> Should be dead
      expect(newState.opponent.field[0]).toBeNull();
      expect(newState.opponent.graveyard).toHaveLength(1);
  });

  it('should detect Game Over when HP reaches 0', () => {
      const attacker = { ...strongCharacter, stats: { ...strongCharacter.stats, power: 2000 } };
      const target = { ...weakCharacter };

      const startState: GameState = {
          ...initialState,
          turn: 'player',
          selectedAttacker: attacker,
          selectedTarget: target,
          player: { ...initialState.player, field: [attacker, null, null] },
          opponent: { ...initialState.opponent, hp: 100, field: [target, null, null] },
      };

      const action: BattleAction = { type: 'ATTACK' };
      const newState = gameReducer(startState, action);

      expect(newState.phase).toBe('game-over');
      expect(newState.opponent.hp).toBeLessThanOrEqual(0);
  });

  it('should load saved game state on LOAD_GAME', () => {
      const savedState: GameState = {
          ...initialState,
          phase: 'battle',
          turn: 'opponent',
          turnCount: 5,
          player: { ...initialState.player, hp: 500 },
      };

      const action: BattleAction = { 
          type: 'LOAD_GAME', 
          payload: { gameState: savedState } 
      };
      
      const newState = gameReducer(initialState, action);

      expect(newState).toEqual(savedState);
      expect(newState.turnCount).toBe(5);
      expect(newState.player.hp).toBe(500);
  });
});
