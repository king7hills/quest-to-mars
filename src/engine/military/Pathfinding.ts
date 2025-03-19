import { HexGrid } from '../map/HexGrid';
import { HexTile } from '../map/HexTile';
import { Unit } from './MilitaryTypes';
import { TerrainType } from '../map/TerrainTypes';
import { UnitType } from './MilitaryTypes';

interface PathNode {
  hex: HexTile;
  g: number; // Cost from start to current node
  h: number; // Estimated cost from current node to end
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export class Pathfinding {
  private hexGrid: HexGrid;

  constructor(hexGrid: HexGrid) {
    this.hexGrid = hexGrid;
  }

  public getHexGrid(): HexGrid {
    return this.hexGrid;
  }

  public findPath(start: HexTile, end: HexTile, unit: Unit): HexTile[] {
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    const startNode: PathNode = {
      hex: start,
      g: 0,
      h: this.heuristic(start, end),
      f: this.heuristic(start, end),
      parent: null
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f cost in open set
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet[currentIndex];

      // Check if we reached the end
      if (current.hex === end) {
        return this.reconstructPath(current);
      }

      // Move current node from open to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(this.getHexKey(current.hex));

      // Get neighbors
      const neighbors = this.getNeighbors(current.hex);
      
      for (const neighbor of neighbors) {
        // Skip if neighbor is in closed set
        if (closedSet.has(this.getHexKey(neighbor))) {
          continue;
        }

        // Calculate new g cost
        const gCost = current.g + this.getMovementCost(neighbor, unit);

        // Check if this path is better than any previous one
        const existingNode = openSet.find(node => node.hex === neighbor);
        if (!existingNode) {
          // Add new node to open set
          const newNode: PathNode = {
            hex: neighbor,
            g: gCost,
            h: this.heuristic(neighbor, end),
            f: gCost + this.heuristic(neighbor, end),
            parent: current
          };
          openSet.push(newNode);
        } else if (gCost < existingNode.g) {
          // Update existing node with better path
          existingNode.g = gCost;
          existingNode.f = gCost + existingNode.h;
          existingNode.parent = current;
        }
      }
    }

    // No path found
    return [];
  }

  private getNeighbors(hex: HexTile): HexTile[] {
    const { row, col } = hex.getGridPosition();
    const neighbors: HexTile[] = [];
    
    // Get all possible neighbor positions
    const directions = [
      [0, 1], [1, 0], [1, -1],
      [0, -1], [-1, 0], [-1, 1]
    ];

    for (const [dr, dc] of directions) {
      const neighborRow = row + dr;
      const neighborCol = col + dc;
      const neighbor = this.hexGrid.getHexTile(neighborRow, neighborCol);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  private heuristic(a: HexTile, b: HexTile): number {
    const posA = a.getGridPosition();
    const posB = b.getGridPosition();
    const dx = Math.abs(posA.col - posB.col);
    const dy = Math.abs(posA.row - posB.row);
    return Math.max(dx, dy);
  }

  private getMovementCost(to: HexTile, unit: Unit): number {
    // Base movement cost is 1
    let cost = 1;

    // Add terrain cost
    const terrainType = to.getTerrainType();
    if (terrainType === TerrainType.MOUNTAIN) {
      cost += 2;
    } else if (terrainType === TerrainType.FOREST) {
      cost += 1.5;
    }

    // Adjust for unit type
    if (unit.type === UnitType.CAVALRY) {
      cost *= 0.8; // Cavalry moves faster
    } else if (unit.type === UnitType.INFANTRY) {
      cost *= 1.2; // Infantry moves slower
    }

    return cost;
  }

  private reconstructPath(endNode: PathNode): HexTile[] {
    const path: HexTile[] = [];
    let current: PathNode | null = endNode;

    while (current) {
      path.unshift(current.hex);
      current = current.parent;
    }

    return path;
  }

  private getHexKey(hex: HexTile): string {
    const { row, col } = hex.getGridPosition();
    return `${col},${row}`;
  }
} 