import React from 'react';
import { useUI, PanelType } from './UIContext';
import './styles/TopBar.css';

interface TopBarProps {
  onSave: () => void;
  onLoad: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSave, onLoad }) => {
  const { activePanel, togglePanel } = useUI();

  const navItems: { id: PanelType; label: string; icon: string }[] = [
    { id: 'resources', label: 'Resources', icon: '💎' },
    { id: 'buildings', label: 'Buildings', icon: '🏗️' },
    { id: 'tech', label: 'Technology', icon: '🔬' },
    { id: 'military', label: 'Military', icon: '⚔️' },
    { id: 'economy', label: 'Economy', icon: '💰' },
    { id: 'ai', label: 'Diplomacy', icon: '🤝' },
    { id: 'events', label: 'Events', icon: '📜' },
  ];

  return (
    <div className="topbar">
      <div className="topbar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`topbar-button ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => togglePanel(item.id)}
          >
            <span className="button-icon">{item.icon}</span>
            <span className="button-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="topbar-actions">
        <button className="topbar-button" onClick={onSave}>
          <span className="button-icon">💾</span>
          <span className="button-label">Save</span>
        </button>
        <button className="topbar-button" onClick={onLoad}>
          <span className="button-icon">📂</span>
          <span className="button-label">Load</span>
        </button>
      </div>
    </div>
  );
}; 