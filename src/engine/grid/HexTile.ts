import * as THREE from 'three';

export class HexTile {
  private q: number;
  private r: number;
  private size: number;
  private mesh: THREE.Mesh;
  private worldPosition: THREE.Vector3;

  constructor(q: number, r: number, size: number) {
    this.q = q;
    this.r = r;
    this.size = size;
    this.worldPosition = this.calculateWorldPosition();
    this.mesh = this.createMesh();
  }

  private calculateWorldPosition(): THREE.Vector3 {
    const x = this.size * (Math.sqrt(3) * this.q + Math.sqrt(3) / 2 * this.r);
    const z = this.size * (3 / 2 * this.r);
    return new THREE.Vector3(x, 0, z);
  }

  private createMesh(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(this.size, this.size, 0.1, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.5,
      roughness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.worldPosition);
    mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  public getQ(): number {
    return this.q;
  }

  public getR(): number {
    return this.r;
  }

  public getSize(): number {
    return this.size;
  }

  public getWorldPosition(): THREE.Vector3 {
    return this.worldPosition.clone();
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setColor(color: number): void {
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(color);
  }

  public highlight(): void {
    this.mesh.scale.set(1.1, 1.1, 1.1);
  }

  public unhighlight(): void {
    this.mesh.scale.set(1, 1, 1);
  }

  public setElevation(elevation: number): void {
    this.mesh.position.y = elevation;
    this.worldPosition.y = elevation;
  }

  public getElevation(): number {
    return this.mesh.position.y;
  }
} 