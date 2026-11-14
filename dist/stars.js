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
  const trail = [];
  const trailLife = 850;
  const random = (min, max) => min + Math.random() * (max - min);

  function draw(now) {
    const reduced = motion.matches;
    const elapsed = previous ? Math.min((now - previous) / 1000, .034) : 1 / 60;
    previous = now;
    const following = 1 - Math.exp(-elapsed * 18);
    const reach = Math.min(360, width * .74);
    const waves = reduced ? [] : trail
      .map(point => ({ ...point, age: (now - point.time) / trailLife }))
      .filter(point => point.age < 1);
    const head = waves.at(-1);
    const palette = colors[desktop.dataset.theme] ?? colors.blue;
    let moving = waves.length > 0;
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    if (head) {
      const radius = reach * .68;
      const halo = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
      halo.addColorStop(0, palette[1]);
      halo.addColorStop(1, palette[1] + '00');
      context.fillStyle = halo;
      context.globalAlpha = .15 * (1 - head.age);
      context.fillRect(head.x - radius, head.y - radius, radius * 2, radius * 2);
    }

    for (const star of stars) {
      let dx = 0;
      let dy = 0;
      let distance = 0;
      let strength = 0;
      let age = 0;
      for (const wave of waves) {
        const waveX = star.x - wave.x;
        const waveY = star.y - wave.y;
        const distanceSquared = waveX * waveX + waveY * waveY;
        if (distanceSquared >= reach * reach) continue;
        const waveDistance = Math.sqrt(distanceSquared);
        const influence = (1 - waveDistance / reach) ** 1.45 * (1 - wave.age) ** 2;
        if (influence <= strength) continue;
        dx = waveX;
        dy = waveY;
        distance = waveDistance;
        strength = influence;
        age = wave.age;
      }
      const angle = strength * 2.4;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle) * star.orbit;
      const ripple = strength * (31 + 52 * Math.sin(distance * .056 - age * 14));
      const scale = Math.max(.22, 1 + ripple / Math.max(distance, 24));
      const targetX = (dx * cosine - dy * sine) * scale - dx;
      const targetY = (dx * sine + dy * cosine) * scale - dy;

      star.offsetX = reduced ? 0 : star.offsetX + (targetX - star.offsetX) * following;
      star.offsetY = reduced ? 0 : star.offsetY + (targetY - star.offsetY) * following;
      if (Math.abs(star.offsetX) + Math.abs(star.offsetY) > .1) moving = true;

      const x = star.x + star.offsetX;
      const y = star.y + star.offsetY;
      const length = star.length + strength * 15;
      const direction = star.angle * (1 - strength) + (Math.atan2(dy, dx) + angle + Math.PI / 2) * strength;
      const endX = Math.cos(direction) * length;
      const endY = Math.sin(direction) * length;
      context.globalAlpha = Math.min(.99, star.opacity + strength * .86);
      context.strokeStyle = palette[star.color];
      context.lineWidth = star.weight + strength * .9;
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
    const spacing = Math.max(width < 740 ? 15 : 22, Math.sqrt(width * height / 3200));
    stars = [];
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        stars.push({
          x: x + random(-spacing * .45, spacing * .45),
          y: y + random(-spacing * .45, spacing * .45),
          length: random(.75, 3.1),
          weight: random(.9, 1.85),
          opacity: random(.32, .72),
          color: Math.floor(random(0, 4)),
          angle: random(0, Math.PI),
          orbit: y > height * .48 ? 1 : -1,
          offsetX: 0,
          offsetY: 0
        });
      }
    }
    trail.length = 0;
    refresh();
  }

  function trackPointer(clientX, clientY) {
    if (motion.matches) return;
    const bounds = desktop.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    const time = performance.now();
    const last = trail.at(-1);
    if (last && Math.hypot(last.x - x, last.y - y) < 32 && time - last.time < 60) {
      Object.assign(last, { x, y, time });
    } else {
      trail.push({ x, y, time });
      if (trail.length > 7) trail.shift();
    }
    if (!frame) refresh();
  }

  desktop.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') trackPointer(event.clientX, event.clientY);
  }, { passive: true });
  function trackTouch(event) {
    const touch = event.touches[0];
    if (touch) trackPointer(touch.clientX, touch.clientY);
  }
  desktop.addEventListener('touchstart', trackTouch, { passive: true });
  desktop.addEventListener('touchmove', trackTouch, { passive: true });
  new ResizeObserver(resize).observe(desktop);
  new MutationObserver(refresh).observe(desktop, { attributes: true, attributeFilter: ['data-theme'] });
  motion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
}
