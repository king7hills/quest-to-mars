import React, { useState } from 'react';
import { TechType, TECH_PROPERTIES } from '../engine/tech/TechTypes';
import { TechManager } from '../engine/tech/TechManager';
import { Epoch } from '../engine/state/GameTypes';
import './TechTreeUI.css';

interface TechTreeUIProps {
  techManager: TechManager;
}

export const TechTreeUI: React.FC<TechTreeUIProps> = ({ techManager }) => {
  const [selectedTech, setSelectedTech] = useState<TechType | null>(null);
  const [showStory, setShowStory] = useState(false);

  const epochs = [
    Epoch.TRIBAL,
    Epoch.AGRICULTURAL,
    Epoch.INDUSTRIAL,
    Epoch.SPACE_AGE
  ];

  const getEpochTechs = (epoch: Epoch) => {
    return Object.values(TechType).filter(
      tech => TECH_PROPERTIES[tech].epoch === epoch
    );
  };

  const getEpochName = (epoch: Epoch): string => {
    switch (epoch) {
      case Epoch.TRIBAL: return 'Tribal';
      case Epoch.AGRICULTURAL: return 'Agricultural';
      case Epoch.INDUSTRIAL: return 'Industrial';
      case Epoch.SPACE_AGE: return 'Space Age';
      default: return 'Unknown';
    }
  };

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

  const handleCancelResearch = () => {
    techManager.cancelResearch();
  };

  return (
    <div className="tech-tree-ui">
      <div className="tech-tree-container">
        {epochs.map(epoch => (
          <div key={epoch} className="tech-epoch">
            <h3>{getEpochName(epoch)}</h3>
            <div className="tech-buttons">
              {getEpochTechs(epoch).map(techType => {
                const tech = TECH_PROPERTIES[techType];
                const status = getTechStatus(techType);
                const progress = techManager.getCurrentResearch() === techType
                  ? (techManager.getResearchProgress() / tech.cost) * 100
                  : 0;

                return (
                  <div key={techType} className="tech-button-container">
                    <button
                      className={`tech-button ${status}`}
                      onClick={() => handleTechClick(techType)}
                      disabled={status === 'locked'}
                    >
                      <div className="tech-name">{tech.name}</div>
                      <div className="tech-cost">Cost: {tech.cost}</div>
                      {status === 'researching' && (
                        <div className="research-progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </button>
                    {status === 'researching' && (
                      <button
                        className="cancel-research"
                        onClick={handleCancelResearch}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showStory && selectedTech && (
        <div className="tech-story-modal">
          <div className="tech-story-content">
            <h2>{TECH_PROPERTIES[selectedTech].name}</h2>
            <p>{TECH_PROPERTIES[selectedTech].description}</p>
            <p>{TECH_PROPERTIES[selectedTech].story || 'No story available.'}</p>
            <button onClick={() => setShowStory(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}; 