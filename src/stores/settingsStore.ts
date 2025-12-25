import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BoardTheme = 'wood' | 'green' | 'blue' | 'gray' | 'purple';
export type PieceStyle = 'standard' | 'neo' | 'classic';

interface SettingsState {
  // Board settings
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  showLegalMoves: boolean;
  showLastMove: boolean;
  highlightCheck: boolean;
  enableAnimations: boolean;
  animationSpeed: number; // ms
  
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  
  // Display settings
  showCoordinates: boolean;
  showCapturedPieces: boolean;
  
  // Actions
  setBoardTheme: (theme: BoardTheme) => void;
  setPieceStyle: (style: PieceStyle) => void;
  setShowLegalMoves: (show: boolean) => void;
  setShowLastMove: (show: boolean) => void;
  setHighlightCheck: (highlight: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setShowCoordinates: (show: boolean) => void;
  setShowCapturedPieces: (show: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  boardTheme: 'wood' as BoardTheme,
  pieceStyle: 'standard' as PieceStyle,
  showLegalMoves: true,
  showLastMove: true,
  highlightCheck: true,
  enableAnimations: true,
  animationSpeed: 200,
  soundEnabled: true,
  soundVolume: 0.5,
  showCoordinates: true,
  showCapturedPieces: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setBoardTheme: (theme) => set({ boardTheme: theme }),
      setPieceStyle: (style) => set({ pieceStyle: style }),
      setShowLegalMoves: (show) => set({ showLegalMoves: show }),
      setShowLastMove: (show) => set({ showLastMove: show }),
      setHighlightCheck: (highlight) => set({ highlightCheck: highlight }),
      setEnableAnimations: (enable) => set({ enableAnimations: enable }),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      setShowCoordinates: (show) => set({ showCoordinates: show }),
      setShowCapturedPieces: (show) => set({ showCapturedPieces: show }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'chess-settings',
    }
  )
);

// Board theme colors
export const BOARD_THEMES: Record<BoardTheme, { light: string; dark: string }> = {
  wood: { light: '#ddb88c', dark: '#b58863' },
  green: { light: '#eeeed2', dark: '#769656' },
  blue: { light: '#dee3e6', dark: '#8ca2ad' },
  gray: { light: '#e0e0e0', dark: '#9e9e9e' },
  purple: { light: '#e6d4f0', dark: '#9b72b0' },
};

