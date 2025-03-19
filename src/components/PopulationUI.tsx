import React, { useState } from 'react';
import { PopulationRole } from '../engine/population/PopulationTypes';
import { Population } from '../engine/population/Population';
import './PopulationUI.css';

interface PopulationUIProps {
  population: Population;
}

export const PopulationUI: React.FC<PopulationUIProps> = ({ population }) => {
  const [selectedRole, setSelectedRole] = useState<PopulationRole | null>(null);
  const [assignmentCount, setAssignmentCount] = useState<number>(0);
  const stats = population.getStats();
  const effects = population.getEffects();

  const handleAssign = () => {
    if (selectedRole && assignmentCount > 0) {
      population.assignPopulation(selectedRole, assignmentCount);
      setAssignmentCount(0);
    }
  };

  const handleUnassign = () => {
    if (selectedRole && assignmentCount > 0) {
      population.unassignPopulation(selectedRole, assignmentCount);
      setAssignmentCount(0);
    }
  };

  return (
    <div className="population-ui">
      <div className="population-stats">
        <h3>Population Overview</h3>
        <div className="stat-row">
          <span>Total Population:</span>
          <span>{stats.total}</span>
        </div>
        <div className="stat-row">
          <span>Unassigned:</span>
          <span>{stats.unassigned}</span>
        </div>
        <div className="stat-row">
          <span>Health:</span>
          <span>{stats.health}</span>
        </div>
        <div className="stat-row">
          <span>Happiness:</span>
          <span>{stats.happiness}</span>
        </div>
      </div>

      <div className="population-assignments">
        <h3>Assignments</h3>
        {Object.values(PopulationRole).map(role => (
          <div key={role} className="assignment-row">
            <span>{role}:</span>
            <span>{stats.assignments.get(role)?.count || 0}</span>
            <span>Efficiency: {(stats.assignments.get(role)?.efficiency || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="population-controls">
        <h3>Assign Population</h3>
        <select
          value={selectedRole || ''}
          onChange={(e) => setSelectedRole(e.target.value as PopulationRole)}
        >
          <option value="">Select Role</option>
          {Object.values(PopulationRole).map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          max={stats.unassigned}
          value={assignmentCount}
          onChange={(e) => setAssignmentCount(parseInt(e.target.value) || 0)}
        />
        <button onClick={handleAssign}>Assign</button>
        <button onClick={handleUnassign}>Unassign</button>
      </div>

      <div className="population-effects">
        <h3>Production Effects</h3>
        <div className="effect-row">
          <span>Food Production:</span>
          <span>{effects.foodProduction.toFixed(1)}</span>
        </div>
        <div className="effect-row">
          <span>Research Production:</span>
          <span>{effects.researchProduction.toFixed(1)}</span>
        </div>
        <div className="effect-row">
          <span>Gold Production:</span>
          <span>{effects.goldProduction.toFixed(1)}</span>
        </div>
        <div className="effect-row">
          <span>Military Strength:</span>
          <span>{effects.militaryStrength.toFixed(1)}</span>
        </div>
        <div className="effect-row">
          <span>Building Speed:</span>
          <span>{effects.buildingSpeed.toFixed(1)}</span>
        </div>
        <div className="effect-row">
          <span>Exploration Speed:</span>
          <span>{effects.explorationSpeed.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}; 