import { Epoch } from '../state/GameTypes';

export enum BuildingType {
  // Tribal Epoch
  HUT = 'HUT',
  CAMPFIRE = 'CAMPFIRE',
  BASIC_DEFENSE = 'BASIC_DEFENSE',

  // Agricultural Epoch
  FARM = 'FARM',
  BARN = 'BARN',
  MINE = 'MINE',
  WORKSHOP = 'WORKSHOP',

  // Industrial Epoch
  FACTORY = 'FACTORY',
  ADVANCED_MINE = 'ADVANCED_MINE',
  POWER_PLANT = 'POWER_PLANT',

  // Space Age Epoch
  RESEARCH_LAB = 'RESEARCH_LAB',
  SPACEPORT = 'SPACEPORT',
  ENERGY_GRID = 'ENERGY_GRID'
}

export interface BuildingProperties {
  name: string;
  epoch: Epoch;
  cost: {
    wood: number;
    stone: number;
    gold?: number;
    metal?: number;
  };
  production: {
    food?: number;
    wood?: number;
    stone?: number;
    gold?: number;
    metal?: number;
    techPoints?: number;
  };
  population: number;
  health: number;
  constructionTime: number;
  color: number;
  height: number;
}

export const BUILDING_PROPERTIES: Record<BuildingType, BuildingProperties> = {
  // Tribal Epoch
  [BuildingType.HUT]: {
    name: 'Hut',
    epoch: Epoch.TRIBAL,
    cost: { wood: 20, stone: 10 },
    production: {},
    population: 5,
    health: 100,
    constructionTime: 3,
    color: 0x8B4513,
    height: 0.5
  },
  [BuildingType.CAMPFIRE]: {
    name: 'Campfire',
    epoch: Epoch.TRIBAL,
    cost: { wood: 10, stone: 5 },
    production: { food: 2 },
    population: 2,
    health: 50,
    constructionTime: 1,
    color: 0xFF4500,
    height: 0.2
  },
  [BuildingType.BASIC_DEFENSE]: {
    name: 'Basic Defense',
    epoch: Epoch.TRIBAL,
    cost: { wood: 15, stone: 20 },
    production: {},
    population: 0,
    health: 200,
    constructionTime: 2,
    color: 0x808080,
    height: 0.3
  },

  // Agricultural Epoch
  [BuildingType.FARM]: {
    name: 'Farm',
    epoch: Epoch.AGRICULTURAL,
    cost: { wood: 30, stone: 20, gold: 50 },
    production: { food: 5 },
    population: 3,
    health: 80,
    constructionTime: 4,
    color: 0x228B22,
    height: 0.4
  },
  [BuildingType.BARN]: {
    name: 'Barn',
    epoch: Epoch.AGRICULTURAL,
    cost: { wood: 40, stone: 30, gold: 100 },
    production: {},
    population: 2,
    health: 150,
    constructionTime: 5,
    color: 0x8B4513,
    height: 0.6
  },
  [BuildingType.MINE]: {
    name: 'Mine',
    epoch: Epoch.AGRICULTURAL,
    cost: { wood: 50, stone: 40, gold: 150 },
    production: { stone: 3, gold: 1 },
    population: 4,
    health: 120,
    constructionTime: 6,
    color: 0x696969,
    height: 0.5
  },
  [BuildingType.WORKSHOP]: {
    name: 'Workshop',
    epoch: Epoch.AGRICULTURAL,
    cost: { wood: 60, stone: 50, gold: 200 },
    production: { techPoints: 1 },
    population: 3,
    health: 100,
    constructionTime: 7,
    color: 0xCD853F,
    height: 0.5
  },

  // Industrial Epoch
  [BuildingType.FACTORY]: {
    name: 'Factory',
    epoch: Epoch.INDUSTRIAL,
    cost: { wood: 100, stone: 80, gold: 500, metal: 200 },
    production: { metal: 5, techPoints: 2 },
    population: 8,
    health: 200,
    constructionTime: 10,
    color: 0x4A4A4A,
    height: 0.8
  },
  [BuildingType.ADVANCED_MINE]: {
    name: 'Advanced Mine',
    epoch: Epoch.INDUSTRIAL,
    cost: { wood: 120, stone: 100, gold: 600, metal: 150 },
    production: { stone: 8, gold: 3, metal: 4 },
    population: 10,
    health: 250,
    constructionTime: 12,
    color: 0x2F4F4F,
    height: 0.7
  },
  [BuildingType.POWER_PLANT]: {
    name: 'Power Plant',
    epoch: Epoch.INDUSTRIAL,
    cost: { wood: 150, stone: 120, gold: 800, metal: 300 },
    production: { techPoints: 3 },
    population: 6,
    health: 300,
    constructionTime: 15,
    color: 0xFFD700,
    height: 0.9
  },

  // Space Age Epoch
  [BuildingType.RESEARCH_LAB]: {
    name: 'Research Lab',
    epoch: Epoch.SPACE_AGE,
    cost: { wood: 200, stone: 150, gold: 1000, metal: 400 },
    production: { techPoints: 5 },
    population: 12,
    health: 400,
    constructionTime: 20,
    color: 0x4169E1,
    height: 1.0
  },
  [BuildingType.SPACEPORT]: {
    name: 'Spaceport',
    epoch: Epoch.SPACE_AGE,
    cost: { wood: 500, stone: 400, gold: 5000, metal: 2000 },
    production: {},
    population: 20,
    health: 1000,
    constructionTime: 50,
    color: 0x1E90FF,
    height: 2.0
  },
  [BuildingType.ENERGY_GRID]: {
    name: 'Energy Grid',
    epoch: Epoch.SPACE_AGE,
    cost: { wood: 300, stone: 200, gold: 2000, metal: 800 },
    production: { techPoints: 8 },
    population: 15,
    health: 500,
    constructionTime: 25,
    color: 0x00CED1,
    height: 0.6
  }
}; 