import { AIPlayer } from './AIPlayer';
import { DiplomaticStatus } from './AITypes';
import { GameResources } from '../state/GameState';
import { ResourceType, Resource } from '../state/ResourceTypes';

export interface DiplomaticEvent {
  id: string;
  type: DiplomaticEventType;
  source: string;
  target: string;
  status: DiplomaticStatus;
  cost: Partial<GameResources>;
  duration: number;
  effects: DiplomaticEventEffect[];
  description: string;
}

export enum DiplomaticEventType {
  TRADE_AGREEMENT = 'TRADE_AGREEMENT',
  RESEARCH_PACT = 'RESEARCH_PACT',
  MILITARY_ALLIANCE = 'MILITARY_ALLIANCE',
  RESOURCE_SHARING = 'RESOURCE_SHARING',
  PEACE_TREATY = 'PEACE_TREATY',
  NON_AGGRESSION_PACT = 'NON_AGGRESSION_PACT',
  CULTURAL_EXCHANGE = 'CULTURAL_EXCHANGE',
  JOINT_EXPLORATION = 'JOINT_EXPLORATION'
}

export interface DiplomaticEventEffect {
  type: DiplomaticEffectType;
  value: number;
  duration: number;
  description: string;
}

export enum DiplomaticEffectType {
  TRADE_AGREEMENT = 'TRADE_AGREEMENT',
  RESEARCH_PACT = 'RESEARCH_PACT',
  MILITARY_ALLIANCE = 'MILITARY_ALLIANCE',
  RESOURCE_SHARING = 'RESOURCE_SHARING',
  PEACE_TREATY = 'PEACE_TREATY',
  NON_AGGRESSION_PACT = 'NON_AGGRESSION_PACT',
  CULTURAL_EXCHANGE = 'CULTURAL_EXCHANGE',
  JOINT_EXPLORATION = 'JOINT_EXPLORATION',
  RESEARCH_SPEED = 'RESEARCH_SPEED',
  ECONOMIC_STRENGTH = 'ECONOMIC_STRENGTH',
  MILITARY_STRENGTH = 'MILITARY_STRENGTH',
  POPULATION_GROWTH = 'POPULATION_GROWTH',
  RESOURCE_PRODUCTION = 'RESOURCE_PRODUCTION',
  EXPLORATION_SPEED = 'EXPLORATION_SPEED'
}

export class DiplomaticEventManager {
  private events: Map<string, DiplomaticEvent>;
  private activeEffects: Map<string, DiplomaticEventEffect[]>;

  constructor() {
    this.events = new Map();
    this.activeEffects = new Map();
  }

  public createEvent(
    type: DiplomaticEventType,
    source: AIPlayer,
    target: AIPlayer,
    status: DiplomaticStatus
  ): DiplomaticEvent | null {
    // Check if event is valid for current diplomatic status
    if (!this.isValidEventForStatus(type, status)) {
      return null;
    }

    // Generate event properties based on type
    const event = this.generateEventProperties(type, source, target, status);
    if (!event) return null;

    // Check if players can afford the event
    if (!this.canAffordEvent(event, source)) {
      return null;
    }

    // Store the event
    this.events.set(event.id, event);
    return event;
  }

  public executeEvent(event: DiplomaticEvent, source: AIPlayer, target: AIPlayer): void {
    // Deduct resources from source
    this.deductEventCost(event, source);

    // Apply effects to both players
    this.applyEventEffects(event, source);
    this.applyEventEffects(event, target);

    // Update diplomatic status
    source.setDiplomaticStatus(target.id, event.status);
    target.setDiplomaticStatus(source.id, event.status);
  }

  public updateEvents(): void {
    // Remove expired events
    const currentTime = Date.now();
    this.events.forEach((event, id) => {
      if (currentTime > event.duration) {
        this.events.delete(id);
      }
    });

    // Apply active event effects
    this.activeEffects.forEach((effects) => {
      // Apply each effect to the relevant player
      effects.forEach(effect => {
        this.applyEffect(effect);
      });
    });
  }

  public getActiveEffects(playerId: string): DiplomaticEventEffect[] {
    return this.activeEffects.get(playerId) || [];
  }

