/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GameSettings, Keybindings } from "../types";
import { sound } from "../utils/sound";
import { 
  Keyboard, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Check, 
  Sliders, 
  ShieldAlert, 
  SlidersHorizontal,
  ArrowLeft
} from "lucide-react";

interface OptionsScreenProps {
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export default function OptionsScreen({ settings, onSave, onBack }: OptionsScreenProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [activeBinding, setActiveBinding] = useState<keyof Keybindings | null>(null);

  // Default keybindings for reset
  const defaultKeybindings: Keybindings = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    jump: "Space",
    interact: "KeyF",
  };

  useEffect(() => {
    // Handle key listener when in remapping state
    if (!activeBinding) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      // Don't bind Escape to normal game actions to keep it free for back/menus
      if (e.code === "Escape") {
        setActiveBinding(null);
        sound.playClick();
        return;
      }

      // Format clean key representation
      let keyName = e.code;
      if (e.code === "Space") keyName = "Space";

      const updatedBindings = {
        ...localSettings.keybindings,
        [activeBinding]: keyName,
      };

      setLocalSettings({
        ...localSettings,
        keybindings: updatedBindings,
      });

      setActiveBinding(null);
      sound.playCollect();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBinding, localSettings]);

  const handleVolumeChange = (type: "music" | "sound", val: number) => {
    const updated = {
      ...localSettings,
      [type === "music" ? "musicVolume" : "soundVolume"]: val,
    };
    setLocalSettings(updated);
    sound.setVolumes(updated.musicVolume, updated.soundVolume);
    if (type === "sound") {
      sound.playSelect();
    }
  };

  const handleDifficultyChange = (difficulty: "easy" | "normal" | "hard") => {
    setLocalSettings({
      ...localSettings,
      difficulty,
    });
    sound.playSelect();
  };

  const handleReset = () => {
    const resetSettings: GameSettings = {
      ...localSettings,
      keybindings: { ...defaultKeybindings },
      difficulty: "normal",
      musicVolume: 50,
      soundVolume: 50,
    };
    setLocalSettings(resetSettings);
    sound.setVolumes(50, 50);
    sound.playCollect();
  };

  const handleSaveAndBack = () => {
    onSave(localSettings);
    sound.playClick();
    onBack();
  };

