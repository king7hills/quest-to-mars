import { PopulationRole, PopulationStats, PopulationConfig, PopulationEffects } from './PopulationTypes';
import { GameState } from '../state/GameState';
import { Epoch } from '../state/GameTypes';

export type { PopulationConfig };

export class Population {
  private stats: PopulationStats;
  private config: PopulationConfig;
  private gameState: GameState;
  private effects: PopulationEffects;

  constructor(config: PopulationConfig, gameState: GameState) {
    this.config = config;
    this.gameState = gameState;
    this.effects = this.initializeEffects();
    
    // Initialize population stats
    this.stats = {
      total: config.startingPopulation,
      growthRate: config.baseGrowthRate,
      health: config.baseHealth,
      happiness: config.baseHappiness,
      assignments: new Map(),
      unassigned: config.startingPopulation
    };

    // Initialize empty assignments
    Object.values(PopulationRole).forEach(role => {
      this.stats.assignments.set(role, {
        role,
        count: 0,
        efficiency: 1.0
      });
    });
  }

  private initializeEffects(): PopulationEffects {
    return {
      foodProduction: 0,
      researchProduction: 0,
      goldProduction: 0,
      militaryStrength: 0,
      buildingSpeed: 0,
      explorationSpeed: 0
    };
  }

  public update(): void {
    // Update population based on food availability
    this.updatePopulationGrowth();
    
    // Update efficiency based on health and happiness
    this.updateEfficiency();
    
    // Calculate production effects
    this.calculateEffects();
    
    // Update game state with new effects
    this.applyEffects();
  }

  private updatePopulationGrowth(): void {
    const foodAvailable = this.gameState.getResources().food.amount;
    const foodNeeded = this.stats.total * this.config.foodConsumptionPerPerson;
    
    if (foodAvailable >= foodNeeded) {
      // Population can grow
      const growth = Math.floor(this.stats.total * this.stats.growthRate);
      this.stats.total += growth;
      this.stats.unassigned += growth;
    } else {
      // Population might decrease
      const foodRatio = foodAvailable / foodNeeded;
      if (foodRatio < 0.5) {
        const decrease = Math.floor(this.stats.total * 0.1);
        this.stats.total -= decrease;
        this.stats.unassigned -= decrease;
      }
    }
  }

  private updateEfficiency(): void {
    // Base efficiency from health and happiness
    const baseEfficiency = (this.stats.health + this.stats.happiness) / 200;
    
    // Update efficiency for each assignment
    this.stats.assignments.forEach(assignment => {
      assignment.efficiency = baseEfficiency;
      
      // Apply epoch-specific efficiency modifiers
      const epoch = this.gameState.getEpoch();
      switch (epoch) {
        case Epoch.TRIBAL:
          if (assignment.role === PopulationRole.FARMER) {
            assignment.efficiency *= 0.8; // Less efficient farming in tribal age
          }
          break;
        case Epoch.AGRICULTURAL:
          if (assignment.role === PopulationRole.FARMER) {
            assignment.efficiency *= 1.2; // More efficient farming
          }
          break;
        case Epoch.INDUSTRIAL:
          if (assignment.role === PopulationRole.SCIENTIST || 
              assignment.role === PopulationRole.MERCHANT) {
            assignment.efficiency *= 1.3; // Industrial efficiency boost
          }
          break;
        case Epoch.SPACE_AGE:
          if (assignment.role === PopulationRole.SCIENTIST) {
            assignment.efficiency *= 1.5; // Space age research boost
          }
          break;
      }
    });
  }

  private calculateEffects(): void {
    this.effects = this.initializeEffects();
    
    this.stats.assignments.forEach(assignment => {
      const baseProduction = assignment.count * assignment.efficiency;
      
      switch (assignment.role) {
        case PopulationRole.FARMER:
          this.effects.foodProduction += baseProduction;
          break;
        case PopulationRole.SCIENTIST:
          this.effects.researchProduction += baseProduction;
          break;
        case PopulationRole.MERCHANT:
          this.effects.goldProduction += baseProduction;
          break;
        case PopulationRole.MILITARY:
          this.effects.militaryStrength += baseProduction;
          break;
        case PopulationRole.BUILDER:
          this.effects.buildingSpeed += baseProduction;
          break;
        case PopulationRole.EXPLORER:
          this.effects.explorationSpeed += baseProduction;
          break;
      }
    });
  }

  private applyEffects(): void {
    const resources = this.gameState.getResources();
    
    // Apply food production
    resources.food.productionRate += this.effects.foodProduction;
    
    // Apply research production
    resources.techPoints.productionRate += this.effects.researchProduction;
    
    // Apply gold production
    resources.gold.productionRate += this.effects.goldProduction;
  }

  public assignPopulation(role: PopulationRole, count: number, location?: string): boolean {
    if (count > this.stats.unassigned) {
      return false;
    }

    const assignment = this.stats.assignments.get(role);
    if (!assignment) {
      return false;
    }

    // Remove from unassigned
    this.stats.unassigned -= count;
    
    // Update assignment
    assignment.count += count;
    if (location) {
      assignment.location = location;
    }

    return true;
  }

  public unassignPopulation(role: PopulationRole, count: number): boolean {
    const assignment = this.stats.assignments.get(role);
    if (!assignment || assignment.count < count) {
      return false;
    }

    // Add back to unassigned
    this.stats.unassigned += count;
    
    // Update assignment
    assignment.count -= count;
    if (assignment.count === 0) {
      assignment.location = undefined;
    }

    return true;
  }

  public getStats(): PopulationStats {
    return { ...this.stats };
  }

  public getEffects(): PopulationEffects {
    return { ...this.effects };
  }

  public setGrowthRate(multiplier: number): void {
    this.stats.growthRate = this.config.baseGrowthRate * multiplier;
  }

  public getGrowthRate(): number {
    return this.stats.growthRate;
  }
  
  public reset(): void {
    // Reset all population stats to initial values
    this.stats = {
      total: this.config.startingPopulation,
      growthRate: this.config.baseGrowthRate,
      health: this.config.baseHealth,
      happiness: this.config.baseHappiness,
      assignments: new Map(),
      unassigned: this.config.startingPopulation
    };
    
    // Reinitialize assignments
    Object.values(PopulationRole).forEach(role => {
      this.stats.assignments.set(role, {
        role,
        count: 0,
        efficiency: 1.0
      });
    });
    
    // Reset effects
    this.effects = this.initializeEffects();
  }
  
  public serialize(): any {
    // Convert Map to array for serialization
    const assignmentsArray = Array.from(this.stats.assignments.entries()).map(([role, assignment]) => ({
      role,
      count: assignment.count,
      efficiency: assignment.efficiency,
      location: assignment.location
    }));
    
    return {
      stats: {
        ...this.stats,
        assignments: assignmentsArray
      },
      effects: this.effects
    };
  }
  
  public deserialize(data: any): void {
    if (!data) return;
    
    // Reconstruct stats and assignments map
    this.stats = {
      ...data.stats,
      assignments: new Map()
    };
    
    // Rebuild assignments map
    if (data.stats.assignments) {
      data.stats.assignments.forEach((assignment: any) => {
        this.stats.assignments.set(assignment.role, {
          role: assignment.role,
          count: assignment.count,
          efficiency: assignment.efficiency,
          location: assignment.location
        });
      });
    }
    
    // Restore effects
    this.effects = data.effects || this.initializeEffects();
  }
} 