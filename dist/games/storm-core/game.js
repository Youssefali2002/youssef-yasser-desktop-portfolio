const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('.overlay');
const $ = id => document.getElementById(id);
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const W = 640;
const H = 440;
const core = { x: 320, y: 396 };
const sky = Array.from({ length: 62 }, (_, i) => [i * 137.508 % W, i * 79.31 % 335, .2 + (i % 5) / 9]);
const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
let state = 'intro';
let frame = 0;
let previous = 0;
let wave, score, health, remaining, spawn, cooldown, combo, comboTime, enemies, vortices, sparks;
let aim = null;
let best = 0;
try { best = Number(localStorage.getItem('storm-core-best')) || 0; } catch {}

function syncHud() {
  $('wave').textContent = wave + ' / 5';
  $('score').textContent = score.toLocaleString('en');
  $('health').value = health;
  $('charge').textContent = cooldown > 0 ? 'Recharging' : 'Vortex ready';
  $('combo').textContent = combo > 1 && comboTime > 0 ? 'COMBO ×' + combo : '';
  $('best').textContent = best.toLocaleString('en');
}

function begin() {
  state = 'playing';
  wave = 1;
  score = 0;
  health = 100;
  remaining = 8;
  spawn = .55;
  cooldown = 0;
  combo = 0;
  comboTime = 0;
  enemies = [];
  vortices = [];
  sparks = [];
  aim = null;
  resume();
}

function resume() {
  overlay.hidden = true;
  state = 'playing';
  $('pause').disabled = false;
  $('pause').setAttribute('aria-label', 'Pause game');
  previous = performance.now();
  syncHud();
  canvas.focus({ preventScroll: true });
  frame = requestAnimationFrame(tick);
}

function showPanel(mode, title, summary, action) {
  cancelAnimationFrame(frame);
  $('mode').textContent = mode;
  $('message').textContent = title;
  $('summary').textContent = summary;
  $('start').textContent = action;
  overlay.hidden = false;
  $('start').focus({ preventScroll: true });
}

function pause() {
  if (state !== 'playing') return;
  state = 'paused';
  $('pause').setAttribute('aria-label', 'Resume game');
  showPanel('STORM CORE', 'Game paused', 'Your run is ready when you are.', 'Resume game');
}

function finish(win) {
  state = 'finished';
  best = Math.max(best, score);
  try { localStorage.setItem('storm-core-best', String(best)); } catch {}
  $('pause').disabled = true;
  syncHud();
  showPanel('FINAL SCORE · ' + score.toLocaleString('en'), win ? 'Core secured' : 'Core lost',
    win ? 'You held off all five waves.' : 'Try placing vortexes where falling streams cross.', 'Play again');
}

function deploy(x, y) {
  if (state !== 'playing' || cooldown > 0) return;
  vortices.push({ x, y: Math.min(y, 367), age: 0 });
  cooldown = .48;
  syncHud();
}

function burst(enemy, hit) {
  if (motion.matches) return;
  for (let i = 0; i < (hit ? 15 : 9); i += 1) {
    const angle = i * 2.4;
    const speed = 30 + Math.random() * 74;
    sparks.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      age: 0, life: .35 + Math.random() * .28, color: hit ? '#91fff0' : '#ffc895' });
  }
}

function update(dt) {
  const wasReady = cooldown <= 0;
  cooldown = Math.max(0, cooldown - dt);
  comboTime = Math.max(0, comboTime - dt);
  spawn -= dt;
  if (remaining && spawn <= 0) {
    const x = 36 + Math.random() * (W - 72);
    const speed = 77 + wave * 13 + Math.random() * 35;
    enemies.push({ x, y: -10, vx: (core.x - x) * speed / (core.y + 10), vy: speed });
    remaining -= 1;
    spawn = Math.max(.36, .98 - wave * .11) * (.8 + Math.random() * .4);
  }
  for (const vortex of vortices) vortex.age += dt;
  vortices = vortices.filter(vortex => vortex.age < 1.15);
  for (const spark of sparks) {
    spark.age += dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
  }
  sparks = sparks.filter(spark => spark.age < spark.life);
  let changed = wasReady !== (cooldown <= 0) || combo > 1 && comboTime === 0;
  if (!comboTime) combo = 0;
  enemies = enemies.filter(enemy => {
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    const hit = vortices.some(vortex => Math.hypot(enemy.x - vortex.x, enemy.y - vortex.y) < radius(vortex));
    if (hit) {
      combo += 1;
      comboTime = 1.15;
      score += 100 * Math.min(combo, 6);
    } else if (enemy.y >= core.y) {
      health = Math.max(0, health - 13);
    } else return true;
    burst(enemy, hit);
    changed = true;
    return false;
  });
  if (health <= 0) return finish(false);
  if (!remaining && !enemies.length) {
    if (wave === 5) return finish(true);
    wave += 1;
    health = Math.min(100, health + 12);
    remaining = 6 + wave * 2;
    spawn = 1.3;
    changed = true;
  }
  if (changed) syncHud();
}

