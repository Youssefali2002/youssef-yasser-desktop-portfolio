const canvas = document.querySelector('.stars');
const desktop = canvas.parentElement;
const context = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const colors = {
  blue: ['#d7ecff', '#83cfff', '#afa7ff'],
  rose: ['#ffdae8', '#ffa5be', '#ffcf9d'],
  emerald: ['#c4ffdd', '#7cebc1', '#ffe49a'],
  violet: ['#f0dcff', '#bc9dff', '#a6c4ff']
};

if (context) {
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastSpark = 0;
  let previousTheme = desktop.dataset.theme;
  let stars = [];
  let sparks = [];
  const random = (min, max) => min + Math.random() * (max - min);

  function drawStar(x, y, size, color, alpha, glow) {
    context.globalAlpha = alpha;
    context.fillStyle = color;
    if (glow) {
      context.shadowBlur = size * 4;
      context.shadowColor = color;
      context.beginPath();
      context.moveTo(x, y - size * 2);
      context.lineTo(x + size * .42, y - size * .42);
      context.lineTo(x + size * 1.45, y);
      context.lineTo(x + size * .42, y + size * .42);
      context.lineTo(x, y + size * 2);
      context.lineTo(x - size * .42, y + size * .42);
      context.lineTo(x - size * 1.45, y);
      context.lineTo(x - size * .42, y - size * .42);
      context.fill();
      context.shadowBlur = 0;
    } else {
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
  }

  function draw(now) {
    frame = 0;
    const theme = desktop.dataset.theme;
    const palette = colors[theme];
    const reduced = motion.matches;
    if (theme !== previousTheme) {
      previousTheme = theme;
      sparks = [];
    }
    context.clearRect(0, 0, width, height);
    stars.forEach(star => {
      const alpha = reduced ? .65 : .56 + .34 * Math.sin(now / star.speed + star.phase);
      drawStar(star.x, star.y, star.size, palette[star.color], alpha, star.glow);
    });
    if (!reduced) {
      sparks = sparks.filter(spark => now - spark.start < spark.life);
      for (const spark of sparks) {
        const age = (now - spark.start) / spark.life;
        drawStar(spark.x + spark.dx * age, spark.y + spark.dy * age, spark.size * (1 - age * .55), palette[spark.color], (1 - age) * .94, true);
      }
    }
    context.globalAlpha = 1;
    if (!reduced && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function refresh() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) draw(performance.now());
  }

  function resize() {
    const bounds = desktop.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width > 740 ? 140 : 50;
    stars = Array.from({ length: count }, (_, i) => {
      const glow = i % 5 === 0;
      const edge = width > 740 && i < 45;
      const x = edge && i % 2 ? random(width * .87, width - 6) : edge ? random(6, width * .13) : random(6, width - 6);
      return {
        x, y: random(4, height - 4),
        size: glow ? random(2.2, 4.8) : random(.65, 1.7),
        color: i % 3, glow, speed: random(550, 1400), phase: random(0, Math.PI * 2)
      };
    });
    refresh();
  }

  function emit(event, count) {
    if (motion.matches || event.target.closest('.window, .dock')) return;
    const now = performance.now();
    if (count < 10 && now - lastSpark < 38) return;
    lastSpark = now;
    const bounds = desktop.getBoundingClientRect();
    for (let i = 0; i < count; i += 1) {
      sparks.push({
        x: event.clientX - bounds.left + random(-7, 7),
        y: event.clientY - bounds.top + random(-7, 7),
        dx: random(-40, 40), dy: random(-45, 22), size: random(1.4, 4.2),
        start: now, life: random(400, 780), color: i % 3
      });
    }
    if (sparks.length > 100) sparks.splice(0, sparks.length - 100);
  }

  desktop.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') emit(event, 4);
  }, { passive: true });
  desktop.addEventListener('pointerdown', event => emit(event, 12), { passive: true });
  new ResizeObserver(resize).observe(desktop);
  new MutationObserver(refresh).observe(desktop, { attributes: true, attributeFilter: ['data-theme'] });
  motion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
}
