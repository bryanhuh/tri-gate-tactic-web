export type Tier = 'S++' | 'S+' | 'S' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-';

export interface GameCharacter {
  id: number;
  instanceId: string;
  name: string;
  image: string;
  tier: Tier;
  stats: {
    hp: number;
    power: number;
    defense: number;
    speed: number;
    skill: number; // Used for crit chance/special effects
  };
  hasAttacked?: boolean;
  position?: string;
}