import React, { useState } from 'react';
import { TechType, TECH_PROPERTIES, TechEffect } from '../engine/tech/TechTypes';
import { TechManager } from '../engine/tech/TechManager';
import { Epoch } from '../engine/state/GameTypes';
import './TechUI.css';

interface TechUIProps {
  techManager: TechManager;
}

interface TechNodeProps {
  techType: TechType;
  techManager: TechManager;
  onSelect: (techType: TechType) => void;
  isSelected: boolean;
}

const TechNode: React.FC<TechNodeProps> = ({ techType, techManager, onSelect, isSelected }) => {
  const tech = TECH_PROPERTIES[techType];
  const isResearched = techManager.isTechResearched(techType);
  const currentResearch = techManager.getCurrentResearch();
  const isResearching = currentResearch && techType === currentResearch;
  const canResearch = techManager.canResearch(techType);

  const getStatusClass = () => {
    if (isResearched) return 'researched';
    if (isResearching) return 'researching';
    if (canResearch) return 'available';
    return 'locked';
  };

  return (
    <div 
      className={`tech-node ${getStatusClass()} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(techType)}
    >
      <h3>{tech.name}</h3>
      <div className="tech-cost">Cost: {tech.cost} TP</div>
      <div className="tech-time">Time: {tech.researchTime} turns</div>
    </div>
  );
};

const TechUI: React.FC<TechUIProps> = ({ techManager }) => {
  const [selectedTech, setSelectedTech] = useState<TechType | null>(null);
  const [currentEpoch, setCurrentEpoch] = useState<Epoch>(Epoch.TRIBAL);

  const handleTechSelect = (techType: TechType) => {
    setSelectedTech(techType);
  };

  const handleStartResearch = () => {
    if (selectedTech) {
      techManager.startResearch(selectedTech);
      setSelectedTech(null);
    }
  };

  const handleCancelResearch = () => {
    techManager.cancelResearch();
  };

  const renderTechDetails = () => {
    if (!selectedTech) return null;

    const tech = TECH_PROPERTIES[selectedTech];
    const prerequisites = tech.prerequisites.map(prereq => TECH_PROPERTIES[prereq].name).join(', ');

    return (
      <div className="tech-details">
        <h2>{tech.name}</h2>
        <p>{tech.description}</p>
        <div className="tech-requirements">
          <h3>Requirements</h3>
          <p>Cost: {tech.cost} Tech Points</p>
          <p>Research Time: {tech.researchTime} turns</p>
          <p>Prerequisites: {prerequisites || 'None'}</p>
        </div>
        <div className="tech-effects">
          <h3>Effects</h3>
          {tech.effects.map((effect: TechEffect, index) => (
            <p key={index}>
              {effect.type === 'PRODUCTION' && `+${(effect.value - 1) * 100}% ${effect.target} production`}
              {effect.type === 'POPULATION' && `+${(effect.value - 1) * 100}% ${effect.target}`}
              {effect.type === 'UNLOCK' && `Unlocks ${effect.target}`}
            </p>
          ))}
        </div>
        {techManager.canResearch(selectedTech) && (
          <button onClick={handleStartResearch}>Start Research</button>
        )}
      </div>
    );
  };

  const renderCurrentResearch = () => {
    const current = techManager.getCurrentResearch();
    if (!current) return null;

    const tech = TECH_PROPERTIES[current];
    const progress = techManager.getResearchProgress();
    const progressPercent = (progress / tech.researchTime) * 100;

    return (
      <div className="current-research">
        <h3>Researching: {tech.name}</h3>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progressPercent}%` }} />
        </div>
        <button onClick={handleCancelResearch}>Cancel Research</button>
      </div>
    );
  };

  const renderEpochTabs = () => {
    return (
      <div className="epoch-tabs">
        {Object.values(Epoch).map(epoch => (
          <button
            key={epoch}
            className={epoch === currentEpoch ? 'active' : ''}
            onClick={() => setCurrentEpoch(epoch)}
          >
            {epoch}
          </button>
        ))}
      </div>
    );
  };

  const renderTechTree = () => {
    const epochTechs = Object.values(TechType).filter(
      tech => TECH_PROPERTIES[tech].epoch === currentEpoch
    );

    return (
      <div className="tech-tree">
        {epochTechs.map(techType => (
          <TechNode
            key={techType}
            techType={techType}
            techManager={techManager}
            onSelect={handleTechSelect}
            isSelected={selectedTech === techType}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="tech-ui">
      <div className="tech-ui-header">
        <h2>Technology</h2>
        {renderEpochTabs()}
      </div>
      <div className="tech-ui-content">
        <div className="tech-ui-left">
          {renderTechTree()}
        </div>
        <div className="tech-ui-right">
          {renderCurrentResearch()}
          {renderTechDetails()}
        </div>
      </div>
    </div>
  );
};

export default TechUI; 