  private isValidEventForStatus(type: DiplomaticEventType, status: DiplomaticStatus): boolean {
    const validStatuses: Record<DiplomaticEventType, DiplomaticStatus[]> = {
      [DiplomaticEventType.TRADE_AGREEMENT]: [DiplomaticStatus.NEUTRAL, DiplomaticStatus.FRIENDLY],
      [DiplomaticEventType.RESEARCH_PACT]: [DiplomaticStatus.FRIENDLY],
      [DiplomaticEventType.MILITARY_ALLIANCE]: [DiplomaticStatus.ALLIED],
      [DiplomaticEventType.RESOURCE_SHARING]: [DiplomaticStatus.ALLIED],
      [DiplomaticEventType.PEACE_TREATY]: [DiplomaticStatus.WAR, DiplomaticStatus.HOSTILE],
      [DiplomaticEventType.NON_AGGRESSION_PACT]: [DiplomaticStatus.NEUTRAL],
      [DiplomaticEventType.CULTURAL_EXCHANGE]: [DiplomaticStatus.FRIENDLY],
      [DiplomaticEventType.JOINT_EXPLORATION]: [DiplomaticStatus.NEUTRAL, DiplomaticStatus.FRIENDLY]
    };

    return validStatuses[type].includes(status);
  }

  private generateEventProperties(
    type: DiplomaticEventType,
    source: AIPlayer,
    target: AIPlayer,
    status: DiplomaticStatus
  ): DiplomaticEvent | null {
    const eventProperties: Record<DiplomaticEventType, Partial<DiplomaticEvent>> = {
      [DiplomaticEventType.TRADE_AGREEMENT]: {
        cost: {
          gold: { 
            type: ResourceType.GOLD,
            amount: 10, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          food: { 
            type: ResourceType.FOOD,
            amount: 20, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 10,
        effects: [
          { type: DiplomaticEffectType.ECONOMIC_STRENGTH, value: 0.1, duration: 10, description: 'Increased economic strength from trade' }
        ],
        description: 'Establish trade routes between civilizations'
      },
      [DiplomaticEventType.RESEARCH_PACT]: {
        cost: {
          techPoints: { 
            type: ResourceType.TECH_POINTS,
            amount: 15, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          gold: { 
            type: ResourceType.GOLD,
            amount: 20, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 15,
        effects: [
          { type: DiplomaticEffectType.RESEARCH_SPEED, value: 0.15, duration: 15, description: 'Faster research through knowledge sharing' }
        ],
        description: 'Share knowledge and research findings'
      },
      [DiplomaticEventType.MILITARY_ALLIANCE]: {
        cost: {
          metal: { 
            type: ResourceType.METAL,
            amount: 30, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          food: { 
            type: ResourceType.FOOD,
            amount: 40, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 20,
        effects: [
          { type: DiplomaticEffectType.MILITARY_STRENGTH, value: 0.2, duration: 20, description: 'Enhanced military capabilities through alliance' }
        ],
        description: 'Form a military alliance for mutual defense'
      },
      [DiplomaticEventType.RESOURCE_SHARING]: {
        cost: {
          food: { 
            type: ResourceType.FOOD,
            amount: 30, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          wood: { 
            type: ResourceType.WOOD,
            amount: 20, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          stone: { 
            type: ResourceType.STONE,
            amount: 15, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 12,
        effects: [
          { type: DiplomaticEffectType.RESOURCE_PRODUCTION, value: 0.1, duration: 12, description: 'Improved resource production through sharing' }
        ],
        description: 'Share resources and production capabilities'
      },
      [DiplomaticEventType.PEACE_TREATY]: {
        cost: {
          gold: { 
            type: ResourceType.GOLD,
            amount: 50, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          food: { 
            type: ResourceType.FOOD,
            amount: 40, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 25,
        effects: [
          { type: DiplomaticEffectType.ECONOMIC_STRENGTH, value: 0.15, duration: 25, description: 'Economic recovery from peace' }
        ],
        description: 'End hostilities and establish peace'
      },
      [DiplomaticEventType.NON_AGGRESSION_PACT]: {
        cost: {
          gold: { 
            type: ResourceType.GOLD,
            amount: 20, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          food: { 
            type: ResourceType.FOOD,
            amount: 15, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 15,
        effects: [
          { type: DiplomaticEffectType.ECONOMIC_STRENGTH, value: 0.05, duration: 15, description: 'Slight economic boost from stability' }
        ],
        description: 'Agree to maintain peaceful relations'
      },
      [DiplomaticEventType.CULTURAL_EXCHANGE]: {
        cost: {
          gold: { 
            type: ResourceType.GOLD,
            amount: 15, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          food: { 
            type: ResourceType.FOOD,
            amount: 10, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 10,
        effects: [
          { type: DiplomaticEffectType.POPULATION_GROWTH, value: 0.1, duration: 10, description: 'Population growth from cultural exchange' }
        ],
        description: 'Exchange cultural knowledge and traditions'
      },
      [DiplomaticEventType.JOINT_EXPLORATION]: {
        cost: {
          food: { 
            type: ResourceType.FOOD,
            amount: 25, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          },
          wood: { 
            type: ResourceType.WOOD,
            amount: 15, 
            productionRate: 0, 
            consumptionRate: 0, 
            productionMultiplier: 1.0,
            production: 0,
            consumption: 0 
          }
        },
        duration: 12,
        effects: [
          { type: DiplomaticEffectType.EXPLORATION_SPEED, value: 0.2, duration: 12, description: 'Faster exploration through cooperation' }
        ],
        description: 'Collaborate on map exploration'
      }
    };

    const properties = eventProperties[type];
    if (!properties) return null;

    return {
      id: `${type}_${source.id}_${target.id}_${Date.now()}`,
      type,
      source: source.id,
      target: target.id,
      status,
      cost: properties.cost || {},
      duration: properties.duration || 10,
      effects: properties.effects || [],
      description: properties.description || ''
    };
  }

  private canAffordEvent(event: DiplomaticEvent, source: AIPlayer): boolean {
    return Object.entries(event.cost).every(([resource, cost]) => {
      const resourceKey = resource as keyof GameResources;
      const playerResource = source.resources[resourceKey];
      
      if (!playerResource || !cost) return false;
      
      const typedResource = playerResource as Resource;
      const typedCost = cost as Resource;
      
      return typedResource.amount >= typedCost.amount;
    });
  }

  private deductEventCost(event: DiplomaticEvent, source: AIPlayer): void {
    Object.entries(event.cost).forEach(([resource, cost]) => {
      const resourceKey = resource as keyof GameResources;
      if (source.resources[resourceKey] && cost) {
        const typedResource = source.resources[resourceKey] as Resource;
        const typedCost = cost as Resource;
        typedResource.amount -= typedCost.amount;
      }
    });
  }

  private applyEventEffects(event: DiplomaticEvent, player: AIPlayer): void {
    const currentEffects = this.activeEffects.get(player.id) || [];
    event.effects.forEach(effect => {
      currentEffects.push({ ...effect });
      switch (effect.type) {
        case DiplomaticEffectType.RESEARCH_SPEED:
          player.researchSpeed *= (1 + effect.value);
          break;
        case DiplomaticEffectType.ECONOMIC_STRENGTH:
          player.economicStrength *= (1 + effect.value);
          break;
        case DiplomaticEffectType.MILITARY_STRENGTH:
          player.militaryStrength *= (1 + effect.value);
          break;
        case DiplomaticEffectType.POPULATION_GROWTH:
          // TODO: Implement population growth effect
          break;
        case DiplomaticEffectType.RESOURCE_PRODUCTION:
          // TODO: Implement resource production effect
          break;
        case DiplomaticEffectType.EXPLORATION_SPEED:
          // TODO: Implement exploration speed effect
          break;
      }
    });
    this.activeEffects.set(player.id, currentEffects);
  }

  private applyEffect(effect: DiplomaticEventEffect): void {
    // Implementation of applying a diplomatic effect
    console.log(`Applying diplomatic effect: ${effect.type}, value: ${effect.value}, duration: ${effect.duration}`);
    // Update effect duration
    effect.duration--;
  }
} 