import { ResourceType, Resource, GameResources } from './ResourceTypes';
import { Epoch } from './GameTypes';

// Re-export these types to fix import errors in other files
export { GameResources };
export type { Resource, Epoch };

// Extend the GameResources interface to include gold
export interface GameResourcesWithGold extends GameResources {
  gold: Resource;
}

export interface Player {
  id: string;
  name: string;
  resources: GameResourcesWithGold;
  isAI: boolean;
}

export class GameState {
  private resources: GameResourcesWithGold;
  private epoch: Epoch;
  private population: number;
  private populationGrowthMultiplier: number;
  private players: Map<string, Player>;
  private currentPlayerId: string;
  private turn: number;

  constructor() {
    // Initialize with GameResources and add gold
    this.resources = new GameResources() as GameResourcesWithGold;
    this.resources.gold = { type: ResourceType.METAL, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.epoch = Epoch.TRIBAL;
    this.population = 10;
    this.populationGrowthMultiplier = 1.0;
    this.players = new Map();
    this.currentPlayerId = 'player';
    this.turn = 1;
    this.initializeResources();
  }

  private initializeResources(): void {
    // Initialize starting resources
    this.resources.food = { type: ResourceType.FOOD, amount: 100, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.resources.wood = { type: ResourceType.WOOD, amount: 50, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.resources.stone = { type: ResourceType.STONE, amount: 30, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.resources.metal = { type: ResourceType.METAL, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.resources.fuel = { type: ResourceType.FUEL, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.resources.techPoints = { type: ResourceType.TECH_POINTS, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.resources.gold = { type: ResourceType.METAL, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
  }

  public update(): void {
    // Update resources based on production and consumption
    // Since GameResources has an update method, we need to call it explicitly
    (this.resources as any).update();
    
    // Update population based on growth rate and resources
    const foodRatio = this.resources.food.amount / (this.population * 2);
    if (foodRatio >= 1.0) {
      this.population *= (1 + 0.1 * this.populationGrowthMultiplier);
    } else if (foodRatio < 0.5) {
      this.population *= 0.95;
    }

    this.turn++;
  }

  public getResources(): GameResourcesWithGold {
    return this.resources;
  }

  public getResource(type: ResourceType): Resource {
    const resourceKey = type.toLowerCase() as keyof GameResourcesWithGold;
    const resource = this.resources[resourceKey];
    
    // Create a default resource if not found
    if (!resource || typeof resource === 'function') {
      return { 
        type, 
        amount: 0, 
        productionRate: 0, 
        consumptionRate: 0, 
        productionMultiplier: 1.0 
      };
    }
    
    return resource;
  }

  public modifyResource(type: ResourceType, amount: number): void {
    const resourceKey = type.toLowerCase() as keyof GameResourcesWithGold;
    const resource = this.resources[resourceKey];
    
    if (resource && typeof resource !== 'function') {
      resource.amount = Math.max(0, resource.amount + amount);
    }
  }

  public getPopulation(): number {
    return this.population;
  }

  public setPopulation(population: number): void {
    this.population = population;
  }

  public getPopulationGrowthMultiplier(): number {
    return this.populationGrowthMultiplier;
  }

  public setPopulationGrowthMultiplier(multiplier: number): void {
    this.populationGrowthMultiplier = multiplier;
  }

  public getPlayers(): Map<string, Player> {
    return this.players;
  }

  public addPlayer(player: Player): void {
    this.players.set(player.id, player);
  }

  public getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  public getCurrentPlayerId(): string {
    return this.currentPlayerId;
  }

  public setCurrentPlayerId(id: string): void {
    this.currentPlayerId = id;
  }

  public getTurn(): number {
    return this.turn;
  }

  public hasEnough(costs: Map<string, number>): boolean {
    for (const [resource, amount] of costs) {
      const key = resource.toLowerCase() as keyof GameResourcesWithGold;
      const resourceObj = this.resources[key];
      const currentAmount = resourceObj && typeof resourceObj !== 'function' ? resourceObj.amount : 0;
      
      if (currentAmount < amount) {
        return false;
      }
    }
    return true;
  }

  public subtract(costs: Map<string, number>): void {
    for (const [resource, amount] of costs) {
      const key = resource.toLowerCase() as keyof GameResourcesWithGold;
      const resourceObj = this.resources[key];
      
      if (resourceObj && typeof resourceObj !== 'function') {
        resourceObj.amount = Math.max(0, resourceObj.amount - amount);
      }
    }
  }

  public getEpoch(): Epoch {
    return this.epoch;
  }

  public advanceEpoch(): void {
    switch (this.epoch) {
      case Epoch.TRIBAL:
        this.epoch = Epoch.AGRICULTURAL;
        break;
      case Epoch.AGRICULTURAL:
        this.epoch = Epoch.INDUSTRIAL;
        break;
      case Epoch.INDUSTRIAL:
        this.epoch = Epoch.SPACE_AGE;
        break;
      default:
        break;
    }
  }

  public serialize(): any {
    return {
      epoch: this.epoch,
      resources: Object.entries(this.resources),
      currentPlayerId: this.currentPlayerId,
      turn: this.turn,
      population: this.population,
      populationGrowthMultiplier: this.populationGrowthMultiplier
    };
  }

  public deserialize(data: any): void {
    this.epoch = data.epoch;
    this.resources = data.resources;
    this.currentPlayerId = data.currentPlayerId;
    this.turn = data.turn;
    this.population = data.population;
    this.populationGrowthMultiplier = data.populationGrowthMultiplier;
  }

  public reset(): void {
    this.epoch = Epoch.TRIBAL;
    this.turn = 1;
    this.population = 10;
    this.populationGrowthMultiplier = 1.0;
    this.players.clear();
    this.currentPlayerId = 'player';
    this.initializeResources();
  }
} 