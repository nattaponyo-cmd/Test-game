/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMusicPlaying = false;
  private currentBeat = 0;

  // Settings
  private musicVolume = 0.3; // 0 to 1
  private sfxVolume = 0.5;   // 0 to 1

  constructor() {
    // Lazy initialized when user interacts
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setVolumes(music: number, sfx: number) {
    this.musicVolume = music / 100;
    this.sfxVolume = sfx / 100;
  }

  playSelect() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playClick() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, this.ctx.currentTime); // E4
    osc.frequency.setValueAtTime(220, this.ctx.currentTime + 0.05); // A3

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playJump() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCollect() {
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5
    osc1.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.24); // C6

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1046.50, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(2093.00, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.35);
    osc2.stop(this.ctx.currentTime + 0.35);
  }

  playHit() {
    this.initContext();
    if (!this.ctx) return;

    // White noise / explosion sound for damage
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.2);
  }

  playGameOver() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  playGameWin() {
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    const duration = 0.12;

    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + index * duration);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.ctx!.currentTime + index * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + index * duration + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + index * duration);
      osc.stop(this.ctx!.currentTime + index * duration + 0.2);
    });
  }

  playAttack() {
    this.initContext();
    if (!this.ctx) return;

    // Fast swoosh/punch sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.45, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playSkill() {
    this.initContext();
    if (!this.ctx) return;

    // Uplifting arpeggio for magical dance/skill activation
    const notes = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // Am pentatonic
    const duration = 0.08;

    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + index * duration);

      // Add a small pitch slide up for more magic
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, this.ctx!.currentTime + index * duration + 0.1);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.ctx!.currentTime + index * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + index * duration + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + index * duration);
      osc.stop(this.ctx!.currentTime + index * duration + 0.15);
    });
  }

  startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const playBeat = () => {
      if (!this.isMusicPlaying || !this.ctx) return;

      // Simple traditional Thai style festival rhythm
      // A pentatonic scale melody (C, D, E, G, A) or classic minor vibe for Halloween/Spirit vibe of Phi Ta Khon
      // F, G, Ab, C, Db, Eb
      const scale = [220.00, 246.94, 261.63, 329.63, 392.00, 440.00]; // A Minor Pentatonic / Folk
      
      // Traditional Thai rhythm beat: Ching & Chap
      // Ching is a high pitch bright bell sound. Chap is a muted brass sound.
      // Ching on beat 1 & 3, Chap on beat 2 & 4
      const isChing = this.currentBeat % 2 === 0;
      const isChap = this.currentBeat % 2 === 1;

      // Play Ching (High, sustaining bell)
      if (isChing) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.61);
      }

      // Play Chap (Muted high-frequency noise/pulse)
      if (isChap) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.musicVolume * 0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      }

      // Bass drone/rhythm
      if (this.currentBeat % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(110.00, this.ctx.currentTime); // A2
        gain.gain.setValueAtTime(this.musicVolume * 0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.41);
      }

      // Simple folk melody sequence
      const melodyPattern = [
        0, 2, 3, 2, 4, 3, 5, 4,
        3, 2, 0, 2, -1, 3, 2, 0
      ];
      const melodyNoteIndex = melodyPattern[this.currentBeat % melodyPattern.length];
      
      if (melodyNoteIndex !== -1 && this.currentBeat % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = "triangle";
        // Map melody to freq
        const freq = scale[melodyNoteIndex % scale.length] * (melodyNoteIndex >= scale.length ? 2 : 1);
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.36);
      }

      this.currentBeat++;
    };

    // Tempo: 125 BPM -> 240ms per sixteenth note / eighth note
    // Let's go with 350ms beats
    this.musicInterval = window.setInterval(playBeat, 350);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundManager();
