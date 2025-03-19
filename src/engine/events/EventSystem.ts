import { v4 as uuidv4 } from 'uuid';

export enum EventType {
  // Resource Events
  RESOURCE_PRODUCTION = 'RESOURCE_PRODUCTION',
  RESOURCE_CONSUMPTION = 'RESOURCE_CONSUMPTION',
  RESOURCE_DEPLETION = 'RESOURCE_DEPLETION',

  // Building Events
  BUILDING_PLACED = 'BUILDING_PLACED',
  BUILDING_COMPLETED = 'BUILDING_COMPLETED',
  BUILDING_DESTROYED = 'BUILDING_DESTROYED',

  // Technology Events
  RESEARCH_STARTED = 'RESEARCH_STARTED',
  RESEARCH_COMPLETED = 'RESEARCH_COMPLETED',
  EPOCH_CHANGED = 'EPOCH_CHANGED',

  // Military Events
  UNIT_TRAINED = 'UNIT_TRAINED',
  UNIT_DESTROYED = 'UNIT_DESTROYED',
  COMBAT_STARTED = 'COMBAT_STARTED',
  COMBAT_ENDED = 'COMBAT_ENDED',

  // Diplomatic Events
  DIPLOMATIC_STATUS_CHANGED = 'DIPLOMATIC_STATUS_CHANGED',
  TRADE_AGREEMENT_SIGNED = 'TRADE_AGREEMENT_SIGNED',
  ALLIANCE_FORMED = 'ALLIANCE_FORMED',

  // Population Events
  POPULATION_GROWTH = 'POPULATION_GROWTH',
  POPULATION_DECLINE = 'POPULATION_DECLINE',

  // Victory Events
  VICTORY_CONDITION_MET = 'VICTORY_CONDITION_MET',
  GAME_OVER = 'GAME_OVER',

  // Save/Load Events
  GAME_SAVED = 'GAME_SAVED',
  GAME_LOADED = 'GAME_LOADED',
  SAVE_DELETED = 'SAVE_DELETED'
}

export interface GameEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source: string;
  target?: string;
  data: any;
  description: string;
}

export interface EventListener {
  id: string;
  type: EventType;
  callback: (event: GameEvent) => void;
}

export class EventSystem {
  private events: GameEvent[];
  private listeners: Map<EventType, EventListener[]>;
  private maxEvents: number;

  constructor(maxEvents: number = 1000) {
    this.events = [];
    this.listeners = new Map();
    this.maxEvents = maxEvents;
  }

  public addEventListener(type: EventType, callback: (event: GameEvent) => void): string {
    const listener: EventListener = {
      id: uuidv4(),
      type,
      callback
    };

    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push(listener);
    return listener.id;
  }

  public removeEventListener(type: EventType, listenerId: string): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.findIndex(l => l.id === listenerId);
      if (index !== -1) {
        typeListeners.splice(index, 1);
      }
    }
  }

  public emitEvent(type: EventType, source: string, data: any, description: string, target?: string): void {
    const event: GameEvent = {
      id: uuidv4(),
      type,
      timestamp: Date.now(),
      source,
      target,
      data,
      description
    };

    // Add to events array
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener.callback(event));
    }
  }

  public getEvents(): GameEvent[] {
    return [...this.events];
  }

  public getEventsByType(type: EventType): GameEvent[] {
    return this.events.filter(event => event.type === type);
  }

  public getEventsBySource(source: string): GameEvent[] {
    return this.events.filter(event => event.source === source);
  }

  public getEventsByTarget(target: string): GameEvent[] {
    return this.events.filter(event => event.target === target);
  }

  public clearEvents(): void {
    this.events = [];
  }

  public clearListeners(): void {
    this.listeners.clear();
  }
} 