# Quest to Mars - Game System Documentation

## Core Game Systems

### GameEngine
- **Purpose**: Central game controller managing all systems
- **Key Properties**:
  - `gameState`: Current game state
  - `hexGrid`: Map system
  - `buildingManager`: Building system
  - `techManager`: Technology system
  - `aiManager`: AI system
  - `military`: Military system
  - `economic`: Economic system
  - `population`: Population system
  - `victorySystem`: Victory condition tracking
  - `eventSystem`: Game event management
  - `saveSystem`: Game save/load functionality
  - `camera`: Three.js camera
  - `scene`: Three.js scene
  - `renderer`: Three.js renderer
  - `controls`: OrbitControls
  - `raycaster`: Three.js raycaster for mouse interaction
  - `mouse`: Mouse position tracking
  - `lastHighlightedHex`: Last highlighted hex tile
  - `selectedBuildingType`: Currently selected building type
  - `isRunning`: Game loop state

- **Initialization Flow**:
  ```typescript
  constructor() {
    // Initialize Three.js scene with sky blue background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    // Initialize camera with perspective view
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Initialize renderer with antialias and shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Initialize orbit controls with damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Initialize game systems
    this.gameState = new GameState();
    this.hexGrid = new HexGrid(20, 20, this.scene);
    this.buildingManager = new BuildingManager(this.scene, this.gameState);
    this.techManager = new TechManager(this.gameState);
    this.aiManager = new AIManager(this.hexGrid, this.buildingManager, this.techManager);
    this.military = new Military();
    this.economic = new Economic(this.gameState);
    this.population = new Population();
    this.victorySystem = new VictorySystem();
    this.eventSystem = new EventSystem();
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

    // Initialize interaction variables
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.lastHighlightedHex = null;
    this.selectedBuildingType = null;
    this.isRunning = false;

    // Add event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('click', this.onMouseClick.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }
  ```

- **Update Loop**:
  ```typescript
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

    // Update victory conditions
    this.victorySystem.update();

    // Update events
    this.eventSystem.updateEvents();

    // Auto-save check
    if (this.gameState.turn % 10 === 0) {
      this.saveSystem.autoSave();
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  ```

- **Event Handling**:
  - `onWindowResize`: Updates camera and renderer for window size changes
  - `onMouseMove`: Updates mouse position and hex highlighting
  - `onMouseClick`: Handles building placement and hex selection
  - `onKeyDown`: Handles keyboard shortcuts and UI toggles

- **Hex Interaction**:
  - `getHexTileUnderMouse`: Uses raycaster to find hex under mouse cursor
  - `updateHexHighlight`: Updates hex highlighting based on building placement validity
  - `handleBuildingPlacement`: Manages building placement on hex tiles

### Map System
- **Purpose**: Manages the hexagonal game map and terrain
- **Key Components**:
  - `HexGrid`: Main grid management
  - `HexTile`: Individual hex tile representation
  - `TerrainType`: Terrain type definitions
  - `NoiseGenerator`: Procedural terrain generation

- **Terrain Types**:
  ```typescript
  enum TerrainType {
    GRASS = 'GRASS',
    FOREST = 'FOREST',
    MOUNTAIN = 'MOUNTAIN',
    WATER = 'WATER',
    DESERT = 'DESERT',
    TUNDRA = 'TUNDRA'
  }
  ```

- **Terrain Properties**:
  ```typescript
  interface TerrainProperties {
    color: number;
    height: number;
    walkable: boolean;
    resourcePotential: {
      food: number;
      wood: number;
      stone: number;
      gold: number;
      metal: number;
    };
    productionMultiplier: number;
  }
  ```

### Building System
- **Purpose**: Manages building placement and functionality
- **Key Components**:
  - `BuildingType`: Enum of available buildings
  - `BUILDING_PROPERTIES`: Configuration for each building
  - `Building`: Class for individual buildings
  - `BuildingManager`: Manages all buildings

