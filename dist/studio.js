const template = document.querySelector('#studio-template');
const replay = document.querySelector('.studio-replay');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 620px) and (orientation: portrait)');
const roomRatio = 1672 / 941;
const visitKey = 'portfolio-studio-seen';
let intro;
let cameraMove;

function seenIntro() {
  try { return localStorage.getItem(visitKey) === '1'; } catch { return false; }
}

function rememberIntro() {
  try { localStorage.setItem(visitKey, '1'); } catch {}
}

function frameRoom(dialog) {
  const { clientWidth: width, clientHeight: height } = dialog;
  const sceneWidth = compact.matches ? width * 1.12 : Math.max(width, height * roomRatio);
  const sceneHeight = sceneWidth / roomRatio;
  const room = dialog.querySelector('.studio-room');
  room.style.width = sceneWidth + 'px';
  room.style.left = (width - sceneWidth) / 2 + 'px';
  room.style.top = (height - sceneHeight) * (compact.matches ? .4 : .5) + 'px';
}

function screenTarget(dialog) {
  const box = dialog.querySelector('.studio-screen').getBoundingClientRect();
  const scale = Math.max(dialog.clientWidth / box.width, dialog.clientHeight / box.height) * 1.04;
  const x = dialog.clientWidth / 2 - (box.left + box.width / 2) * scale;
  const y = dialog.clientHeight / 2 - (box.top + box.height / 2) * scale;
  return 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
}

function revealWorkspace() {
  const parts = [
    ['.menubar', 0, 10],
    ['.window', 65, 24],
    ['.desktop-files', 145, 18],
    ['.dock', 215, 13]
  ];
  for (const [selector, delay, distance] of parts) {
    document.querySelector(selector)?.animate([
      { opacity: 0, translate: '0 -' + distance + 'px' },
      { opacity: 1, translate: '0 0' }
    ], { duration: 520, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  }
  document.querySelector('.selected-entry')?.animate([
    { boxShadow: '0 0 0 0 #75a2fe00' },
    { boxShadow: '0 0 0 4px #75a2fe65, 0 0 26px #6385ee65', offset: .27 },
    { boxShadow: '0 0 0 9px #75a2fe00' }
  ], { duration: 1200, delay: 490, easing: 'ease-out' });
}

function removeIntro(dialog) {
  if (intro !== dialog) return;
  cameraMove?.cancel();
  dialog.close();
  dialog.remove();
  intro = undefined;
  document.documentElement.classList.remove('studio-active');
  document.querySelector('#pane')?.focus({ preventScroll: true });
}

function finish(dialog, animate = false) {
  if (intro !== dialog) return;
  rememberIntro();
  if (!animate || motion.matches) return removeIntro(dialog);
  revealWorkspace();
  dialog.classList.add('is-exiting');
  setTimeout(() => removeIntro(dialog), 330);
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function playIntro() {
  if (intro || motion.matches || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  const dialog = template.content.firstElementChild.cloneNode(true);
  const camera = dialog.querySelector('.studio-camera');
  intro = dialog;
  document.body.append(dialog);
  document.documentElement.classList.add('studio-active');
  dialog.showModal();
  frameRoom(dialog);
  dialog.querySelector('.studio-skip').addEventListener('click', () => finish(dialog));
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    finish(dialog);
  });

  let assetsReady = false;
  await Promise.race([
    Promise.all(Array.from(dialog.querySelectorAll('img'), image => image.decode()))
      .then(() => { assetsReady = true; })
      .catch(() => {}),
    wait(2000)
  ]);
  if (intro !== dialog) return;
  if (!assetsReady) return finish(dialog);
  await wait(850);
  if (intro !== dialog) return;
  dialog.classList.add('is-typing');
  await wait(170);
  if (intro !== dialog) return;
  dialog.classList.add('is-launching');
  await wait(300);
  if (intro !== dialog) return;
  dialog.classList.add('is-zooming');
  cameraMove = camera.animate([
    { transform: 'translate(0,0) scale(1)' },
    { transform: screenTarget(dialog) }
  ], { duration: 1225, easing: 'cubic-bezier(.65,.03,.2,1)', fill: 'forwards' });
  await wait(1100);
  finish(dialog, true);
}

replay.addEventListener('click', playIntro);
window.addEventListener('hashchange', () => { if (intro) finish(intro); });
window.addEventListener('resize', () => {
  if (!intro) return;
  if (intro.classList.contains('is-zooming')) finish(intro);
  else frameRoom(intro);
});
motion.addEventListener('change', () => { if (motion.matches && intro) finish(intro); });
if (!location.hash && !seenIntro() && !motion.matches) playIntro();
