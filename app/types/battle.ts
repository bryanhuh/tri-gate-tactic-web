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
  wildcardUsed: boolean;
}

export interface GameState {
  phase: GamePhase;
  turn: Turn;
  roundFirstTurn?: Turn;
  turnCount: number;
  player: PlayerState;
  opponent: PlayerState;
  selectedAttacker?: GameCharacter;
  selectedTarget?: GameCharacter;
  battleLog: string[];
  wildcardAlert: string | null; // Stores the name of who used it, or null
}

export type BattleAction =
  | { type: 'SETUP_GAME'; payload: { playerDeck: GameCharacter[]; opponentDeck: GameCharacter[] } }
  | { type: 'START_BATTLE' }
  | { type: 'PLAY_CARD'; payload: { card: GameCharacter; position: number } }
  | { type: 'SWAP_CARDS'; payload: { handCard: GameCharacter; fieldPosition: number } }
  | { type: 'DRAW_WILDCARD'; payload: { wildcards: GameCharacter[] } }
  | { type: 'CLEAR_WILDCARD_ALERT' }
  | { type: 'SELECT_ATTACKER'; payload: { attacker: GameCharacter | undefined } }
  | { type: 'SELECT_TARGET'; payload: { target: GameCharacter } }
  | { type: 'ATTACK' }
  | { type: 'END_TURN' }
  | { type: 'BEGIN_FIGHT' }
  | { type: 'GAME_OVER' }
  | { type: 'LOAD_GAME'; payload: { gameState: GameState } };