- **Building Properties**:
  ```typescript
  interface BuildingProperties {
    name: string;
    epoch: Epoch;
    cost: {
      wood: number;
      stone: number;
      gold?: number;
      metal?: number;
    };
    production: {
      food?: number;
      wood?: number;
      stone?: number;
      gold?: number;
      metal?: number;
      techPoints?: number;
    };
    population: number;
    health: number;
    constructionTime: number;
    color: number;
    height: number;
  }
  ```

- **Building Types by Epoch**:
  1. **Tribal Epoch**:
     - `HUT`: Basic housing (wood: 20, stone: 10)
     - `CAMPFIRE`: Food production (wood: 10, stone: 5)
     - `BASIC_DEFENSE`: Defensive structure (wood: 15, stone: 20)

  2. **Agricultural Epoch**:
     - `FARM`: Food production (wood: 30, stone: 20, gold: 50)
     - `BARN`: Storage (wood: 40, stone: 30, gold: 100)
     - `MINE`: Resource extraction (wood: 50, stone: 40, gold: 150)
     - `WORKSHOP`: Tech point generation (wood: 60, stone: 50, gold: 200)

  3. **Industrial Epoch**:
     - `FACTORY`: Metal and tech production (wood: 100, stone: 80, gold: 500, metal: 200)
     - `ADVANCED_MINE`: Advanced resource extraction (wood: 120, stone: 100, gold: 600, metal: 150)
     - `POWER_PLANT`: Tech point generation (wood: 150, stone: 120, gold: 800, metal: 300)

  4. **Space Age Epoch**:
     - `RESEARCH_LAB`: Advanced tech production (wood: 200, stone: 150, gold: 1000, metal: 400)
     - `SPACEPORT`: Victory condition building (wood: 500, stone: 400, gold: 5000, metal: 2000)
     - `ENERGY_GRID`: High tech point generation (wood: 300, stone: 200, gold: 2000, metal: 800)

- **BuildingManager Functions**:
  - `canPlaceBuilding`: Validates building placement
    - Checks hex occupancy
    - Validates walkable terrain
    - Verifies resource costs
    - Confirms epoch requirements
  - `placeBuilding`: Places building on hex
    - Creates building instance
    - Adds to scene
    - Updates building map
    - Deducts resources
  - `removeBuilding`: Removes building from hex
    - Removes from scene
    - Updates building map
  - `getBuildingAtHex`: Retrieves building at hex
  - `highlightBuilding`: Visual feedback for building selection
  - `resetBuildingHighlight`: Resets building visual state

- **Building Placement Rules**:
  1. Hex must be unoccupied
  2. Hex must be walkable
  3. Player must have sufficient resources
  4. Player must be in correct epoch
  5. Building must be within player's territory

### Technology System
- **Purpose**: Manages technology research and progression
- **Key Components**:
  - `TechType`: Enum of available technologies
  - `TECH_PROPERTIES`: Configuration for each technology
  - `TechManager`: Manages research and effects

- **Technology Properties**:
  ```typescript
  interface TechProperties {
    name: string;
    epoch: Epoch;
    cost: number;
    researchTime: number;
    prerequisites: TechType[];
    effects: TechEffect[];
    description: string;
    story?: string;
  }
  ```

### Economic System
- **Purpose**: Manages market mechanics, resource trading, and economic agreements
- **Key Components**:
  - `MarketPrice`: Market price tracking
  - `TradeOffer`: Trade offer management
  - `EconomicAgreement`: Economic agreement management
  - `Economic`: Main economic system

- **Market Properties**:
  ```typescript
  interface MarketPrice {
    resource: ResourceType;
    basePrice: number;
    currentPrice: number;
    volatility: number;
    demand: number;
    supply: number;
  }
  ```

- **Trade Properties**:
  ```typescript
  interface TradeOffer {
    id: string;
    sellerId: string;
    buyerId: string;
    resource: keyof GameResources;
    amount: number;
    pricePerUnit: number;
    totalPrice: number;
    status: TradeStatus;
    turnsRemaining: number;
  }
  ```

