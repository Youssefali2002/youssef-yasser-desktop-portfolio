import './stars.js';

const github = 'https://github.com/Youssefali2002';
const pages = 'https://youssefali2002.github.io';
const classic = pages + '/youssef-yasser-portfolio';
const sections = { projects: 'Projects', skills: 'Tech Stack', about: 'About Me', contact: 'Contact' };

const vercelDemos = {
  'Bondi-Bootstrap5': 'bondi-bootstrap5',
  'github-repo-finder': 'github-repo-finder-six',
  'Hangman-Game': 'hangman-game-one-neon',
  'Kasper-Creative-Design': 'kasper-creative-design',
  NovaDesigns: 'novadesigns-ochre',
  'vanilla-wordle-clone': 'vanilla-wordle-clone',
  'vibe-store': 'vibe-store-khaki',
  VisionOne: 'visionone-indol',
  YoussefUI: 'youssefui'
};

const publishedProjects = [
  ['retail', 'Product & Inventory Management', 'Youssef-CRUDS-App', 'Bilingual dashboard for product records, stock tracking, charts, search filters, and CSV import and export.', ['JavaScript', 'Charts', 'CSV'], 'retail-preview.webp'],
  ['vanilla-wordle-clone', 'Wordle-inspired Game', 'vanilla-wordle-clone', 'Keyboard navigation, guess validation, hints, and game state in vanilla JavaScript.', ['JavaScript', 'DOM', 'Game state']],
  ['vibe-store', 'Vibe Store', 'vibe-store', 'Bilingual storefront with a JavaScript shopping cart.', ['JavaScript', 'E-commerce']],
  ['youssefui', 'YoussefUI', 'YoussefUI', 'Responsive admin dashboard with charts and management screens.', ['Responsive UI', 'CSS']],
  ['novadesigns', 'NovaDesigns', 'NovaDesigns', 'Creative agency site with a mega menu and CSS transitions.', ['HTML', 'CSS']],
  ['github-repo-finder', 'GitHub Repo Finder', 'github-repo-finder', 'Search public repositories with the GitHub API.', ['JavaScript', 'GitHub API']],
  ['hangman-game', 'Hangman', 'Hangman-Game', 'JavaScript word game with categories, keyboard input, and audio.', ['JavaScript', 'Game state']],
  ['visionone', 'VisionOne', 'VisionOne', 'Responsive landing page with a product-focused layout.', ['HTML', 'CSS']],
  ['bondi-bootstrap5', 'Bondi Bootstrap', 'Bondi-Bootstrap5', 'Responsive landing page built with Bootstrap 5.', ['Bootstrap 5', 'CSS']],
  ['kasper-creative-design', 'Kasper Creative Design', 'Kasper-Creative-Design', 'Creative portfolio template built with HTML and CSS.', ['HTML', 'CSS']]
].map(([id, name, repo, summary, stack, image]) => ({
  id, name, summary, stack, category: 'Web project',
  images: [[image ?? 'project-previews/' + id + '.webp', name + ' preview']],
  links: [
    ['Live demo', vercelDemos[repo] ? 'https://' + vercelDemos[repo] + '.vercel.app/' : pages + '/' + repo + '/'],
    ['Source code', github + '/' + repo]
  ]
}));

