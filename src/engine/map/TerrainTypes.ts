export enum TerrainType {
  GRASS = 'GRASS',
  FOREST = 'FOREST',
  MOUNTAIN = 'MOUNTAIN',
  WATER = 'WATER',
  DESERT = 'DESERT',
  TUNDRA = 'TUNDRA'
}

export interface TerrainProperties {
  color: number;
  height: number;
  walkable: boolean;
  resourcePotential: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    metal: number;
  };
  productionMultiplier: number;
}

export const TERRAIN_PROPERTIES: Record<TerrainType, TerrainProperties> = {
  [TerrainType.GRASS]: {
    color: 0x4CAF50,
    height: 0,
    walkable: true,
    resourcePotential: {
      food: 2,
      wood: 1,
      stone: 0,
      gold: 0,
      metal: 0
    },
    productionMultiplier: 1.0
  },
  [TerrainType.FOREST]: {
    color: 0x2E7D32,
    height: 0.2,
    walkable: true,
    resourcePotential: {
      food: 1,
      wood: 3,
      stone: 0,
      gold: 0,
      metal: 0
    },
    productionMultiplier: 0.8
  },
  [TerrainType.MOUNTAIN]: {
    color: 0x795548,
    height: 1.5,
    walkable: false,
    resourcePotential: {
      food: 0,
      wood: 0,
      stone: 3,
      gold: 1,
      metal: 2
    },
    productionMultiplier: 0.5
  },
  [TerrainType.WATER]: {
    color: 0x2196F3,
    height: -0.5,
    walkable: false,
    resourcePotential: {
      food: 1,
      wood: 0,
      stone: 0,
      gold: 0,
      metal: 0
    },
    productionMultiplier: 0.3
  },
  [TerrainType.DESERT]: {
    color: 0xFFC107,
    height: 0.3,
    walkable: true,
    resourcePotential: {
      food: 0,
      wood: 0,
      stone: 1,
      gold: 2,
      metal: 1
    },
    productionMultiplier: 0.6
  },
  [TerrainType.TUNDRA]: {
    color: 0xE0E0E0,
    height: 0.1,
    walkable: true,
    resourcePotential: {
      food: 0,
      wood: 0,
      stone: 1,
      gold: 0,
      metal: 0
    },
    productionMultiplier: 0.4
  }
}; 