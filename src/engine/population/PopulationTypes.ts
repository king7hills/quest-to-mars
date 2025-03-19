export enum PopulationRole {
  FARMER = 'FARMER',
  BUILDER = 'BUILDER',
  SCIENTIST = 'SCIENTIST',
  MERCHANT = 'MERCHANT',
  MILITARY = 'MILITARY',
  EXPLORER = 'EXPLORER',
  UNASSIGNED = 'UNASSIGNED'
}

export interface PopulationAssignment {
  role: PopulationRole;
  count: number;
  location?: string; // Hex coordinates or building ID
  efficiency: number;
}

export interface PopulationStats {
  total: number;
  growthRate: number;
  health: number;
  happiness: number;
  assignments: Map<PopulationRole, PopulationAssignment>;
  unassigned: number;
}

export interface PopulationConfig {
  startingPopulation: number;
  baseGrowthRate: number;
  baseHealth: number;
  baseHappiness: number;
  foodConsumptionPerPerson: number;
  housingRequirementPerPerson: number;
}

export interface PopulationEffects {
  foodProduction: number;
  researchProduction: number;
  goldProduction: number;
  militaryStrength: number;
  buildingSpeed: number;
  explorationSpeed: number;
} 