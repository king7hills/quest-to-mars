import * as THREE from 'three';
import { Building } from './Building';
import { BuildingType, BUILDING_PROPERTIES } from './BuildingTypes';
import { HexTile } from '../map/HexTile';
import { GameState } from '../state/GameState';
import { HexGrid } from '../map/HexGrid';

export class BuildingManager {
  private buildings: Map<string, Building>;
  private gameState: GameState;
  private scene: THREE.Scene;
  private hexGrid: HexGrid | null;

  constructor(scene: THREE.Scene, gameState: GameState) {
    this.buildings = new Map();
    this.gameState = gameState;
    this.scene = scene;
    this.hexGrid = null;
  }

  public setHexGrid(hexGrid: HexGrid): void {
    this.hexGrid = hexGrid;
  }

  public update(): void {
    // Update all buildings
    this.buildings.forEach(building => {
      building.update();
    });
  }

  public canPlaceBuilding(type: BuildingType, hexTile: HexTile): boolean {
    // Check if hex is already occupied
    if (this.getBuildingAtHex(hexTile)) {
      return false;
    }

    // Check if hex is walkable
    if (!hexTile.isWalkable()) {
      return false;
    }

    // Check if we have enough resources
    const properties = BUILDING_PROPERTIES[type];
    const resources = this.gameState.getResources();

    if (resources.wood.amount < properties.cost.wood ||
        resources.stone.amount < properties.cost.stone ||
        (properties.cost.gold && resources.gold?.amount < properties.cost.gold) ||
        (properties.cost.metal && resources.metal.amount < properties.cost.metal)) {
      return false;
    }

    // Check if we're in the correct epoch
    if (this.gameState.getEpoch() < properties.epoch) {
      return false;
    }

    return true;
  }

  public placeBuilding(type: BuildingType, hexTile: HexTile): boolean {
    if (!this.canPlaceBuilding(type, hexTile)) {
      return false;
    }

    // Create new building
    const building = new Building(type, hexTile);
    this.scene.add(building.mesh);

    // Add to buildings map
    const key = `${hexTile.getGridPosition().row},${hexTile.getGridPosition().col}`;
    this.buildings.set(key, building);

    // Deduct resources
    const properties = BUILDING_PROPERTIES[type];
    const resources = this.gameState.getResources();

    resources.wood.amount -= properties.cost.wood;
    resources.stone.amount -= properties.cost.stone;
    if (properties.cost.gold) {
      resources.gold.amount -= properties.cost.gold;
    }
    if (properties.cost.metal) {
      resources.metal.amount -= properties.cost.metal;
    }

    return true;
  }

  public removeBuilding(hexTile: HexTile): boolean {
    const building = this.getBuildingAtHex(hexTile);
    if (!building) {
      return false;
    }

    // Remove from scene
    this.scene.remove(building.mesh);

    // Remove from buildings map
    const key = `${hexTile.getGridPosition().row},${hexTile.getGridPosition().col}`;
    this.buildings.delete(key);

    return true;
  }

  public getBuildingAtHex(hexTile: HexTile): Building | null {
    const key = `${hexTile.getGridPosition().row},${hexTile.getGridPosition().col}`;
    return this.buildings.get(key) || null;
  }

  public getAllBuildings(): Building[] {
    return Array.from(this.buildings.values());
  }

  public getBuildingsByType(type: BuildingType): Building[] {
    return this.getAllBuildings().filter(building => building.getType() === type);
  }

  public highlightBuilding(hexTile: HexTile, color: number = 0xffffff): void {
    const building = this.getBuildingAtHex(hexTile);
    if (building) {
      building.highlight(color);
    }
  }

  public resetBuildingHighlight(hexTile: HexTile): void {
    const building = this.getBuildingAtHex(hexTile);
    if (building) {
      building.reset();
    }
  }

  public dispose(): void {
    // Remove all buildings from scene
    this.buildings.forEach(building => {
      this.scene.remove(building.mesh);
    });
    this.buildings.clear();
  }

  public serialize(): any[] {
    return this.getAllBuildings().map(building => ({
      type: building.getType(),
      row: building.getHex().getGridPosition().row,
      col: building.getHex().getGridPosition().col,
      progress: building.getConstructionProgress(),
      isConstructed: building.isFullyConstructed()
    }));
  }

  public deserialize(data: any[]): void {
    if (!this.hexGrid) {
      console.error("Cannot deserialize buildings: HexGrid is not set");
      return;
    }
    
    // Clear existing buildings
    this.dispose();

    // Restore buildings
    data.forEach(buildingData => {
      const hex = this.hexGrid?.getHexTile(buildingData.row, buildingData.col);
      if (hex) {
        const building = new Building(buildingData.type, hex);
        building.setConstructionProgress(buildingData.progress);
        if (buildingData.isConstructed) {
          building.completeConstruction();
        }
        this.buildings.set(`${hex.getGridPosition().row},${hex.getGridPosition().col}`, building);
        this.scene.add(building.mesh);
      }
    });
  }

  public reset(): void {
    this.dispose();
  }

  public rebuild(): void {
    // Rebuild all building meshes
    this.buildings.forEach(building => {
      this.scene.remove(building.mesh);
      this.scene.add(building.mesh);
    });
  }
} 