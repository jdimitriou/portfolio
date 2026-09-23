/* ==========================================================================
   PROJECT DATA
   -------------------------------------------------------------------------
   The original Processing sketch (.pde) read this from a tab-separated
   "projects.txt" file with columns:
     id | project name | domain | role | output | image filename | link
   That data file and the 89 referenced images were not included in the
   upload, so the list below is reconstructed from the image filenames the
   sketch preloaded, with placeholder categorization and placeholder
   thumbnails. Replace PROJECTS below with your real rows (and point
   `image` at real files, e.g. "images/bedfordbridge.png") to bring in the
   actual portfolio content — everything else in this file works unchanged.
   ========================================================================== */
const DOMAINS = ["Professional","Academic","Personal"];
const ROLES   = ["Principal","Collaborator","Apprentice"];
const OUTPUTS = ["Graphics","Places","Text"];
const CAT_COLOR = {
  Professional:"#2f8fd6", Academic:"#5cb75f", Personal:"#e2543c",
  Principal:"#2f8fd6", Collaborator:"#5cb75f", Apprentice:"#e2543c",
  Graphics:"#2f8fd6", Places:"#5cb75f", Text:"#e2543c"
};

const RAW_TITLES = [
  "Bedford Bridge Design","Bedford Comparison Study","Bedford Design Guidelines",
  "Bird Feeder Study","Buzzards Point","Chelsea Open Space Plan","Comprehensive Plan",
  "Efficiency Diagram","Eindhoven Studio","Executive Summary","Frederick Regional Transit",
  "Gas Station Redesign","Hartford — Elmwood","Hartford — Flatbush Ave","Hartford — Parkville",
  "How TIF Works","Hybrid Building","I-270 Corridor Study","IBG Floor Plans","Firm Logos",
  "Mabon House","Massport Context Study","Massport District Access","Massport Physical Features",
  "Maury Center Elevations","Maury Center Site Study","Mitigation Diagram",
  "Natural History Museum","NCS Phasing Plan","Paterson Redevelopment","Pupil Yield Study",
  "Redesign Series","Redevelopment Report","Rock Creek Condos","Route 101 Corridor",
  "Salem Waterfront","Sanctum","Southeast Corridor Study","Suburban Revisions","Train Station",
  "Trends and Issues","Union Station","Urban A-Pike","VA Beach Town Center",
  "Village Center Design Guide","Weather Station","Windsor","Workflow Diagram","Zoning Graphics"
];

const PROJECTS = RAW_TITLES.map((title, i) => ({
  id: i,
  title,
  domain: DOMAINS[i % 3],
  role:   ROLES[(i + 1) % 3],
  output: OUTPUTS[(i + 2) % 3],
  link: "#",
  seed: i
}));

