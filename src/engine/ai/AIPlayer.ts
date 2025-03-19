import { AIPlayer as AIPlayerType, AIDecision, AIPlayerConfig, AIState, DiplomaticStatus, AIPersonality } from './AITypes';
import { GameResources } from '../state/GameState';
import { Epoch } from '../state/GameTypes';
import { HexTile } from '../map/HexTile';
import { BuildingType, BUILDING_PROPERTIES } from '../buildings/BuildingTypes';
import { TechType, TECH_PROPERTIES } from '../tech/TechTypes';
import { BuildingManager } from '../buildings/BuildingManager';
import { HexGrid } from '../map/HexGrid';
import { TechManager } from '../tech/TechManager';
import { AIManager } from '../ai/AIManager';
import { ResourceType } from '../state/ResourceTypes';
import { Resource } from '../state/ResourceTypes';

export class AIPlayer implements AIPlayerType {
  id: string;
  name: string;
  personality: AIPersonality;
  state: AIState;
  epoch: Epoch;
  resources: GameResources;
  population: number;
  territory: Set<string>;
  diplomaticRelations: Map<string, DiplomaticStatus>;
  techProgress: number;
  militaryStrength: number;
  economicStrength: number;
  researchSpeed: number;
  lastAction: number;
  actionCooldown: number;

  private militaryAggression: number;
  private economicFocus: number;
  private researchFocus: number;
  private diplomaticTendency: number;
  private decisions: AIDecision[];
  private currentResearch: TechType | null;
  private buildingManager: BuildingManager;
  private hexGrid: HexGrid;
  private techManager: TechManager;
  private aiManager: AIManager;

  constructor(
    config: AIPlayerConfig,
    buildingManager: BuildingManager,
    hexGrid: HexGrid,
    techManager: TechManager,
    aiManager: AIManager
  ) {
    this.id = config.id;
    this.name = config.name;
    this.personality = config.personality;
    this.state = AIState.EXPLORING;
    this.epoch = Epoch.TRIBAL;
    this.resources = this.initializeResources(config.startingResources);
    this.population = config.startingPopulation;
    this.territory = new Set([`${config.startingPosition.row},${config.startingPosition.col}`]);
    this.diplomaticRelations = new Map();
    this.techProgress = 0;
    this.militaryStrength = 0;
    this.economicStrength = 0;
    this.researchSpeed = 1.0;
    this.lastAction = 0;
    this.actionCooldown = 3;

    this.militaryAggression = config.militaryAggression;
    this.economicFocus = config.economicFocus;
    this.researchFocus = config.researchFocus;
    this.diplomaticTendency = config.diplomaticTendency;

    this.decisions = [];
    this.currentResearch = null;

    this.buildingManager = buildingManager;
    this.hexGrid = hexGrid;
    this.techManager = techManager;
    this.aiManager = aiManager;
  }

