# Quest to Mars - Game Design

## Overview
*Quest to Mars* is a strategy/simulation game where players guide a civilization from its tribal origins to establishing a base on Mars. The game unfolds across four historical epochs—Tribal, Agricultural, Industrial, and Space Age—each introducing new mechanics, resources, and narrative elements. It features a low-poly aesthetic with smooth shapes, environmental effects, and a soundtrack evolving from lo-fi tribal beats to techno. The story blends mysticism with grounded science, driven by the dream of space exploration. Computer-run societies (AI players) add existential pressure, creating opportunities for competition or cooperation.

## Epochs of Advancement
The game progresses through four epochs, each with distinct focuses and mechanics:

1. **Tribal Epoch**
   - **Focus**: Exploration, herding, battles with nomadic tribes, and uncovering life’s mysteries.
   - **Resources**: Food (gathering), wood, stone.
   - **Buildings**: Huts, campfires, basic defenses.
   - **Mechanics**:
     - Players explore to reveal the map and gather resources.
     - Battles with nomadic tribes require simple defenses.
     - Gold is discoverable in the second half but unusable until the next epoch.

2. **Agricultural Epoch**
   - **Focus**: Farming, village development, civic structures, and simple mechanization.
   - **Resources**: Food (farming), wood, stone, gold (usable), tech points (introduced via scientists).
   - **Buildings**: Farms, storage barns, mines, workshops.
   - **Mechanics**:
     - Food production shifts to farming on sustained tiles.
     - Commerce (gold) becomes usable for production and trade.
     - Specialists (scientists and merchants) emerge.

3. **Industrial Epoch**
   - **Focus**: Advanced mechanization, factories, and specialization.
   - **Resources**: Food, wood, stone, metal, fuel, tech points.
   - **Buildings**: Factories, advanced mines, power plants.
   - **Mechanics**:
     - Advanced production methods increase resource output.
     - Specialists enhance efficiency and knowledge generation.
     - Resource management becomes critical.

4. **Space Age Epoch**
   - **Focus**: Complex structures, scientific discovery, and space travel.
   - **Resources**: Food, metal, fuel, tech points.
   - **Buildings**: Research labs, spaceports, energy grids.
   - **Mechanics**:
     - Focus shifts to science and tech points for space travel.
     - Players build a spaceport to launch to Mars.

## Map and Exploration
- **Map Type**: Hexagonal grid.
- **Starting Size**: 15x15 hex tiles.
- **Fog of War**: Only 7 tiles from the starting location are visible initially. The fog lifts as players explore within their epoch’s limits.
- **Map Expansion**:
  - Each epoch unlocks a new map segment.
  - Total map size caps at 30 (north-south) x 50 (east-west) hex tiles.
- **Exploration Mechanics**:
  - Population can be assigned as "Explorers" to reveal tiles, consuming food per turn.
  - Exploration range expands with each epoch.

## Resources
Resources evolve with each epoch, reflecting historical progression:
- **Tribal Epoch**: Food (gathering), wood, stone.
- **Agricultural Epoch**: Food (farming), wood, stone, gold, tech points.
- **Industrial Epoch**: Food, wood, stone, metal, fuel, tech points.
- **Space Age Epoch**: Food, metal, fuel, tech points.
- **Mechanics**:
  - Resources are produced by assigning population to tiles or buildings.
  - Food drives population growth and requires careful management.

## Population and Specialists
- **Population Growth**: Linked to food production. Insufficient food causes stagnation or citizen loss.
- **Assignments**:
  - **Farmers**: Work tiles to produce food (outside cities).
  - **Builders**: Construct buildings and improvements.
  - **Specialists** (within cities):
    - **Scientists**: Generate knowledge points (from Agricultural Epoch).
    - **Merchants**: Generate gold (from Agricultural Epoch).
- **Management**:
  - Players assign population to maximize resource production and advancement.
  - Skilled specialist management accelerates progress.

## Technology Tree
- **Structure**: 10-15 technologies per epoch.
- **Unlocks**:
  - Technologies are optional for epoch progression but offer advantages (e.g., irrigation, mechanized farming).
  - Unlocked using knowledge points from scientists.
- **Cost**: Increases with tech complexity across epochs.
- **Enhancements**: Buildings like libraries boost knowledge point generation.
- **Examples**:
  - Tribal: Basic tools, herding, fire-making, primitive weapons.
  - Agricultural: Wheel, mining, irrigation, pottery.
  - Industrial: Factories, electricity, steam engines, metallurgy.
  - Space Age: Rocketry, spaceports, nuclear power, satellite systems.

## Commerce (Gold)
- **Introduction**: Discoverable in late Tribal Epoch, usable in Agricultural Epoch.
- **Uses**:
  - Speed up production (buildings, units).
  - Accelerate knowledge point generation.
  - Purchase improvements or resources.
  - Influence AI players (e.g., bribe for peace, trade resources, delay their progress).
- **Generation**:
  - Merchants in cities produce gold.
  - Output improves with tech and epoch progression.

## AI Players
- **Role**: Independent computer-run societies.
- **Mechanics**:
  - Follow the same rules and epoch progression as the player.
  - Compete for resources and territory or cooperate via diplomacy.
  - Decisions are autonomous but influenced by player actions (e.g., gold bribes).
- **Existential Pressure**: AI players create failure risks if they outpace or overwhelm the player.

## Story and Narrative
- **Tone**: Mystical yet grounded, reflecting humanity’s dream of exploration.
- **Narrative Arc**:
  - Tribal Epoch: Elders tell tales of a group that ventured to the stars.
  - Agricultural Epoch: Relics hint at ancient knowledge.
  - Industrial Epoch: Science uncovers space travel plans.
  - Space Age Epoch: The dream is realized with a Mars launch.
- **Delivery**:
  - Each technology unlock reveals a story fragment.
  - Major epoch shifts unveil larger narrative pieces.
- **Cultural Theme**: Begins with stargazing nomads driven by curiosity.

## Aesthetics and Sound
- **Visual Style**: Low-poly with smooth shapes.
- **Environmental Effects**:
  - Tribal: Wind, dust.
  - Agricultural: Rain, crop sway.
  - Industrial: Smoke, machinery glow.
  - Space Age: Rocket exhaust, starry vistas.
- **Sound**:
  - **Music**: Lo-fi tribal beats evolving to techno in the Space Age.
  - **Effects**: Subtle clicks, chimes, and ambient sounds tied to actions.

## Endgame
- **Objective**: Build a spaceport and launch to Mars.
- **Cutscene**: A low-poly animation of the rocket launch, followed by a Martian base bustling with activity and gradual expansion.

## Technical Implementation
- **Engine**:   ThreeJS for 3D rendering.
- **Map**: Hex grid with procedural terrain and resource placement.
- **Performance**: Optimized low-poly assets for instant loading.
- **AI Players**: Logic for independent decision-making and player interaction.
- **Narrative**: Trigger-based story events tied to tech and epochs.