import { ResourceType } from '../state/ResourceTypes';

export interface TechEffect {
  type: string;
  value: number;
  target: string;
}

export class Technology {
  private id: string;
  private name: string;
  private description: string;
  private cost: Map<ResourceType, number>;
  private prerequisites: string[];
  private researchTime: number;
  private effects: TechEffect[];

  constructor(
    id: string,
    name: string,
    description: string,
    cost: Map<ResourceType, number>,
    prerequisites: string[],
    researchTime: number,
    effects: TechEffect[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.cost = cost;
    this.prerequisites = prerequisites;
    this.researchTime = researchTime;
    this.effects = effects;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getCost(): Map<ResourceType, number> {
    return this.cost;
  }

  public getPrerequisites(): string[] {
    return this.prerequisites;
  }

  public getResearchTime(): number {
    return this.researchTime;
  }

  public getEffects(): TechEffect[] {
    return this.effects;
  }
} 