  // Helper to translate keycodes into readable Thai/English labels
  const getReadableKeyName = (code: string) => {
    if (code === "Space") return "SPACE (สเปซบาร์)";
    if (code === "ArrowLeft") return "← (ลูกศรซ้าย)";
    if (code === "ArrowRight") return "→ (ลูกศรขวา)";
    if (code === "ArrowUp") return "↑ (ลูกศรขึ้น)";
    if (code === "ArrowDown") return "↓ (ลูกศรลง)";
    if (code.startsWith("Key")) return code.replace("Key", "");
    if (code.startsWith("Digit")) return code.replace("Digit", "");
    return code;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div id="options-container" className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-0 font-sans">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-zinc-950/90 border border-red-500/30 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Sliders className="w-7 h-7 text-red-500 animate-pulse" />
            <h2 className="text-3xl font-semibold tracking-tight text-white font-kanit">
              ตั้งค่าออปชัน <span className="text-xs text-red-500 font-normal uppercase tracking-widest block md:inline md:ml-2">Settings & Controls</span>
            </h2>
          </div>
          <button
            onClick={handleSaveAndBack}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-red-600 border border-zinc-700 hover:border-red-500 rounded-lg text-sm text-zinc-300 hover:text-white transition-all cursor-pointer font-kanit"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Keybindings (การตั้งค่าปุ่มควบคุม) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
              <Keyboard className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-medium text-white font-kanit">ปุ่มควบคุมตัวละคร</h3>
            </div>

            <p className="text-xs text-zinc-400 font-kanit leading-relaxed">
              คลิกที่ช่องสำหรับตั้งค่าปุ่มที่ต้องการ จากนั้นกดปุ่มบนคีย์บอร์ดเพื่อเปลี่ยนปุ่มควบคุม
            </p>

            <div className="space-y-3">
              {/* Move Left */}
              <motion.div 
                variants={itemVariants} 
                className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl"
              >
                <span className="text-sm font-kanit text-zinc-300">เดินซ้าย (Move Left)</span>
                <button
                  onClick={() => { setActiveBinding("moveLeft"); sound.playClick(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium min-w-[130px] border transition-all ${
                    activeBinding === "moveLeft"
                      ? "bg-red-600/20 border-red-500 text-red-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-700 text-white hover:border-red-500/50"
                  }`}
                >
                  {activeBinding === "moveLeft" ? "กดปุ่มใหม่..." : getReadableKeyName(localSettings.keybindings.moveLeft)}
                </button>
              </motion.div>

              {/* Move Right */}
              <motion.div 
                variants={itemVariants} 
                className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl"
              >
                <span className="text-sm font-kanit text-zinc-300">เดินขวา (Move Right)</span>
                <button
                  onClick={() => { setActiveBinding("moveRight"); sound.playClick(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium min-w-[130px] border transition-all ${
                    activeBinding === "moveRight"
                      ? "bg-red-600/20 border-red-500 text-red-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-700 text-white hover:border-red-500/50"
                  }`}
                >
                  {activeBinding === "moveRight" ? "กดปุ่มใหม่..." : getReadableKeyName(localSettings.keybindings.moveRight)}
                </button>
              </motion.div>

              {/* Jump */}
              <motion.div 
                variants={itemVariants} 
                className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl"
              >
                <span className="text-sm font-kanit text-zinc-300">กระโดด (Jump)</span>
                <button
                  onClick={() => { setActiveBinding("jump"); sound.playClick(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium min-w-[130px] border transition-all ${
                    activeBinding === "jump"
                      ? "bg-red-600/20 border-red-500 text-red-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-700 text-white hover:border-red-500/50"
                  }`}
                >
                  {activeBinding === "jump" ? "กดปุ่มใหม่..." : getReadableKeyName(localSettings.keybindings.jump)}
                </button>
              </motion.div>

              {/* Interact */}
              <motion.div 
                variants={itemVariants} 
                className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl"
              >
                <span className="text-sm font-kanit text-zinc-300">โจมตี / สำรวจ (Interact)</span>
                <button
                  onClick={() => { setActiveBinding("interact"); sound.playClick(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium min-w-[130px] border transition-all ${
                    activeBinding === "interact"
                      ? "bg-red-600/20 border-red-500 text-red-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-700 text-white hover:border-red-500/50"
                  }`}
                >
                  {activeBinding === "interact" ? "กดปุ่มใหม่..." : getReadableKeyName(localSettings.keybindings.interact)}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Audio & Game Difficulty */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
              <SlidersHorizontal className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-medium text-white font-kanit">ระดับเสียง & ทั่วไป</h3>
            </div>

            {/* Audio volume sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-kanit text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-zinc-400" />
                    เสียงเพลงประกอบ (Music Volume)
                  </span>
                  <span className="font-mono text-xs">{localSettings.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.musicVolume}
                  onChange={(e) => handleVolumeChange("music", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-kanit text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-zinc-400" />
                    เสียงเอฟเฟกต์ (SFX Volume)
                  </span>
                  <span className="font-mono text-xs">{localSettings.soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.soundVolume}
                  onChange={(e) => handleVolumeChange("sound", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Difficulty Setting */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-kanit text-zinc-300">ระดับความยาก (Difficulty)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize font-kanit border transition-all ${
                      localSettings.difficulty === diff
                        ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {diff === "easy" ? "ง่าย" : diff === "normal" ? "ปกติ" : "ยาก"}
                  </button>
                ))}
              </div>
            </div>

            {/* Miscellaneous */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.showFps}
                  onChange={(e) => {
                    setLocalSettings({ ...localSettings, showFps: e.target.checked });
                    sound.playSelect();
                  }}
                  className="rounded bg-zinc-900 border-zinc-700 text-red-500 focus:ring-red-500 w-4 h-4"
                />
                <span className="text-sm font-kanit text-zinc-300">แสดงเฟรมเรตและค่าดีบัก (Show FPS Counter)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions inside screen */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg text-sm transition-all cursor-pointer font-kanit"
          >
            <RotateCcw className="w-4 h-4" />
            รีเซ็ตค่าเริ่มต้น (Reset Defaults)
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-semibold font-kanit text-zinc-300 transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveAndBack}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-red-600 hover:bg-red-500 border border-red-500 rounded-lg text-sm font-semibold font-kanit text-white shadow-lg hover:shadow-red-600/35 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              บันทึกการปรับเปลี่ยน
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
