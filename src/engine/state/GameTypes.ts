export enum Epoch {
  TRIBAL = 'Tribal',
  AGRICULTURAL = 'Agricultural',
  INDUSTRIAL = 'Industrial',
  SPACE_AGE = 'Space Age'
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  color: string;
  territory: Set<string>;
}

export interface GameConfig {
  mapSize: {
    width: number;
    height: number;
  };
  startingResources: {
    food: number;
    wood: number;
    stone: number;
    metal: number;
    fuel: number;
    techPoints: number;
  };
  startingPopulation: number;
  aiPlayers: number;
} 