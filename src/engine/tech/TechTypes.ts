import { Epoch } from '../state/GameTypes';

export enum TechType {
  // Tribal Epoch
  BASIC_TOOLS = 'BASIC_TOOLS',
  STONE_WORKING = 'STONE_WORKING',
  BASIC_SHELTER = 'BASIC_SHELTER',

  // Agricultural Epoch
  AGRICULTURE = 'AGRICULTURE',
  IRRIGATION = 'IRRIGATION',
  ANIMAL_HUSBANDRY = 'ANIMAL_HUSBANDRY',

  // Industrial Epoch
  METALLURGY = 'METALLURGY',
  STEAM_POWER = 'STEAM_POWER',
  COMBUSTION = 'COMBUSTION',

  // Space Age Epoch
  ROCKETRY = 'ROCKETRY',
  SPACE_TECH = 'SPACE_TECH',
  LIFE_SUPPORT = 'LIFE_SUPPORT'
}

export interface TechEffect {
  type: 'PRODUCTION' | 'POPULATION' | 'UNLOCK';
  value: number;
  target: string;
}

export interface TechProperties {
  name: string;
  description: string;
  epoch: Epoch;
  cost: number;
  researchTime: number;
  prerequisites: TechType[];
  effects: TechEffect[];
  story?: string;
}

export const TECH_PROPERTIES: Record<TechType, TechProperties> = {
  // Tribal Epoch
  [TechType.BASIC_TOOLS]: {
    name: 'Basic Tools',
    description: 'Develop simple tools for resource gathering',
    epoch: Epoch.TRIBAL,
    cost: 50,
    researchTime: 5,
    prerequisites: [],
    effects: [{ type: 'PRODUCTION', value: 1.2, target: 'WOOD' }]
  },
  [TechType.STONE_WORKING]: {
    name: 'Stone Working',
    description: 'Learn to work with stone for better tools and buildings',
    epoch: Epoch.TRIBAL,
    cost: 100,
    researchTime: 10,
    prerequisites: [TechType.BASIC_TOOLS],
    effects: [{ type: 'PRODUCTION', value: 1.2, target: 'STONE' }]
  },
  [TechType.BASIC_SHELTER]: {
    name: 'Basic Shelter',
    description: 'Improve housing and protection from the elements',
    epoch: Epoch.TRIBAL,
    cost: 150,
    researchTime: 15,
    prerequisites: [TechType.BASIC_TOOLS],
    effects: [{ type: 'POPULATION', value: 1.2, target: 'GROWTH' }]
  },

  // Agricultural Epoch
  [TechType.AGRICULTURE]: {
    name: 'Agriculture',
    description: 'Learn to cultivate crops and domesticate animals',
    epoch: Epoch.AGRICULTURAL,
    cost: 200,
    researchTime: 20,
    prerequisites: [TechType.BASIC_TOOLS],
    effects: [{ type: 'PRODUCTION', value: 1.5, target: 'FOOD' }]
  },
  [TechType.IRRIGATION]: {
    name: 'Irrigation',
    description: 'Develop systems for efficient water management',
    epoch: Epoch.AGRICULTURAL,
    cost: 250,
    researchTime: 25,
    prerequisites: [TechType.AGRICULTURE],
    effects: [{ type: 'PRODUCTION', value: 1.3, target: 'FOOD' }]
  },
  [TechType.ANIMAL_HUSBANDRY]: {
    name: 'Animal Husbandry',
    description: 'Learn to breed and raise animals for food and labor',
    epoch: Epoch.AGRICULTURAL,
    cost: 300,
    researchTime: 30,
    prerequisites: [TechType.AGRICULTURE],
    effects: [{ type: 'PRODUCTION', value: 1.4, target: 'FOOD' }]
  },

  // Industrial Epoch
  [TechType.METALLURGY]: {
    name: 'Metallurgy',
    description: 'Learn to extract and work with metals',
    epoch: Epoch.INDUSTRIAL,
    cost: 400,
    researchTime: 40,
    prerequisites: [TechType.STONE_WORKING],
    effects: [{ type: 'PRODUCTION', value: 1.5, target: 'METAL' }]
  },
  [TechType.STEAM_POWER]: {
    name: 'Steam Power',
    description: 'Harness the power of steam for industrial production',
    epoch: Epoch.INDUSTRIAL,
    cost: 450,
    researchTime: 45,
    prerequisites: [TechType.METALLURGY],
    effects: [{ type: 'PRODUCTION', value: 1.3, target: 'ALL' }]
  },
  [TechType.COMBUSTION]: {
    name: 'Combustion',
    description: 'Learn to harness the power of combustion',
    epoch: Epoch.INDUSTRIAL,
    cost: 500,
    researchTime: 50,
    prerequisites: [TechType.STEAM_POWER],
    effects: [{ type: 'PRODUCTION', value: 1.5, target: 'FUEL' }]
  },

  // Space Age Epoch
  [TechType.ROCKETRY]: {
    name: 'Rocketry',
    description: 'Develop the fundamentals of rocket propulsion',
    epoch: Epoch.SPACE_AGE,
    cost: 600,
    researchTime: 60,
    prerequisites: [TechType.COMBUSTION],
    effects: [{ type: 'UNLOCK', value: 1, target: 'ROCKET' }]
  },
  [TechType.SPACE_TECH]: {
    name: 'Space Technology',
    description: 'Develop the technology needed for space travel',
    epoch: Epoch.SPACE_AGE,
    cost: 800,
    researchTime: 80,
    prerequisites: [TechType.ROCKETRY],
    effects: [{ type: 'UNLOCK', value: 1, target: 'SPACEPORT' }]
  },
  [TechType.LIFE_SUPPORT]: {
    name: 'Life Support Systems',
    description: 'Develop systems for sustaining life in space',
    epoch: Epoch.SPACE_AGE,
    cost: 700,
    researchTime: 70,
    prerequisites: [TechType.ROCKETRY],
    effects: [{ type: 'POPULATION', value: 1.2, target: 'SPACE' }]
  }
}; 