import * as THREE from 'three';
// Import OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HexGrid } from './map/HexGrid';
import { GameState } from './state/GameState';
import { BuildingManager } from './buildings/BuildingManager';
import { BuildingType } from './buildings/BuildingTypes';
import { HexTile } from './map/HexTile';
import { TechManager } from './tech/TechManager';
import { AIManager } from './ai/AIManager';
import { Military } from './military/Military';
import { MilitaryConfig, MilitaryFormationType } from './military/MilitaryTypes';
import { Epoch } from './state/GameTypes';
import { Economic } from './economy/Economic';
import { Population } from './population/Population';
import { VictorySystem } from './victory/VictorySystem';
import { EventSystem, EventType } from './events/EventSystem';
import { SaveSystem } from './save/SaveSystem';
import { TerrainType } from './map/TerrainTypes';
import { HexType } from './map/HexTypes';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private hexGrid: HexGrid;
  private gameState: GameState;
  private buildingManager: BuildingManager;
  private techManager: TechManager;
  private aiManager: AIManager;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private lastHighlightedHex: HexTile | null;
  private selectedBuildingType: BuildingType | null;
  private military: Military;
  private economic: Economic;
  private population: Population;
  private isRunning: boolean;
  private victorySystem: VictorySystem;
  private eventSystem: EventSystem;
  private saveSystem: SaveSystem;
  private frameCount: number = 0;

  constructor() {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Initialize camera with better positioning for a clearer view
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 40, 40); // Higher and further back for better overview
    this.camera.lookAt(0, 0, 0); // Look at center

    // Initialize renderer with enhanced settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Get the game container element
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
      throw new Error('Game container element not found');
    }
    gameContainer.appendChild(this.renderer.domElement);

    // Initialize OrbitControls for better camera navigation
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Add smooth damping
    this.controls.dampingFactor = 0.1;
    this.controls.rotateSpeed = 0.7;
    this.controls.minDistance = 10; // Minimum zoom distance
    this.controls.maxDistance = 70; // Maximum zoom distance
    this.controls.maxPolarAngle = Math.PI / 2.1; // Limit angle to prevent going below the ground
    
    // Add debug logging
    console.log('GameEngine initialized with:', {
      containerSize: {
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight
      },
      cameraPosition: this.camera.position,
      sceneChildren: this.scene.children.length
    });

    // Initialize game state
    this.gameState = new GameState();

    // CRITICAL: Create a map with proper dimensions
    console.log('Creating hex grid...');
    this.hexGrid = new HexGrid(20, 20, this.scene); // Reduced grid size for better performance and visibility
    
    // Verify the grid was created properly
    if (!this.hexGrid || this.scene.children.length < 10) {
      console.error('Failed to create hex grid properly. Scene contains', this.scene.children.length, 'children');
    } else {
      console.log('Hex grid created successfully with', this.scene.children.length, 'children in scene');
    }

    // Initialize building manager
    this.buildingManager = new BuildingManager(this.scene, this.gameState);
    this.buildingManager.setHexGrid(this.hexGrid);

    // Initialize tech manager
    this.techManager = new TechManager(this.gameState);

    // Initialize economic system
    this.economic = new Economic(this.gameState);

    // Initialize AI manager
    this.aiManager = new AIManager(
      this.hexGrid,
      this.buildingManager,
      this.techManager
    );

    // Initialize interaction variables
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.lastHighlightedHex = null;
    this.selectedBuildingType = null;

    // Add event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('click', this.onMouseClick.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));

    // Initialize AI players
    this.aiManager.initializeAIPlayers();

    // Enhanced lighting for better visibility
    // Clear any existing lights
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Light) {
        this.scene.remove(child);
      }
    });

    // Add stronger ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Add directional light with proper shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(15, 30, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    // Add a hemisphere light for better environment lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
    this.scene.add(hemisphereLight);

    // Set up player spawn point with visual marker
    this.setupPlayerSpawnPoint();

    // Initialize military
    const militaryConfig: MilitaryConfig = {
      baseMorale: 100,
      baseTrainingSpeed: 1,
      experienceGainRate: 0.1,
      maxUnitsPerEpoch: {
        [Epoch.TRIBAL]: 10,
        [Epoch.AGRICULTURAL]: 20,
        [Epoch.INDUSTRIAL]: 50,
        [Epoch.SPACE_AGE]: 100
      },
      formationBonus: {
        [MilitaryFormationType.SCATTERED]: { attack: 0, defense: 0, speed: 1 },
        [MilitaryFormationType.LINE]: { attack: 0.1, defense: 0.2, speed: 0.8 },
        [MilitaryFormationType.SQUARE]: { attack: 0, defense: 0.3, speed: 0.6 },
        [MilitaryFormationType.CIRCLE]: { attack: 0, defense: 0.4, speed: 0.5 },
        [MilitaryFormationType.WEDGE]: { attack: 0.2, defense: 0.1, speed: 1.2 }
      }
    };
    this.military = new Military(militaryConfig, this.gameState, 'player', this.hexGrid, this.scene);

    // Initialize population
    this.population = new Population({
      startingPopulation: 10,
      baseGrowthRate: 0.1,
      baseHealth: 100,
      baseHappiness: 100,
      foodConsumptionPerPerson: 0.5,
      housingRequirementPerPerson: 1.0
    }, this.gameState);

    // Initialize victory system
    this.victorySystem = new VictorySystem(this.gameState, this.buildingManager);

    // Initialize event system
    this.eventSystem = new EventSystem();

    // Initialize running flag
    this.isRunning = false;

    // Initialize save system
    this.saveSystem = new SaveSystem(
      this.gameState,
      this.hexGrid,
      this.buildingManager,
      this.techManager,
      this.aiManager,
      this.military,
      this.economic,
      this.population,
      this.victorySystem,
      this.eventSystem
    );

    // Set up auto-save interval (every 5 minutes)
    setInterval(() => {
      if (this.isRunning) {
        this.saveSystem.autoSave();
      }
    }, 5 * 60 * 1000);

    // Run a test render to ensure everything is visible
    this.renderer.render(this.scene, this.camera);
    console.log('Initial render complete');
  }

  private setupPlayerSpawnPoint(): void {
    // Find a suitable grass tile near the center for player spawn
    const centerRow = Math.floor(this.hexGrid.getHeight() / 2);
    const centerCol = Math.floor(this.hexGrid.getWidth() / 2);
    
    // Search in a spiral pattern for a suitable tile
    let spiralSize = 0;
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = -1;
    
    const maxSpiral = 10; // Limit search radius
    
    while (spiralSize <= maxSpiral) {
      if ((-spiralSize/2 <= x && x <= spiralSize/2) && (-spiralSize/2 <= y && y <= spiralSize/2)) {
        const row = centerRow + y;
        const col = centerCol + x;
        
        const tile = this.hexGrid.getHexTile(row, col);
        if (tile && tile.getTerrainType() === TerrainType.GRASS) {
          console.log(`Found player spawn at (${row}, ${col})`);
          
          // Create a visible spawn marker
          const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 6);
          const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff4000,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
          });
          
          const spawnMarker = new THREE.Mesh(geometry, material);
          const tilePosition = tile.getPosition();
          spawnMarker.position.set(tilePosition.x, tilePosition.y + 0.75, tilePosition.z);
          
          // Add a pulsing animation to make it more visible
          const pulseAnimation = () => {
            requestAnimationFrame(pulseAnimation);
            const time = Date.now() * 0.001;
            spawnMarker.scale.y = 1 + Math.sin(time * 2) * 0.1;
          };
          pulseAnimation();
          
          this.scene.add(spawnMarker);
          
          // Start camera centered on spawn
          this.camera.position.set(
            tilePosition.x + 15, 
            tilePosition.y + 25, 
            tilePosition.z + 15
          );
          this.camera.lookAt(tilePosition.x, tilePosition.y, tilePosition.z);
          this.controls.target.set(tilePosition.x, tilePosition.y, tilePosition.z);
          
          // Mark this tile as player spawn
          tile.highlight(0xff0000);
          return;
        }
      }
      
      // Move in spiral pattern
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1-y)) {
        const temp = dx;
        dx = -dy;
        dy = temp;
      }
      
      x += dx;
      y += dy;
      
      if (x === 0 && y === -spiralSize-1) {
        spiralSize++;
      }
    }
    
    console.warn('Could not find a suitable grass tile for spawn point');
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onMouseMove(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.updateHexHighlight();
  }

  private onMouseClick(event: MouseEvent): void {
    // Update mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Set up the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      // Find the closest hex tile
      let intersectedHex: HexTile | null = null;
      
      // Check all intersections to find a hex tile
      for (const intersect of intersects) {
        const object = intersect.object;
        
        // Navigate up to parent to handle wireframe intersections
        const targetObject = object.parent && object.parent.userData && object.parent.userData.isHexTile 
          ? object.parent 
          : object;
            
        if (targetObject.userData && targetObject.userData.isHexTile) {
          const row = targetObject.userData.row;
          const col = targetObject.userData.col;
          intersectedHex = this.hexGrid.getHexTile(row, col);
          break;
        }
      }
      
      if (intersectedHex) {
        console.log("Hex tile clicked:", {
          row: intersectedHex.getRow(),
          col: intersectedHex.getCol(),
          type: intersectedHex.getTerrainType()
        });
        
        // Handle building placement
        if (this.selectedBuildingType) {
          if (this.buildingManager.canPlaceBuilding(this.selectedBuildingType, intersectedHex)) {
            console.log(`Placing ${this.selectedBuildingType} at (${intersectedHex.getRow()}, ${intersectedHex.getCol()})`);
            this.buildingManager.placeBuilding(this.selectedBuildingType, intersectedHex);
            
            // You might want to reset selection after placing
            // this.selectedBuildingType = null;
          } else {
            console.log(`Cannot place ${this.selectedBuildingType} at this location`);
          }
        }
      }
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    // Handle building selection with number keys
    switch (event.key) {
      case '1':
        this.selectedBuildingType = BuildingType.HUT;
        break;
      case '2':
        this.selectedBuildingType = BuildingType.FARM;
        break;
      case '3':
        this.selectedBuildingType = BuildingType.FACTORY;
        break;
      case '4':
        this.selectedBuildingType = BuildingType.RESEARCH_LAB;
        break;
      case 'Escape':
        this.selectedBuildingType = null;
        break;
    }
  }

  private getHexTileUnderMouse(): HexTile | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    for (const intersect of intersects) {
      if (intersect.object instanceof THREE.Mesh && this.hexGrid.isHexTile(intersect.object)) {
        const row = intersect.object.userData.row;
        const col = intersect.object.userData.col;
        return this.hexGrid.getHexTile(row, col);
      }
    }

    return null;
  }

  private updateHexHighlight(): void {
    const hexTile = this.getHexTileUnderMouse();
    
    // Reset previous highlight
    if (this.lastHighlightedHex) {
      this.hexGrid.resetHex(this.lastHighlightedHex);
    }

    if (hexTile) {
      if (this.selectedBuildingType) {
        // Check if we can place the building here
        const canPlace = this.buildingManager.canPlaceBuilding(this.selectedBuildingType, hexTile);
        this.hexGrid.highlightHex(hexTile, canPlace ? 0x00ff00 : 0xff0000);
      } else {
        this.hexGrid.highlightHex(hexTile);
      }
    }

    this.lastHighlightedHex = hexTile;
  }

  public update(): void {
    // Update controls
    this.controls.update();

    // Update game state
    this.gameState.update();

    // Update hex grid
    this.hexGrid.update();

    // Update building manager
    this.buildingManager.update();

    // Update tech manager
    this.techManager.update();

    // Update AI players
    this.aiManager.update();

    // Update military
    this.military.update();

    // Update economic
    this.economic.update();

    // Update population
    this.population.update();

    // Update victory system
    this.victorySystem.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Debug logging for first few frames
    if (this.frameCount < 5) {
      console.log('Frame rendered:', {
        frameCount: this.frameCount,
        sceneChildren: this.scene.children.length,
        cameraPosition: this.camera.position
      });
      this.frameCount++;
    }
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    // Clean up resources
    if (this.hexGrid) {
      this.hexGrid.dispose();
    }
    if (this.buildingManager) {
      this.buildingManager.dispose();
    }
    if (this.military) {
      this.military.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getTechManager(): TechManager {
    return this.techManager;
  }

  public getAIManager(): AIManager {
    return this.aiManager;
  }

  public setSelectedBuildingType(type: BuildingType | null): void {
    this.selectedBuildingType = type;
    this.updateHexHighlight();
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getHexGrid(): HexGrid {
    return this.hexGrid;
  }

  public getBuildingManager(): BuildingManager {
    return this.buildingManager;
  }

  public getMilitary(): Military {
    return this.military;
  }

  public getEconomic(): Economic {
    return this.economic;
  }

  public getPopulation(): Population {
    return this.population;
  }

  public getVictorySystem(): VictorySystem {
    return this.victorySystem;
  }

  public getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  public getSaveSystem(): SaveSystem {
    return this.saveSystem;
  }

  public handleSave(): void {
    this.saveSystem.autoSave();
    this.eventSystem.emitEvent(
      EventType.GAME_SAVED,
      'GameEngine',
      { timestamp: Date.now() },
      'Game saved successfully'
    );
  }

  public handleLoad(): void {
    // Load game functionality would go here
    // For now, just emit the event
    this.eventSystem.emitEvent(
      EventType.GAME_LOADED,
      'GameEngine',
      { timestamp: Date.now() },
      'Game loaded'
    );
    console.log('Game loading placeholder');
  }

  public start(): void {
    console.log('Starting game engine...');
    this.isRunning = true;
    this.frameCount = 0;
    
    // Make sure the game loop starts
    this.animate();
    
    console.log('Game engine started');
  }

  public stop(): void {
    this.isRunning = false;
  }
} 