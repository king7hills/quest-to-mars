import { AIPlayerConfig, AIPersonality, DiplomaticStatus } from './AITypes';
import { AIPlayer } from './AIPlayer';
import { HexGrid } from '../map/HexGrid';
import { BuildingManager } from '../buildings/BuildingManager';
import { TechManager } from '../tech/TechManager';
import { DiplomaticEventManager, DiplomaticEvent, DiplomaticEventType } from './DiplomaticEvents';

export class AIManager {
  private aiPlayers: Map<string, AIPlayer>;
  private hexGrid: HexGrid;
  private buildingManager: BuildingManager;
  private techManager: TechManager;
  private diplomaticEventManager: DiplomaticEventManager;
  private turn: number;
  private relations: Map<string, DiplomaticStatus>;

  constructor(
    hexGrid: HexGrid,
    buildingManager: BuildingManager,
    techManager: TechManager
  ) {
    this.aiPlayers = new Map();
    this.hexGrid = hexGrid;
    this.buildingManager = buildingManager;
    this.techManager = techManager;
    this.diplomaticEventManager = new DiplomaticEventManager();
    this.turn = 0;
    this.relations = new Map();
  }

  public initializeAIPlayers(): void {
    // Create AI players with different personalities
    const aiConfigs: AIPlayerConfig[] = [
      {
        id: 'ai1',
        name: 'The Aggressive Empire',
        personality: AIPersonality.AGGRESSIVE,
        startingPosition: { row: 5, col: 5 },
        startingResources: {},
        startingPopulation: 10,
        militaryAggression: 0.8,
        economicFocus: 0.4,
        researchFocus: 0.3,
        diplomaticTendency: 0.2
      },
      {
        id: 'ai2',
        name: 'The Diplomatic Federation',
        personality: AIPersonality.DIPLOMATIC,
        startingPosition: { row: 10, col: 10 },
        startingResources: {},
        startingPopulation: 10,
        militaryAggression: 0.3,
        economicFocus: 0.5,
        researchFocus: 0.4,
        diplomaticTendency: 0.8
      },
      {
        id: 'ai3',
        name: 'The Isolationist Kingdom',
        personality: AIPersonality.ISOLATIONIST,
        startingPosition: { row: 15, col: 15 },
        startingResources: {},
        startingPopulation: 10,
        militaryAggression: 0.4,
        economicFocus: 0.6,
        researchFocus: 0.5,
        diplomaticTendency: 0.1
      }
    ];

    // Create AI players
    aiConfigs.forEach(config => {
      const aiPlayer = new AIPlayer(
        config,
        this.buildingManager,
        this.hexGrid,
        this.techManager,
        this
      );
      this.aiPlayers.set(config.id, aiPlayer);

      // Initialize diplomatic relations between AI players
      this.initializeDiplomaticRelations(aiPlayer);
    });
  }

  private initializeDiplomaticRelations(aiPlayer: AIPlayer): void {
    this.aiPlayers.forEach(otherPlayer => {
      if (otherPlayer.id !== aiPlayer.id) {
        // Set initial diplomatic status based on personalities
        const status = this.determineInitialDiplomaticStatus(aiPlayer, otherPlayer);
        aiPlayer.setDiplomaticStatus(otherPlayer.id, status);
        otherPlayer.setDiplomaticStatus(aiPlayer.id, status);
      }
    });
  }

  private determineInitialDiplomaticStatus(ai1: AIPlayer, ai2: AIPlayer): DiplomaticStatus {
    // Aggressive players start hostile
    if (ai1.personality === AIPersonality.AGGRESSIVE || ai2.personality === AIPersonality.AGGRESSIVE) {
      return DiplomaticStatus.HOSTILE;
    }
    // Diplomatic players start friendly
    if (ai1.personality === AIPersonality.DIPLOMATIC && ai2.personality === AIPersonality.DIPLOMATIC) {
      return DiplomaticStatus.FRIENDLY;
    }
    // Default to neutral
    return DiplomaticStatus.NEUTRAL;
  }

  public update(): void {
    // Update each AI player
    this.aiPlayers.forEach(aiPlayer => {
      aiPlayer.update(this.turn);
    });

    // Update diplomatic relations
    this.updateDiplomaticRelations();

    // Update diplomatic events
    this.diplomaticEventManager.updateEvents();

    // Check for conflicts
    this.checkConflicts();

    this.turn++;
  }