/* ---- placeholder thumbnail generator (swap for real images later) ---- */
function placeholderDataURL(project, w, h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const base = CAT_COLOR[project.domain];
  const grad = ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0, base);
  grad.addColorStop(1, '#11161d');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);
  // subtle grid to read as "drafting plate"
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  const step = Math.max(10, w/8);
  for(let x=0;x<w;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  // initials
  const initials = project.title.split(/\s|—/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `600 ${Math.floor(h*0.34)}px 'Space Grotesk', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, w/2, h/2 + h*0.02);
  return c.toDataURL();
}
PROJECTS.forEach(p=>{
  p.thumbSmall = placeholderDataURL(p, 160, 100);
  p.thumbLarge = placeholderDataURL(p, 760, 280);
});

/* ==========================================================================
   PHYSICS FIELD  (ported from the Ball class / draw loop in the .pde)
   ========================================================================== */
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const fieldWrap = document.querySelector('.field-wrap');
const tooltip = document.getElementById('tooltip');

let W = 0, H = 0, DPR = Math.max(1, window.devicePixelRatio || 1);
function resize(){
  W = fieldWrap.clientWidth;
  H = fieldWrap.clientHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  layoutSelectedTargets();
}
window.addEventListener('resize', resize);

const GRAVITY = 0.012;
const FRICTION = -0.9;
const SPRING = 0.06;
const DIAMETER = 15;

const balls = PROJECTS.map((p, i) => ({
  project: p,
  x: 60 + Math.random() * 300,
  y: 40 + Math.random() * 200,
  vx: (Math.random()-0.5) * 0.6,
  vy: 0,
  d: DIAMETER,
  selected: false,
  tx: 0, ty: 0 // target position when selected (grid slot)
}));

let activeFilters = { domain: null, role: null, output: null };

function matches(p){
  const active = [activeFilters.domain, activeFilters.role, activeFilters.output].filter(Boolean);
  if(active.length === 0) return false;
  return active.every(v => p.domain === v || p.role === v || p.output === v);
}

function updateSelection(){
  let n = 0;
  balls.forEach(b => {
    b.selected = matches(b.project);
    if(b.selected) n++;
  });
  document.getElementById('countSel').textContent = n;
  layoutSelectedTargets();
}

function layoutSelectedTargets(){
  const selected = balls.filter(b => b.selected);
  const marginX = 30, marginY = 26, gap = 46;
  const usableW = Math.max(220, W - marginX*2);
  const cols = Math.max(1, Math.floor(usableW / gap));
  selected.forEach((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    b.tx = marginX + col * gap + gap/2;
    b.ty = marginY + row * gap + gap/2;
  });
}

function collide(i){
  const b = balls[i];
  if(b.selected) return;
  for(let j = i+1; j < balls.length; j++){
    const o = balls[j];
    if(o.selected) continue;
    const dx = o.x - b.x, dy = o.y - b.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
    const minDist = o.d/2 + b.d/2;
    if(dist < minDist){
      const angle = Math.atan2(dy, dx);
      const targetX = b.x + Math.cos(angle) * minDist;
      const targetY = b.y + Math.sin(angle) * minDist;
      const ax = (targetX - o.x) * SPRING;
      const ay = (targetY - o.y) * SPRING;
      b.vx -= ax; b.vy -= ay;
      o.vx += ax; o.vy += ay;
    }
  }
}

function move(b){
  if(b.selected){
    // ease toward its grid slot
    b.x += (b.tx - b.x) / 12;
    b.y += (b.ty - b.y) / 12;
    return;
  }
  b.vy += GRAVITY;
  b.x += b.vx;
  b.y += b.vy;
  const rightBound = Math.max(160, W - 20);
  if(b.x + b.d/2 > rightBound){ b.x = rightBound - b.d/2; b.vx *= FRICTION; }
  else if(b.x - b.d/2 < 20){ b.x = b.d/2 + 20; b.vx *= FRICTION; }
  if(b.y + b.d/2 > H - 20){ b.y = H - 20 - b.d/2; b.vy *= FRICTION; }
  else if(b.y - b.d/2 < 20){ b.y = b.d/2 + 20; b.vy *= FRICTION; }
}

let hovered = null;
let mouseX = -999, mouseY = -999;

function draw(){
  ctx.clearRect(0,0,W,H);

  for(let i=0;i<balls.length;i++) collide(i);
  balls.forEach(move);

  // faint linking rule for unselected field (drafting-table feel)
  hovered = null;
  balls.forEach(b => {
    const dx = mouseX - b.x, dy = mouseY - b.y;
    const isHover = Math.sqrt(dx*dx+dy*dy) < b.d/2 + 6;
    if(isHover) hovered = b;
  });

  // draw unselected dots (dim, background layer)
  balls.forEach(b => {
    if(b.selected) return;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(230,236,244,0.16)';
    ctx.arc(b.x, b.y, b.d/2, 0, Math.PI*2);
    ctx.fill();
  });

  // draw selected dots (accent, foreground layer)
  balls.forEach(b => {
    if(!b.selected) return;
    const isHover = hovered === b;
    ctx.beginPath();
    ctx.fillStyle = CAT_COLOR[b.project.domain];
    ctx.arc(b.x, b.y, isHover ? b.d/2 + 2.5 : b.d/2, 0, Math.PI*2);
    ctx.fill();
    if(isHover){
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.d/2 + 6, 0, Math.PI*2);
      ctx.stroke();
    }
  });

  // tooltip for hovered selected ball
  if(hovered && hovered.selected){
    tooltip.style.display = 'block';
    let left = hovered.x + 16, top = hovered.y - 10;
    if(left + 190 > W) left = hovered.x - 196;
    if(top + 150 > H) top = H - 150;
    tooltip.style.left = left + 'px';
    tooltip.style.top = Math.max(8, top) + 'px';
    document.getElementById('ttThumb').style.backgroundImage = `url(${hovered.project.thumbSmall})`;
    document.getElementById('ttTitle').textContent = hovered.project.title;
    document.getElementById('ttMeta').textContent = `${hovered.project.domain} · ${hovered.project.role} · ${hovered.project.output}`;
    canvas.style.cursor = 'pointer';
  } else {
    tooltip.style.display = 'none';
    canvas.style.cursor = 'default';
  }

  requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = e.clientX - r.left;
  mouseY = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });
canvas.addEventListener('click', () => {
  if(hovered && hovered.selected) openModal(hovered.project);
});

/* ==========================================================================
   FILTER BUTTONS
   ========================================================================== */
document.querySelectorAll('.filter-row').forEach(row => {
  row.addEventListener('click', () => {
    const group = row.closest('.filter-group').dataset.group;
    const cat = row.dataset.cat;
    const alreadyActive = activeFilters[group] === cat;
    document.querySelectorAll(`.filter-group[data-group="${group}"] .filter-row`).forEach(r => r.classList.remove('active'));
    if(alreadyActive){
      activeFilters[group] = null;
    } else {
      activeFilters[group] = cat;
      row.classList.add('active');
    }
    updateSelection();
  });
});
document.getElementById('resetBtn').addEventListener('click', () => {
  activeFilters = { domain:null, role:null, output:null };
  document.querySelectorAll('.filter-row.active').forEach(r => r.classList.remove('active'));
  updateSelection();
});

/* ==========================================================================
   MODAL
   ========================================================================== */
const modalBackdrop = document.getElementById('modalBackdrop');
function openModal(project){
  document.getElementById('modalHero').style.backgroundImage = `url(${project.thumbLarge})`;
  document.getElementById('modalTitle').textContent = project.title;
  document.getElementById('modalTags').innerHTML =
    [project.domain, project.role, project.output].map(t => `<span class="tag">${t}</span>`).join('');
  document.getElementById('modalDesc').textContent =
    `Placeholder description for "${project.title}". Replace this with the real project summary once your project data is wired in.`;
  document.getElementById('modalLink').href = project.link;
  modalBackdrop.classList.add('open');
}
document.getElementById('modalClose').addEventListener('click', () => modalBackdrop.classList.remove('open'));
modalBackdrop.addEventListener('click', e => { if(e.target === modalBackdrop) modalBackdrop.classList.remove('open'); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') modalBackdrop.classList.remove('open'); });

/* ==========================================================================
   INIT
   ========================================================================== */
document.getElementById('countAll').textContent = PROJECTS.length;
resize();
draw();
