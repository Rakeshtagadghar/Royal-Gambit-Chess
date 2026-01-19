import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore, BOARD_THEMES } from '@/stores/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults();
  });

  describe('initial state / defaults', () => {
    it('should have correct default board settings', () => {
      const state = useSettingsStore.getState();
      expect(state.boardTheme).toBe('wood');
      expect(state.pieceStyle).toBe('standard');
      expect(state.showLegalMoves).toBe(true);
      expect(state.showLastMove).toBe(true);
      expect(state.highlightCheck).toBe(true);
      expect(state.enableAnimations).toBe(true);
      expect(state.animationSpeed).toBe(200);
    });

    it('should have correct default sound settings', () => {
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
      expect(state.soundVolume).toBe(0.5);
    });

    it('should have correct default display settings', () => {
      const state = useSettingsStore.getState();
      expect(state.showCoordinates).toBe(true);
      expect(state.showCapturedPieces).toBe(true);
    });
  });

  describe('board theme settings', () => {
    it('should set board theme', () => {
      const { setBoardTheme } = useSettingsStore.getState();
      setBoardTheme('green');
      expect(useSettingsStore.getState().boardTheme).toBe('green');
    });

    it('should accept all valid board themes', () => {
      const themes = ['wood', 'green', 'blue', 'gray', 'purple'] as const;
      themes.forEach(theme => {
        useSettingsStore.getState().setBoardTheme(theme);
        expect(useSettingsStore.getState().boardTheme).toBe(theme);
      });
    });
  });

  describe('piece style settings', () => {
    it('should set piece style', () => {
      const { setPieceStyle } = useSettingsStore.getState();
      setPieceStyle('neo');
      expect(useSettingsStore.getState().pieceStyle).toBe('neo');
    });

    it('should accept all valid piece styles', () => {
      const styles = ['standard', 'neo', 'classic'] as const;
      styles.forEach(style => {
        useSettingsStore.getState().setPieceStyle(style);
        expect(useSettingsStore.getState().pieceStyle).toBe(style);
      });
    });
  });

  describe('board display toggles', () => {
    it('should toggle showLegalMoves', () => {
      const { setShowLegalMoves } = useSettingsStore.getState();
      setShowLegalMoves(false);
      expect(useSettingsStore.getState().showLegalMoves).toBe(false);
      setShowLegalMoves(true);
      expect(useSettingsStore.getState().showLegalMoves).toBe(true);
    });

    it('should toggle showLastMove', () => {
      const { setShowLastMove } = useSettingsStore.getState();
      setShowLastMove(false);
      expect(useSettingsStore.getState().showLastMove).toBe(false);
    });

    it('should toggle highlightCheck', () => {
      const { setHighlightCheck } = useSettingsStore.getState();
      setHighlightCheck(false);
      expect(useSettingsStore.getState().highlightCheck).toBe(false);
    });

    it('should toggle showCoordinates', () => {
      const { setShowCoordinates } = useSettingsStore.getState();
      setShowCoordinates(false);
      expect(useSettingsStore.getState().showCoordinates).toBe(false);
    });

    it('should toggle showCapturedPieces', () => {
      const { setShowCapturedPieces } = useSettingsStore.getState();
      setShowCapturedPieces(false);
      expect(useSettingsStore.getState().showCapturedPieces).toBe(false);
    });
  });

  describe('animation settings', () => {
    it('should toggle enableAnimations', () => {
      const { setEnableAnimations } = useSettingsStore.getState();
      setEnableAnimations(false);
      expect(useSettingsStore.getState().enableAnimations).toBe(false);
    });

    it('should set animationSpeed', () => {
      const { setAnimationSpeed } = useSettingsStore.getState();
      setAnimationSpeed(100);
      expect(useSettingsStore.getState().animationSpeed).toBe(100);

      setAnimationSpeed(500);
      expect(useSettingsStore.getState().animationSpeed).toBe(500);
    });
  });

  describe('sound settings', () => {
    it('should toggle soundEnabled', () => {
      const { setSoundEnabled } = useSettingsStore.getState();
      setSoundEnabled(false);
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });

    it('should set soundVolume', () => {
      const { setSoundVolume } = useSettingsStore.getState();
      setSoundVolume(0);
      expect(useSettingsStore.getState().soundVolume).toBe(0);

      setSoundVolume(1);
      expect(useSettingsStore.getState().soundVolume).toBe(1);

      setSoundVolume(0.75);
      expect(useSettingsStore.getState().soundVolume).toBe(0.75);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', () => {
      const store = useSettingsStore.getState();

      // Change all settings
      store.setBoardTheme('purple');
      store.setPieceStyle('classic');
      store.setShowLegalMoves(false);
      store.setShowLastMove(false);
      store.setHighlightCheck(false);
      store.setEnableAnimations(false);
      store.setAnimationSpeed(500);
      store.setSoundEnabled(false);
      store.setSoundVolume(0);
      store.setShowCoordinates(false);
      store.setShowCapturedPieces(false);

      // Reset
      store.resetToDefaults();

      const state = useSettingsStore.getState();
      expect(state.boardTheme).toBe('wood');
      expect(state.pieceStyle).toBe('standard');
      expect(state.showLegalMoves).toBe(true);
      expect(state.showLastMove).toBe(true);
      expect(state.highlightCheck).toBe(true);
      expect(state.enableAnimations).toBe(true);
      expect(state.animationSpeed).toBe(200);
      expect(state.soundEnabled).toBe(true);
      expect(state.soundVolume).toBe(0.5);
      expect(state.showCoordinates).toBe(true);
      expect(state.showCapturedPieces).toBe(true);
    });
  });

  describe('BOARD_THEMES constant', () => {
    it('should have correct theme colors', () => {
      expect(BOARD_THEMES.wood).toEqual({ light: '#ddb88c', dark: '#b58863' });
      expect(BOARD_THEMES.green).toEqual({ light: '#eeeed2', dark: '#769656' });
      expect(BOARD_THEMES.blue).toEqual({ light: '#dee3e6', dark: '#8ca2ad' });
      expect(BOARD_THEMES.gray).toEqual({ light: '#e0e0e0', dark: '#9e9e9e' });
      expect(BOARD_THEMES.purple).toEqual({ light: '#e6d4f0', dark: '#9b72b0' });
    });

    it('should have all themes defined', () => {
      const themes = ['wood', 'green', 'blue', 'gray', 'purple'];
      themes.forEach(theme => {
        expect(BOARD_THEMES[theme as keyof typeof BOARD_THEMES]).toBeDefined();
        expect(BOARD_THEMES[theme as keyof typeof BOARD_THEMES].light).toBeDefined();
        expect(BOARD_THEMES[theme as keyof typeof BOARD_THEMES].dark).toBeDefined();
      });
    });
  });
});
