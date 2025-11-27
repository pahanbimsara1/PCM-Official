
const EVENTS = [
  { id:'e1', title:'Annual Sports Meet', datetime:'2025-12-10T08:30:00', location:'Main Grounds', type:'Sports', description:'Track & field — house competitions. Multiple categories for boys and girls. Cheer for your house!', image:'e1.jpg' },
  { id:'e2', title:'Inter-school Debate Finals', datetime:'2026-01-15T09:00:00', location:'Auditorium', type:'Debate', description:'Top teams from around the district compete in the finals.', image:'e2.jpg' },
  { id:'e3', title:'Science Exhibition', datetime:'2026-02-20T10:00:00', location:'Gymnasium', type:'Exhibition', description:'Student STEM projects, interactive demos & awards.', image:'e3.jpg' },
  { id:'e4', title:'Art & Culture Night', datetime:'2026-03-05T18:00:00', location:'Hall B', type:'Culture', description:'Performances, cultural displays & awards.', image:'e4.jpg' },
  { id:'e5', title:'House Music Competition', datetime:'2025-11-30T18:00:00', location:'Main Hall', type:'Music', description:'Vocal & instrumental competition between houses.', image:'e5.jpg' },
  { id:'e6', title:'Annual Prize Giving', datetime:'2026-04-18T09:00:00', location:'Main Grounds', type:'Ceremony', description:'Awards ceremony celebrating achievements.', image:'e6.jpg' }
];


const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, fallback=[]) => { try { return JSON.parse(localStorage.getItem(k)) || fallback } catch(e){ return fallback } };


(function loaderSequence(){
  const loader = document.getElementById('site-loader');
  if(!loader){ initPage(); return; }


  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  const bar = document.getElementById('loader-bar');
  const percent = document.getElementById('loader-percent');
  const welcome = document.getElementById('loader-welcome');
  const duration = 2000; // ms
  const start = performance.now();

  function step(now){
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease out cubic
    const value = Math.floor(1 + eased * 99);
    if(bar) bar.style.width = value + '%';
    if(percent) percent.textContent = value + '%';
    if(value >= 40 && welcome){ welcome.style.opacity = 1; welcome.style.transform = 'translateY(0)'; }

    if(t < 1) requestAnimationFrame(step);
    else {
      
      setTimeout(()=> {
        loader.style.transition = 'opacity .6s ease, transform .6s ease';
        loader.style.opacity = 0;
        loader.style.transform = 'translateY(-12px)';
        setTimeout(()=> {
          loader.remove();
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
         
          const main = document.getElementById('site-main');
          if(main) main.setAttribute('aria-hidden','false');
          initPage();
        }, 520);
      }, 240);
    }
  }
  requestAnimationFrame(step);
})();