const featured = [
  {
    id: 'look', name: 'Look Operations Platform', category: 'Full-stack web & PWA', theme: 'rose',
    summary: 'An internal platform for trip dispatch, fleet coordination, attendance, and operational reporting.',
    points: ['Implemented server-side permissions for owners, managers, drivers, and field representatives.', 'Built live trip updates and vehicle booking conflict checks.', 'Designed installable mobile workspaces for drivers and field representatives.'],
    stack: ['React', 'NestJS', 'Prisma', 'SQLite', 'Socket.IO', 'Playwright'],
    images: [['look/owner.webp', 'Owner dashboard with sample data'], ['look/dispatch.webp', 'Operations dispatch'], ['look/driver.webp', 'Driver workspace'], ['look/field.webp', 'Field representative'], ['look/reports.webp', 'Personal reports'], ['look/schedule.webp', 'Fleet schedule']],
    links: [['Case study', classic + '/#look-case-study']]
  },
  {
    id: 'zad-al-qulub', name: 'Zad Al-Qulub', category: 'Independent mobile app', thumb: 'mobile', theme: 'emerald',
    summary: 'A mobile app that brings together the complete Quran, daily adhkar, prayer times, and adhan alerts with offline audio.',
    points: ['Readers can save their place and bookmark verses.', 'The home screen shows a countdown to the next prayer.'],
    stack: ['Quran reader', 'Prayer schedules', 'Offline audio'],
    images: [['zad-al-qulub/dashboard.webp', 'Home and next-prayer countdown'], ['zad-al-qulub/quran-reader.webp', 'Quran reader and saved reading position'], ['zad-al-qulub/prayer-times.webp', 'Prayer times and adhan alerts']],
    links: [['Release repository', github + '/zad-al-qulub-updates']]
  },
  {
    id: 'whatsapp-automation', name: 'WhatsApp Order Automation', category: 'Desktop automation', thumb: 'desktop-shot', theme: 'violet',
    summary: 'A desktop workflow that prepares WhatsApp requests, waits for approval, and automates fulfillment steps.',
    stack: ['WhatsApp intake', 'Approval workflow', 'Desktop fulfillment'],
    images: [['execution.webp', 'Desktop execution dialog'], ['whatsapp.webp', 'WhatsApp intake with contact details covered']],
    video: 'desktop-demo.mp4',
    links: [['Project overview', classic + '/#desktop-automation']]
  }
];
const allProjects = [...featured, ...publishedProjects];
const projectMap = new Map(allProjects.map(project => [project.id, project]));
const skillGroups = [
  ['Web & mobile', ['React', 'Next.js', 'React Native', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'PWA']],
  ['Backend & APIs', ['Node.js', 'NestJS', 'REST APIs', 'JWT', 'RBAC', 'Socket.IO']],
  ['Data & reporting', ['MySQL', 'SQLite', 'Prisma', 'SQL', 'Excel', 'CSV']],
  ['Testing & delivery', ['Playwright', 'Git', 'GitHub', 'npm', 'Vite', 'Cloudflare Tunnel']]
];

const finder = document.querySelector('#finder');
const desktop = document.querySelector('.desktop');
const titlebar = document.querySelector('.titlebar');
const pane = document.querySelector('#pane');
const back = document.querySelector('#back');
const search = document.querySelector('#search');
const query = document.querySelector('#query');
const searchResults = document.querySelector('#search-results');
const imageViewer = document.querySelector('#image-viewer');
const maximize = document.querySelector('[data-action="maximize"]');

const tags = items => '<div class="chips">' + items.map(item => '<span>' + item + '</span>').join('') + '</div>';
const links = items => '<div class="linkbar">' + items.map(([label, href]) => '<a href="' + href + '">' + label + ' ↗</a>').join('') + '</div>';
const folder = '<span class="folder-icon small" aria-hidden="true"></span>';
const fileRow = project => '<a class="file-row" href="#' + project.id + '">' + folder + project.name + '<span aria-hidden="true">›</span></a>';

function projectsPage() {
  return '<div class="pane-hero"><h1>Projects</h1><p>Explore software I built for the web, mobile, and desktop.</p></div>' +
    '<div class="section-heading"><h2>Featured projects</h2></div><div class="project-grid">' +
    featured.map(project => '<a class="project" href="#' + project.id + '"><div class="thumb ' + (project.thumb ?? '') + '"><img alt="" src="./media/' + project.images[0][0] + '"></div>' +
      '<div class="project-copy"><span class="category">' + project.category + '</span><div class="project-title">' + folder + '<h3>' + project.name + '</h3></div></div></a>').join('') +
    '</div><div class="section-heading"><h2>More projects</h2><span>' + publishedProjects.length + ' items</span></div><div class="project-list">' +
    publishedProjects.map(fileRow).join('') + '</div>';
}

