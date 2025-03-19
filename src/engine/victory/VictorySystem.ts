import { GameState } from '../state/GameState';
import { Epoch } from '../state/GameTypes';
import { BuildingType } from '../buildings/BuildingTypes';
import { BuildingManager } from '../buildings/BuildingManager';

export enum VictoryCondition {
  SPACE_AGE = 'SPACE_AGE',
  SPACEPORT = 'SPACEPORT',
  LAUNCH_TO_MARS = 'LAUNCH_TO_MARS'
}

export interface VictoryState {
  conditions: Map<VictoryCondition, boolean>;
  winner: string | null;
  gameOver: boolean;
}

export class VictorySystem {
  private gameState: GameState;
  private buildingManager: BuildingManager;
  private victoryState: VictoryState;

  constructor(gameState: GameState, buildingManager: BuildingManager) {
    this.gameState = gameState;
    this.buildingManager = buildingManager;
    this.victoryState = {
      conditions: new Map(),
      winner: null,
      gameOver: false
    };
  }

  public update(): void {
    if (this.victoryState.gameOver) return;

    // Check Space Age condition
    const spaceAgeAchieved = this.gameState.getEpoch() === Epoch.SPACE_AGE;
    this.victoryState.conditions.set(VictoryCondition.SPACE_AGE, spaceAgeAchieved);

    // Check Spaceport condition
    const hasSpaceport = this.checkSpaceportCondition();
    this.victoryState.conditions.set(VictoryCondition.SPACEPORT, hasSpaceport);

    // Check Launch to Mars condition
    const canLaunchToMars = this.checkLaunchToMarsCondition();
    this.victoryState.conditions.set(VictoryCondition.LAUNCH_TO_MARS, canLaunchToMars);

    // Check if all conditions are met
    const allConditionsMet = Array.from(this.victoryState.conditions.values()).every(condition => condition);
    if (allConditionsMet) {
      this.victoryState.winner = this.gameState.getCurrentPlayerId();
      this.victoryState.gameOver = true;
    }
  }

  private checkSpaceportCondition(): boolean {
    // Check if player has built a Spaceport
    const buildings = this.buildingManager.getAllBuildings();
    return buildings.some(building => building.getType() === BuildingType.SPACEPORT);
  }

  private checkLaunchToMarsCondition(): boolean {
    // Check if player has enough resources to launch to Mars
    const resources = this.gameState.getResources();
    return (
      resources.fuel.amount >= 1000 &&
      resources.metal.amount >= 500 &&
      resources.techPoints.amount >= 2000
    );
  }

  public getVictoryState(): VictoryState {
    return this.victoryState;
  }

  public isGameOver(): boolean {
    return this.victoryState.gameOver;
  }

  public getWinner(): string | null {
    return this.victoryState.winner;
  }

  public getConditions(): Map<VictoryCondition, boolean> {
    return this.victoryState.conditions;
  }
} 