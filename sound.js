// Synthesized sound effects (Web Audio API). Off by default; never blocks the game.
const AC = window.AudioContext || window.webkitAudioContext;
let ctx = null, on = false;

function tone(freq, dur, { type = 'sine', at = 0, gain = 0.12, to } = {}) {
  if (!on || !ctx) return;
  try {
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch { /* ignore audio errors */ }
}

const REVEAL = { common: [660], uncommon: [660, 880], rare: [660, 880, 1100], legendary: [523, 659, 784, 1047, 1319] };

export const sound = {
  activate() { for (let i = 0; i < 6; i++) tone(180 + i * 20, 0.08, { type: 'square', at: i * 0.12, gain: 0.05 }); },
  dispense() { tone(700, 0.5, { type: 'triangle', to: 180 }); tone(140, 0.12, { type: 'square', at: 0.55, gain: 0.1 }); },
  open() { tone(520, 0.12, { type: 'triangle' }); tone(780, 0.16, { type: 'triangle', at: 0.1 }); },
  reveal(r) { (REVEAL[r] || REVEAL.common).forEach((f, i) => tone(f, 0.25, { type: 'triangle', at: 0.18 + i * 0.1 })); }
};

export function initSound(btn) {
  const render = () => {
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Sound effects on. Press to mute' : 'Sound effects off. Press to turn on');
    btn.classList.toggle('is-on', on);
  };
  if (!AC) { btn.disabled = true; btn.title = 'Sound is not supported on this browser'; render(); return; }
  btn.addEventListener('click', () => {
    on = !on;
    if (on) {
      try { ctx = ctx || new AC(); ctx.resume && ctx.resume(); } catch { on = false; }
      tone(880, 0.12, { type: 'triangle' });
    }
    render();
  });
  render();
}