- **Agreement Properties**:
  ```typescript
  interface EconomicAgreement {
    id: string;
    type: EconomicAgreementType;
    participants: string[];
    resources: {
      [key: string]: Partial<Record<keyof GameResources, number>>;
    };
    duration: number;
    effects: EconomicEffect[];
    status: AgreementStatus;
  }
  ```

- **Market Configuration**:
  ```typescript
  interface MarketConfig {
    basePrices: {
      [key in keyof GameResources]: number;
    };
    volatility: {
      [key in keyof GameResources]: number;
    };
    epochMultipliers: {
      [key in Epoch]: number;
    };
    maxPriceMultiplier: number;
    minPriceMultiplier: number;
    priceUpdateInterval: number;
  }
  ```

- **Default Market Settings**:
  - Base Prices:
    - Food: 1
    - Wood: 2
    - Stone: 3
    - Gold: 5
    - Metal: 4
    - Fuel: 6
    - Tech Points: 10
  - Volatility:
    - Food: 0.1
    - Wood: 0.15
    - Stone: 0.2
    - Gold: 0.3
    - Metal: 0.25
    - Fuel: 0.35
    - Tech Points: 0.4
  - Epoch Multipliers:
    - Tribal: 1.0
    - Agricultural: 1.2
    - Industrial: 1.5
    - Space Age: 2.0
  - Price Limits:
    - Max Multiplier: 3.0
    - Min Multiplier: 0.3
    - Update Interval: 5 turns

- **Economic Effects**:
  - `TRADE_DISCOUNT`: Reduced trade costs
  - `PRODUCTION_BOOST`: Increased resource production
  - `MARKET_ACCESS`: Access to partner's market
  - `RESOURCE_SHARING`: Shared resource pools

- **Market Mechanics**:
  - Dynamic price calculation based on:
    - Base price
    - Epoch multiplier
    - Volatility factor
    - Supply/demand ratio
  - Price limits to prevent extreme values
  - Regular price updates every 5 turns
  - Resource transfer system for completed trades

- **Trade Mechanics**:
  - Create trade offers with:
    - Resource type
    - Amount
    - Price per unit
  - Trade offers expire after 5 turns
  - Automatic trade completion when accepted
  - Resource transfer between players
  - Market price-based cost calculation

- **Agreement Types**:
  - Trade deals: Reduced trade costs and improved market access
  - Resource sharing: Shared resource pools between participants
  - Joint production: Combined production capabilities
  - Market access: Access to partner's market with special rates

- **UI Components**:
  - Market tab: Display current prices and create trade offers
  - Trades tab: Manage active trade offers
  - Agreements tab: View and manage economic agreements
  - Resource transfer visualization
  - Price trend indicators

### Resource System
- **Purpose**: Manages game resources and their production
- **Resource Types**:
  - Food: Population growth and maintenance
  - Wood: Basic construction
  - Stone: Advanced construction
  - Gold: Commerce and trade
  - Metal: Industrial production
  - Fuel: Advanced energy
  - Tech Points: Research

- **Resource Management**:
  ```typescript
  interface ResourceCost {
    food?: number;
    wood?: number;
    stone?: number;
    gold?: number;
    metal?: number;
    fuel?: number;
    techPoints?: number;
  }
  ```

- **Market Integration**:
  - Resources can be traded on the market
  - Prices fluctuate based on supply/demand
  - Economic agreements affect resource production
  - Trade deals modify resource amounts

### Population System
- **Purpose**: Manages population growth, assignments, and effects
- **Key Components**:
  - `PopulationRole`: Enum of population roles
  - `PopulationStats`: Population statistics
  - `PopulationEffects`: Population effects on production
  - `Population`: Main population system

