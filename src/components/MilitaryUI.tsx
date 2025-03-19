import React, { useState } from 'react';
import { Military } from '../engine/military/Military';
import { UnitType, MilitaryFormationType, Unit, Formation } from '../engine/military/MilitaryTypes';
import './MilitaryUI.css';

interface MilitaryUIProps {
  military: Military;
}

export const MilitaryUI: React.FC<MilitaryUIProps> = ({ military }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [newFormationType, setNewFormationType] = useState<MilitaryFormationType>(MilitaryFormationType.SCATTERED);

  const handleTrainUnit = (type: UnitType) => {
    military.trainUnit(type, 'default');
  };

  const handleCreateFormation = (units: Unit[]) => {
    if (units.length > 0) {
      military.createFormation(units, newFormationType, 'default');
    }
  };

  const handleDisbandFormation = (formation: Formation) => {
    if (formation.id) {
      military.disbandFormation(formation.id);
    }
  };

  const stats = military.getStats();
  const units = military.getUnits();
  const formations = military.getFormations();

  return (
    <div className="military-ui">
      <div className="military-stats">
        <h2>Military Overview</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span>Total Units:</span>
            <span>{stats.totalUnits}</span>
          </div>
          <div className="stat-item">
            <span>Military Power:</span>
            <span>{Math.round(stats.militaryPower)}</span>
          </div>
          <div className="stat-item">
            <span>Morale:</span>
            <span>{Math.round(stats.morale)}</span>
          </div>
          <div className="stat-item">
            <span>Training Units:</span>
            <span>{stats.trainingUnits}</span>
          </div>
        </div>
      </div>

      <div className="military-controls">
        <div className="unit-training">
          <h3>Train Units</h3>
          <div className="unit-type-buttons">
            {Object.values(UnitType).map(type => (
              <button
                key={type}
                onClick={() => handleTrainUnit(type)}
                disabled={stats.trainingUnits >= stats.maxUnits}
              >
                Train {type}
              </button>
            ))}
          </div>
        </div>

        <div className="formation-controls">
          <h3>Formations</h3>
          <select
            value={newFormationType}
            onChange={(e) => setNewFormationType(e.target.value as MilitaryFormationType)}
          >
            {Object.values(MilitaryFormationType).map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedUnit && handleCreateFormation([selectedUnit])}
            disabled={!selectedUnit}
          >
            Create Formation
          </button>
        </div>
      </div>

      <div className="military-units">
        <h3>Units</h3>
        <div className="units-grid">
          {units.map(unit => (
            <div
              key={unit.id}
              className={`unit-card ${selectedUnit?.id === unit.id ? 'selected' : ''}`}
              onClick={() => setSelectedUnit(unit)}
            >
              <h4>{unit.type}</h4>
              <div className="unit-stats">
                <span>Health: {Math.round(unit.currentHealth)}/{unit.stats.health}</span>
                <span>Attack: {unit.stats.attack}</span>
                <span>Defense: {unit.stats.defense}</span>
                <span>Experience: {unit.experience}</span>
                <span>Formation: {unit.formation}</span>
              </div>
              {unit.isTraining && (
                <div className="training-progress">
                  Training: {Math.round((unit.trainingProgress / unit.stats.trainingTime) * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="military-formations">
        <h3>Formations</h3>
        <div className="formations-grid">
          {formations.map(formation => (
            <div
              key={formation.id}
              className={`formation-card ${selectedFormation?.id === formation.id ? 'selected' : ''}`}
              onClick={() => setSelectedFormation(formation)}
            >
              <h4>{formation.formation}</h4>
              <div className="formation-stats">
                <span>Units: {formation.units.length}</span>
                <span>Strength: {Math.round(formation.strength)}</span>
                <span>Morale: {Math.round(formation.morale)}</span>
              </div>
              <button onClick={() => handleDisbandFormation(formation)}>
                Disband Formation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 