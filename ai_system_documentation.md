# AI System Documentation

## System Overview
The AI system consists of three main components:
1. `AIPlayer`: Individual AI behavior and decision-making
2. `AIManager`: Manages all AI players and their interactions
3. Integration with `GameEngine` for game state management

## Core Components

### AIPlayer Class
- **Properties**:
  ```typescript
  interface AIPlayer {
    id: string;
    name: string;
    personality: AIPersonality;
    state: AIState;
    epoch: Epoch;
    resources: GameResources;
    population: number;
    territory: Set<string>;
    diplomaticRelations: Map<string, DiplomaticStatus>;
    techProgress: number;
    militaryStrength: number;
    economicStrength: number;
    researchSpeed: number;
    lastAction: number;
    actionCooldown: number;
  }
  ```

- **Decision-Making Parameters**:
  - `militaryAggression`: Tendency for military actions (0-1)
  - `economicFocus`: Focus on economic development (0-1)
  - `researchFocus`: Focus on technology research (0-1)
  - `diplomaticTendency`: Tendency for diplomatic actions (0-1)

- **Dependencies**:
  - `BuildingManager`: For building placement and management
  - `HexGrid`: For map interaction and territory management
  - `TechManager`: For technology research and effects
  - `AIManager`: For accessing other AI players and diplomatic relations
  - `Economic`: For market interaction and trade management

- **Decision-Making System**:
  1. **State Evaluation**:
     - Evaluates threats, opportunities, and resource needs
     - Updates AI state (EXPLORING, EXPANDING, DEVELOPING, DEFENDING)
     - Analyzes market conditions and trade opportunities
  
  2. **Decision Generation**:
     - Building decisions based on current state and personality
     - Research decisions based on available technologies
     - Diplomatic decisions based on relations and personality
     - Military decisions based on threats and opportunities
     - Economic decisions based on market conditions and needs
  
  3. **Decision Execution**:
     - Building placement and territory expansion
     - Technology research and effects
     - Diplomatic actions and relation changes
     - Military actions and unit management
     - Economic actions (trade offers, agreements)

### AIManager Class
- **Properties**:
  ```typescript
  interface AIManager {
    aiPlayers: Map<string, AIPlayer>;
    gameState: GameState;
    hexGrid: HexGrid;
    buildingManager: BuildingManager;
    techManager: TechManager;
    diplomaticEventManager: DiplomaticEventManager;
    turn: number;
  }
  ```

- **Key Functions**:
  1. **Initialization**:
     ```typescript
     public initializeAIPlayers(): void {
       // Create AI players with different personalities
       const aiConfigs: AIPlayerConfig[] = [
         {
           id: 'ai1',
           name: 'The Aggressive Empire',
           personality: AIPersonality.AGGRESSIVE,
           startingPosition: { row: 5, col: 5 },
           startingResources: {},
           startingPopulation: 10,
           militaryAggression: 0.8,
           economicFocus: 0.4,
           researchFocus: 0.3,
           diplomaticTendency: 0.2
         },
         // ... other AI configurations
       ];
     }
     ```

  2. **Diplomatic Management**:
     - Updates diplomatic relations based on:
       - Territory proximity
       - Personality compatibility
       - Military balance
       - Economic balance
     - Handles diplomatic status changes
     - Manages diplomatic effects

  3. **Economic Management**:
     - Updates market prices based on AI actions
     - Processes trade offers between AI players
     - Manages economic agreements
     - Handles resource sharing

  4. **Turn Management**:
     - Updates all AI players
     - Processes diplomatic relations
     - Handles economic interactions
     - Checks for conflicts

## Personality Types
1. **Aggressive**:
   - High military aggression (0.8)
   - Low diplomatic tendency (0.2)
   - Focuses on military strength
   - Tends to declare war
   - Limited economic focus

2. **Diplomatic**:
   - High diplomatic tendency (0.8)
   - Balanced military focus (0.3)
   - Seeks alliances
   - Avoids conflict
   - Moderate economic focus

3. **Isolationist**:
   - Low diplomatic tendency (0.1)
   - High economic focus (0.6)
   - Avoids interaction
   - Self-sufficient
   - Minimal trade

## State Management
1. **EXPLORING**:
   - Initial state
   - Focus on territory expansion
   - Basic resource gathering
   - Limited diplomatic interaction
   - Minimal economic activity

2. **EXPANDING**:
   - Territory growth
   - Resource acquisition
   - Building development
   - Increased diplomatic activity
   - Basic trade relationships

3. **DEVELOPING**:
   - Technology advancement
   - Economic growth
   - Building optimization
   - Active diplomacy
   - Complex trade networks

4. **DEFENDING**:
   - Military focus
   - Resource conservation
   - Defensive building
   - Limited diplomacy
   - Strategic trade

## Diplomatic System
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

## Next Steps
1. Implement military decision generation and execution
2. Enhance economic decision-making with machine learning
3. Add diplomatic events and their effects
4. Create diplomatic UI components
5. Implement resource trading system
6. Add alliance formation mechanics
7. Implement victory conditions
8. Add AI difficulty levels

## Testing Requirements
1. Unit tests for decision generation
2. Integration tests for diplomatic relations
3. Performance tests for multiple AI players
4. State transition tests
5. Resource management tests
6. Diplomatic effect tests
7. Personality behavior tests
8. Economic decision tests
9. Trade agreement tests
10. Market interaction tests 