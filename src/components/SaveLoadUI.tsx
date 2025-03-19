import React, { useState, useEffect } from 'react';
import { SaveSystem } from '../engine/save/SaveSystem';
import './styles/SaveLoadUI.css';

interface SaveLoadUIProps {
  saveSystem: SaveSystem;
  onSave: () => void;
  onLoad: () => void;
}

export const SaveLoadUI: React.FC<SaveLoadUIProps> = ({ saveSystem, onSave, onLoad }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveSlots, setSaveSlots] = useState<{ slot: number; timestamp: number }[]>([]);

  useEffect(() => {
    updateSaveSlots();
  }, []);

  const updateSaveSlots = () => {
    const slots = saveSystem.getSaveSlots();
    setSaveSlots(slots);
  };

  const handleSave = (slot: number) => {
    saveSystem.saveGame(slot);
    updateSaveSlots();
    onSave();
  };

  const handleLoad = (slot: number) => {
    if (saveSystem.loadGame(slot)) {
      onLoad();
    }
  };

  const handleDelete = (slot: number) => {
    if (saveSystem.deleteSave(slot)) {
      updateSaveSlots();
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="save-load-ui">
      <button 
        className="save-load-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Save/Load'}
      </button>

      {isOpen && (
        <div className="save-load-panel">
          <div className="save-slots">
            {Array.from({ length: 10 }, (_, i) => {
              const saveData = saveSlots.find(slot => slot.slot === i);
              return (
                <div key={i} className="save-slot">
                  <div className="slot-header">
                    <span className="slot-number">Slot {i + 1}</span>
                    {saveData && (
                      <span className="slot-date">{formatDate(saveData.timestamp)}</span>
                    )}
                  </div>
                  <div className="slot-actions">
                    <button
                      className="save-button"
                      onClick={() => handleSave(i)}
                    >
                      Save
                    </button>
                    {saveData && (
                      <>
                        <button
                          className="load-button"
                          onClick={() => handleLoad(i)}
                        >
                          Load
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(i)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 