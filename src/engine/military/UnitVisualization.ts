import * as THREE from 'three';
import { Unit, UnitType } from './MilitaryTypes';
import { HexTile } from '../map/HexTile';

export class UnitVisualization {
  private unitMeshes: Map<string, THREE.Mesh>;
  private scene: THREE.Scene;
  private unitGeometries: Map<UnitType, THREE.BufferGeometry>;
  private unitMaterials: Map<UnitType, THREE.Material>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.unitMeshes = new Map();
    this.unitGeometries = new Map();
    this.unitMaterials = new Map();
    this.initializeGeometries();
  }

  private initializeGeometries(): void {
    // Create geometries for different unit types
    const warriorGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const scoutGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const archerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
    const cavalryGeometry = new THREE.BoxGeometry(0.7, 1.2, 0.7);

    // Create materials for different unit types
    const warriorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const scoutMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const archerMaterial = new THREE.MeshStandardMaterial({ color: 0x4B0082 });
    const cavalryMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });

    // Store geometries and materials
    this.unitGeometries.set(UnitType.WARRIOR, warriorGeometry);
    this.unitGeometries.set(UnitType.SCOUT, scoutGeometry);
    this.unitGeometries.set(UnitType.ARCHER, archerGeometry);
    this.unitGeometries.set(UnitType.CAVALRY, cavalryGeometry);

    this.unitMaterials.set(UnitType.WARRIOR, warriorMaterial);
    this.unitMaterials.set(UnitType.SCOUT, scoutMaterial);
    this.unitMaterials.set(UnitType.ARCHER, archerMaterial);
    this.unitMaterials.set(UnitType.CAVALRY, cavalryMaterial);
  }

  public createUnitMesh(unit: Unit, hexTile: HexTile): void {
    const geometry = this.unitGeometries.get(unit.type);
    const material = this.unitMaterials.get(unit.type);

    if (!geometry || !material) return;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(hexTile.getPosition());
    mesh.position.y = 0.5; // Lift unit slightly above ground
    mesh.userData.unitId = unit.id;

    this.scene.add(mesh);
    this.unitMeshes.set(unit.id, mesh);
  }

  public updateUnitPosition(unitId: string, hexTile: HexTile): void {
    const mesh = this.unitMeshes.get(unitId);
    if (mesh) {
      mesh.position.copy(hexTile.getPosition());
      mesh.position.y = 0.5; // Keep unit slightly above ground
    }
  }

  public removeUnitMesh(unitId: string): void {
    const mesh = this.unitMeshes.get(unitId);
    if (mesh) {
      this.scene.remove(mesh);
      this.unitMeshes.delete(unitId);
    }
  }

  public updateUnitHealth(unitId: string, health: number): void {
    const mesh = this.unitMeshes.get(unitId);
    if (mesh) {
      // Scale unit based on health
      const scale = 0.5 + (health / 100) * 0.5;
      mesh.scale.set(scale, scale, scale);

      // Change color based on health
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (health < 30) {
        material.color.setHex(0xFF0000); // Red for low health
      } else if (health < 70) {
        material.color.setHex(0xFFFF00); // Yellow for medium health
      } else {
        material.color.setHex(0x00FF00); // Green for high health
      }
    }
  }

  public highlightUnit(unitId: string, highlight: boolean): void {
    const mesh = this.unitMeshes.get(unitId);
    if (mesh) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (highlight) {
        material.emissive.setHex(0xFFFFFF);
        material.emissiveIntensity = 0.5;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
    }
  }

  public dispose(): void {
    // Remove all unit meshes from scene
    for (const mesh of this.unitMeshes.values()) {
      this.scene.remove(mesh);
    }
    this.unitMeshes.clear();
  }
} 