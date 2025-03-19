import { TechType, TECH_PROPERTIES } from './TechTypes';
import { GameState } from '../state/GameState';
import { Epoch } from '../state/GameTypes';
import { Technology } from './Technology';
import { TechTree } from './TechTree';
import { ResourceType } from '../state/ResourceTypes';

export class TechManager {
  private gameState: GameState;
  private techTree: TechTree;
  private researchedTechnologies: Set<string>;
  private currentResearch: Technology | null;
  private researchProgress: number;
  private researchSpeed: number;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.techTree = new TechTree();
    this.researchedTechnologies = new Set();
    this.currentResearch = null;
    this.researchProgress = 0;
    this.researchSpeed = 1.0;
  }

  public update(): void {
    if (this.currentResearch) {
      const tech = TECH_PROPERTIES[this.currentResearch.getId() as TechType];
      const techPoints = this.gameState.getResource(ResourceType.TECH_POINTS);

      // Check if we have enough tech points
      if (techPoints && techPoints.amount >= tech.cost) {
        // Update research progress
        this.researchProgress += this.researchSpeed;

        // If research is complete
        if (this.researchProgress >= tech.cost) {
          this.completeResearch();
          this.currentResearch = null;
          this.researchProgress = 0;
        }
      } else {
        // Not enough tech points, pause research
        this.currentResearch = null;
        this.researchProgress = 0;
      }
    }
  }

  public startResearch(techId: TechType | string): boolean {
    const techIdStr = typeof techId === 'string' ? techId : String(techId);
    const technology = this.techTree.getTechnology(techIdStr);
    if (!technology || this.researchedTechnologies.has(techIdStr)) {
      return false;
    }

    // Check if prerequisites are met
    if (!this.hasPrerequisites(technology)) {
      return false;
    }

    // Check if player has enough resources
    if (!this.gameState.hasEnough(technology.getCost())) {
      return false;
    }

    this.currentResearch = technology;
    this.researchProgress = 0;
    return true;
  }

  public cancelResearch(): void {
    this.currentResearch = null;
    this.researchProgress = 0;
  }

  private completeResearch(): void {
    if (this.currentResearch) {
      const tech = TECH_PROPERTIES[this.currentResearch.getId() as TechType];
      
      // Deduct tech points
      this.gameState.modifyResource(ResourceType.TECH_POINTS, -tech.cost);

      // Add to researched technologies
      this.researchedTechnologies.add(this.currentResearch.getId());

      // Apply technology effects
      this.applyTechnologyEffects(this.currentResearch);

      // Check for epoch advancement
      this.checkEpochAdvancement();

      // Reset current research
      this.currentResearch = null;
      this.researchProgress = 0;
    }
  }

  private applyTechnologyEffects(technology: Technology): void {
    // Apply technology effects to game state
    const effects = technology.getEffects();
    
    effects.forEach(effect => {
      switch (effect.type) {
        case 'PRODUCTION':
          if (effect.target === 'ALL') {
            // Apply to all resources
            Object.values(ResourceType).forEach(resourceType => {
              if (resourceType !== ResourceType.TECH_POINTS) { // Skip tech points
                const resource = this.gameState.getResource(resourceType);
                if (resource) {
                  resource.productionMultiplier *= effect.value;
                }
              }
            });
          } else {
            // Apply to specific resource
            // Convert target string to ResourceType
            const resourceTypeStr = effect.target.toUpperCase();
            if (resourceTypeStr in ResourceType) {
              const resourceType = ResourceType[resourceTypeStr as keyof typeof ResourceType];
              const resource = this.gameState.getResource(resourceType);
              if (resource) {
                resource.productionMultiplier *= effect.value;
              }
            }
          }
          break;
          
        case 'POPULATION':
          if (effect.target === 'GROWTH') {
            this.gameState.setPopulationGrowthMultiplier(
              this.gameState.getPopulationGrowthMultiplier() * effect.value
            );
          }
          break;
          
        case 'UNLOCK':
          // Handle unlocking new buildings or features
          // This will be implemented when we add the building unlock system
          break;
      }
    });
  }

  private hasPrerequisites(technology: Technology): boolean {
    return technology.getPrerequisites().every(prereqId => 
      this.researchedTechnologies.has(prereqId)
    );
  }

  private checkEpochAdvancement(): void {
    const currentEpoch = this.gameState.getEpoch();
    const epochTechs = Object.values(TechType).filter(
      tech => TECH_PROPERTIES[tech].epoch === currentEpoch
    );

    // Check if all technologies for current epoch are researched
    const allEpochTechsResearched = epochTechs.every(tech => this.researchedTechnologies.has(tech));

    if (allEpochTechsResearched) {
      switch (currentEpoch) {
        case Epoch.TRIBAL:
          this.gameState.advanceEpoch();
          break;
        case Epoch.AGRICULTURAL:
          this.gameState.advanceEpoch();
          break;
        case Epoch.INDUSTRIAL:
          this.gameState.advanceEpoch();
          break;
        default:
          break;
      }
    }
  }

  public getResearchedTechnologies(): string[] {
    return Array.from(this.researchedTechnologies);
  }

  public getCurrentResearch(): TechType | null {
    return this.currentResearch?.getId() as TechType || null;
  }

  public getResearchProgress(): number {
    return this.researchProgress;
  }

  public getResearchSpeed(): number {
    return this.researchSpeed;
  }

  public isTechnologyResearched(techId: string): boolean {
    return this.researchedTechnologies.has(techId);
  }

  private canResearchInternal(techId: string): boolean {
    const technology = this.techTree.getTechnology(techId);
    if (!technology) {
      return false;
    }

    return (
      !this.researchedTechnologies.has(techId) &&
      this.hasPrerequisites(technology) &&
      this.gameState.getEpoch() >= TECH_PROPERTIES[technology.getId() as TechType].epoch &&
      this.gameState.hasEnough(technology.getCost())
    );
  }

  public canResearch(techType: TechType): boolean {
    return this.canResearchInternal(techType.toString());
  }

  public serialize(): any[] {
    return Array.from(this.researchedTechnologies);
  }

  public deserialize(data: any[]): void {
    this.researchedTechnologies = new Set(data);
    this.currentResearch = null;
    this.researchProgress = 0;
  }

  public reset(): void {
    this.researchedTechnologies.clear();
    this.currentResearch = null;
    this.researchProgress = 0;
  }

  public isTechResearched(techType: TechType): boolean {
    return this.researchedTechnologies.has(techType.toString());
  }
} 