  private updateDiplomaticRelations(): void {
    // Update relations based on proximity and actions
    this.aiPlayers.forEach(ai1 => {
      this.aiPlayers.forEach(ai2 => {
        if (ai1.id !== ai2.id) {
          const currentStatus = ai1.getDiplomaticStatus(ai2.id);
          const newStatus = this.evaluateDiplomaticStatus(ai1, ai2, currentStatus);
          
          if (newStatus !== currentStatus) {
            // Create appropriate diplomatic event based on status change
            const event = this.createDiplomaticEventForStatusChange(ai1, ai2, newStatus);
            if (event) {
              this.diplomaticEventManager.executeEvent(event, ai1, ai2);
            }
          }
        }
      });
    });
  }

  private createDiplomaticEventForStatusChange(
    ai1: AIPlayer,
    ai2: AIPlayer,
    newStatus: DiplomaticStatus
  ): DiplomaticEvent | null {
    // Only create events for significant changes
    if (newStatus === DiplomaticStatus.NEUTRAL) {
      return null;
    }

    const eventType = this.getDiplomaticEventTypeForStatus(newStatus);
    if (!eventType) {
      return null;
    }

    return this.diplomaticEventManager.createEvent(
      eventType,
      ai1,
      ai2,
      newStatus
    );
  }

  private getDiplomaticEventTypeForStatus(status: DiplomaticStatus): DiplomaticEventType | null {
    switch (status) {
      case DiplomaticStatus.ALLIED:
        return DiplomaticEventType.MILITARY_ALLIANCE;
      case DiplomaticStatus.FRIENDLY:
        return DiplomaticEventType.TRADE_AGREEMENT;
      case DiplomaticStatus.HOSTILE:
      case DiplomaticStatus.WAR:
      default:
        return null;
    }
  }

  private evaluateDiplomaticStatus(ai1: AIPlayer, ai2: AIPlayer, currentStatus: DiplomaticStatus): DiplomaticStatus {
    // Get territory proximity
    const proximity = this.calculateTerritoryProximity(ai1, ai2);
    
    // Get personality compatibility
    const compatibility = this.calculatePersonalityCompatibility(ai1, ai2);
    
    // Get military balance
    const militaryBalance = this.calculateMilitaryBalance(ai1, ai2);
    
    // Get economic balance
    const economicBalance = this.calculateEconomicBalance(ai1, ai2);

    // Calculate status change probability
    let statusChangeProbability = 0;
    
    // Proximity effects
    if (proximity < 3) {
      statusChangeProbability += 0.2; // Close proximity increases tension
    } else if (proximity > 8) {
      statusChangeProbability -= 0.1; // Distance reduces tension
    }

    // Personality effects
    statusChangeProbability += compatibility * 0.3;

    // Military balance effects
    if (Math.abs(militaryBalance) > 0.5) {
      statusChangeProbability += militaryBalance * 0.2;
    }

    // Economic balance effects
    if (Math.abs(economicBalance) > 0.5) {
      statusChangeProbability += economicBalance * 0.1;
    }

    // Determine status change based on probability
    if (Math.random() < Math.abs(statusChangeProbability)) {
      switch (currentStatus) {
        case DiplomaticStatus.WAR:
          return statusChangeProbability > 0 ? DiplomaticStatus.HOSTILE : DiplomaticStatus.WAR;
        case DiplomaticStatus.HOSTILE:
          return statusChangeProbability > 0 ? DiplomaticStatus.NEUTRAL : DiplomaticStatus.WAR;
        case DiplomaticStatus.NEUTRAL:
          return statusChangeProbability > 0 ? DiplomaticStatus.FRIENDLY : DiplomaticStatus.HOSTILE;
        case DiplomaticStatus.FRIENDLY:
          return statusChangeProbability > 0 ? DiplomaticStatus.ALLIED : DiplomaticStatus.NEUTRAL;
        case DiplomaticStatus.ALLIED:
          return statusChangeProbability < 0 ? DiplomaticStatus.FRIENDLY : DiplomaticStatus.ALLIED;
        default:
          return currentStatus;
      }
    }

    return currentStatus;
  }

