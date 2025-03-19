import { v4 as uuidv4 } from 'uuid';
import { UnitType, MilitaryFormationType, Unit, Formation, MilitaryStats, MilitaryConfig, CombatResult, UnitStats, ResourceCost } from './MilitaryTypes';
import { GameState } from '../state/GameState';
import { UNIT_CONFIGS } from './UnitConfig';
import { Pathfinding } from './Pathfinding';
import { HexGrid } from '../map/HexGrid';
import { HexTile } from '../map/HexTile';
import { UnitVisualization } from './UnitVisualization';
import * as THREE from 'three';
import { Epoch } from '../state/GameTypes';

export class Military {
  private units: Map<string, Unit>;
  private formations: Map<string, Formation>;
  private stats: MilitaryStats;
  private config: MilitaryConfig;
  private gameState: GameState;
  private ownerId: string;
  private pathfinding: Pathfinding;
  private movingUnits: Map<string, { path: HexTile[], currentIndex: number }>;
  private visualization: UnitVisualization;

  constructor(config: MilitaryConfig, gameState: GameState, ownerId: string, hexGrid: HexGrid, scene: THREE.Scene) {
    this.config = config;
    this.gameState = gameState;
    this.ownerId = ownerId;
    this.units = new Map();
    this.formations = new Map();
    this.pathfinding = new Pathfinding(hexGrid);
    this.movingUnits = new Map();
    this.visualization = new UnitVisualization(scene);
    
    this.stats = {
      totalUnits: 0,
      totalStrength: 0,
      formations: [],
      morale: config.baseMorale,
      militaryPower: 0,
      trainingUnits: 0,
      maxUnits: config.maxUnitsPerEpoch[gameState.getEpoch() as Epoch]
    };
  }

  public update(): void {
    // Update training progress
    this.updateTraining();
    
    // Update unit movement
    this.updateMovement();
    
    // Update formations
    this.updateFormations();
    
    // Update military stats
    this.updateStats();
  }

  private updateTraining(): void {
    this.units.forEach(unit => {
      if (unit.isTraining) {
        unit.trainingProgress += this.config.baseTrainingSpeed;
        
        if (unit.trainingProgress >= unit.stats.trainingTime) {
          unit.isTraining = false;
          unit.trainingProgress = 0;
          this.stats.trainingUnits--;
        }
      }
    });
  }

  private updateMovement(): void {
    for (const [unitId, movement] of this.movingUnits) {
      const unit = this.units.get(unitId);
      if (!unit) continue;

      // Move unit to next position in path
      if (movement.currentIndex < movement.path.length) {
        const nextTile = movement.path[movement.currentIndex];
        const { row, col } = nextTile.getGridPosition();
        unit.position = `${col},${row}`;
        this.visualization.updateUnitPosition(unitId, nextTile);
        movement.currentIndex++;
      } else {
        // Unit reached destination
        this.movingUnits.delete(unitId);
      }
    }
  }

  private updateFormations(): void {
    this.formations.forEach(formation => {
      // Remove destroyed units
      formation.units = formation.units.filter(unit => unit.currentHealth > 0);
      
      // Update formation strength
      formation.strength = this.calculateFormationStrength(formation);
      
      // Update formation morale
      formation.morale = this.calculateFormationMorale(formation);
    });
  }

  private updateStats(): void {
    // Update total units and strength
    this.stats.totalUnits = this.units.size;
    this.stats.totalStrength = Array.from(this.units.values())
      .reduce((total, unit) => total + this.calculateUnitStrength(unit), 0);
    
    // Update formations array
    this.stats.formations = Array.from(this.formations.values());
    
    // Update military power
    this.stats.militaryPower = this.calculateMilitaryPower();
  }

