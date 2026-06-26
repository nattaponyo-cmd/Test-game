/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Keybindings {
  moveLeft: string;
  moveRight: string;
  jump: string;
  interact: string;
}

export interface GameSettings {
  musicVolume: number; // 0 to 100
  soundVolume: number; // 0 to 100
  keybindings: Keybindings;
  difficulty: "easy" | "normal" | "hard";
  showFps: boolean;
}

export type ScreenState = "start" | "options" | "playing" | "credits";

export interface HighScore {
  name: string;
  score: number;
  date: string;
}
