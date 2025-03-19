import { UnitType, UnitStats } from './MilitaryTypes';
import { Epoch } from '../state/GameTypes';

const createDefaultUnitStats = (name: string, epoch: Epoch): UnitStats => ({
  name,
  health: 100,
  attack: 10,
  defense: 5,
  speed: 3,
  range: 1,
  trainingTime: 5,
  cost: {
    food: 50,
    wood: 20,
    stone: 10
  },
  epoch
});

export const UNIT_CONFIGS: Record<Epoch, Record<UnitType, UnitStats>> = {
  [Epoch.TRIBAL]: {
    [UnitType.WARRIOR]: {
      name: 'Warrior',
      health: 100,
      attack: 10,
      defense: 5,
      speed: 3,
      range: 1,
      trainingTime: 5,
      cost: {
        food: 50,
        wood: 20,
        stone: 10
      },
      epoch: Epoch.TRIBAL
    },
    [UnitType.SCOUT]: {
      name: 'Scout',
      health: 60,
      attack: 5,
      defense: 3,
      speed: 5,
      range: 2,
      trainingTime: 3,
      cost: {
        food: 30,
        wood: 15,
        stone: 5
      },
      epoch: Epoch.TRIBAL
    },
    [UnitType.ARCHER]: createDefaultUnitStats('Archer', Epoch.TRIBAL),
    [UnitType.CAVALRY]: createDefaultUnitStats('Cavalry', Epoch.TRIBAL),
    [UnitType.INFANTRY]: createDefaultUnitStats('Infantry', Epoch.TRIBAL),
    [UnitType.ARTILLERY]: createDefaultUnitStats('Artillery', Epoch.TRIBAL),
    [UnitType.TANK]: createDefaultUnitStats('Tank', Epoch.TRIBAL),
    [UnitType.AIRCRAFT]: createDefaultUnitStats('Aircraft', Epoch.TRIBAL),
    [UnitType.SPACE_FIGHTER]: createDefaultUnitStats('Space Fighter', Epoch.TRIBAL)
  },
  [Epoch.AGRICULTURAL]: {
    [UnitType.WARRIOR]: {
      name: 'Trained Warrior',
      health: 120,
      attack: 15,
      defense: 8,
      speed: 3,
      range: 1,
      trainingTime: 6,
      cost: {
        food: 60,
        wood: 25,
        stone: 15,
        gold: 20
      },
      epoch: Epoch.AGRICULTURAL
    },
    [UnitType.SCOUT]: {
      name: 'Advanced Scout',
      health: 80,
      attack: 8,
      defense: 5,
      speed: 6,
      range: 2,
      trainingTime: 4,
      cost: {
        food: 40,
        wood: 20,
        stone: 10,
        gold: 15
      },
      epoch: Epoch.AGRICULTURAL
    },
    [UnitType.ARCHER]: {
      name: 'Archer',
      health: 70,
      attack: 12,
      defense: 4,
      speed: 4,
      range: 3,
      trainingTime: 5,
      cost: {
        food: 45,
        wood: 30,
        stone: 10,
        gold: 25
      },
      epoch: Epoch.AGRICULTURAL
    },
    [UnitType.CAVALRY]: createDefaultUnitStats('Cavalry', Epoch.AGRICULTURAL),
    [UnitType.INFANTRY]: createDefaultUnitStats('Infantry', Epoch.AGRICULTURAL),
    [UnitType.ARTILLERY]: createDefaultUnitStats('Artillery', Epoch.AGRICULTURAL),
    [UnitType.TANK]: createDefaultUnitStats('Tank', Epoch.AGRICULTURAL),
    [UnitType.AIRCRAFT]: createDefaultUnitStats('Aircraft', Epoch.AGRICULTURAL),
    [UnitType.SPACE_FIGHTER]: createDefaultUnitStats('Space Fighter', Epoch.AGRICULTURAL)
  },
  [Epoch.INDUSTRIAL]: {
    [UnitType.WARRIOR]: {
      name: 'Professional Soldier',
      health: 150,
      attack: 20,
      defense: 12,
      speed: 4,
      range: 1,
      trainingTime: 8,
      cost: {
        food: 80,
        wood: 30,
        stone: 20,
        gold: 50,
        metal: 30
      },
      epoch: Epoch.INDUSTRIAL
    },
    [UnitType.SCOUT]: {
      name: 'Mounted Scout',
      health: 100,
      attack: 12,
      defense: 8,
      speed: 7,
      range: 2,
      trainingTime: 6,
      cost: {
        food: 60,
        wood: 25,
        stone: 15,
        gold: 40,
        metal: 20
      },
      epoch: Epoch.INDUSTRIAL
    },
    [UnitType.ARCHER]: {
      name: 'Crossbowman',
      health: 90,
      attack: 18,
      defense: 6,
      speed: 4,
      range: 3,
      trainingTime: 7,
      cost: {
        food: 70,
        wood: 40,
        stone: 15,
        gold: 60,
        metal: 25
      },
      epoch: Epoch.INDUSTRIAL
    },
    [UnitType.CAVALRY]: {
      name: 'Cavalry',
      health: 130,
      attack: 25,
      defense: 10,
      speed: 8,
      range: 1,
      trainingTime: 10,
      cost: {
        food: 100,
        wood: 50,
        stone: 30,
        gold: 100,
        metal: 50
      },
      epoch: Epoch.INDUSTRIAL
    },
    [UnitType.INFANTRY]: createDefaultUnitStats('Infantry', Epoch.INDUSTRIAL),
    [UnitType.ARTILLERY]: createDefaultUnitStats('Artillery', Epoch.INDUSTRIAL),
    [UnitType.TANK]: createDefaultUnitStats('Tank', Epoch.INDUSTRIAL),
    [UnitType.AIRCRAFT]: createDefaultUnitStats('Aircraft', Epoch.INDUSTRIAL),
    [UnitType.SPACE_FIGHTER]: createDefaultUnitStats('Space Fighter', Epoch.INDUSTRIAL)
  },
  [Epoch.SPACE_AGE]: {
    [UnitType.WARRIOR]: {
      name: 'Space Marine',
      health: 200,
      attack: 30,
      defense: 20,
      speed: 5,
      range: 1,
      trainingTime: 12,
      cost: {
        food: 120,
        wood: 40,
        stone: 30,
        gold: 100,
        metal: 80,
        fuel: 50
      },
      epoch: Epoch.SPACE_AGE
    },
    [UnitType.SCOUT]: {
      name: 'Recon Drone',
      health: 80,
      attack: 15,
      defense: 10,
      speed: 10,
      range: 2,
      trainingTime: 8,
      cost: {
        food: 60,
        wood: 30,
        stone: 20,
        gold: 80,
        metal: 60,
        fuel: 30
      },
      epoch: Epoch.SPACE_AGE
    },
    [UnitType.ARCHER]: {
      name: 'Plasma Archer',
      health: 120,
      attack: 35,
      defense: 12,
      speed: 5,
      range: 3,
      trainingTime: 10,
      cost: {
        food: 90,
        wood: 50,
        stone: 25,
        gold: 120,
        metal: 70,
        fuel: 40
      },
      epoch: Epoch.SPACE_AGE
    },
    [UnitType.CAVALRY]: {
      name: 'Hover Cavalry',
      health: 180,
      attack: 40,
      defense: 15,
      speed: 12,
      range: 1,
      trainingTime: 15,
      cost: {
        food: 150,
        wood: 60,
        stone: 40,
        gold: 150,
        metal: 100,
        fuel: 80
      },
      epoch: Epoch.SPACE_AGE
    },
    [UnitType.INFANTRY]: createDefaultUnitStats('Infantry', Epoch.SPACE_AGE),
    [UnitType.ARTILLERY]: createDefaultUnitStats('Artillery', Epoch.SPACE_AGE),
    [UnitType.TANK]: createDefaultUnitStats('Tank', Epoch.SPACE_AGE),
    [UnitType.AIRCRAFT]: createDefaultUnitStats('Aircraft', Epoch.SPACE_AGE),
    [UnitType.SPACE_FIGHTER]: createDefaultUnitStats('Space Fighter', Epoch.SPACE_AGE)
  }
}; 