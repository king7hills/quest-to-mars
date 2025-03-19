import React from 'react';
import { GameState } from '../engine/state/GameState';
import { ResourceType } from '../engine/state/ResourceTypes';
import './ResourceUI.css';

interface ResourceUIProps {
  gameState: GameState;
}

export const ResourceUI: React.FC<ResourceUIProps> = ({ gameState }) => {
  const resources = gameState.getResources();

  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  const getResourceIcon = (type: ResourceType): string => {
    switch (type) {
      case ResourceType.FOOD:
        return '🍎';
      case ResourceType.WOOD:
        return '🪵';
      case ResourceType.STONE:
        return '🪨';
      case ResourceType.METAL:
        return '⚙️';
      case ResourceType.FUEL:
        return '⛽';
      case ResourceType.TECH_POINTS:
        return '🔬';
      default:
        return '❓';
    }
  };

  const getResourceColor = (type: ResourceType): string => {
    switch (type) {
      case ResourceType.FOOD:
        return '#4CAF50';
      case ResourceType.WOOD:
        return '#795548';
      case ResourceType.STONE:
        return '#9E9E9E';
      case ResourceType.METAL:
        return '#607D8B';
      case ResourceType.FUEL:
        return '#FF9800';
      case ResourceType.TECH_POINTS:
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const renderResourceBar = (type: ResourceType) => {
    const resourceKey = type.toLowerCase() as keyof typeof resources;
    const resource = resources[resourceKey];
    
    if (!resource || typeof resource === 'function') {
      return null;
    }
    
    const netProduction = resource.productionRate - resource.consumptionRate;
    const color = getResourceColor(type);
    const icon = getResourceIcon(type);

    return (
      <div key={type} className="resource-bar">
        <div className="resource-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="resource-info">
          <div className="resource-name">{type}</div>
          <div className="resource-amount">{formatNumber(resource.amount)}</div>
          <div className="resource-rates">
            <span className={`production ${netProduction >= 0 ? 'positive' : 'negative'}`}>
              {netProduction >= 0 ? '+' : ''}{formatNumber(netProduction)}/turn
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="resource-ui">
      {Object.values(ResourceType).map(renderResourceBar)}
    </div>
  );
}; 