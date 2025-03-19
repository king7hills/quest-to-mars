import * as THREE from 'three';
import { TerrainType, TERRAIN_PROPERTIES } from './TerrainTypes';
import { HexType } from './HexTypes';

export class HexTile {
  public mesh: THREE.Mesh;
  private terrainType: TerrainType;
  private properties: typeof TERRAIN_PROPERTIES[TerrainType];
  private row: number;
  private col: number;
  private health: number;
  private constructionProgress: number;
  private isConstructed: boolean;
  private type: HexType;
  private resources: Map<string, number>;

  constructor(terrainType: TerrainType, row: number, col: number) {
    this.terrainType = terrainType;
    this.properties = TERRAIN_PROPERTIES[terrainType];
    this.row = row;
    this.col = col;
    this.health = 100;
    this.constructionProgress = 0;
    this.isConstructed = false;
    this.type = HexType.PLAINS;
    this.resources = new Map();

    // Create mesh with thicker height for better visibility
    const geometry = new THREE.CylinderGeometry(1.0, 1.0, 0.5, 6);

    // Create material with enhanced colors and lighting properties
    const color = new THREE.Color(this.properties.color);
    // Slightly adjust color for visual variety
    color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.2,
      roughness: 0.7,
      flatShading: true,
      side: THREE.DoubleSide, // Render both sides
      transparent: terrainType === TerrainType.WATER,
      opacity: terrainType === TerrainType.WATER ? 0.8 : 1.0,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Add a darker and more visible wireframe for borders
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineWidth = terrainType === TerrainType.WATER ? 1.0 : 2.0;
    const wireframe = new THREE.LineSegments(
      edgesGeometry,
      new THREE.LineBasicMaterial({ 
        color: 0x000000, 
        linewidth: lineWidth,
        opacity: terrainType === TerrainType.WATER ? 0.5 : 0.9,
        transparent: true 
      })
    );
    wireframe.position.y = 0.02; // Slight offset to prevent z-fighting
    this.mesh.add(wireframe);

    // Add terrain-specific decorations
    this.addTerrainDecorations();

    // Set up the mesh
    this.mesh.userData.isHexTile = true;
    this.mesh.userData.row = row;
    this.mesh.userData.col = col;
    this.mesh.userData.terrainType = terrainType;
    this.mesh.rotation.x = Math.PI / 2; // Rotate to lay flat
    
    // Add subtle shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  private addTerrainDecorations(): void {
    // Add terrain-specific visual elements
    switch (this.terrainType) {
      case TerrainType.FOREST:
        this.addForestDecoration();
        break;
      case TerrainType.MOUNTAIN:
        this.addMountainDecoration();
        break;
      case TerrainType.DESERT:
        this.addDesertDecoration();
        break;
      case TerrainType.WATER:
        this.addWaterDecoration();
        break;
      case TerrainType.TUNDRA:
        this.addTundraDecoration();
        break;
      default:
        break;
    }
  }

  private addForestDecoration(): void {
    // Create simple tree shapes
    const treeCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < treeCount; i++) {
      const treeTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      );
      