- **Population Roles**:
  ```typescript
  enum PopulationRole {
    FARMER = 'FARMER',
    BUILDER = 'BUILDER',
    SCIENTIST = 'SCIENTIST',
    MERCHANT = 'MERCHANT',
    MILITARY = 'MILITARY',
    EXPLORER = 'EXPLORER',
    UNASSIGNED = 'UNASSIGNED'
  }
  ```

- **Population Stats**:
  ```typescript
  interface PopulationStats {
    total: number;                    // Total population
    growthRate: number;               // Current growth rate
    health: number;                   // Population health (0-100)
    happiness: number;                // Population happiness (0-100)
    assignments: Map<PopulationRole, PopulationAssignment>; // Role assignments
    unassigned: number;               // Available population
  }
  ```

- **Population Config**:
  ```typescript
  interface PopulationConfig {
    startingPopulation: number;       // Initial population
    baseGrowthRate: number;          // Base growth rate
    baseHealth: number;              // Starting health
    baseHappiness: number;           // Starting happiness
    foodConsumptionPerPerson: number; // Food needed per person
    housingRequirementPerPerson: number; // Housing needed per person
  }
  ```

- **Population Effects**:
  ```typescript
  interface PopulationEffects {
    foodProduction: number;          // Food production rate
    researchProduction: number;      // Research point production
    goldProduction: number;          // Gold production rate
    militaryStrength: number;        // Military power
    buildingSpeed: number;           // Construction speed
    explorationSpeed: number;        // Exploration speed
  }
  ```

- **Core Mechanics**:
  1. **Population Growth**:
     - Based on food availability
     - Growth rate affected by food surplus/deficit
     - Population decreases if food ratio < 0.5
     - Growth formula: `growth = total * growthRate`

  2. **Efficiency System**:
     - Base efficiency from health and happiness
     - Epoch-specific efficiency modifiers
     - Role-specific efficiency bonuses
     - Formula: `efficiency = (health + happiness) / 200`

  3. **Epoch Efficiency Modifiers**:
     - Tribal: Farmers 0.8x efficiency
     - Agricultural: Farmers 1.2x efficiency
     - Industrial: Scientists/Merchants 1.3x efficiency
     - Space Age: Scientists 1.5x efficiency

  4. **Production Effects**:
     - Each role contributes to specific effects
     - Effects calculated based on count and efficiency
     - Formula: `effect = count * efficiency`

- **Assignment System**:
  1. **Assignment Rules**:
     - Cannot assign more than unassigned population
     - Assignments can have locations (hex/building)
     - Unassigning returns population to unassigned pool
     - Location cleared when assignment count reaches 0

  2. **Assignment Methods**:
     ```typescript
     assignPopulation(role: PopulationRole, count: number, location?: string): boolean
     unassignPopulation(role: PopulationRole, count: number): boolean
     ```

- **UI Components**:
  1. **Population Overview**:
     - Total population display
     - Unassigned population
     - Health and happiness stats
     - Growth rate display

  2. **Assignment Management**:
     - Role selection dropdown
     - Assignment count input
     - Assign/Unassign buttons
     - Current assignments display

  3. **Production Effects**:
     - Food production rate
     - Research production rate
     - Gold production rate
     - Military strength
     - Building speed
     - Exploration speed

- **Integration**:
  1. **Resource System**:
     - Food consumption affects growth
     - Production effects modify resource rates
     - Housing requirements tracked

  2. **Epoch System**:
     - Efficiency modifiers by epoch
     - Role effectiveness changes
     - Production scaling

  3. **Building System**:
     - Population assignments to buildings
     - Building-specific efficiency bonuses
     - Housing requirements

- **Default Configuration**:
  ```typescript
  const defaultConfig: PopulationConfig = {
    startingPopulation: 10,
    baseGrowthRate: 0.1,
    baseHealth: 100,
    baseHappiness: 100,
    foodConsumptionPerPerson: 1,
    housingRequirementPerPerson: 1
  };
  ```

