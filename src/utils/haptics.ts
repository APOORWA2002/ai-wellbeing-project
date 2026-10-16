/**
 * Tactile Haptics & Acoustic Feedback Utility
 * Provides physical hardware vibrations via navigator.vibrate
 * and synchronized gentle micro-acoustic tactile feedback via Web Audio API.
 */

export type HapticType = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'levelUp';

class HapticEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isUnlocked: boolean = false;

  constructor() {
    this.setupGestureUnlock();
  }

  private setupGestureUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.ensureAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      this.isUnlocked = true;
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };

    window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    window.addEventListener('keydown', unlock, { capture: true, passive: true });
    window.addEventListener('touchstart', unlock, { capture: true, passive: true });
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        try {
          this.audioCtx = new AudioCtxClass();
        } catch {
          this.audioCtx = null;
        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public trigger(type: HapticType = 'light'): void {
    // 1. Hardware vibration on supported mobile devices
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        switch (type) {
          case 'selection':
            navigator.vibrate(6);
            break;
          case 'light':
            navigator.vibrate(12);
            break;
          case 'medium':
            navigator.vibrate(24);
            break;
          case 'heavy':
            navigator.vibrate(45);
            break;
          case 'success':
            navigator.vibrate([15, 35, 20]);
            break;
          case 'warning':
            navigator.vibrate([25, 40, 25]);
            break;
          case 'levelUp':
            navigator.vibrate([20, 45, 20, 45, 40]);
            break;
        }
      } catch {
        // Ignore vibration errors in restricted environments
      }
    }

    // 2. Micro-acoustic tactile synthesis for desktop & iOS audio feedback
    if (!this.soundEnabled) return;
    try {
      const ctx = this.ensureAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'selection') {
        // Ultra-crisp subtle tactile tick (like iOS picker wheel or micro-toggle)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.02);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.022);
      } else if (type === 'light') {
        // Crisp soft tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.03);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.032);
      } else if (type === 'medium') {
        // Solid mechanical click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.045);
        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'heavy') {
        // Deep punchy tactile thud (e.g. explosive combos, major triggers)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.065);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'success') {
        // Warm dual harmonic chime
        const playTone = (freq: number, startDelay: number, dur: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, now + startDelay);
          g.gain.setValueAtTime(0.07, now + startDelay);
          g.gain.exponentialRampToValueAtTime(0.0005, now + startDelay + dur);
          o.start(now + startDelay);
          o.stop(now + startDelay + dur);
        };
        playTone(523.25, 0, 0.12); // C5
        playTone(783.99, 0.07, 0.18); // G5
      } else if (type === 'levelUp') {
        // Uplifting ascending major triad arpeggio
        const playNote = (freq: number, delay: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, now + delay);
          g.gain.setValueAtTime(0.08, now + delay);
          g.gain.exponentialRampToValueAtTime(0.0005, now + delay + 0.18);
          o.start(now + delay);
          o.stop(now + delay + 0.2);
        };
        playNote(440.0, 0); // A4
        playNote(554.37, 0.06); // C#5
        playNote(659.25, 0.12); // E5
        playNote(880.0, 0.18); // A5
      } else if (type === 'warning') {
        // Dual gentle tactile nudge
        const playBuzz = (delay: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(180, now + delay);
          o.frequency.exponentialRampToValueAtTime(90, now + delay + 0.05);
          g.gain.setValueAtTime(0.07, now + delay);
          g.gain.exponentialRampToValueAtTime(0.0005, now + delay + 0.05);
          o.start(now + delay);
          o.stop(now + delay + 0.055);
        };
        playBuzz(0);
        playBuzz(0.08);
      }
    } catch {
      // Audio playback fails silently if permissions restricted
    }
  }
}

export const haptics = new HapticEngine();
export const triggerHaptic = (type: HapticType = 'light') => haptics.trigger(type);
