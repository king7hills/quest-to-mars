import React from 'react';
import { VictoryCondition, VictoryState } from '../engine/victory/VictorySystem';
import './styles/VictoryUI.css';

interface VictoryUIProps {
  victoryState: VictoryState;
}

export const VictoryUI: React.FC<VictoryUIProps> = ({ victoryState }) => {
  const getConditionStatus = (condition: VictoryCondition): string => {
    const isMet = victoryState.conditions.get(condition);
    return isMet ? '✓' : '✗';
  };

  const getConditionDescription = (condition: VictoryCondition): string => {
    switch (condition) {
      case VictoryCondition.SPACE_AGE:
        return 'Reach Space Age Epoch';
      case VictoryCondition.SPACEPORT:
        return 'Build a Spaceport';
      case VictoryCondition.LAUNCH_TO_MARS:
        return 'Gather resources to launch to Mars';
      default:
        return '';
    }
  };

  if (victoryState.gameOver) {
    return (
      <div className="victory-overlay">
        <div className="victory-content">
          <h2>Game Over!</h2>
          <p>Winner: {victoryState.winner}</p>
          <p>Congratulations on reaching Mars!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="victory-panel">
      <h3>Victory Conditions</h3>
      <div className="victory-conditions">
        {Object.values(VictoryCondition).map(condition => (
          <div key={condition} className="victory-condition">
            <span className="condition-status">{getConditionStatus(condition)}</span>
            <span className="condition-description">{getConditionDescription(condition)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 