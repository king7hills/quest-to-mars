import * as THREE from 'three';
import { HexTile } from './HexTile';
import { TerrainType, TERRAIN_PROPERTIES } from './TerrainTypes';
import { NoiseGenerator } from '../utils/NoiseGenerator';

export class HexGrid {
  private width: number;
  private height: number;
  private hexSize: number;
  private grid: HexTile[][];
  private scene: THREE.Scene;
  private geometry: THREE.BufferGeometry;

  constructor(width: number, height: number, scene: THREE.Scene) {
    this.width = width;
    this.height = height;
    this.hexSize = 1;
    this.scene = scene;
    this.geometry = this.createHexGeometry();
    this.grid = this.createGrid();
  }

  private createHexGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    // Create a regular hexagon with improved height
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      vertices.push(
        this.hexSize * Math.cos(angle),
        0,
        this.hexSize * Math.sin(angle)
      );
      
      // Add UVs for better texture mapping
      uvs.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle));
    }

    // Add center vertex
    vertices.push(0, 0, 0);
    uvs.push(0.5, 0.5);

    // Create triangles
    for (let i = 0; i < 6; i++) {
      indices.push(6, i, (i + 1) % 6);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  private createGrid(): HexTile[][] {
    const grid: HexTile[][] = [];
    
    // Create a more clearly defined noise pattern with higher contrast
    const baseNoise = NoiseGenerator.generateNoise(this.width, this.height, 4); // Larger features
    const detailNoise = NoiseGenerator.generateNoise(this.width, this.height, 10); // Details
    const variationNoise = NoiseGenerator.generateNoise(this.width, this.height, 2); // Large variations
    
    console.log("Generating terrain with grid size: " + this.width + "x" + this.height);

    // Calculate grid center for better positioning - FIX: More accurate center calculation
    const centerX = (this.width - 1) * this.hexSize * 1.5;
    let centerZ = (this.height - 1) * this.hexSize * Math.sqrt(3);
    
    // The center calculation doesn't need the col check here since it's a global offset

    for (let row = 0; row < this.height; row++) {
      grid[row] = [];
      for (let col = 0; col < this.width; col++) {
        // Combine noise layers with different weights for clearer patterns
        const combinedNoise = 
          baseNoise[row][col] * 0.65 + 
          detailNoise[row][col] * 0.25 + 
          variationNoise[row][col] * 0.1;

        const terrainType = this.determineTerrainType(combinedNoise);
        const hexTile = new HexTile(terrainType, row, col);
        
        // Position the hex tile with proper offset for hexagonal grid
        const x = col * this.hexSize * 1.5;
        let z = row * this.hexSize * Math.sqrt(3);
        if (col % 2 === 1) {
          z += this.hexSize * Math.sqrt(3) / 2;
        }
        
        // Center the grid and add height variation based on terrain
        const heightOffset = this.getTerrainHeight(terrainType, combinedNoise);
        hexTile.mesh.position.set(
          x - centerX / 2, 
          heightOffset, 
          z - centerZ / 2
        );
        
        // Add the tile to the scene
        this.scene.add(hexTile.mesh);
        grid[row][col] = hexTile;
      }
    }

    console.log("Terrain generation complete. Added " + (this.width * this.height) + " tiles to scene.");
    return grid;
  }

  private determineTerrainType(noiseValue: number): TerrainType {
    // Normalize noise value to 0-1 range with enhanced contrast
    const normalizedValue = Math.pow((noiseValue + 1) / 2, 1.2);

    // Adjust distribution to create more balanced and visually distinct terrain
    if (normalizedValue < 0.24) {
      return TerrainType.WATER; // 24% water
    } else if (normalizedValue < 0.52) {
      return TerrainType.GRASS; // 28% grass (fertile plains)
    } else if (normalizedValue < 0.75) {
      return TerrainType.FOREST; // 23% forest
    } else if (normalizedValue < 0.90) {
      return TerrainType.MOUNTAIN; // 15% mountains
    } else if (normalizedValue < 0.96) {
      return TerrainType.DESERT; // 6% desert
    } else {
      return TerrainType.TUNDRA; // 4% tundra/snow
    }
  }

  private getTerrainHeight(terrainType: TerrainType, noiseValue: number): number {
    const baseHeight = TERRAIN_PROPERTIES[terrainType].height;
    const heightVariation = (noiseValue + 1) * 0.3; // Increased height variation
    
    switch (terrainType) {
      case TerrainType.WATER:
        return -0.3;
      case TerrainType.GRASS:
        return baseHeight + heightVariation * 0.1;
      case TerrainType.FOREST:
        return baseHeight + heightVariation * 0.4;
      case TerrainType.MOUNTAIN:
        return baseHeight + heightVariation * 1.2;
      case TerrainType.DESERT:
        return baseHeight + heightVariation * 0.3;
      case TerrainType.TUNDRA:
        return baseHeight + heightVariation * 0.5;
      default:
        return baseHeight;
    }
  }

  public isHexTile(mesh: THREE.Mesh): boolean {
    return mesh.userData.isHexTile === true;
  }

  public getHexTile(row: number, col: number): HexTile | null {
    if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
      return this.grid[row][col];
    }
    return null;
  }

  public highlightHex(hexTile: HexTile, color: number = 0xffffff): void {
    hexTile.highlight(color);
  }

  public resetHex(hexTile: HexTile): void {
    hexTile.reset();
  }

  public update(): void {
    // Update all hex tiles
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.grid[row][col].update();
      }
    }
  }

  public dispose(): void {
    // Remove all hex tiles from scene
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.scene.remove(this.grid[row][col].mesh);
      }
    }
    this.geometry.dispose();
  }

  public getDistance(q1: number, r1: number, q2: number, r2: number): number {
    // Convert axial coordinates to cube coordinates
    const x1 = q1;
    const z1 = r1 - (q1 - (q1 & 1)) / 2;
    const y1 = -x1 - z1;

    const x2 = q2;
    const z2 = r2 - (q2 - (q2 & 1)) / 2;
    const y2 = -x2 - z2;

    // Calculate distance using cube coordinates
    return Math.max(
      Math.abs(x1 - x2),
      Math.abs(y1 - y2),
      Math.abs(z1 - z2)
    );
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public serialize(): any {
    return {
      rows: this.height,
      cols: this.width,
      tiles: this.grid.map(row =>
        row.map(tile => ({
          row: tile.getRow(),
          col: tile.getCol(),
          type: tile.getType(),
          resources: tile.getResources()
        }))
      )
    };
  }

  public deserialize(data: any): void {
    // Clear existing tiles
    this.dispose();
    this.grid = [];

    // Restore grid dimensions
    this.height = data.rows;
    this.width = data.cols;

    // Regenerate grid
    this.grid = this.createGrid();

    // Restore tile data
    data.tiles.forEach((row: any[], rowIndex: number) => {
      row.forEach((tileData: any, colIndex: number) => {
        const tile = this.grid[rowIndex][colIndex];
        tile.setType(tileData.type);
        tile.setResources(tileData.resources);
      });
    });
  }

  public rebuild(): void {
    this.dispose();
    this.grid = this.createGrid();
  }

  public getNeighbors(row: number, col: number): HexTile[] {
    const neighbors: HexTile[] = [];
    const directions = [
      [-1, 0], // North
      [-1, 1], // Northeast
      [0, 1],  // Southeast
      [1, 0],  // South
      [1, -1], // Southwest
      [0, -1]  // Northwest
    ];

    // Adjust for even/odd columns
    const isEvenCol = col % 2 === 0;
    const rowOffsets = isEvenCol ? [0, -1, 0, 1, 0, -1] : [0, 0, 1, 1, 1, 0];

    for (let i = 0; i < 6; i++) {
      const newRow = row + directions[i][0] + rowOffsets[i];
      const newCol = col + directions[i][1];

      if (this.isValidPosition(newRow, newCol)) {
        neighbors.push(this.grid[newRow][newCol]);
      }
    }

    return neighbors;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.height && col >= 0 && col < this.width;
  }
} 