  private initializeResources(startingResources: Partial<GameResources>): GameResources {
    return {
      food: { 
        type: ResourceType.FOOD, 
        amount: 100, 
        productionRate: 10, 
        consumptionRate: 5, 
        productionMultiplier: 1.0,
        production: 10,
        consumption: 5
      },
      wood: { 
        type: ResourceType.WOOD, 
        amount: 50, 
        productionRate: 5, 
        consumptionRate: 2, 
        productionMultiplier: 1.0,
        production: 5,
        consumption: 2
      },
      stone: { 
        type: ResourceType.STONE, 
        amount: 30, 
        productionRate: 3, 
        consumptionRate: 1, 
        productionMultiplier: 1.0,
        production: 3,
        consumption: 1
      },
      gold: { 
        type: ResourceType.GOLD, 
        amount: 0, 
        productionRate: 0, 
        consumptionRate: 0, 
        productionMultiplier: 1.0,
        production: 0,
        consumption: 0
      },
      metal: { 
        type: ResourceType.METAL, 
        amount: 0, 
        productionRate: 0, 
        consumptionRate: 0, 
        productionMultiplier: 1.0,
        production: 0,
        consumption: 0
      },
      fuel: { 
        type: ResourceType.FUEL, 
        amount: 0, 
        productionRate: 0, 
        consumptionRate: 0, 
        productionMultiplier: 1.0,
        production: 0,
        consumption: 0
      },
      techPoints: { 
        type: ResourceType.TECH_POINTS, 
        amount: 0, 
        productionRate: 0, 
        consumptionRate: 0, 
        productionMultiplier: 1.0,
        production: 0,
        consumption: 0
      },
      ...startingResources,
      update: function() {
        // Update each resource based on production and consumption
        ['food', 'wood', 'stone', 'metal', 'fuel', 'techPoints', 'gold'].forEach(key => {
          const resource = this[key as keyof GameResources];
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
    };
  }

  public update(currentTurn: number): void {
    // Update resources and population
    this.updateResources();
    this.updatePopulation();

    // Check if it's time to make a decision
    if (currentTurn - this.lastAction >= this.actionCooldown) {
      this.evaluateState();
      this.generateDecisions();
      this.executeBestDecision();
      this.lastAction = currentTurn;
    }

    // Update research if in progress
    if (this.currentResearch) {
      this.updateResearch();
    }
  }

  private updateResources(): void {
    Object.entries(this.resources).forEach(([_, resource]) => {
      if (resource && typeof resource === 'object') {
        const typedResource = resource as Resource;
        const effectiveProduction = typedResource.productionRate * typedResource.productionMultiplier;
        typedResource.amount += effectiveProduction - typedResource.consumptionRate;
        typedResource.amount = Math.max(0, typedResource.amount);
        
        // Keep production and consumption in sync with their respective rates
        typedResource.production = typedResource.productionRate;
        typedResource.consumption = typedResource.consumptionRate;
      }
    });
  }

  private updatePopulation(): void {
    const foodPerPerson = 1;
    const foodNeeded = this.population * foodPerPerson;
    
    if (this.resources.food.amount >= foodNeeded) {
      const excessFood = this.resources.food.amount - foodNeeded;
      const growthRate = 0.1; // 10% growth rate per turn with excess food
      this.population += Math.floor(excessFood * growthRate);
    } else {
      const foodRatio = this.resources.food.amount / foodNeeded;
      this.population = Math.floor(this.population * foodRatio);
    }
  }

  private updateResearch(): void {
    // Update research progress based on research focus
    if (this.currentResearch) {
      // Increase research progress based on research focus and tech points
      const researchSpeed = this.researchSpeed * (0.5 + this.researchFocus * 0.5);
      const progress = this.resources.techPoints.amount * 0.1 * researchSpeed;
      
      this.techProgress += progress;
      
      // If research is complete
      if (this.techProgress >= 100) {
        // Complete the research and check for a new one
        if (this.techManager.isTechResearched(this.currentResearch)) {
          // Research is already complete, find a new one
          this.currentResearch = null;
        } else {
          // Start the research in the tech manager
          this.techManager.startResearch(this.currentResearch);
        }
        this.techProgress = 0;
      }
    }
  }

  private evaluateState(): void {
    // Evaluate current state and adjust strategy
    const threats = this.evaluateThreats();
    const opportunities = this.evaluateOpportunities();
    const resourceNeeds = this.evaluateResourceNeeds();

    // Update state based on evaluation
    if (threats.length > 0) {
      this.state = AIState.DEFENDING;
    } else if (opportunities.length > 0) {
      this.state = AIState.EXPANDING;
    } else if (resourceNeeds.length > 0) {
      this.state = AIState.DEVELOPING;
    } else {
      this.state = AIState.EXPLORING;
    }
  }

  private evaluateThreats(): any[] {
    // TODO: Implement threat evaluation
    return [];
  }

  private evaluateOpportunities(): any[] {
    // TODO: Implement opportunity evaluation
    return [];
  }

  private evaluateResourceNeeds(): any[] {
    // TODO: Implement resource needs evaluation
    return [];
  }

  private generateDecisions(): void {
    this.decisions = [];

    // Generate building decisions
    this.generateBuildingDecisions();

    // Generate research decisions
    this.generateResearchDecisions();

    // Generate diplomatic decisions
    this.generateDiplomaticDecisions();

    // Generate military decisions
    this.generateMilitaryDecisions();

    // Sort decisions by priority
    this.decisions.sort((a, b) => b.priority - a.priority);
  }

  private generateBuildingDecisions(): void {
    // Get available building types for current epoch
    const availableBuildings = Object.values(BuildingType).filter(
      type => BUILDING_PROPERTIES[type].epoch <= this.epoch
    );

    // Evaluate each building type
    availableBuildings.forEach(type => {
      const decision = this.evaluateBuildingDecision(type);
      if (decision) {
        this.decisions.push(decision);
      }
    });
  }

  private evaluateBuildingDecision(type: BuildingType): AIDecision | null {
    const properties = BUILDING_PROPERTIES[type];
    const costs = properties.cost;

    // Check if we can afford the building
    if (this.resources.wood.amount < costs.wood ||
        this.resources.stone.amount < costs.stone ||
        (costs.gold && this.resources.gold && this.resources.gold.amount < costs.gold) ||
        (costs.metal && this.resources.metal.amount < costs.metal)) {
      return null;
    }

    // Calculate total cost
    const totalCost = costs.wood + costs.stone + (costs.gold || 0) + (costs.metal || 0);

    // Calculate expected benefit based on building type and current state
    let expectedBenefit = 0;
    let priority = 1;

    // Evaluate based on current state
    switch (this.state) {
      case AIState.EXPLORING:
        if (type === BuildingType.HUT || type === BuildingType.CAMPFIRE) {
          expectedBenefit = 5;
          priority = 8;
        }
        break;
      case AIState.EXPANDING:
        if (type === BuildingType.BASIC_DEFENSE) {
          expectedBenefit = 7;
          priority = 9;
        } else if (type === BuildingType.FARM || type === BuildingType.MINE) {
          expectedBenefit = 6;
          priority = 7;
        }
        break;
      case AIState.DEVELOPING:
        if (type === BuildingType.WORKSHOP || type === BuildingType.RESEARCH_LAB) {
          expectedBenefit = 8;
          priority = 8;
        } else if (type === BuildingType.FACTORY || type === BuildingType.POWER_PLANT) {
          expectedBenefit = 7;
          priority = 7;
        }
        break;
      case AIState.DEFENDING:
        if (type === BuildingType.BASIC_DEFENSE) {
          expectedBenefit = 10;
          priority = 10;
        }
        break;
    }

    // Adjust benefit based on personality
    switch (this.personality) {
      case AIPersonality.AGGRESSIVE:
        if (type === BuildingType.BASIC_DEFENSE) {
          expectedBenefit *= 1.5;
        }
        break;
      case AIPersonality.DIPLOMATIC:
        if (type === BuildingType.WORKSHOP || type === BuildingType.RESEARCH_LAB) {
          expectedBenefit *= 1.3;
        }
        break;
      case AIPersonality.ISOLATIONIST:
        if (type === BuildingType.FARM || type === BuildingType.MINE) {
          expectedBenefit *= 1.4;
        }
        break;
      case AIPersonality.TRADER:
        if (type === BuildingType.FACTORY || type === BuildingType.WORKSHOP) {
          expectedBenefit *= 1.3;
        }
        break;
    }

    // If no significant benefit, don't create decision
    if (expectedBenefit < 5) {
      return null;
    }

    return {
      type: 'BUILD',
      target: type,
      priority,
      cost: totalCost,
      expectedBenefit
    };
  }

  private executeBuildingDecision(decision: AIDecision): void {
    const buildingType = decision.target as BuildingType;
    if (!buildingType) return;

    // Find suitable hex for building
    const suitableHex = this.findSuitableHexForBuilding(buildingType);
    if (!suitableHex) return;

    // Place building
    const buildingManager = this.getBuildingManager();
    if (buildingManager && buildingManager.placeBuilding(buildingType, suitableHex)) {
      // Update territory
      const hexKey = `${suitableHex.getGridPosition().row},${suitableHex.getGridPosition().col}`;
      this.addTerritory(hexKey);
    }
  }

  private findSuitableHexForBuilding(type: BuildingType): HexTile | null {
    const hexGrid = this.getHexGrid();
    if (!hexGrid) return null;

    // Get all hexes in territory
    const territoryHexes = Array.from(this.territory).map(key => {
      const [row, col] = key.split(',').map(Number);
      return hexGrid.getHexTile(row, col);
    });

    // Filter for suitable hexes
    const suitableHexes = territoryHexes.filter(hex => {
      if (!hex) return false;
      const buildingManager = this.getBuildingManager();
      return buildingManager && buildingManager.canPlaceBuilding(type, hex);
    });

    // Return the first suitable hex
    return suitableHexes[0] || null;
  }

  private getBuildingManager(): BuildingManager {
    return this.buildingManager;
  }

  private getHexGrid(): HexGrid {
    return this.hexGrid;
  }

  private generateResearchDecisions(): void {
    // Get available techs for current epoch
    const availableTechs = Object.values(TechType).filter(
      tech => TECH_PROPERTIES[tech].epoch <= this.epoch
    );

    // Evaluate each tech
    availableTechs.forEach(tech => {
      const decision = this.evaluateResearchDecision(tech);
      if (decision) {
        this.decisions.push(decision);
      }
    });
  }

  private evaluateResearchDecision(tech: TechType): AIDecision | null {
    const properties = TECH_PROPERTIES[tech];
    const techManager = this.getTechManager();
    if (!techManager) return null;

    // Check if we can research this tech
    if (!techManager.canResearch(tech)) {
      return null;
    }

    // Calculate expected benefit based on tech effects and current state
    let expectedBenefit = 0;
    let priority = 1;

    // Evaluate based on current state and effects
    properties.effects.forEach(effect => {
      switch (this.state) {
        case AIState.EXPLORING:
          if (effect.type === 'PRODUCTION') {
            expectedBenefit = 6;
            priority = 7;
          }
          break;
        case AIState.EXPANDING:
          if (effect.type === 'PRODUCTION' && effect.target === 'ALL') {
            expectedBenefit = 7;
            priority = 8;
          }
          break;
        case AIState.DEVELOPING:
          if (effect.type === 'POPULATION' && effect.target === 'GROWTH') {
            expectedBenefit = 8;
            priority = 8;
          }
          break;
        case AIState.DEFENDING:
          if (effect.type === 'PRODUCTION' && effect.target === 'METAL') {
            expectedBenefit = 9;
            priority = 9;
          }
          break;
      }
    });

    // Adjust benefit based on personality
    properties.effects.forEach(effect => {
      switch (this.personality) {
        case AIPersonality.AGGRESSIVE:
          if (effect.type === 'PRODUCTION' && effect.target === 'METAL') {
            expectedBenefit *= 1.5;
          }
          break;
        case AIPersonality.DIPLOMATIC:
          if (effect.type === 'POPULATION' && effect.target === 'GROWTH') {
            expectedBenefit *= 1.3;
          }
          break;
        case AIPersonality.ISOLATIONIST:
          if (effect.type === 'PRODUCTION' && effect.target === 'ALL') {
            expectedBenefit *= 1.4;
          }
          break;
        case AIPersonality.TRADER:
          if (effect.type === 'PRODUCTION' && effect.target === 'ALL') {
            expectedBenefit *= 1.3;
          }
          break;
      }
    });

    // If no significant benefit, don't create decision
    if (expectedBenefit < 5) {
      return null;
    }

    return {
      type: 'RESEARCH',
      target: tech,
      priority,
      cost: properties.cost,
      expectedBenefit
    };
  }

  private executeResearchDecision(decision: AIDecision): void {
    const techType = decision.target as TechType;
    if (!techType) return;

    const techManager = this.getTechManager();
    if (techManager && techManager.canResearch(techType)) {
      techManager.startResearch(techType);
    }
  }

  private getTechManager(): TechManager {
    return this.techManager;
  }

  private generateDiplomaticDecisions(): void {
    // Get all other AI players
    const otherPlayers = Array.from(this.diplomaticRelations.keys());

    otherPlayers.forEach(playerId => {
      const currentStatus = this.getDiplomaticStatus(playerId);
      const decision = this.evaluateDiplomaticDecision(playerId, currentStatus);
      if (decision) {
        this.decisions.push(decision);
      }
    });
  }

  private evaluateDiplomaticDecision(playerId: string, currentStatus: DiplomaticStatus): AIDecision | null {
    // Base priority on personality and current state
    let priority = 5;
    let expectedBenefit = 0;
    let cost = 0;

    // Adjust priority based on personality
    switch (this.personality) {
      case AIPersonality.AGGRESSIVE:
        priority += this.militaryAggression * 2;
        break;
      case AIPersonality.DIPLOMATIC:
        priority += this.diplomaticTendency * 3;
        break;
      case AIPersonality.ISOLATIONIST:
        priority -= this.diplomaticTendency * 2;
        break;
      case AIPersonality.TRADER:
        priority += this.economicFocus;
        break;
    }

    // Adjust priority based on current state
    switch (this.state) {
      case AIState.EXPLORING:
        priority += 1; // More diplomatic during exploration
        break;
      case AIState.EXPANDING:
        priority += 2; // High diplomatic priority during expansion
        break;
      case AIState.DEVELOPING:
        priority += 1; // Moderate diplomatic priority during development
        break;
      case AIState.DEFENDING:
        priority -= 1; // Lower diplomatic priority during defense
        break;
    }

    // Evaluate potential status changes
    switch (currentStatus) {
      case DiplomaticStatus.WAR:
        // Consider peace if resources are low or military is weak
        if (this.resources.food.amount < 50 || this.militaryStrength < 30) {
          expectedBenefit = 8;
          cost = 20; // Resource cost for peace treaty
        }
        break;

      case DiplomaticStatus.HOSTILE:
        // Consider improving relations if military is weak
        if (this.militaryStrength < 40) {
          expectedBenefit = 6;
          cost = 15; // Resource cost for improving relations
        }
        break;

      case DiplomaticStatus.NEUTRAL:
        // Consider improving relations based on personality
        if (this.personality === AIPersonality.DIPLOMATIC || 
            this.personality === AIPersonality.TRADER) {
          expectedBenefit = 4;
          cost = 10; // Resource cost for improving relations
        }
        break;

      case DiplomaticStatus.FRIENDLY:
        // Consider alliance based on personality and state
        if (this.personality === AIPersonality.DIPLOMATIC && 
            this.state === AIState.DEVELOPING) {
          expectedBenefit = 7;
          cost = 25; // Resource cost for alliance
        }
        break;

      case DiplomaticStatus.ALLIED:
        // No need to change status
        return null;
    }

    // Adjust benefit based on personality
    switch (this.personality) {
      case AIPersonality.AGGRESSIVE:
        expectedBenefit *= 0.8; // Less benefit from diplomacy
        break;
      case AIPersonality.DIPLOMATIC:
        expectedBenefit *= 1.5; // More benefit from diplomacy
        break;
      case AIPersonality.ISOLATIONIST:
        expectedBenefit *= 0.6; // Less benefit from diplomacy
        break;
      case AIPersonality.TRADER:
        expectedBenefit *= 1.2; // Moderate benefit from diplomacy
        break;
    }

    // If no significant benefit or can't afford cost, don't create decision
    if (expectedBenefit < 3 || this.resources.food.amount < cost) {
      return null;
    }

    return {
      type: 'DIPLOMACY',
      target: playerId,
      priority,
      cost,
      expectedBenefit
    };
  }

  private generateMilitaryDecisions(): void {
    // TODO: Implement military decision generation
  }

  private executeBestDecision(): void {
    if (this.decisions.length === 0) return;

    const bestDecision = this.decisions[0];
    
    switch (bestDecision.type) {
      case 'BUILD':
        this.executeBuildingDecision(bestDecision);
        break;
      case 'RESEARCH':
        this.executeResearchDecision(bestDecision);
        break;
      case 'DIPLOMACY':
        this.executeDiplomaticDecision(bestDecision);
        break;
      case 'MILITARY':
        this.executeMilitaryDecision(bestDecision);
        break;
      case 'ECONOMY':
        this.executeEconomicDecision(bestDecision);
        break;
    }
  }

  private executeDiplomaticDecision(decision: AIDecision): void {
    const targetId = decision.target;
    if (!targetId) return;

    const targetPlayer = this.getAIManager().getAIPlayer(targetId);
    if (!targetPlayer) return;

    // Get current diplomatic status
    const currentStatus = this.diplomaticRelations.get(targetId) || DiplomaticStatus.NEUTRAL;

    // Determine new status based on decision and current status
    let newStatus = currentStatus;

    // Simple logic: improve relationship by one level
    if (currentStatus === DiplomaticStatus.WAR) {
      newStatus = DiplomaticStatus.HOSTILE;
    } else if (currentStatus === DiplomaticStatus.HOSTILE) {
      newStatus = DiplomaticStatus.NEUTRAL;
    } else if (currentStatus === DiplomaticStatus.NEUTRAL) {
      newStatus = DiplomaticStatus.FRIENDLY;
    } else if (currentStatus === DiplomaticStatus.FRIENDLY) {
      newStatus = DiplomaticStatus.ALLIED;
    }

    // Update diplomatic status
    this.diplomaticRelations.set(targetId, newStatus);
    targetPlayer.diplomaticRelations.set(this.id, newStatus);

    // Apply diplomatic effects based on new status
    this.applyDiplomaticEffects(newStatus);
    targetPlayer.applyDiplomaticEffects(newStatus);
  }

  private applyDiplomaticEffects(status: DiplomaticStatus): void {
    // Apply effects based on diplomatic status
    switch (status) {
      case DiplomaticStatus.ALLIED:
        this.researchSpeed *= 1.2;
        this.economicStrength *= 1.1;
        break;
      case DiplomaticStatus.FRIENDLY:
        this.researchSpeed *= 1.1;
        break;
      case DiplomaticStatus.HOSTILE:
        this.militaryStrength *= 1.1;
        break;
      case DiplomaticStatus.WAR:
        this.militaryStrength *= 1.2;
        break;
      default:
        break;
    }
  }

  private getAIManager(): AIManager {
    return this.aiManager;
  }

  private executeMilitaryDecision(decision: AIDecision): void {
    // TODO: Implement military decision execution
    console.log(`Executing military decision for ${this.id}`, decision);
  }

  private executeEconomicDecision(decision: AIDecision): void {
    // TODO: Implement economic decision execution
    console.log(`Executing economic decision for ${this.id}`, decision);
  }

  public getState(): AIState {
    return this.state;
  }

  public getDiplomaticStatus(playerId: string): DiplomaticStatus {
    return this.diplomaticRelations.get(playerId) || DiplomaticStatus.NEUTRAL;
  }

  public setDiplomaticStatus(playerId: string, status: DiplomaticStatus): void {
    this.diplomaticRelations.set(playerId, status);
  }

  public getTerritory(): Set<string> {
    return this.territory;
  }

  public addTerritory(hexKey: string): void {
    this.territory.add(hexKey);
  }

  public removeTerritory(hexKey: string): void {
    this.territory.delete(hexKey);
  }

  public serialize(): any {
    return {
      id: this.id,
      name: this.name,
      personality: this.personality,
      state: this.state,
      epoch: this.epoch,
      resources: Object.entries(this.resources).reduce((acc, [key, resource]) => {
        const typedResource = resource as Resource;
        acc[key] = {
          type: typedResource.type,
          amount: typedResource.amount,
          productionRate: typedResource.productionRate,
          consumptionRate: typedResource.consumptionRate,
          productionMultiplier: typedResource.productionMultiplier,
          production: typedResource.production,
          consumption: typedResource.consumption
        };
        return acc;
      }, {} as Record<string, any>),
      population: this.population,
      territory: Array.from(this.territory),
      diplomaticRelations: Array.from(this.diplomaticRelations.entries()),
      techProgress: this.techProgress,
      militaryStrength: this.militaryStrength,
      economicStrength: this.economicStrength,
      researchSpeed: this.researchSpeed,
      lastAction: this.lastAction,
      actionCooldown: this.actionCooldown
    };
  }

  public deserialize(data: any): void {
    if (!data) return;

    this.id = data.id;
    this.name = data.name;
    this.personality = data.personality;
    this.state = data.state;
    this.epoch = data.epoch;
    
    // Restore resources
    if (data.resources) {
      Object.entries(data.resources).forEach(([key, resourceData]: [string, any]) => {
        if (key in this.resources) {
          const typedResource = this.resources[key as keyof GameResources] as Resource;
          typedResource.type = resourceData.type;
          typedResource.amount = resourceData.amount;
          typedResource.productionRate = resourceData.productionRate;
          typedResource.consumptionRate = resourceData.consumptionRate;
          typedResource.productionMultiplier = resourceData.productionMultiplier;
          typedResource.production = resourceData.production;
          typedResource.consumption = resourceData.consumption;
        }
      });
    }
    
    this.population = data.population;
    
    // Restore territory
    this.territory.clear();
    if (data.territory && Array.isArray(data.territory)) {
      data.territory.forEach((hex: string) => {
        this.territory.add(hex);
      });
    }
    
    // Restore diplomatic relations
    this.diplomaticRelations.clear();
    if (data.diplomaticRelations && Array.isArray(data.diplomaticRelations)) {
      data.diplomaticRelations.forEach(([id, status]: [string, DiplomaticStatus]) => {
        this.diplomaticRelations.set(id, status);
      });
    }
    
    this.techProgress = data.techProgress;
    this.militaryStrength = data.militaryStrength;
    this.economicStrength = data.economicStrength;
    this.researchSpeed = data.researchSpeed;
    this.lastAction = data.lastAction;
    this.actionCooldown = data.actionCooldown;
  }
} 