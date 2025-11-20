'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type PanelType = 'add-movie' | 'add-series' | 'edit-movie' | 'manage-categories' | 'browse-movies' | 'browse-series' | null;

interface PanelContextType {
  activePanel: PanelType;
  panelData: any;
  openPanel: (type: PanelType, data?: any) => void;
  closePanel: () => void;
  isOpen: (type: PanelType) => boolean;
}

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [panelData, setPanelData] = useState<any>(null);

  const openPanel = (type: PanelType, data?: any) => {
    setActivePanel(type);
    setPanelData(data || null);
  };

  const closePanel = () => {
    setActivePanel(null);
    setPanelData(null);
  };

  const isOpen = (type: PanelType) => {
    return activePanel === type;
  };

  return (
    <PanelContext.Provider
      value={{
        activePanel,
        panelData,
        openPanel,
        closePanel,
        isOpen,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const context = useContext(PanelContext);
  if (context === undefined) {
    throw new Error('usePanel must be used within a PanelProvider');
  }
  return context;
}