  public trainUnit(type: UnitType, position: string): boolean {
    const unitStats = this.getUnitStats(type);
    if (!unitStats) return false;

    // Check if we can afford the unit
    if (!this.canAffordUnit(unitStats.cost)) return false;

    // Check if we're at unit limit
    if (this.stats.totalUnits >= this.stats.maxUnits) return false;

    // Get hex tile for unit position
    const [col, row] = position.split(',').map(Number);
    const hexTile = this.pathfinding.getHexGrid().getHexTile(row, col);
    if (!hexTile) return false;

    // Create new unit
    const unit: Unit = {
      id: uuidv4(),
      type,
      stats: unitStats,
      currentHealth: unitStats.health,
      experience: 0,
      formation: MilitaryFormationType.SCATTERED,
      position,
      owner: this.ownerId,
      isTraining: true,
      trainingProgress: 0
    };

    // Deduct resources
    this.deductUnitCost(unitStats.cost);

    // Add unit to military
    this.units.set(unit.id, unit);
    this.stats.trainingUnits++;

    // Create unit visualization
    this.visualization.createUnitMesh(unit, hexTile);

    return true;
  }

  public removeUnit(unitId: string): void {
    const unit = this.units.get(unitId);
    if (!unit) return;

    // Remove unit visualization
    this.visualization.removeUnitMesh(unitId);

    // Remove unit from formations
    this.formations.forEach(formation => {
      formation.units = formation.units.filter(u => u.id !== unitId);
    });

    // Remove unit from military
    this.units.delete(unitId);
    this.stats.totalUnits--;
  }

  public createFormation(units: Unit[], formationType: MilitaryFormationType, position: string): Formation {
    const formationId = uuidv4();
    const formation: Formation = {
      id: formationId,
      units,
      formation: formationType,
      position,
      strength: this.calculateFormationStrength({ units, formation: formationType, position, strength: 0, morale: 0 }),
      morale: this.calculateFormationMorale({ units, formation: formationType, position, strength: 0, morale: 0 })
    };

    this.formations.set(formationId, formation);

    // Update unit formations
    units.forEach(unit => {
      unit.formation = formationType;
    });

    return formation;
  }

  public disbandFormation(formationId: string): void {
    const formation = this.formations.get(formationId);
    if (!formation) return;

    // Reset unit formations
    formation.units.forEach(unit => {
      unit.formation = MilitaryFormationType.SCATTERED;
    });

    this.formations.delete(formationId);
  }

  public moveUnit(unitId: string, targetPosition: string): boolean {
    const unit = this.units.get(unitId);
    if (!unit || unit.isTraining) return false;

    // Get current and target hex tiles
    const [currentCol, currentRow] = unit.position.split(',').map(Number);
    const [targetCol, targetRow] = targetPosition.split(',').map(Number);

    const currentTile = this.pathfinding.getHexGrid().getHexTile(currentRow, currentCol);
    const targetTile = this.pathfinding.getHexGrid().getHexTile(targetRow, targetCol);

    if (!currentTile || !targetTile) return false;

    // Find path to target
    const path = this.pathfinding.findPath(currentTile, targetTile, unit);
    if (path.length === 0) return false;

    // Start movement
    this.movingUnits.set(unitId, {
      path,
      currentIndex: 0
    });

    return true;
  }

  public attack(attackerId: string, defenderId: string): CombatResult | null {
    const attacker = this.units.get(attackerId);
    const defender = this.units.get(defenderId);
    
    if (!attacker || !defender || attacker.isTraining || defender.isTraining) {
      return null;
    }

    // Calculate combat modifiers
    const formationBonus = this.getFormationBonus(attacker.formation);
    const experienceBonus = attacker.experience * 0.1; // 10% bonus per experience point
    const moraleBonus = this.stats.morale * 0.01; // 1% bonus per morale point

    // Calculate damage
    const baseDamage = attacker.stats.attack * (1 + formationBonus + experienceBonus + moraleBonus);
    const defense = defender.stats.defense * (1 + this.getFormationBonus(defender.formation));
    const damageDealt = Math.max(0, baseDamage - defense);

    // Apply damage
    defender.currentHealth -= damageDealt;

    // Update unit visualization
    this.visualization.updateUnitHealth(defenderId, defender.currentHealth);

    // Calculate experience gain
    const experienceGained = Math.floor(damageDealt * this.config.experienceGainRate);
    attacker.experience += experienceGained;

    // Check if defender is destroyed
    if (defender.currentHealth <= 0) {
      this.removeUnit(defenderId);
    }

    return {
      attackerId,
      defenderId,
      damageDealt,
      experienceGained,
      defenderDestroyed: defender.currentHealth <= 0
    };
  }

