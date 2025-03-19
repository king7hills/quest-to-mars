import React, { useState } from 'react';
import { BuildingType, BUILDING_PROPERTIES } from '../engine/buildings/BuildingTypes';
import { GameState } from '../engine/state/GameState';
import { Epoch } from '../engine/state/GameTypes';

interface BuildingUIProps {
  gameState: GameState;
  onBuildingSelect: (type: BuildingType | null) => void;
  selectedBuildingType: BuildingType | null;
}

export const BuildingUI: React.FC<BuildingUIProps> = ({
  gameState,
  onBuildingSelect,
  selectedBuildingType
}) => {
  const [showDetails, setShowDetails] = useState<BuildingType | null>(null);
  const resources = gameState.getResources();

  const getBuildingCosts = (type: BuildingType) => {
    const costs = BUILDING_PROPERTIES[type].cost;
    return Object.entries(costs)
      .map(([resource, amount]) => `${resource}: ${amount}`)
      .join(', ');
  };

  const canAffordBuilding = (type: BuildingType): boolean => {
    const costs = BUILDING_PROPERTIES[type].cost;
    return (
      resources.wood.amount >= costs.wood &&
      resources.stone.amount >= costs.stone &&
      (!costs.gold || resources.gold?.amount >= costs.gold) &&
      (!costs.metal || resources.metal.amount >= costs.metal)
    );
  };

  const getEpochBuildings = (epoch: Epoch) => {
    return Object.values(BuildingType).filter(
      type => BUILDING_PROPERTIES[type].epoch === epoch
    );
  };

  const epochs = [
    Epoch.TRIBAL,
    Epoch.AGRICULTURAL,
    Epoch.INDUSTRIAL,
    Epoch.SPACE_AGE
  ];

  const getEpochName = (epoch: Epoch): string => {
    switch (epoch) {
      case Epoch.TRIBAL: return 'Tribal';
      case Epoch.AGRICULTURAL: return 'Agricultural';
      case Epoch.INDUSTRIAL: return 'Industrial';
      case Epoch.SPACE_AGE: return 'Space Age';
      default: return 'Unknown';
    }
  };

  return (
    <div className="building-ui">
      <div className="building-categories">
        {epochs.map(epoch => (
          <div key={epoch} className="building-category">
            <h3>{getEpochName(epoch)}</h3>
            <div className="building-buttons">
              {getEpochBuildings(epoch).map(type => (
                <button
                  key={type}
                  className={`building-button ${
                    selectedBuildingType === type ? 'selected' : ''
                  } ${!canAffordBuilding(type) ? 'disabled' : ''}`}
                  onClick={() => onBuildingSelect(type)}
                  onMouseEnter={() => setShowDetails(type)}
                  onMouseLeave={() => setShowDetails(null)}
                >
                  {BUILDING_PROPERTIES[type].name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="building-details">
          <h4>{BUILDING_PROPERTIES[showDetails].name}</h4>
          <p>Cost: {getBuildingCosts(showDetails)}</p>
          <p>Production:</p>
          <ul>
            {Object.entries(BUILDING_PROPERTIES[showDetails].production).map(
              ([resource, amount]) => (
                <li key={resource}>
                  {resource}: {amount}
                </li>
              )
            )}
          </ul>
          <p>Population: {BUILDING_PROPERTIES[showDetails].population}</p>
          <p>Health: {BUILDING_PROPERTIES[showDetails].health}</p>
          <p>Construction Time: {BUILDING_PROPERTIES[showDetails].constructionTime}s</p>
        </div>
      )}
    </div>
  );
}; 