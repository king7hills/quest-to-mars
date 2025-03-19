export enum ResourceType {
  FOOD = 'FOOD',
  WOOD = 'WOOD',
  STONE = 'STONE',
  METAL = 'METAL',
  FUEL = 'FUEL',
  TECH_POINTS = 'TECH_POINTS',
  GOLD = 'GOLD'
}

export interface Resource {
  type: ResourceType;
  amount: number;
  productionRate: number;
  consumptionRate: number;
  productionMultiplier: number;
  production?: number; // Alias for productionRate for backward compatibility
  consumption?: number; // Alias for consumptionRate for backward compatibility
}

export interface GameResources {
  food: Resource;
  wood: Resource;
  stone: Resource;
  metal: Resource;
  fuel: Resource;
  techPoints: Resource;
  gold?: Resource; // Make gold optional for compatibility
}

export class GameResources {
  constructor() {
    this.food = { type: ResourceType.FOOD, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.wood = { type: ResourceType.WOOD, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.stone = { type: ResourceType.STONE, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.metal = { type: ResourceType.METAL, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.fuel = { type: ResourceType.FUEL, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
    this.techPoints = { type: ResourceType.TECH_POINTS, amount: 0, productionRate: 0, consumptionRate: 0, productionMultiplier: 1.0 };
  }

  public update(): void {
    // Update each resource based on production and consumption
    Object.values(this).forEach(resource => {
      if (resource && typeof resource === 'object' && 'amount' in resource) {
        const netProduction = (resource.productionRate * resource.productionMultiplier) - resource.consumptionRate;
        resource.amount = Math.max(0, resource.amount + netProduction);
        
        // Sync production with productionRate to maintain compatibility
        if ('production' in resource) {
          resource.production = resource.productionRate;
        }
      }
    });
  }
} 