import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PanelType = 'resources' | 'buildings' | 'tech' | 'military' | 'economy' | 'ai' | 'events' | 'none';

interface UIContextType {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  isPanelOpen: boolean;
  togglePanel: (panel: PanelType) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePanel, setActivePanel] = useState<PanelType>('none');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const togglePanel = (panel: PanelType) => {
    if (activePanel === panel) {
      setIsPanelOpen(!isPanelOpen);
    } else {
      setActivePanel(panel);
      setIsPanelOpen(true);
    }
  };

  return (
    <UIContext.Provider value={{ activePanel, setActivePanel, isPanelOpen, togglePanel }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}; 