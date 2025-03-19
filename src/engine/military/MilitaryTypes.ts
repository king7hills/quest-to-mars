import { Epoch } from '../state/GameTypes';

export enum UnitType {
  WARRIOR = 'WARRIOR',
  SCOUT = 'SCOUT',
  ARCHER = 'ARCHER',
  CAVALRY = 'CAVALRY',
  INFANTRY = 'INFANTRY',
  ARTILLERY = 'ARTILLERY',
  TANK = 'TANK',
  AIRCRAFT = 'AIRCRAFT',
  SPACE_FIGHTER = 'SPACE_FIGHTER'
}

export enum MilitaryFormationType {
  SCATTERED = 'SCATTERED',
  LINE = 'LINE',
  SQUARE = 'SQUARE',
  CIRCLE = 'CIRCLE',
  WEDGE = 'WEDGE'
}

export interface UnitStats {
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  trainingTime: number;
  cost: ResourceCost;
  epoch: Epoch;
}

export interface Unit {
  id: string;
  type: UnitType;
  stats: UnitStats;
  currentHealth: number;
  experience: number;
  formation: MilitaryFormationType;
  position: string; // Hex coordinates
  owner: string; // Player ID
  isTraining: boolean;
  trainingProgress: number;
}

export interface Formation {
  id?: string;
  units: Unit[];
  formation: MilitaryFormationType;
  position: string;
  strength: number;
  morale: number;
}

export interface MilitaryStats {
  totalUnits: number;
  totalStrength: number;
  formations: Formation[];
  morale: number;
  militaryPower: number;
  trainingUnits: number;
  maxUnits: number;
}

export interface MilitaryConfig {
  maxUnitsPerEpoch: Record<Epoch, number>;
  baseTrainingSpeed: number;
  baseMorale: number;
  experienceGainRate: number;
  formationBonus: Record<MilitaryFormationType, {
    attack: number;
    defense: number;
    speed: number;
  }>;
}

export interface ResourceCost {
  food?: number;
  wood?: number;
  stone?: number;
  gold?: number;
  metal?: number;
  fuel?: number;
  techPoints?: number;
}

export interface CombatResult {
  attackerId: string;
  defenderId: string;
  damageDealt: number;
  experienceGained: number;
  defenderDestroyed: boolean;
} 