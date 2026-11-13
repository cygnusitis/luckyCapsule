import { pickCapsule } from './draw.js';
import { RARITY_LABEL } from './capsules.js';
import { sound, initSound } from './sound.js';

const $ = id => document.getElementById(id);
const el = Object.fromEntries(['machine', 'cap', 'burst', 'fx', 'draw', 'result', 'illus', 'badge', 'cat', 'cname', 'cmsg', 'share', 'shareMsg', 'live', 'sound', 'domeCaps'].map(k => [k, $(k)]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const sleep = ms => new Promise(r => setTimeout(r, reduce.matches ? Math.min(ms, 100) : ms));
const rand = (a, b) => a + Math.random() * (b - a);

// States: IDLE -> DISPENSING -> REVEALED -> (Draw Again) DISPENSING ...
let state = 'IDLE';
let current = null;

// Decorative capsules inside the dome
const PAL = ['#cff0ff', '#5dbbff', '#f783b6', '#ffd27f', '#ff9ec6', '#7ed6ff', '#7a5af8'];
const POS = [[95,185],[128,190],[162,190],[196,184],[70,160],[108,155],[145,160],[182,155],[212,160],[60,125],[98,118],[140,122],[182,116],[222,120],[88,82],[126,80],[165,84],[198,80],[118,48],[158,50]];
el.domeCaps.innerHTML = POS.map(([x, y], i) => `<g transform="translate(${x} ${y})"><g class="dc" style="--d:${-(i % 5) * 0.6}s"><path d="M-17 0a17 17 0 0 0 34 0z" fill="#fff"/><path d="M-17 0a17 17 0 0 1 34 0z" fill="${PAL[i % 7]}"/><circle r="17" fill="none" stroke="#1f1747" stroke-width="3"/><path d="M-17 0h34" stroke="#1f1747" stroke-width="2"/><circle cx="-7" cy="-8" r="3" fill="#fff" opacity=".7"/></g></g>`).join('');

initSound(el.sound);

const FX = { common: [0, []], uncommon: [8, ['#5dbbff', '#7ed6ff']], rare: [16, ['#f783b6', '#ff9ec6', '#ffd27f']], legendary: [40, ['#ffd27f', '#7a5af8', '#f783b6', '#5dbbff', '#ff9ec6']] };
function sparkle(tier) {
  if (reduce.matches) return;
  const [n, colors] = FX[tier];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.className = 'fx';
    s.style.cssText = `--x:${rand(-150, 150)}px;--y:${rand(-260, -30)}px;--rot:${rand(-540, 540)}deg;background:${colors[i % colors.length]}`;
    el.fx.append(s);
    setTimeout(() => s.remove(), 1500);
  }
}

function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }

async function draw() {
  if (state === 'DISPENSING') return;           // block overlapping draws
  state = 'DISPENSING';
  el.draw.disabled = true;
  el.result.hidden = true;
  el.shareMsg.textContent = '';
  el.live.textContent = '';
  el.cap.hidden = true;
  el.cap.className = 'cap';
  el.machine.scrollIntoView({ block: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });

  const capsule = pickCapsule();                 // result chosen instantly, revealed later
  current = capsule;
  el.cap.dataset.r = el.burst.dataset.r = capsule.rarity;
  el.cap.style.setProperty('--c', ({ common: '#cff0ff', uncommon: '#5dbbff', rare: '#f783b6', legendary: '#ffd27f' })[capsule.rarity]);
  el.burst.style.setProperty('--r', ({ common: '#7ed6ff', uncommon: '#5dbbff', rare: '#f783b6', legendary: '#ffd27f' })[capsule.rarity]);

  sound.activate();
  el.machine.classList.add('shake');
  await sleep(950);
  el.machine.classList.remove('shake');

  sound.dispense();
  el.cap.hidden = false;
  el.cap.classList.add('drop');
  await sleep(850);
  el.cap.classList.replace('drop', 'landed');

  sound.open();
  el.cap.classList.add('open');
  restart(el.burst, 'go');
  await sleep(600);

  sound.reveal(capsule.rarity);
  sparkle(capsule.rarity);
  show(capsule);
  state = 'REVEALED';
  el.draw.textContent = 'DRAW AGAIN!';
  el.draw.disabled = false;
}

function show(c) {
  const label = RARITY_LABEL[c.rarity];
  el.result.dataset.r = c.rarity;
  el.illus.innerHTML = `<div class="cap open" data-r="${c.rarity}" style="--c:${el.cap.style.getPropertyValue('--c')}"><i class="top"></i><i class="bot"></i></div>`;
  el.badge.textContent = label;
  el.cat.textContent = c.category;
  el.cname.textContent = c.name;
  el.cmsg.textContent = c.message;
  el.result.hidden = false;
  restart(el.result, 'pop');
  el.live.textContent = `You got a ${label} capsule: ${c.name}. ${c.message}`;
  el.result.scrollIntoView({ block: 'nearest', behavior: reduce.matches ? 'auto' : 'smooth' });
}

function legacyCopy(text) {
  const t = document.createElement('textarea');
  t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0';
  document.body.append(t); t.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* unsupported */ }
  t.remove();
  return ok;
}

async function share() {
  if (!current) return;
  const text = `I got "${current.name}" (${RARITY_LABEL[current.rarity]}) from What's Your Lucky Capsule! ${current.message}`;
  const note = m => { el.shareMsg.textContent = m; };
  if (navigator.share) {
    try { await navigator.share({ title: "What's Your Lucky Capsule?", text }); note('Shared!'); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); note('Copied to clipboard!'); return; } catch { /* try legacy */ }
  note(legacyCopy(text) ? 'Copied to clipboard!' : "Sharing isn't available on this browser.");
}

el.draw.addEventListener('click', draw);
el.share.addEventListener('click', share);
