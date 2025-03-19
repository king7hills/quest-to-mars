import * as THREE from 'three';
import { BuildingType, BUILDING_PROPERTIES } from './BuildingTypes';
import { HexTile } from '../map/HexTile';

export class Building {
  public mesh: THREE.Mesh;
  private type: BuildingType;
  private properties: typeof BUILDING_PROPERTIES[BuildingType];
  private hexTile: HexTile;
  private health: number;
  private constructionProgress: number;
  private isConstructed: boolean;

  constructor(type: BuildingType, hexTile: HexTile) {
    this.type = type;
    this.properties = BUILDING_PROPERTIES[type];
    this.hexTile = hexTile;
    this.health = this.properties.health;
    this.constructionProgress = 0;
    this.isConstructed = false;

    // Create building geometry
    this.mesh = this.createMesh();

    // Add user data for identification
    this.mesh.userData = {
      type: this.type,
      row: this.hexTile.getGridPosition().row,
      col: this.hexTile.getGridPosition().col
    };
  }

  private createMesh(): THREE.Mesh {
    // Create building mesh based on type
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({
      color: this.getBuildingColor(),
      metalness: 0.5,
      roughness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.hexTile.getMesh().position);
    mesh.position.y = 1; // Place on top of hex
    return mesh;
  }

  private getBuildingColor(): number {
    switch (this.type) {
      case BuildingType.HUT:
        return 0x8B4513; // Brown
      case BuildingType.FARM:
        return 0x90EE90; // Light green
      case BuildingType.FACTORY:
        return 0x808080; // Gray
      case BuildingType.RESEARCH_LAB:
        return 0x4169E1; // Royal blue
      case BuildingType.SPACEPORT:
        return 0xFFD700; // Gold
      default:
        return 0xFFFFFF; // White
    }
  }

  public update(): void {
    if (!this.isConstructed) {
      this.constructionProgress += 1 / this.properties.constructionTime;
      if (this.constructionProgress >= 1) {
        this.isConstructed = true;
        this.constructionProgress = 1;
      }
      // Update visual appearance during construction
      const material = this.mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 0.3 + (0.7 * this.constructionProgress);
    }
  }

  public getType(): BuildingType {
    return this.type;
  }

  public getProperties(): typeof BUILDING_PROPERTIES[BuildingType] {
    return this.properties;
  }

  public getHexTile(): HexTile {
    return this.hexTile;
  }

  public getHealth(): number {
    return this.health;
  }

  public getConstructionProgress(): number {
    return this.constructionProgress;
  }

  public isFullyConstructed(): boolean {
    return this.isConstructed;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    // Update visual appearance based on health
    const material = this.mesh.material as THREE.MeshStandardMaterial;
    material.opacity = 0.3 + (0.7 * (this.health / this.properties.health));
  }

  public heal(amount: number): void {
    this.health = Math.min(this.properties.health, this.health + amount);
    // Update visual appearance based on health
    const material = this.mesh.material as THREE.MeshStandardMaterial;
    material.opacity = 0.3 + (0.7 * (this.health / this.properties.health));
  }

  public highlight(color: number = 0xffffff): void {
    const material = this.mesh.material as THREE.MeshStandardMaterial;
    material.color.setHex(color);
    material.opacity = 1;
  }

  public reset(): void {
    const material = this.mesh.material as THREE.MeshStandardMaterial;
    material.color.setHex(this.getBuildingColor());
    material.opacity = 0.5;
  }

  public getHex(): HexTile {
    return this.hexTile;
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setConstructionProgress(progress: number): void {
    this.constructionProgress = Math.max(0, Math.min(1, progress));
    this.updateMesh();
  }

  public completeConstruction(): void {
    this.constructionProgress = 1;
    this.isConstructed = true;
    this.updateMesh();
  }

  private updateMesh(): void {
    // Update mesh appearance based on construction progress
    const material = this.mesh.material as THREE.MeshStandardMaterial;
    material.color.setHex(this.getBuildingColor());
    material.opacity = 0.5 + (this.constructionProgress * 0.5);
    material.transparent = true;
  }
} 