  private calculateTerritoryProximity(ai1: AIPlayer, ai2: AIPlayer): number {
    let minDistance = Infinity;
    
    ai1.territory.forEach(hex1 => {
      ai2.territory.forEach(hex2 => {
        const [q1, r1] = hex1.split(',').map(Number);
        const [q2, r2] = hex2.split(',').map(Number);
        
        const distance = this.hexGrid.getDistance(q1, r1, q2, r2);
        minDistance = Math.min(minDistance, distance);
      });
    });

    return minDistance;
  }

  private calculatePersonalityCompatibility(ai1: AIPlayer, ai2: AIPlayer): number {
    // Calculate compatibility based on personality combinations
    const compatibilityMatrix: Record<AIPersonality, Record<AIPersonality, number>> = {
      [AIPersonality.AGGRESSIVE]: {
        [AIPersonality.AGGRESSIVE]: -0.5,
        [AIPersonality.DIPLOMATIC]: -0.3,
        [AIPersonality.ISOLATIONIST]: -0.2,
        [AIPersonality.TRADER]: -0.1
      },
      [AIPersonality.DIPLOMATIC]: {
        [AIPersonality.AGGRESSIVE]: -0.3,
        [AIPersonality.DIPLOMATIC]: 0.5,
        [AIPersonality.ISOLATIONIST]: 0.2,
        [AIPersonality.TRADER]: 0.4
      },
      [AIPersonality.ISOLATIONIST]: {
        [AIPersonality.AGGRESSIVE]: -0.2,
        [AIPersonality.DIPLOMATIC]: 0.2,
        [AIPersonality.ISOLATIONIST]: 0.3,
        [AIPersonality.TRADER]: 0.1
      },
      [AIPersonality.TRADER]: {
        [AIPersonality.AGGRESSIVE]: -0.1,
        [AIPersonality.DIPLOMATIC]: 0.4,
        [AIPersonality.ISOLATIONIST]: 0.1,
        [AIPersonality.TRADER]: 0.3
      }
    };

    return compatibilityMatrix[ai1.personality][ai2.personality];
  }

  private calculateMilitaryBalance(ai1: AIPlayer, ai2: AIPlayer): number {
    // Calculate relative military strength (-1 to 1)
    const totalStrength = ai1.militaryStrength + ai2.militaryStrength;
    if (totalStrength === 0) return 0;
    return (ai1.militaryStrength - ai2.militaryStrength) / totalStrength;
  }

  private calculateEconomicBalance(ai1: AIPlayer, ai2: AIPlayer): number {
    // Calculate relative economic strength (-1 to 1)
    const totalStrength = ai1.economicStrength + ai2.economicStrength;
    if (totalStrength === 0) return 0;
    return (ai1.economicStrength - ai2.economicStrength) / totalStrength;
  }

  private checkConflicts(): void {
    // TODO: Implement conflict checking between AI players and the human player
  }

  public getAIPlayers(): Map<string, AIPlayer> {
    return this.aiPlayers;
  }

  public getAIPlayer(id: string): AIPlayer | undefined {
    return this.aiPlayers.get(id);
  }

  public getTurn(): number {
    return this.turn;
  }

  public getDiplomaticEventManager(): DiplomaticEventManager {
    return this.diplomaticEventManager;
  }

  // Add required reset, serialize and deserialize methods
  public reset(): void {
    this.aiPlayers.clear();
    this.relations.clear();
  }
  
  public serialize(): any {
    return {
      aiPlayers: Array.from(this.aiPlayers.entries()).map(([id, player]) => {
        return [id, player.serialize()];
      }),
      relations: Array.from(this.relations.entries()).map(([key, status]) => {
        return [key, status];
      })
    };
  }
  
  public deserialize(data: any): void {
    if (!data) return;
    
    // Clear existing data
    this.reset();
    
    // Restore AI players
    if (data.aiPlayers && Array.isArray(data.aiPlayers)) {
      data.aiPlayers.forEach(([id, playerData]: [string, any]) => {
        if (this.aiPlayers.has(id)) {
          const player = this.aiPlayers.get(id);
          if (player) {
            player.deserialize(playerData);
          }
        }
      });
    }
    
    // Restore relations
    if (data.relations && Array.isArray(data.relations)) {
      data.relations.forEach(([key, status]: [string, DiplomaticStatus]) => {
        this.relations.set(key, status);
      });
    }
  }
} 