const THEME_KEY = 'pcm_theme_v_final';
function applyTheme(theme){
  if(theme === 'light') {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  } else {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  }
  document.getElementById('themeToggle')?.setAttribute('aria-pressed', theme === 'light');
  localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme(){ const isLight = document.body.classList.contains('light'); applyTheme(isLight ? 'dark' : 'light'); }


function openMenuFromButton(btn){
  const mega = document.getElementById('megaMenu');
  const panel = document.getElementById('menuPanel');
  if(!mega || !panel) return;


  const rect = btn.getBoundingClientRect();
  const cx = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
  const cy = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
  panel.style.setProperty('--cx', cx + '%');
  panel.style.setProperty('--cy', cy + '%');


  mega.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';

  setTimeout(()=> {
    const first = document.querySelector('.menu-item');
    if(first) first.focus();
  }, 380);
}
function closeMenu(){
  const mega = document.getElementById('megaMenu');
  if(!mega) return;
  mega.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  
  const menuBtn = document.getElementById('menuToggle');
  if(menuBtn) menuBtn.focus();
}


function trapFocusInMenu(e){
  const mega = document.getElementById('megaMenu');
  if(!mega || mega.getAttribute('aria-hidden') === 'true') return;
  const focusable = mega.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
  if(focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if(e.key === 'Tab'){
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  } else if(e.key === 'Escape'){
    closeMenu();
  }
}


function populateMarquee(){
  const el = document.getElementById('marqueeInner');
  if(!el) return;
  const items = [
    'Welcome to PCM Official — President\'s College Minuwangoda',
    ...EVENTS.slice(0,6).map(e => `${e.title} — ${new Date(e.datetime).toLocaleDateString()}`)
  ];
  el.textContent = items.join('   •   ') + '   •   ' + items.join('   •   ');
}


function populateUpcoming(){
  const out = document.getElementById('upcomingList');
  if(!out) return;
  const upcoming = EVENTS.filter(e => new Date(e.datetime) > Date.now()).sort((a,b) => new Date(a.datetime) - new Date(b.datetime));
  if(!upcoming.length){
    out.innerHTML = '<div class="card"><p>No upcoming events</p></div>';
    return;
  }
  out.innerHTML = upcoming.map(ev => `
    <article class="card event-card" data-event-id="${ev.id}">
      <img src="${ev.image}" alt="${ev.title}">
      <h4>${ev.title}</h4>
      <div class="muted">${new Date(ev.datetime).toLocaleString()} • ${ev.location}</div>
      <p>${ev.description}</p>
      <div class="card-actions">
        <button class="button outline btn-details" data-event-id="${ev.id}">Details</button>
        <a class="button primary" href="register.html" onclick="sessionStorage.setItem('pcm_prefill_event','${ev.id}')">Register</a>
      </div>
    </article>
  `).join('');
}


function renderFeatured(){
  const out = document.getElementById('featuredEvents');
  if(!out) return;
  const featured = EVENTS.slice(0,4);
  out.innerHTML = featured.map(ev => `
    <div class="card event-card" data-event-id="${ev.id}">
      <img src="${ev.image}" alt="${ev.title}">
      <h4>${ev.title}</h4>
      <div class="muted">${new Date(ev.datetime).toLocaleDateString()}</div>
      <p>${ev.description}</p>
      <div style="margin-top:10px;">
        <button class="button outline btn-details" data-event-id="${ev.id}">Details</button>
        <a class="button" href="events.html" style="margin-left:8px">More</a>
      </div>
    </div>
  `).join('');
}


function renderAnnouncements(){
  const el = document.getElementById('homeAnnouncements'); if(!el) return;
  el.innerHTML = EVENTS.slice(0,5).map(a => `<li><strong>${a.title}</strong> <div class="muted">${new Date(a.datetime).toLocaleDateString()}</div></li>`).join('');
}
function populateStats(){
  document.getElementById('statEvents') && (document.getElementById('statEvents').textContent = EVENTS.length);
  document.getElementById('statRegs') && (document.getElementById('statRegs').textContent = load('pcm_regs', []).length);
  document.getElementById('statLive') && (document.getElementById('statLive').textContent = load('pcm_live', []).length);
}


function initHomeCountdown(){
  const next = EVENTS.filter(e => new Date(e.datetime) > Date.now()).sort((a,b) => new Date(a.datetime) - new Date(b.datetime))[0];
  if(!next){ document.getElementById('nextEventTitle') && (document.getElementById('nextEventTitle').textContent = 'No upcoming events'); return; }
  document.getElementById('nextEventTitle') && (document.getElementById('nextEventTitle').textContent = `${next.title} — ${new Date(next.datetime).toLocaleDateString()}`);
  startCountdown(next.datetime, 'nextEventCountdown');
}
function startCountdown(dtString, elId){
  const el = document.getElementById(elId); if(!el) return;
  function tick(){
    const diff = new Date(dtString) - Date.now();
    if(diff <= 0){ el.textContent = 'Live or finished'; return; }
    const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    el.textContent = `${d}d ${h}h ${m}m ${s}s`;
    setTimeout(tick, 1000);
  }
  tick();
}


function showEventDetails(id){
  const ev = EVENTS.find(x => x.id === id);
  if(!ev) return alert('Event not found');
  let panel = document.getElementById('eventDetailsPanel');
  if(panel) panel.remove();

  panel = document.createElement('aside');
  panel.id = 'eventDetailsPanel';
  panel.className = 'event-panel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.innerHTML = `
    <div class="event-panel-inner card">
      <button id="eventDetailsClose" class="event-panel-close" aria-label="Close">✕</button>
      <img src="${ev.image}" alt="${ev.title}">
      <h2>${ev.title}</h2>
      <div class="muted">${new Date(ev.datetime).toLocaleString()} • ${ev.location}</div>
      <p>${ev.description}</p>
      <div style="margin-top:12px;">
        <a class="button primary" href="register.html" onclick="sessionStorage.setItem('pcm_prefill_event','${ev.id}')">Register for this event</a>
        <button class="button outline" id="eventAddCal">Add to calendar (iCal)</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  requestAnimationFrame(()=> panel.classList.add('open'));

  document.getElementById('eventDetailsClose').addEventListener('click', closeEventDetails);
  panel.addEventListener('click', (e) => { if(e.target === panel) closeEventDetails(); });
  document.addEventListener('keydown', onEscCloseEvent);


  document.getElementById('eventAddCal').addEventListener('click', () => {
    const ics = generateICS(ev);
    const blob = new Blob([ics], {type: 'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${ev.title.replace(/\s+/g,'_')}.ics`; a.click(); URL.revokeObjectURL(url);
  });
}
function closeEventDetails(){ const panel = document.getElementById('eventDetailsPanel'); if(!panel) return; panel.classList.remove('open'); document.removeEventListener('keydown', onEscCloseEvent); setTimeout(()=> panel.remove(), 300); }
function onEscCloseEvent(e){ if(e.key === 'Escape') closeEventDetails(); }

function generateICS(ev){
  const dtStart = new Date(ev.datetime).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  const dtEnd = new Date(new Date(ev.datetime).getTime() + 1000*60*60*2).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  const uid = `${ev.id}@pcm-official`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PCM Official//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${ev.description}`,
    `LOCATION:${ev.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}


function exportRegistrationsCSV(){
  const regs = load('pcm_regs', []);
  if(!regs.length){ alert('No registrations to export.'); return; }
  const keys = ['id','name','email','eventId','qty','ts'];
  const rows = [keys.join(',')].concat(regs.map(r => keys.map(k => `"${String(r[k]||'').replace(/"/g,'""')}"`).join(',')));
  const csv = rows.join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'registrations.csv'; a.click(); URL.revokeObjectURL(url);
}


function initPage(){

  $$('#year-footer, #menu-year, #footer-year').forEach(x => x && (x.textContent = new Date().getFullYear()));


  const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(saved);


  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);


  const menuToggle = document.getElementById('menuToggle');
  menuToggle?.addEventListener('click', (e) => openMenuFromButton(e.currentTarget));
  document.getElementById('menuClose')?.addEventListener('click', closeMenu);
  document.getElementById('menuBackdrop')?.addEventListener('click', closeMenu);


  document.addEventListener('keydown', trapFocusInMenu);


  populateMarquee();
  populateUpcoming();
  renderFeatured();
  renderAnnouncements();
  populateStats();
  initHomeCountdown();


  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-details');
    if(btn){
      const id = btn.getAttribute('data-event-id');
      if(id) showEventDetails(id);
      e.preventDefault();
    }
  });

  document.getElementById('nextEventDetails')?.addEventListener('click', () => {
    const next = EVENTS.filter(e => new Date(e.datetime) > Date.now()).sort((a,b) => new Date(a.datetime) - new Date(b.datetime))[0];
    if(next) showEventDetails(next.id); else alert('No upcoming event.');
  });

  
  document.getElementById('btnDownload')?.addEventListener('click', exportRegistrationsCSV);


  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
      const mega = document.getElementById('megaMenu');
      if(mega && mega.getAttribute('aria-hidden') === 'false') closeMenu();
      const panel = document.getElementById('eventDetailsPanel');
      if(panel) closeEventDetails();
    }
  });


  highlightActiveTopNav();
}
function highlightActiveTopNav(){
  const page = (document.body.dataset.page || 'home').toLowerCase();
  $$('.top-btn').forEach(btn => {
    btn.classList.remove('active');
    const href = (btn.getAttribute('href')||'').toLowerCase();
    if(href.includes(page) || (page === 'home' && href.includes('index'))) btn.classList.add('active');
  });
}


document.addEventListener('DOMContentLoaded', () => { if(!document.getElementById('site-loader')) initPage(); });
