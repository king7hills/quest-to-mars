import React from 'react';
import { useUI } from './UIContext';
import { ResourceUI } from '../components/ResourceUI';
import { BuildingUI } from '../components/BuildingUI';
import { TechTreeUI } from '../components/TechTreeUI';
import { MilitaryUI } from '../components/MilitaryUI';
import { EconomicUI } from '../components/EconomicUI';
import { AIUI } from '../components/AIUI';
import { EventLogUI } from '../components/EventLogUI';
import './styles/Sidebar.css';

interface SidebarProps {
  gameState: any;
  gameEngine: any;
  selectedBuildingType: any;
  onBuildingSelect: (type: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  gameState,
  gameEngine,
  selectedBuildingType,
  onBuildingSelect,
}) => {
  const { activePanel, isPanelOpen } = useUI();

  if (!isPanelOpen) {
    return null;
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'resources':
        return <ResourceUI gameState={gameState} />;
      case 'buildings':
        return (
          <BuildingUI
            selectedBuildingType={selectedBuildingType}
            onBuildingSelect={onBuildingSelect}
            gameState={gameState}
          />
        );
      case 'tech':
        return <TechTreeUI techManager={gameEngine.getTechManager()} />;
      case 'military':
        return <MilitaryUI military={gameEngine.getMilitary()} />;
      case 'economy':
        return (
          <EconomicUI
            economic={gameEngine.getEconomic()}
            gameState={gameState}
          />
        );
      case 'ai':
        return (
          <AIUI
            aiPlayers={gameEngine.getAIManager().getAIPlayers()}
            playerId={gameState.getCurrentPlayerId()}
          />
        );
      case 'events':
        return <EventLogUI eventSystem={gameEngine.getEventSystem()} />;
      default:
        return null;
    }
  };

  return (
    <div className={`sidebar ${isPanelOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>{activePanel.charAt(0).toUpperCase() + activePanel.slice(1)}</h2>
      </div>
      <div className="sidebar-content">{renderPanel()}</div>
    </div>
  );
}; 