  public highlightUnit(unitId: string, highlight: boolean): void {
    this.visualization.highlightUnit(unitId, highlight);
  }

  public dispose(): void {
    this.visualization.dispose();
  }

  private calculateUnitStrength(unit: Unit): number {
    const baseStrength = unit.stats.attack + unit.stats.defense;
    const experienceBonus = unit.experience * 0.1; // 10% bonus per experience point
    const healthBonus = (unit.currentHealth / unit.stats.health) * 0.2; // 20% bonus at full health
    return baseStrength * (1 + experienceBonus + healthBonus);
  }

  private calculateFormationStrength(formation: Formation): number {
    const baseStrength = formation.units.reduce((total, unit) => total + this.calculateUnitStrength(unit), 0);
    const formationBonus = this.getFormationBonus(formation.formation);
    return baseStrength * (1 + formationBonus);
  }

  private calculateFormationMorale(formation: Formation): number {
    const baseMorale = this.stats.morale;
    const healthBonus = formation.units.reduce((total, unit) => 
      total + (unit.currentHealth / unit.stats.health), 0) / formation.units.length;
    const experienceBonus = formation.units.reduce((total, unit) => 
      total + unit.experience, 0) / formation.units.length * 0.1;
    return baseMorale * (1 + healthBonus + experienceBonus);
  }

  private calculateMilitaryPower(): number {
    const unitPower = Array.from(this.units.values())
      .reduce((total, unit) => total + this.calculateUnitStrength(unit), 0);
    const formationPower = Array.from(this.formations.values())
      .reduce((total, formation) => total + formation.strength, 0);
    return unitPower + formationPower;
  }

  private getFormationBonus(formationType: MilitaryFormationType): number {
    return this.config.formationBonus[formationType].attack;
  }

  private canAffordUnit(cost: ResourceCost): boolean {
    const costMap = new Map<string, number>();
    for (const [resource, amount] of Object.entries(cost)) {
      costMap.set(resource, amount);
    }
    return this.gameState.hasEnough(costMap);
  }

  private deductUnitCost(cost: ResourceCost): void {
    const costMap = new Map<string, number>();
    for (const [resource, amount] of Object.entries(cost)) {
      costMap.set(resource, amount);
    }
    this.gameState.subtract(costMap);
  }

  private getUnitStats(type: UnitType): UnitStats | null {
    const epoch = this.gameState.getEpoch();
    return UNIT_CONFIGS[epoch as Epoch]?.[type] || null;
  }

  public getStats(): MilitaryStats {
    return { ...this.stats };
  }

  public getUnits(): Unit[] {
    return Array.from(this.units.values());
  }

  public getFormations(): Formation[] {
    return Array.from(this.formations.values());
  }
  
  public reset(): void {
    // Clear all units and formations
    this.units.clear();
    this.formations.clear();
    this.movingUnits.clear();
    
    // Reset visualization
    this.visualization.dispose();
    
    // Reset stats
    this.stats = {
      totalUnits: 0,
      totalStrength: 0,
      formations: [],
      morale: this.config.baseMorale,
      militaryPower: 0,
      trainingUnits: 0,
      maxUnits: this.config.maxUnitsPerEpoch[this.gameState.getEpoch() as Epoch]
    };
  }
  
  public serialize(): any {
    return {
      units: Array.from(this.units.entries()),
      formations: Array.from(this.formations.entries()),
      stats: this.stats
    };
  }
  
  public deserialize(data: any): void {
    if (!data) return;
    
    // Clear existing data
    this.reset();
    
    // Restore units
    if (data.units) {
      data.units.forEach(([id, unit]: [string, Unit]) => {
        this.units.set(id, unit);
        
        // Recreate visualizations for each unit
        const [col, row] = unit.position.split(',').map(Number);
        const hexTile = this.pathfinding.getHexGrid().getHexTile(row, col);
        if (hexTile) {
          this.visualization.createUnitMesh(unit, hexTile);
        }
      });
    }
    
    // Restore formations
    if (data.formations) {
      data.formations.forEach(([id, formation]: [string, Formation]) => {
        this.formations.set(id, formation);
      });
    }
    
    // Restore stats
    if (data.stats) {
      this.stats = data.stats;
    }
  }
} 