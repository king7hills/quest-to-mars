import * as THREE from 'three';
import { HexTile } from './HexTile';

export class HexGrid {
  private tiles: Map<string, HexTile>;
  private size: number;
  private width: number;
  private height: number;

  constructor(size: number = 1, width: number = 10, height: number = 10) {
    this.size = size;
    this.width = width;
    this.height = height;
    this.tiles = new Map();
    this.generateGrid();
  }

  private generateGrid(): void {
    for (let q = 0; q < this.width; q++) {
      for (let r = 0; r < this.height; r++) {
        const tile = new HexTile(q, r, this.size);
        this.tiles.set(this.getTileKey(q, r), tile);
      }
    }
  }

  private getTileKey(q: number, r: number): string {
    return `${q},${r}`;
  }

  public getTile(q: number, r: number): HexTile | undefined {
    return this.tiles.get(this.getTileKey(q, r));
  }

  public getNeighbors(q: number, r: number): HexTile[] {
    const directions = [
      [1, 0], [1, -1], [0, -1],
      [-1, 0], [-1, 1], [0, 1]
    ];

    return directions
      .map(([dq, dr]) => this.getTile(q + dq, r + dr))
      .filter((tile): tile is HexTile => tile !== undefined);
  }

  public getTiles(): HexTile[] {
    return Array.from(this.tiles.values());
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getSize(): number {
    return this.size;
  }

  public getWorldPosition(q: number, r: number): THREE.Vector3 {
    const x = this.size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const z = this.size * (3 / 2 * r);
    return new THREE.Vector3(x, 0, z);
  }

  public getGridPosition(worldPosition: THREE.Vector3): { q: number; r: number } {
    const q = (Math.sqrt(3) / 3 * worldPosition.x - 1 / 3 * worldPosition.z) / this.size;
    const r = (2 / 3 * worldPosition.z) / this.size;
    return this.roundToHex(q, r);
  }

  private roundToHex(q: number, r: number): { q: number; r: number } {
    let rq = Math.round(q);
    let rr = Math.round(r);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);

    if (qDiff > rDiff) {
      rq = -rr - q;
    } else if (rDiff > qDiff) {
      rr = -rq - r;
    } else {
      rq = -rr - q;
      rr = -rq - r;
    }

    return { q: rq, r: rr };
  }
} 