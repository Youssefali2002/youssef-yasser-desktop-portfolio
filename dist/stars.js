const canvas = document.querySelector('.stars');
const desktop = canvas.parentElement;
const context = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const colors = {
  blue: ['#c7dcff', '#80bfff', '#b79aff', '#f2d194'],
  rose: ['#ffc6dc', '#f08dbb', '#c9a0ff', '#ffd494'],
  emerald: ['#baf9de', '#6adcbc', '#9ad9ec', '#ffe09a'],
  violet: ['#ead7ff', '#a79aff', '#89baff', '#ffc4df']
};

if (context) {
  let width = 0;
  let height = 0;
  let stars = [];
  let frame = 0;
  let previous = 0;
  const pointer = { x: 0, y: 0, time: -Infinity };
  const random = (min, max) => min + Math.random() * (max - min);

  function draw(now) {
    const reduced = motion.matches;
    const elapsed = previous ? Math.min((now - previous) / 1000, .034) : 1 / 60;
    previous = now;
    const following = 1 - Math.exp(-elapsed * 7);
    const reach = Math.min(310, width * .62);
    const intensity = reduced ? 0 : Math.max(0, 1 - (now - pointer.time) / 1150);
    const palette = colors[desktop.dataset.theme] ?? colors.blue;
    let moving = intensity > 0;
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';

    for (const star of stars) {
      const dx = star.x - pointer.x;
      const dy = star.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const strength = Math.max(0, 1 - distance / reach) ** 1.7 * intensity;
      const angle = strength * 1.7;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle) * star.orbit;
      const ripple = strength * 27 * Math.sin(distance * .065 - now * .006);
      const scale = 1 + ripple / Math.max(distance, 18);
      const targetX = (dx * cosine - dy * sine) * scale - dx;
      const targetY = (dx * sine + dy * cosine) * scale - dy;

      star.offsetX = reduced ? 0 : star.offsetX + (targetX - star.offsetX) * following;
      star.offsetY = reduced ? 0 : star.offsetY + (targetY - star.offsetY) * following;
      if (Math.abs(star.offsetX) + Math.abs(star.offsetY) > .1) moving = true;

      const x = star.x + star.offsetX;
      const y = star.y + star.offsetY;
      const length = star.length + strength * 8;
      const direction = star.angle + angle + strength * Math.atan2(dy, dx);
      const endX = Math.cos(direction) * length;
      const endY = Math.sin(direction) * length;
      context.globalAlpha = Math.min(.92, star.opacity + strength * .58);
      context.strokeStyle = palette[star.color];
      context.lineWidth = star.weight;
      context.beginPath();
      context.moveTo(x - endX * .5, y - endY * .5);
      context.lineTo(x + endX * .5, y + endY * .5);
      context.stroke();
    }

    context.globalAlpha = 1;
    frame = moving && !reduced && !document.hidden ? requestAnimationFrame(draw) : 0;
  }

  function refresh() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!document.hidden) draw(performance.now());
  }

  function resize() {
    width = desktop.clientWidth;
    height = desktop.clientHeight;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * pixelRatio);
    canvas.height = Math.ceil(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const spacing = width < 740 ? 21 : 29;
    stars = [];
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        stars.push({
          x: x + random(-spacing * .45, spacing * .45),
          y: y + random(-spacing * .45, spacing * .45),
          length: random(.45, 2.4),
          weight: random(.8, 1.7),
          opacity: random(.23, .6),
          color: Math.floor(random(0, 4)),
          angle: random(0, Math.PI),
          orbit: y > height * .48 ? 1 : -1,
          offsetX: 0,
          offsetY: 0
        });
      }
    }
    pointer.time = -Infinity;
    refresh();
  }

  function trackPointer(event) {
    if (motion.matches) return;
    const bounds = desktop.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.time = performance.now();
    if (!frame) refresh();
  }

  desktop.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') trackPointer(event);
  }, { passive: true });
  desktop.addEventListener('pointerdown', trackPointer, { passive: true });
  new ResizeObserver(resize).observe(desktop);
  new MutationObserver(refresh).observe(desktop, { attributes: true, attributeFilter: ['data-theme'] });
  motion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
}
