'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore, BOARD_THEMES, BoardTheme } from '@/stores/settingsStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Settings, Palette, Volume2, Eye, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useAuth();
  const {
    boardTheme,
    showLegalMoves,
    showLastMove,
    highlightCheck,
    enableAnimations,
    soundEnabled,
    showCoordinates,
    showCapturedPieces,
    setBoardTheme,
    setShowLegalMoves,
    setShowLastMove,
    setHighlightCheck,
    setEnableAnimations,
    setSoundEnabled,
    setShowCoordinates,
    setShowCapturedPieces,
    resetToDefaults,
  } = useSettingsStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Customize your chess experience</p>
            </div>
          </div>

          {/* Board Theme */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Board Theme</CardTitle>
              </div>
              <CardDescription>Choose your preferred board colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {(Object.entries(BOARD_THEMES) as [BoardTheme, { light: string; dark: string }][]).map(
                  ([theme, colors]) => (
                    <button
                      key={theme}
                      onClick={() => setBoardTheme(theme)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-2 rounded-lg transition-all',
                        boardTheme === theme
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="grid grid-cols-2 w-12 h-12 rounded overflow-hidden">
                        <div style={{ backgroundColor: colors.light }} />
                        <div style={{ backgroundColor: colors.dark }} />
                        <div style={{ backgroundColor: colors.dark }} />
                        <div style={{ backgroundColor: colors.light }} />
                      </div>
                      <span className="text-xs capitalize">{theme}</span>
                    </button>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <CardTitle>Display</CardTitle>
              </div>
              <CardDescription>Visual preferences and helpers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleSetting
                label="Show Legal Moves"
                description="Highlight squares where pieces can move"
                checked={showLegalMoves}
                onChange={setShowLegalMoves}
              />
              <Separator />
              <ToggleSetting
                label="Show Last Move"
                description="Highlight the last move made"
                checked={showLastMove}
                onChange={setShowLastMove}
              />
              <Separator />
              <ToggleSetting
                label="Highlight Check"
                description="Show when a king is in check"
                checked={highlightCheck}
                onChange={setHighlightCheck}
              />
              <Separator />
              <ToggleSetting
                label="Board Coordinates"
                description="Show rank and file labels"
                checked={showCoordinates}
                onChange={setShowCoordinates}
              />
              <Separator />
              <ToggleSetting
                label="Captured Pieces"
                description="Show captured pieces beside player cards"
                checked={showCapturedPieces}
                onChange={setShowCapturedPieces}
              />
              <Separator />
              <ToggleSetting
                label="Animations"
                description="Enable smooth piece movement animations"
                checked={enableAnimations}
                onChange={setEnableAnimations}
              />
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <CardTitle>Sound</CardTitle>
              </div>
              <CardDescription>Audio feedback settings</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleSetting
                label="Sound Effects"
                description="Play sounds for moves, captures, and game events"
                checked={soundEnabled}
                onChange={setSoundEnabled}
              />
            </CardContent>
          </Card>

          {/* Reset */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                <CardTitle>Reset</CardTitle>
              </div>
              <CardDescription>Restore default settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          checked ? 'bg-primary' : 'bg-input'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

