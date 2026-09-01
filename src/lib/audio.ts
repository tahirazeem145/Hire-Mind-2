/**
 * Minion Sound Engine using Web Audio API
 * Generates fun, high-pitched Minion vocalizations, giggles, squeaks, and chirps.
 * 100% offline, zero latency, no external network dependencies.
 */

class MinionAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. "Bello!" Chirp (Cute rising two-tone vocal chirp)
  playBello() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // First syllable ("Bel-")
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(680, now + 0.12);

      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second syllable ("-lo!")
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(720, now + 0.13);
      osc2.frequency.exponentialRampToValueAtTime(980, now + 0.32);

      gain2.gain.setValueAtTime(0.01, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.13);
      osc2.stop(now + 0.36);
    } catch (e) {
      console.warn("Audio playback not allowed yet", e);
    }
  }

  // 2. Minion Giggle / Chuckle (Rapid high-pitched laughing pulses)
  playGiggle() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const pitches = [750, 880, 820, 940, 860, 780];

      pitches.forEach((freq, idx) => {
        const time = now + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq + 80, time + 0.05);

        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.065);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  // 3. "Banana!" Melodic rising squeak
  playBanana() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const notes = [
        { freq: 520, start: 0, dur: 0.1 },
        { freq: 650, start: 0.09, dur: 0.12 },
        { freq: 880, start: 0.20, dur: 0.22 },
      ];

      notes.forEach(({ freq, start, dur }) => {
        const t = now + start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t + dur);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  // 4. "Ooh! / Wow!" Cute inquisitive voice squeak
  playOoh() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.35);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  // Play random cute Minion sound on click
  playRandomMinionSound() {
    const sounds = [
      () => this.playBello(),
      () => this.playGiggle(),
      () => this.playBanana(),
      () => this.playOoh(),
    ];
    const randomIndex = Math.floor(Math.random() * sounds.length);
    sounds[randomIndex]();
  }
}

export const minionAudio = new MinionAudioEngine();