function projectPage(project) {
  return '<div class="pane-hero"><p class="detail-label">' + project.category + '</p><h1>' + project.name + '</h1></div>' +
    '<div class="details-text"><p>' + project.summary + '</p>' +
    (project.points ? '<ul>' + project.points.map(point => '<li>' + point + '</li>').join('') + '</ul>' : '') + '</div>' +
    tags(project.stack) + links(project.links) +
    (project.video ? '<video class="demo-video" controls playsinline preload="none" aria-label="Desktop automation demo" poster="./media/execution.webp" src="./media/' + project.video + '"></video>' : '') +
    '<div class="detail-media">' + project.images.map(([src, label]) =>
      '<button type="button" data-image="' + src + '" data-caption="' + label + '"><img loading="lazy" alt="" src="./media/' + src + '"><span>' + label + '</span></button>').join('') + '</div>';
}

const pagesBySection = {
  projects: projectsPage,
  skills: () => '<div class="pane-hero"><h1>Tech Stack</h1><p>Tools I use to build interfaces, APIs, data workflows, and automated tests.</p></div><div class="info-grid">' +
    skillGroups.map(([name, items]) => '<section class="info"><h2>' + name + '</h2>' + tags(items) + '</section>').join('') + '</div>',
  about: () => '<div class="pane-hero"><h1>Youssef Yasser Ismail</h1><p>Full-Stack Software Engineer · Cairo, Egypt</p></div>' +
    '<p class="details-text">I develop operations software, mobile applications, and desktop workflows. My work includes fleet dispatch, an independent Quran app, and an order approval and fulfillment workflow.</p>' +
    '<div class="info-grid"><section class="info"><h2>Training</h2><p>500+ hours of self-directed study in HTML, CSS, and JavaScript through Elzero Web School.</p></section>' +
    '<section class="info"><h2>Languages</h2><p>Arabic · Native<br>English · Technical working proficiency</p></section></div>' +
    links([['Read résumé in Arabic', classic + '/ar/resume/']]),
  contact: () => '<div class="pane-hero"><h1>Contact</h1><p>Get in touch about software projects and engineering roles.</p></div>' +
    '<div class="info-grid"><section class="info"><h2>Email</h2><p><a href="mailto:youseef.ali.2002@gmail.com">youseef.ali.2002@gmail.com</a></p></section>' +
    '<section class="info"><h2>Phone</h2><p><a href="tel:+201203785127">+20 120 378 5127</a></p></section></div>' +
    links([['GitHub', github], ['LinkedIn', 'https://www.linkedin.com/in/youssef-yasser-02b447343/']])
};

function render(focus = false) {
  const route = location.hash.slice(1);
  const project = projectMap.get(route);
  const section = Object.hasOwn(sections, route) ? route : 'projects';
  const name = project?.name ?? sections[section];
  finder.hidden = false;
  desktop.dataset.theme = project?.theme ?? 'blue';
  document.querySelector('#path-name').textContent = name;
  document.title = section === 'projects' && !project ? 'Youssef Yasser Portfolio' : name + ' | Youssef Yasser Portfolio';
  document.querySelector('#status').textContent = project ? project.category : section === 'projects' ? allProjects.length + ' projects' : name;
  back.disabled = !project && section === 'projects';
  pane.innerHTML = project ? projectPage(project) : pagesBySection[section]();
  pane.scrollTop = 0;
  document.querySelectorAll('[data-tab], .dock [data-route]').forEach(link => {
    if ((link.dataset.tab ?? link.dataset.route) === section) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (focus) pane.focus();
}

function go(route) {
  if (location.hash === '#' + route) render(true);
  else location.hash = route;
}

function toggleExpanded(expanded) {
  finder.classList.toggle('is-expanded', expanded);
  maximize.setAttribute('aria-pressed', String(expanded));
  maximize.setAttribute('aria-label', expanded ? 'Restore window' : 'Expand window');
  maximize.title = expanded ? 'Restore window' : 'Expand window';
}

function setWindowPosition(x, y) {
  finder.style.setProperty('--window-x', x + 'px');
  finder.style.setProperty('--window-y', y + 'px');
}

let drag;
titlebar.addEventListener('pointerdown', event => {
  if (event.button !== 0 || event.pointerType !== 'mouse' || event.target.closest('button') ||
      finder.classList.contains('is-expanded') || innerWidth <= 740) return;
  const bounds = finder.getBoundingClientRect();
  const area = desktop.getBoundingClientRect();
  const x = parseFloat(finder.style.getPropertyValue('--window-x')) || 0;
  const y = parseFloat(finder.style.getPropertyValue('--window-y')) || 0;
  drag = { id: event.pointerId, left: event.clientX, top: event.clientY, x, y,
    minX: x + area.left + 10 - bounds.left, maxX: x + area.right - 10 - bounds.right,
    minY: y + area.top + 8 - bounds.top, maxY: y + area.bottom - 86 - bounds.bottom };
  titlebar.setPointerCapture(event.pointerId);
  titlebar.classList.add('is-dragging');
});
titlebar.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId) return;
  const x = drag.x + event.clientX - drag.left;
  const y = drag.y + event.clientY - drag.top;
  setWindowPosition(Math.min(drag.maxX, Math.max(drag.minX, x)), Math.min(drag.maxY, Math.max(drag.minY, y)));
});
titlebar.addEventListener('lostpointercapture', () => {
  drag = undefined;
  titlebar.classList.remove('is-dragging');
});
window.addEventListener('resize', () => setWindowPosition(0, 0));

