/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ScreenState, GameSettings } from "./types";
import StartScreen from "./components/StartScreen";
import OptionsScreen from "./components/OptionsScreen";
import GameScreen from "./components/GameScreen";
import { sound } from "./utils/sound";
import { Gamepad2, Compass, AlertCircle } from "lucide-react";

export default function App() {
  const [screen, setScreen] = useState<ScreenState>("start");
  const [settings, setSettings] = useState<GameSettings>({
    musicVolume: 50,
    soundVolume: 60,
    difficulty: "normal",
    showFps: false,
    keybindings: {
      moveLeft: "ArrowLeft",
      moveRight: "ArrowRight",
      jump: "Space",
      interact: "KeyF",
    },
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("dansai_adventure_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        sound.setVolumes(parsed.musicVolume, parsed.soundVolume);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    } else {
      sound.setVolumes(50, 60);
    }
  }, []);

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem("dansai_adventure_settings", JSON.stringify(newSettings));
  };

  const handleStartGame = () => {
    setScreen("playing");
  };

  const handleOpenOptions = () => {
    setScreen("options");
  };

  const handleBackToStart = () => {
    setScreen("start");
  };

  return (
    <div id="app-root" className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden">
      
      {/* Dynamic Animated Atmospheric Particles in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Glowing red top aura */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        {/* Glowing green right aura */}
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-green-950/15 rounded-full blur-[100px] mix-blend-screen"></div>
        {/* Glowing yellow center aura */}
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-yellow-950/10 rounded-full blur-[130px] mix-blend-screen"></div>

        {/* Traditional Thai abstract hanging floral strings/patterns represented via simple css circles */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-red-600/10 via-yellow-500/5 to-transparent flex justify-around">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div 
              key={i} 
              className="w-1.5 h-16 bg-gradient-to-b from-red-500/30 to-transparent rounded-full transform origin-top animate-pulse"
              style={{ 
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
                transform: `scaleY(${1 + Math.sin(i) * 0.3})`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Decorative top tiny status badge to convey mood - fully standard and humble */}
      <header className="relative z-10 w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse border border-red-500/40"></div>
          <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-sans">Phi Ta Khon Festival</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-sans">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '20s' }} />
          <span>Dan Sai, Loei, Thailand</span>
        </div>
      </header>

      {/* Main Content Body Screen */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        {screen === "start" && (
          <StartScreen 
            onStartGame={handleStartGame}
            onOpenOptions={handleOpenOptions}
          />
        )}

        {screen === "options" && (
          <OptionsScreen
            settings={settings}
            onSave={handleSaveSettings}
            onBack={handleBackToStart}
          />
        )}

        {screen === "playing" && (
          <GameScreen
            settings={settings}
            onExit={handleBackToStart}
          />
        )}
      </main>

      {/* Humble Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center max-w-7xl mx-auto pointer-events-none select-none">
        <p className="text-[10px] text-zinc-600 font-sans tracking-wider">
          Dan Sai Adventure &bull; สืบสานวัฒนธรรมผีตาโขนอวดสายตาชาวโลก
        </p>
      </footer>

    </div>
  );
}
