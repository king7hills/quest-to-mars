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
} 