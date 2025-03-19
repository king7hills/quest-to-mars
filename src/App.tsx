import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { BuildingType } from './engine/buildings/BuildingTypes';
import { UIProvider } from './ui/UIContext';
import { TopBar } from './ui/TopBar';
import { Sidebar } from './ui/Sidebar';
import './App.css';

const App: React.FC = () => {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [isEngineInitialized, setIsEngineInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeGameEngine = () => {
    if (!gameEngineRef.current) {
      try {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
          throw new Error('Game container element not found');
        }
        gameEngineRef.current = new GameEngine();
        gameEngineRef.current.start();
        setIsEngineInitialized(true);
      } catch (error) {
        console.error('Failed to initialize game engine:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize game engine');
      }
    }
  };

  useEffect(() => {
    initializeGameEngine();
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
        gameEngineRef.current = null;
      }
    };
  }, []);

  const handleBuildingSelect = (type: BuildingType | null) => {
    setSelectedBuildingType(type);
  };

  const handleSave = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.handleSave();
    }
  };

  const handleLoad = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.handleLoad();
    }
  };

  const renderGameContent = () => {
    if (!isEngineInitialized) {
      return (
        <div className="loading">
          <div className="loading-text">Loading game...</div>
          {error && <div className="error-text">{error}</div>}
        </div>
      );
    }

    const gameEngine = gameEngineRef.current!;
    const gameState = gameEngine.getGameState();

    return (
      <>
        <TopBar onSave={handleSave} onLoad={handleLoad} />
        <Sidebar
          gameState={gameState}
          gameEngine={gameEngine}
          selectedBuildingType={selectedBuildingType}
          onBuildingSelect={handleBuildingSelect}
        />
      </>
    );
  };

  return (
    <UIProvider>
      <div className="app">
        <div id="game-container" className="game-container" />
        {renderGameContent()}
      </div>
    </UIProvider>
  );
};

export default App; 