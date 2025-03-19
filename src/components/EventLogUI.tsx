import React, { useEffect, useState } from 'react';
import { EventSystem, GameEvent, EventType } from '../engine/events/EventSystem';
import './styles/EventLogUI.css';

interface EventLogUIProps {
  eventSystem: EventSystem;
}

export const EventLogUI: React.FC<EventLogUIProps> = ({ eventSystem }) => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateEvents = () => {
      setEvents(eventSystem.getEvents());
    };

    // Initial events
    updateEvents();

    // Subscribe to all event types
    const listenerIds = Object.values(EventType).map(type => 
      eventSystem.addEventListener(type, updateEvents)
    );

    // Cleanup
    return () => {
      Object.values(EventType).forEach((type, index) => {
        eventSystem.removeEventListener(type, listenerIds[index]);
      });
    };
  }, [eventSystem]);

  const getEventIcon = (type: EventType): string => {
    switch (type) {
      case EventType.RESOURCE_PRODUCTION:
        return '📈';
      case EventType.RESOURCE_CONSUMPTION:
        return '📉';
      case EventType.RESOURCE_DEPLETION:
        return '⚠️';
      case EventType.BUILDING_PLACED:
        return '🏗️';
      case EventType.BUILDING_COMPLETED:
        return '✅';
      case EventType.BUILDING_DESTROYED:
        return '💥';
      case EventType.RESEARCH_STARTED:
        return '🔬';
      case EventType.RESEARCH_COMPLETED:
        return '🎓';
      case EventType.EPOCH_CHANGED:
        return '⚡';
      case EventType.UNIT_TRAINED:
        return '⚔️';
      case EventType.UNIT_DESTROYED:
        return '💀';
      case EventType.COMBAT_STARTED:
        return '⚔️';
      case EventType.COMBAT_ENDED:
        return '🏳️';
      case EventType.DIPLOMATIC_STATUS_CHANGED:
        return '🤝';
      case EventType.TRADE_AGREEMENT_SIGNED:
        return '📝';
      case EventType.ALLIANCE_FORMED:
        return '🤝';
      case EventType.POPULATION_GROWTH:
        return '👥';
      case EventType.POPULATION_DECLINE:
        return '👻';
      case EventType.VICTORY_CONDITION_MET:
        return '🏆';
      case EventType.GAME_OVER:
        return '🎮';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`event-log ${isExpanded ? 'expanded' : ''}`}>
      <div className="event-log-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Event Log</h3>
        <span className="event-count">{events.length}</span>
      </div>
      {isExpanded && (
        <div className="event-list">
          {events.slice().reverse().map(event => (
            <div key={event.id} className="event-item">
              <span className="event-icon">{getEventIcon(event.type)}</span>
              <span className="event-time">{formatTimestamp(event.timestamp)}</span>
              <span className="event-description">{event.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 