function updateSearch() {
  const terms = query.value.toLowerCase().trim().split(/\s+/);
  const results = allProjects.filter(project => {
    const corpus = [project.name, project.category, project.summary, ...project.stack].join(' ').toLowerCase();
    return terms.every(term => corpus.includes(term));
  });
  searchResults.innerHTML = results.length ? results.map(fileRow).join('') : '<p>No matching projects.</p>';
}

function openSearch() {
  if (search.open) return;
  query.value = '';
  updateSearch();
  search.showModal();
  query.focus();
}

document.addEventListener('click', event => {
  const route = event.target.closest('[data-route]');
  const action = event.target.closest('[data-action]');
  const image = event.target.closest('[data-image]');
  if (route?.closest('.desktop-files') && event.detail > 0 && event.pointerType !== 'touch') {
    document.querySelectorAll('.desktop-files button').forEach(button => button.setAttribute('aria-pressed', String(button === route)));
  } else if (route) go(route.dataset.route);
  if (action?.dataset.action === 'search') openSearch();
  if (action?.dataset.action === 'dismiss') action.closest('dialog').close();
  if (action?.dataset.action === 'maximize') toggleExpanded(!finder.classList.contains('is-expanded'));
  if (['close', 'minimize'].includes(action?.dataset.action)) {
    finder.hidden = true;
    if (action.dataset.action === 'close') {
      toggleExpanded(false);
      setWindowPosition(0, 0);
      desktop.dataset.theme = 'blue';
    }
    document.querySelector('.dock [data-route="projects"]').focus();
  }
  if (image) {
    const preview = imageViewer.querySelector('img');
    preview.src = './media/' + image.dataset.image;
    preview.alt = image.dataset.caption;
    imageViewer.querySelector('h2').textContent = image.dataset.caption;
    imageViewer.showModal();
  }
  const searchLink = event.target.closest('#search-results a');
  if (searchLink) {
    event.preventDefault();
    search.close();
    go(searchLink.hash.slice(1));
  }
  const activeLink = event.target.closest('.brand, [data-tab]');
  if (activeLink?.hash === location.hash && finder.hidden) render(true);
});
document.querySelector('.desktop-files').addEventListener('dblclick', event => {
  const folderButton = event.target.closest('[data-route]');
  if (folderButton) go(folderButton.dataset.route);
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !imageViewer.open) {
    event.preventDefault();
    openSearch();
  }
  if (event.key === 'Enter' && search.open && document.activeElement === query) {
    event.preventDefault();
    searchResults.querySelector('a')?.click();
  }
});
query.addEventListener('input', updateSearch);
back.addEventListener('click', () => go('projects'));
window.addEventListener('hashchange', () => render(true));

const cairoTime = new Intl.DateTimeFormat('en', { timeZone: 'Africa/Cairo', weekday: 'short', hour: 'numeric', minute: '2-digit' });
function updateClock() {
  const now = new Date();
  const clock = document.querySelector('#clock');
  clock.textContent = cairoTime.format(now);
  clock.dateTime = now.toISOString();
}
document.querySelector('kbd').textContent = /Mac/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
updateClock();
setInterval(updateClock, 15000);
render();