### Epoch System
- **Purpose**: Manages game progression through epochs
- **Epochs**:
  1. **Tribal**:
     - Basic resources (Food, Wood, Stone)
     - Simple buildings
     - Basic exploration

  2. **Agricultural**:
     - Gold introduction
     - Farming
     - Basic specialists

  3. **Industrial**:
     - Metal and Fuel
     - Advanced production
     - Complex buildings

  4. **Space Age**:
     - Advanced technology
     - Space travel
     - Victory conditions

### UI System
- **Purpose**: Manages game interface and user interaction
- **Components**:
  - `App`: Main application
  - `TechTreeUI`: Technology interface
  - `BuildingUI`: Building interface
  - `AIUI`: AI information display
  - `ResourceUI`: Resource display
  - `DiplomaticUI`: Diplomatic relations display (TODO)

### AI System
- **Purpose**: Manages AI player behavior and decision making
- **Key Components**:
  - `AIPersonality`: Enum of AI personalities
  - `AIState`: Enum of AI states
  - `DiplomaticStatus`: Enum of diplomatic relations
  - `AIManager`: Manages AI players
  - `AIPlayer`: Individual AI player behavior
  - `DiplomaticEventManager`: Manages diplomatic events

- **AI Properties**:
  ```typescript
  interface AIPlayerConfig {
    id: string;
    name: string;
    personality: AIPersonality;
    startingPosition: { row: number; col: number };
    startingResources: Partial<GameResources>;
    startingPopulation: number;
    militaryAggression: number;
    economicFocus: number;
    researchFocus: number;
    diplomaticTendency: number;
  }
  ```

- **Diplomatic System**:
  - **Status Types**:
    - WAR: Active conflict
    - HOSTILE: Negative relations
    - NEUTRAL: No special relations
    - FRIENDLY: Positive relations
    - ALLIED: Strong alliance

  - **Effects**:
    - Research speed modifiers
    - Economic strength modifiers
    - Resource sharing
    - Military cooperation

  - **Decision Factors**:
    - Territory proximity
    - Personality compatibility
    - Military balance
    - Economic balance

### Military System
- **Purpose**: Manages military units and combat
- **Key Components**:
  - `UnitType`: Enum of available units
  - `MilitaryFormationType`: Enum of formation types
  - `Military`: Manages units and combat
  - `UNIT_CONFIGS`: Unit statistics configuration

- **Unit Properties**:
  ```typescript
  interface UnitStats {
    health: number;
    attack: number;
    defense: number;
    speed: number;
    range: number;
    trainingTime: number;
    cost: ResourceCost[];
  }
  ```

### Victory System
- **Purpose**: Tracks progress towards victory conditions
- **Key Components**:
  - `VictoryCondition`: Enum of victory conditions
  - `VictoryState`: Current victory state
  - `VictorySystem`: Manages victory conditions

- **Victory Conditions**:
  ```typescript
  enum VictoryCondition {
    SPACE_AGE = 'SPACE_AGE',
    SPACEPORT = 'SPACEPORT',
    LAUNCH_TO_MARS = 'LAUNCH_TO_MARS'
  }
  ```

### Event System
- **Purpose**: Manages game events and notifications
- **Key Components**:
  - `EventType`: Enum of event types
  - `GameEvent`: Event data structure
  - `EventListener`: Event listener interface
  - `EventSystem`: Manages events and listeners

