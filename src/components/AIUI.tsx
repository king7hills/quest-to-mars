import React from 'react';
import { AIPlayer } from '../engine/ai/AIPlayer';
import { DiplomaticStatus } from '../engine/ai/AITypes';
import './AIUI.css';

interface AIUIProps {
  aiPlayers: Map<string, AIPlayer>;
  playerId: string;
}

export const AIUI: React.FC<AIUIProps> = ({ aiPlayers, playerId }) => {
  const getDiplomaticStatusColor = (status: DiplomaticStatus): string => {
    switch (status) {
      case DiplomaticStatus.WAR:
        return '#ff0000';
      case DiplomaticStatus.HOSTILE:
        return '#ff4444';
      case DiplomaticStatus.NEUTRAL:
        return '#ffff00';
      case DiplomaticStatus.FRIENDLY:
        return '#44ff44';
      case DiplomaticStatus.ALLIED:
        return '#00ff00';
      default:
        return '#ffffff';
    }
  };

  return (
    <div className="ai-ui">
      <h2>AI Players</h2>
      <div className="ai-players">
        {Array.from(aiPlayers.values()).map(aiPlayer => (
          <div key={aiPlayer.id} className="ai-player-card">
            <div className="ai-player-header">
              <h3>{aiPlayer.name}</h3>
              <div
                className="diplomatic-status"
                style={{
                  backgroundColor: getDiplomaticStatusColor(
                    aiPlayer.getDiplomaticStatus(playerId)
                  )
                }}
              />
            </div>
            <div className="ai-player-info">
              <div className="info-row">
                <span>Epoch:</span>
                <span>{aiPlayer.epoch}</span>
              </div>
              <div className="info-row">
                <span>Population:</span>
                <span>{aiPlayer.population}</span>
              </div>
              <div className="info-row">
                <span>State:</span>
                <span>{aiPlayer.state}</span>
              </div>
              <div className="info-row">
                <span>Military Strength:</span>
                <span>{aiPlayer.militaryStrength}</span>
              </div>
              <div className="info-row">
                <span>Economic Strength:</span>
                <span>{aiPlayer.economicStrength}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 