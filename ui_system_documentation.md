# UI System Documentation

## Overview
The UI system is built using React and styled-components, providing a modular and maintainable interface for the game. The system is divided into several key components, each responsible for a specific aspect of the game interface.

## Core Components

### App Component
- **Purpose**: Main application container
- **Key Features**:
  - Game engine initialization
  - UI state management
  - Component composition
  - Global styling
  - UI visibility toggle

- **State Management**:
  ```typescript
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [showUI, setShowUI] = useState(true);
  ```

- **Key Functions**:
  - `handleBuildingSelect`: Building type selection
  - `handleKeyPress`: UI visibility toggle
  - `handleBuildingPlacement`: Building placement logic

### ResourceUI Component
- **Purpose**: Display and manage game resources
- **Features**:
  - Resource amounts display
  - Production rates
  - Consumption rates
  - Resource trends
  - Resource alerts

### BuildingUI Component
- **Purpose**: Building management interface
- **Features**:
  - Building type selection by epoch
  - Building placement preview
  - Building information display
  - Resource cost display
  - Production information
  - Population requirements
  - Health status
  - Construction time

- **Key Functions**:
  ```typescript
  const getBuildingCosts = (type: BuildingType) => {
    const costs = type.properties.cost;
    return Object.entries(costs)
      .map(([resource, amount]) => `${resource}: ${amount}`)
      .join(', ');
  };

  const canAffordBuilding = (type: BuildingType): boolean => {
    const costs = type.properties.cost;
    return (
      resources.wood.amount >= costs.wood &&
      resources.stone.amount >= costs.stone &&
      (!costs.gold || resources.gold.amount >= costs.gold) &&
      (!costs.metal || resources.metal.amount >= costs.metal)
    );
  };

  const getEpochBuildings = (epoch: number) => {
    return Object.values(BuildingType).filter(
      type => type.properties.epoch === epoch
    );
  };
  ```

### TechTreeUI Component
- **Purpose**: Technology research interface
- **Features**:
  - Technology tree visualization by epoch
  - Research progress tracking
  - Technology status display (researched/researching/available/locked)
  - Research cost display
  - Story content display
  - Research cancellation

- **Key Functions**:
  ```typescript
  const getTechStatus = (techType: TechType) => {
    if (techManager.isTechResearched(techType)) {
      return 'researched';
    }
    if (techManager.getCurrentResearch() === techType) {
      return 'researching';
    }
    if (techManager.canResearch(techType)) {
      return 'available';
    }
    return 'locked';
  };

  const handleTechClick = (techType: TechType) => {
    if (techManager.isTechResearched(techType)) {
      setSelectedTech(techType);
      setShowStory(true);
    } else if (techManager.canResearch(techType)) {
      techManager.startResearch(techType);
    }
  };
  ```

### MilitaryUI Component
- **Purpose**: Military unit management interface
- **Features**:
  - Unit creation and management
  - Formation controls
  - Unit statistics display
  - Combat preview
  - Military actions

### EconomicUI Component
- **Purpose**: Economic system interface
- **Features**:
  - Market prices display
  - Trade offer management
  - Economic agreement management
  - Resource trading interface
  - Market trends visualization

- **Key Sections**:
  1. **Market Tab**:
     - Current market prices
     - Resource amounts
     - Price trends
     - Trade offer creation
     - Market statistics

  2. **Trades Tab**:
     - Active trade offers
     - Offer details
     - Accept/reject actions
     - Trade history
     - Trade statistics

  3. **Agreements Tab**:
     - Active agreements
     - Agreement details
     - Duration tracking
     - Effect display
     - Agreement management

### AIUI Component
- **Purpose**: AI player information display
- **Features**:
  - AI player status
  - Diplomatic relations
  - AI actions log
  - AI statistics
  - AI settings

## UI Layout

### Main Layout
```
+------------------------+
|      Game Canvas      |
|                       |
|                       |
+------------------------+
|      UI Container     |
| +------------------+ |
| |    ResourceUI    | |
| +------------------+ |
| +------------------+ |
| |   BuildingUI     | |
| +------------------+ |
| +------------------+ |
| |   TechTreeUI     | |
| +------------------+ |
| +------------------+ |
| |   MilitaryUI     | |
| +------------------+ |
| +------------------+ |
| |   EconomicUI     | |
| +------------------+ |
| +------------------+ |
| |     AIUI         | |
| +------------------+ |
+------------------------+
```

## Styling System

### Global Styles
- **Color Scheme**:
  - Primary: #4CAF50 (Green)
  - Secondary: #2196F3 (Blue)
  - Background: rgba(0, 0, 0, 0.8)
  - Text: #FFFFFF
  - Accent: #FFC107 (Yellow)

- **Typography**:
  - Font Family: Arial, sans-serif
  - Font Sizes:
    - Headers: 1.5rem
    - Body: 1rem
    - Small: 0.875rem

### Component Styles
- **Common Styles**:
  ```typescript
  const commonStyles = {
    container: {
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '8px',
      padding: '16px',
      color: 'white'
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      background: '#4CAF50',
      color: 'white',
      cursor: 'pointer'
    }
  };
  ```

- **EconomicUI Styles**:
  ```typescript
  const economicStyles = {
    marketPrices: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    tradeForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '300px'
    },
    tradeOffers: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  };
  ```

## State Management

### Local State
- Component-specific state using React hooks
- UI visibility and interaction state
- Form input state
- Selection state

### Global State
- Game engine reference
- Game state reference
- Resource state
- Building state
- Technology state
- Military state
- Economic state
- AI state

## Event Handling

### User Input
- Mouse events for game interaction
- Keyboard events for shortcuts
- Form input handling
- Button click handling

### Game Events
- Resource updates
- Building placement
- Technology research
- Military actions
- Economic actions
- AI actions

## Performance Optimization

### Rendering Optimization
- Component memoization
- Virtual scrolling for lists
- Lazy loading of components
- Efficient state updates

### Memory Management
- Cleanup of event listeners
- Resource disposal
- State cleanup
- Component unmounting

## Accessibility

### Keyboard Navigation
- Tab navigation
- Shortcut keys
- Focus management
- Screen reader support

### Visual Accessibility
- High contrast mode
- Color blind friendly
- Scalable text
- Clear visual hierarchy

## Testing

### Unit Tests
- Component rendering
- State management
- Event handling
- Style application

### Integration Tests
- Component interaction
- State updates
- Event propagation
- UI updates

### Visual Tests
- Layout verification
- Style consistency
- Responsive design
- Animation smoothness

## Future Improvements

### Planned Features
1. Enhanced tooltips
2. Context menus
3. Drag and drop
4. Advanced animations
5. Custom themes
6. UI presets
7. Tutorial system
8. Help system
9. Settings panel
10. Performance metrics

### Technical Improvements
1. WebGL optimization
2. State management refactor
3. Component composition
4. Style system enhancement
5. Event system optimization
6. Accessibility improvements
7. Testing coverage
8. Documentation updates
9. Performance monitoring
10. Error handling 