function radius(vortex) {
  return 9 + Math.min(1, vortex.age / .23) * 57;
}

function circle(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function paint() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, H);
  skyGradient.addColorStop(0, '#070e26');
  skyGradient.addColorStop(.8, '#1e3563');
  skyGradient.addColorStop(1, '#10253d');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, opacity] of sky) {
    ctx.globalAlpha = opacity;
    circle(x, y, 1.2, '#b9d9ff');
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#101e3b';
  ctx.beginPath();
  ctx.moveTo(0, 336);
  for (const [x, y] of [[75,278],[145,325],[245,254],[325,320],[420,268],[520,325],[590,288],[640,313],[640,440],[0,440]]) ctx.lineTo(x,y);
  ctx.fill();
  ctx.fillStyle = '#09192e';
  ctx.fillRect(0, 408, W, 32);
  const glow = ctx.createRadialGradient(core.x, core.y, 2, core.x, core.y, 42);
  glow.addColorStop(0, '#83fff4b8');
  glow.addColorStop(1, '#60e7ff00');
  circle(core.x, core.y, 42, glow);
  ctx.fillStyle = '#9bfff2';
  ctx.beginPath();
  ctx.ellipse(core.x, core.y, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#60d6db';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(core.x, core.y + 3, 30, 13, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (const enemy of enemies ?? []) {
    const tail = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x - enemy.vx * .23, enemy.y - enemy.vy * .23);
    tail.addColorStop(0, '#ffdaa4');
    tail.addColorStop(1, '#ff7a9a00');
    ctx.strokeStyle = tail;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y);
    ctx.lineTo(enemy.x - enemy.vx * .23, enemy.y - enemy.vy * .23);
    ctx.stroke();
    circle(enemy.x, enemy.y, 4, '#ffe4b8');
  }

  for (const vortex of vortices ?? []) {
    ctx.globalAlpha = Math.min(1, (1.15 - vortex.age) * 1.7);
    ctx.strokeStyle = '#9bfff1';
    ctx.lineWidth = 2;
    for (let arm = 0; arm < 3; arm += 1) {
      ctx.beginPath();
      for (let i = 0; i <= 24; i += 1) {
        const phase = i / 24;
        const a = phase * 5 + arm * Math.PI * 2 / 3 + (motion.matches ? 0 : vortex.age * 8);
        const r = radius(vortex) * phase;
        ctx.lineTo(vortex.x + Math.cos(a) * r, vortex.y + Math.sin(a) * r);
      }
      ctx.stroke();
    }
  }
  for (const s of sparks ?? []) {
    ctx.globalAlpha = 1 - s.age / s.life;
    circle(s.x, s.y, 2, s.color);
  }
  ctx.globalAlpha = 1;
  if (aim && state === 'playing') {
    ctx.strokeStyle = '#d2faff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(aim.x - 9, aim.y);
    ctx.lineTo(aim.x + 9, aim.y);
    ctx.moveTo(aim.x, aim.y - 9);
    ctx.lineTo(aim.x, aim.y + 9);
    ctx.stroke();
  }
}

function tick(now) {
  const dt = Math.min(.032, (now - previous) / 1000);
  previous = now;
  update(dt);
  paint();
  if (state === 'playing') frame = requestAnimationFrame(tick);
}

new ResizeObserver(() => {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
  canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  paint();
}).observe(canvas);

canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  const bounds = canvas.getBoundingClientRect();
  deploy((event.clientX - bounds.left) * W / bounds.width, (event.clientY - bounds.top) * H / bounds.height);
});
canvas.addEventListener('keydown', event => {
  if (!Object.hasOwn(arrows, event.key) && event.code !== 'Space') return;
  event.preventDefault();
  aim ??= { x: W / 2, y: H / 2 };
  if (event.code === 'Space') return deploy(aim.x, aim.y);
  const [x, y] = arrows[event.key];
  aim.x = Math.max(15, Math.min(W - 15, aim.x + x * 21));
  aim.y = Math.max(15, Math.min(367, aim.y + y * 21));
});
$('start').addEventListener('click', () => state === 'paused' ? resume() : begin());
$('pause').addEventListener('click', () => state === 'paused' ? resume() : pause());
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
$('best').textContent = best.toLocaleString('en');
