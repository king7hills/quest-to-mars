import React, { useState, useEffect } from 'react';
import { DiplomaticStatus } from '../engine/ai/AITypes';
import { DiplomaticEventEffect, DiplomaticEventType } from '../engine/ai/DiplomaticEvents';
import { AIManager } from '../engine/ai/AIManager';
import './styles/DiplomaticUI.css';

interface DiplomaticUIProps {
  aiManager: AIManager;
  humanPlayerId: string;
  onDiplomaticAction: (eventType: DiplomaticEventType, targetId: string) => void;
}

interface DiplomaticRelation {
  playerId: string;
  playerName: string;
  status: DiplomaticStatus;
  personality: string;
  militaryStrength: number;
  economicStrength: number;
  activeEvents: DiplomaticEventEffect[];
}

export const DiplomaticUI: React.FC<DiplomaticUIProps> = ({
  aiManager,
  humanPlayerId,
  onDiplomaticAction
}) => {
  const [relations, setRelations] = useState<DiplomaticRelation[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<DiplomaticRelation | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    updateRelations();
  }, [aiManager]);

  const updateRelations = () => {
    const aiPlayers = aiManager.getAIPlayers();
    const newRelations: DiplomaticRelation[] = [];

    aiPlayers.forEach((aiPlayer) => {
      const status = aiPlayer.getDiplomaticStatus(humanPlayerId);
      const activeEffects = aiManager.getDiplomaticEventManager().getActiveEffects(aiPlayer.id);
      
      newRelations.push({
        playerId: aiPlayer.id,
        playerName: aiPlayer.name,
        status,
        personality: aiPlayer.personality,
        militaryStrength: aiPlayer.militaryStrength,
        economicStrength: aiPlayer.economicStrength,
        activeEvents: activeEffects
      });
    });

    setRelations(newRelations);
  };

  const getStatusColor = (status: DiplomaticStatus): string => {
    switch (status) {
      case DiplomaticStatus.ALLIED:
        return '#4CAF50'; // Green
      case DiplomaticStatus.FRIENDLY:
        return '#8BC34A'; // Light Green
      case DiplomaticStatus.NEUTRAL:
        return '#FFC107'; // Yellow
      case DiplomaticStatus.HOSTILE:
        return '#FF9800'; // Orange
      case DiplomaticStatus.WAR:
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const getAvailableEvents = (status: DiplomaticStatus): DiplomaticEventType[] => {
    switch (status) {
      case DiplomaticStatus.WAR:
        return [DiplomaticEventType.PEACE_TREATY];
      case DiplomaticStatus.HOSTILE:
        return [DiplomaticEventType.PEACE_TREATY, DiplomaticEventType.NON_AGGRESSION_PACT];
      case DiplomaticStatus.NEUTRAL:
        return [
          DiplomaticEventType.TRADE_AGREEMENT,
          DiplomaticEventType.RESEARCH_PACT,
          DiplomaticEventType.NON_AGGRESSION_PACT
        ];
      case DiplomaticStatus.FRIENDLY:
        return [
          DiplomaticEventType.TRADE_AGREEMENT,
          DiplomaticEventType.RESEARCH_PACT,
          DiplomaticEventType.RESOURCE_SHARING,
          DiplomaticEventType.CULTURAL_EXCHANGE,
          DiplomaticEventType.JOINT_EXPLORATION
        ];
      case DiplomaticStatus.ALLIED:
        return [
          DiplomaticEventType.TRADE_AGREEMENT,
          DiplomaticEventType.RESEARCH_PACT,
          DiplomaticEventType.MILITARY_ALLIANCE,
          DiplomaticEventType.RESOURCE_SHARING,
          DiplomaticEventType.CULTURAL_EXCHANGE,
          DiplomaticEventType.JOINT_EXPLORATION
        ];
      default:
        return [];
    }
  };

  const handleEventClick = (eventType: DiplomaticEventType, targetId: string) => {
    onDiplomaticAction(eventType, targetId);
    setShowEventModal(false);
  };

  return (
    <div className="diplomatic-ui">
      <h2>Diplomatic Relations</h2>
      
      <div className="relations-list">
        {relations.map((relation) => (
          <div
            key={relation.playerId}
            className={`relation-card ${selectedPlayer?.playerId === relation.playerId ? 'selected' : ''}`}
            onClick={() => setSelectedPlayer(relation)}
          >
            <div className="relation-header">
              <h3>{relation.playerId}</h3>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(relation.status) }}
              >
                {relation.status}
              </span>
            </div>
            
            <div className="relation-details">
              <p>Personality: {relation.personality}</p>
              <p>Military Strength: {relation.militaryStrength}</p>
              <p>Economic Strength: {relation.economicStrength}</p>
            </div>

            <div className="active-events">
              <h4>Active Events</h4>
              <ul>
                {relation.activeEvents.map((event, index) => (
                  <li key={index}>{event.description} ({event.duration} turns remaining)</li>
                ))}
              </ul>
            </div>

            <button
              className="diplomatic-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlayer(relation);
                setShowEventModal(true);
              }}
            >
              Diplomatic Actions
            </button>
          </div>
        ))}
      </div>

      {showEventModal && selectedPlayer && (
        <div className="event-modal">
          <div className="modal-content">
            <h3>Diplomatic Actions with {selectedPlayer.playerId}</h3>
            <div className="event-list">
              {getAvailableEvents(selectedPlayer.status).map((eventType) => (
                <button
                  key={eventType}
                  className="event-button"
                  onClick={() => handleEventClick(eventType, selectedPlayer.playerId)}
                >
                  {eventType}
                </button>
              ))}
            </div>
            <button
              className="close-modal-btn"
              onClick={() => setShowEventModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 