import { GameCharacter } from '@/types/game';

export type GamePhase = 'setup' |'character-selection' | 'battle' | 'game-over';
export type Turn = 'player' | 'opponent';

export interface PlayerState {
  hp: number;
  hand: GameCharacter[];
  field: (GameCharacter | null)[];
  deck: GameCharacter[];
  graveyard: GameCharacter[];
}

export interface GameState {
  phase: GamePhase;
  turn: Turn;
  player: PlayerState;
  opponent: PlayerState;
  selectedAttacker?: GameCharacter;
  selectedTarget?: GameCharacter;
}

export type BattleAction =
  | { type: 'SETUP_GAME'; payload: { playerDeck: GameCharacter[]; opponentDeck: GameCharacter[] } }
  | { type: 'START_BATTLE' }
  | { type: 'PLAY_CARD'; payload: { card: GameCharacter; position: number } }
  | { type: 'SELECT_ATTACKER'; payload: { attacker: GameCharacter } }
  | { type: 'SELECT_TARGET'; payload: { target: GameCharacter } }
  | { type: 'ATTACK' }
  | { type: 'END_TURN' }
  | { type: 'GAME_OVER' };
