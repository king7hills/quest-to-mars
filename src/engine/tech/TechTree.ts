import { Technology } from './Technology';
import { ResourceType } from '../state/ResourceTypes';
import { Epoch } from '../state/GameTypes';

export class TechTree {
  private technologies: Map<string, Technology>;

  constructor() {
    this.technologies = new Map();
    this.initializeTechTree();
  }

  private initializeTechTree(): void {
    // Tribal Epoch Technologies
    this.addTechnology(new Technology(
      'BASIC_TOOLS',
      'Basic Tools',
      'Develop simple tools for resource gathering',
      new Map([[ResourceType.TECH_POINTS, 50]]),
      [],
      5,
      [{ type: 'PRODUCTION', value: 1.2, target: 'WOOD' }]
    ));

    this.addTechnology(new Technology(
      'STONE_WORKING',
      'Stone Working',
      'Learn to work with stone for better tools and buildings',
      new Map([[ResourceType.TECH_POINTS, 100]]),
      ['BASIC_TOOLS'],
      10,
      [{ type: 'PRODUCTION', value: 1.2, target: 'STONE' }]
    ));

    this.addTechnology(new Technology(
      'BASIC_SHELTER',
      'Basic Shelter',
      'Improve housing and protection from the elements',
      new Map([[ResourceType.TECH_POINTS, 150]]),
      ['BASIC_TOOLS'],
      15,
      [{ type: 'POPULATION', value: 1.2, target: 'GROWTH' }]
    ));

    // Agricultural Epoch Technologies
    this.addTechnology(new Technology(
      'AGRICULTURE',
      'Agriculture',
      'Learn to cultivate crops and domesticate animals',
      new Map([[ResourceType.TECH_POINTS, 200]]),
      ['BASIC_TOOLS'],
      20,
      [{ type: 'PRODUCTION', value: 1.5, target: 'FOOD' }]
    ));

    this.addTechnology(new Technology(
      'IRRIGATION',
      'Irrigation',
      'Develop systems for efficient water management',
      new Map([[ResourceType.TECH_POINTS, 250]]),
      ['AGRICULTURE'],
      25,
      [{ type: 'PRODUCTION', value: 1.3, target: 'FOOD' }]
    ));

    this.addTechnology(new Technology(
      'ANIMAL_HUSBANDRY',
      'Animal Husbandry',
      'Learn to breed and raise animals for food and labor',
      new Map([[ResourceType.TECH_POINTS, 300]]),
      ['AGRICULTURE'],
      30,
      [{ type: 'PRODUCTION', value: 1.4, target: 'FOOD' }]
    ));

    // Industrial Epoch Technologies
    this.addTechnology(new Technology(
      'METALLURGY',
      'Metallurgy',
      'Learn to extract and work with metals',
      new Map([[ResourceType.TECH_POINTS, 400]]),
      ['STONE_WORKING'],
      40,
      [{ type: 'PRODUCTION', value: 1.5, target: 'METAL' }]
    ));

    this.addTechnology(new Technology(
      'STEAM_POWER',
      'Steam Power',
      'Harness the power of steam for industrial production',
      new Map([[ResourceType.TECH_POINTS, 450]]),
      ['METALLURGY'],
      45,
      [{ type: 'PRODUCTION', value: 1.3, target: 'ALL' }]
    ));

    this.addTechnology(new Technology(
      'COMBUSTION',
      'Combustion',
      'Learn to harness the power of combustion',
      new Map([[ResourceType.TECH_POINTS, 500]]),
      ['STEAM_POWER'],
      50,
      [{ type: 'PRODUCTION', value: 1.5, target: 'FUEL' }]
    ));

    // Space Age Technologies
    this.addTechnology(new Technology(
      'ROCKETRY',
      'Rocketry',
      'Develop the fundamentals of rocket propulsion',
      new Map([[ResourceType.TECH_POINTS, 600]]),
      ['COMBUSTION'],
      60,
      [{ type: 'UNLOCK', value: 1, target: 'ROCKET' }]
    ));

    this.addTechnology(new Technology(
      'SPACE_TECH',
      'Space Technology',
      'Develop the technology needed for space travel',
      new Map([[ResourceType.TECH_POINTS, 800]]),
      ['ROCKETRY'],
      80,
      [{ type: 'UNLOCK', value: 1, target: 'SPACEPORT' }]
    ));

    this.addTechnology(new Technology(
      'LIFE_SUPPORT',
      'Life Support Systems',
      'Develop systems for sustaining life in space',
      new Map([[ResourceType.TECH_POINTS, 700]]),
      ['ROCKETRY'],
      70,
      [{ type: 'POPULATION', value: 1.2, target: 'SPACE' }]
    ));
  }

  private addTechnology(technology: Technology): void {
    this.technologies.set(technology.getId(), technology);
  }

  public getTechnology(id: string): Technology | undefined {
    return this.technologies.get(id);
  }

  public getTechnologiesByEpoch(epoch: Epoch): Technology[] {
    return Array.from(this.technologies.values()).filter(tech => {
      const techEpoch = this.getTechnologyEpoch(tech.getId());
      return techEpoch === epoch;
    });
  }

  private getTechnologyEpoch(techId: string): Epoch {
    // Define epoch thresholds based on tech costs
    const cost = this.technologies.get(techId)?.getCost().get(ResourceType.TECH_POINTS) || 0;
    
    if (cost <= 150) return Epoch.TRIBAL;
    if (cost <= 300) return Epoch.AGRICULTURAL;
    if (cost <= 500) return Epoch.INDUSTRIAL;
    return Epoch.SPACE_AGE;
  }

  public getAllTechnologies(): Technology[] {
    return Array.from(this.technologies.values());
  }

  public getPrerequisites(techId: string): Technology[] {
    const tech = this.technologies.get(techId);
    if (!tech) return [];
    
    return tech.getPrerequisites()
      .map(prereqId => this.technologies.get(prereqId))
      .filter((tech): tech is Technology => tech !== undefined);
  }

  public getDependents(techId: string): Technology[] {
    return Array.from(this.technologies.values())
      .filter(tech => tech.getPrerequisites().includes(techId));
  }

  public getCost(id: string): Map<ResourceType, number> {
    const technology = this.technologies.get(id);
    return technology ? technology.getCost() : new Map();
  }

  public getResearchTime(id: string): number {
    const technology = this.technologies.get(id);
    return technology ? technology.getResearchTime() : 0;
  }

  public getEffects(id: string): any[] {
    const technology = this.technologies.get(id);
    return technology ? technology.getEffects() : [];
  }
} 