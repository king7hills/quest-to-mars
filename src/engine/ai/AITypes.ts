import { Epoch } from '../state/GameState';
import { GameResources } from '../state/GameState';

export enum AIPersonality {
  AGGRESSIVE = 'AGGRESSIVE',
  DIPLOMATIC = 'DIPLOMATIC',
  ISOLATIONIST = 'ISOLATIONIST',
  TRADER = 'TRADER'
}

export enum AIState {
  EXPLORING = 'EXPLORING',
  EXPANDING = 'EXPANDING',
  DEVELOPING = 'DEVELOPING',
  TRADING = 'TRADING',
  CONFLICT = 'CONFLICT',
  DEFENDING = 'DEFENDING'
}

export enum DiplomaticStatus {
  WAR = 'WAR',
  HOSTILE = 'HOSTILE',
  NEUTRAL = 'NEUTRAL',
  FRIENDLY = 'FRIENDLY',
  ALLIED = 'ALLIED'
}

export interface AIPlayer {
  id: string;
  name: string;
  personality: AIPersonality;
  state: AIState;
  epoch: Epoch;
  resources: GameResources;
  population: number;
  territory: Set<string>; // Set of hex coordinates
  diplomaticRelations: Map<string, DiplomaticStatus>; // Map of player ID to diplomatic status
  techProgress: number; // 0-100% progress through current epoch
  militaryStrength: number;
  economicStrength: number;
  researchSpeed: number;
  lastAction: number; // Turn number of last action
  actionCooldown: number; // Turns between actions
}

export interface AIDecision {
  type: 'BUILD' | 'RESEARCH' | 'DIPLOMACY' | 'MILITARY' | 'ECONOMY';
  target?: string; // Target hex, tech, or player ID
  priority: number; // 1-10 priority
  cost: number; // Estimated cost in resources
  expectedBenefit: number; // Expected benefit score
}

export interface AIPlayerConfig {
  id: string;
  name: string;
  personality: AIPersonality;
  startingPosition: { row: number; col: number };
  startingResources: Partial<GameResources>;
  startingPopulation: number;
  militaryAggression: number; // 0-1
  economicFocus: number; // 0-1
  researchFocus: number; // 0-1
  diplomaticTendency: number; // 0-1
} 