- **Event Types**:
  ```typescript
  enum EventType {
    RESOURCE_PRODUCTION = 'RESOURCE_PRODUCTION',
    RESOURCE_CONSUMPTION = 'RESOURCE_CONSUMPTION',
    RESOURCE_DEPLETION = 'RESOURCE_DEPLETION',
    BUILDING_PLACED = 'BUILDING_PLACED',
    BUILDING_COMPLETED = 'BUILDING_COMPLETED',
    BUILDING_DESTROYED = 'BUILDING_DESTROYED',
    RESEARCH_STARTED = 'RESEARCH_STARTED',
    RESEARCH_COMPLETED = 'RESEARCH_COMPLETED',
    EPOCH_CHANGED = 'EPOCH_CHANGED',
    UNIT_TRAINED = 'UNIT_TRAINED',
    UNIT_DESTROYED = 'UNIT_DESTROYED',
    COMBAT_STARTED = 'COMBAT_STARTED',
    COMBAT_ENDED = 'COMBAT_ENDED',
    DIPLOMATIC_STATUS_CHANGED = 'DIPLOMATIC_STATUS_CHANGED',
    TRADE_AGREEMENT_SIGNED = 'TRADE_AGREEMENT_SIGNED',
    ALLIANCE_FORMED = 'ALLIANCE_FORMED',
    POPULATION_GROWTH = 'POPULATION_GROWTH',
    POPULATION_DECLINE = 'POPULATION_DECLINE',
    VICTORY_CONDITION_MET = 'VICTORY_CONDITION_MET',
    GAME_OVER = 'GAME_OVER',
    GAME_SAVED = 'GAME_SAVED',
    GAME_LOADED = 'GAME_LOADED',
    SAVE_DELETED = 'SAVE_DELETED'
  }
  ```

### Save System
- **Purpose**: Manages game saving and loading
- **Key Components**:
  - `SaveData`: Save data structure
  - `SaveSystem`: Manages save operations

- **Save Data Structure**:
  ```typescript
  interface SaveData {
    timestamp: number;
    gameState: any;
    hexGrid: any;
    buildings: any[];
    technologies: any[];
    aiPlayers: any[];
    military: any;
    economic: any;
    population: any;
    victoryState: any;
    events: any[];
  }
  ```

## UI Components

### Core UI Components
- **VictoryUI**: Displays victory conditions and game over state
- **SaveLoadUI**: Manages game saving and loading
- **EconomicUI**: Manages economic interactions
- **TechUI**: Manages technology research
- **TechTreeUI**: Displays technology tree
- **MilitaryUI**: Manages military units and formations
- **BuildingUI**: Manages building placement
- **ResourceUI**: Displays resource information
- **EventLogUI**: Shows game events
- **PopulationUI**: Manages population assignments
- **AIUI**: Displays AI player information

### UI Styling
- Each UI component has its own CSS file
- Consistent styling across components
- Responsive design for different screen sizes
- Dark theme with high contrast for readability

## Game Flow

### Initialization
1. Create game engine instance
2. Initialize Three.js scene and camera
3. Create hex grid with procedural terrain
4. Initialize all game systems
5. Set up event listeners
6. Start game loop

### Game Loop
1. Update controls
2. Update game state
3. Update all systems
4. Check victory conditions
5. Process events
6. Auto-save if needed
7. Render scene

### Victory Conditions
1. Reach Space Age Epoch
2. Build a Spaceport
3. Gather resources to launch to Mars

### Save/Load System
- 10 save slots available
- Auto-save every 10 turns
- Save data includes all game state
- Load restores complete game state

## Technical Implementation

### Dependencies
- React: UI framework
- Three.js: 3D rendering
- TypeScript: Type safety
- GSAP: Animations

### File Structure
```
src/
├── components/         # UI components
├── engine/            # Game engine systems
│   ├── ai/           # AI system
│   ├── buildings/    # Building system
│   ├── economy/      # Economic system
│   ├── events/       # Event system
│   ├── map/          # Map system
│   ├── military/     # Military system
│   ├── population/   # Population system
│   ├── save/         # Save system
│   ├── state/        # Game state
│   ├── tech/         # Technology system
│   ├── utils/        # Utility functions
│   └── victory/      # Victory system
└── App.tsx           # Main application
```

### Type System
- Comprehensive TypeScript interfaces
- Strong type checking
- Enum-based constants
- Type-safe event system

### Performance Considerations
- Efficient hex grid implementation
- Optimized Three.js rendering
- Event system for decoupled updates
- Efficient save/load system 