export type Tier = 'S+' | 'S' | 'A+' | 'A' | 'A-';

export interface GameCharacter {
  id: number;
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
}