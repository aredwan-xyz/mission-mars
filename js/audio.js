// MISSION MARS — Procedural WebAudio Telemetry Sonification & Game SFX Engine

class MarsAudioEngine {
  constructor() {
    this.ctx = null;
    this.radioMode = 0; // 0: Off, 1: DSN Telemetry Sonification FM, 2: Jezero Synth Pulse
    this.radioInterval = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playLaserZap() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSwitchWhoosh() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.22);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.45);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.47);
  }

  playMissionPassedFanfare() {
    this.ensureContext();
    if (!this.ctx) return;
    // Iconic GTA-inspired triumphant minor-to-major synth brass progression
    const notes = [293.66, 349.23, 440.0, 587.33, 523.25, 659.25];
    const times = [0, 0.14, 0.28, 0.44, 0.72, 0.95];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + times[idx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  cycleRadio(getTelemetryCallback) {
    this.ensureContext();
    this.radioMode = (this.radioMode + 1) % 3;
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }

    const labels = [
      '📻 DSN RADIO: OFF [R]',
      '📻 DSN SONIFICATION FM [R]',
      '📻 JEZERO HORIZON SYNTH [R]'
    ];

    if (this.radioMode > 0 && this.ctx) {
      const pentatonic = [220, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
      this.radioInterval = setInterval(() => {
        if (!this.ctx || document.hidden) return;
        const tele = getTelemetryCallback ? getTelemetryCallback() : { elev: 0, slope: 2, speed: 0 };
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (this.radioMode === 1) {
          // Sonify real MOLA elevation & local slope into harmonic frequencies
          const baseFreq = 180 + Math.max(-20, Math.min(40, tele.elev)) * 4.5 + tele.slope * 8;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(Math.max(110, baseFreq), now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        } else {
          // Ambient Martian synth arpeggio modulated by vehicle velocity
          const idx = Math.floor(Math.abs(tele.elev + tele.speed) * 1.7) % pentatonic.length;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(pentatonic[idx], now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        }

        osc.connect(gain).connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.44);
      }, 420);
    }

    return labels[this.radioMode];
  }
}

window.MarsAudio = new MarsAudioEngine();