      const treeTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.4, 5),
        new THREE.MeshStandardMaterial({ color: 0x004d00 })
      );
      
      // Position trees
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.4;
      treeTrunk.position.set(
        radius * Math.cos(angle),
        0.25,
        radius * Math.sin(angle)
      );
      treeTop.position.set(
        radius * Math.cos(angle),
        0.45,
        radius * Math.sin(angle)
      );
      
      this.mesh.add(treeTrunk);
      this.mesh.add(treeTop);
    }
  }

  private addMountainDecoration(): void {
    // Create a small peak
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.8, 4),
      new THREE.MeshStandardMaterial({ 
        color: 0x606060,
        roughness: 0.9
      })
    );
    
    mountain.position.y = 0.3;
    this.mesh.add(mountain);
  }

  private addWaterDecoration(): void {
    // Add slight wave effect to water
    const waves = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7, 8, 8),
      new THREE.MeshStandardMaterial({ 
        color: 0x4169E1,
        transparent: true,
        opacity: 0.7,
        wireframe: true
      })
    );
    
    waves.position.y = 0.15;
    this.mesh.add(waves);
  }

  private addDesertDecoration(): void {
    // Add cactus or sand dunes
    if (Math.random() > 0.6) {
      const cactus = new THREE.Group();
      
      const cactusBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0x2E8B57 })
      );
      
      cactus.add(cactusBody);
      cactus.position.y = 0.2;
      this.mesh.add(cactus);
    }
  }

  private addTundraDecoration(): void {
    // Add snow caps
    const snow = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 6),
      new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
      })
    );
    
    snow.rotation.x = -Math.PI / 2;
    snow.position.y = 0.11;
    this.mesh.add(snow);
  }

  public update(): void {
    // Update visual state based on health and construction progress
    if (!this.isConstructed) {
      const scale = 0.5 + (this.constructionProgress / 100) * 0.5;
      this.mesh.scale.set(scale, 1, scale);
    } else {
      const healthScale = 0.8 + (this.health / 100) * 0.2;
      this.mesh.scale.set(healthScale, 1, healthScale);
    }
  }

  public getTerrainType(): TerrainType {
    return this.terrainType;
  }

  public setTerrainType(type: TerrainType): void {
    this.terrainType = type;
    this.properties = TERRAIN_PROPERTIES[type];
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(this.properties.color);
  }

  public isWalkable(): boolean {
    return this.properties.walkable;
  }

  public getResourcePotential(resource: keyof typeof this.properties.resourcePotential): number {
    return this.properties.resourcePotential[resource];
  }

  public getProductionMultiplier(): number {
    return this.properties.productionMultiplier;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }

  public getGridPosition(): { row: number; col: number } {
    return { row: this.row, col: this.col };
  }

  public highlight(color: number): void {
    (this.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(color);
    (this.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
    
    // Scale up slightly to further emphasize the highlight
    this.mesh.scale.set(1.05, 1.0, 1.05);
  }

  public reset(): void {
    (this.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
    (this.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    
    // Reset scale
    this.mesh.scale.set(1.0, 1.0, 1.0);
  }

  public getHealth(): number {
    return this.health;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.update();
  }

  public heal(amount: number): void {
    this.health = Math.min(100, this.health + amount);
    this.update();
  }

  public getConstructionProgress(): number {
    return this.constructionProgress;
  }

  public setConstructionProgress(progress: number): void {
    this.constructionProgress = Math.min(100, Math.max(0, progress));
    if (this.constructionProgress >= 100) {
      this.isConstructed = true;
    }
    this.update();
  }

  public isFullyConstructed(): boolean {
    return this.isConstructed;
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getRow(): number {
    return this.row;
  }

  public getCol(): number {
    return this.col;
  }

  public getType(): HexType {
    return this.type;
  }

  public setType(type: HexType): void {
    this.type = type;
    // Update mesh appearance based on type
    const material = this.mesh.material as THREE.MeshStandardMaterial;
    switch (type) {
      case HexType.PLAINS:
        material.color.setHex(0x90EE90); // Light green
        break;
      case HexType.MOUNTAINS:
        material.color.setHex(0x808080); // Gray
        break;
      case HexType.WATER:
        material.color.setHex(0x4169E1); // Royal blue
        break;
      case HexType.DESERT:
        material.color.setHex(0xF4A460); // Sandy brown
        break;
      case HexType.FOREST:
        material.color.setHex(0x228B22); // Forest green
        break;
    }
  }

  public getResources(): Map<string, number> {
    return this.resources;
  }

  public setResources(resources: Map<string, number>): void {
    this.resources = resources;
  }

  public addResource(type: string, amount: number): void {
    const currentAmount = this.resources.get(type) || 0;
    this.resources.set(type, currentAmount + amount);
  }

  public removeResource(type: string, amount: number): void {
    const currentAmount = this.resources.get(type) || 0;
    this.resources.set(type, Math.max(0, currentAmount - amount));
  }
} 