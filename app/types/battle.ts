import { GameCharacter } from '@/types/game';

export type GamePhase = 'setup' |'character-selection' | 'reveal' | 'battle' | 'game-over';
export type Turn = 'player' | 'opponent';

export interface PlayerState {
  hp: number;
  hand: GameCharacter[];
  field: (GameCharacter | null)[];
  deck: GameCharacter[];
  graveyard: GameCharacter[];
  lastSwapTurn: number;
}

export interface GameState {
  phase: GamePhase;
  turn: Turn;
  turnCount: number;
  player: PlayerState;
  opponent: PlayerState;
  selectedAttacker?: GameCharacter;
  selectedTarget?: GameCharacter;
  battleLog: string[];
}

export type BattleAction =
  | { type: 'SETUP_GAME'; payload: { playerDeck: GameCharacter[]; opponentDeck: GameCharacter[] } }
  | { type: 'START_BATTLE' }
  | { type: 'PLAY_CARD'; payload: { card: GameCharacter; position: number } }
  | { type: 'SWAP_CARDS'; payload: { handCard: GameCharacter; fieldPosition: number } }
  | { type: 'SELECT_ATTACKER'; payload: { attacker: GameCharacter } }
  | { type: 'SELECT_TARGET'; payload: { target: GameCharacter } }
  | { type: 'ATTACK' }
  | { type: 'END_TURN' }
  | { type: 'BEGIN_FIGHT' }
  | { type: 'GAME_OVER' };