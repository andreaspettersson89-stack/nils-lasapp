/* =====================================================================
   Ljuda ihop – Nils läsapp. Fem nivåer: trä → sten → järn → guld → diamant.
   Statiska filer, inget konto, ingen server, ingen AI medan han spelar.
   Allt sparas bara på paddan (localStorage). Rösten = inspelade ljudfiler i ljud/.
   ===================================================================== */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slump = a => a[Math.floor(Math.random() * a.length)];
const blanda = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const RUNDOR = 6;            // block per nivå ("Du fick sex träblock")
const NYCKEL = 'ljuda-ihop-v1';

/* ---------------- material och nivåer ---------------- */
const MAT = {
  tra:     { namn:'trä',     tex:T.plank,   steg:'A och a' },
  sten:    { namn:'sten',    tex:T.stone,   steg:'första ljudet' },
  jarn:    { namn:'järn',    tex:T.iron,    steg:'stavelser' },
  guld:    { namn:'guld',    tex:T.gold,    steg:'ord' },
  diamant: { namn:'diamant', tex:T.diamant, steg:'meningar' },
};
const ORDN = ['tra','sten','jarn','guld','diamant'];
const NIVAER = ORDN;   // alla fem är spelbara

/* ---------------- sparat läge ---------------- */
function datumtext(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const idag = () => datumtext(new Date());
const noll = () => Object.fromEntries(ORDN.map(m => [m, 0]));
function nyttLage(){
  return { v:1, bag:noll(), built:noll(), stjarnor:noll(), klara:noll(), miss:Object.fromEntries(ORDN.map(m => [m, {}])),
           tid:{ datum:idag(), sek:0, extra:0 }, maxtid:15, pin:null, logg:[], sett:{}, slott:0 };
}
let S = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(NYCKEL));
    if (s && s.v === 1){
      const n = nyttLage();
      ['bag','built','stjarnor','klara'].forEach(k => s[k] = Object.assign(noll(), s[k]));
      s.miss = Object.assign(n.miss, s.miss); s.sett = s.sett || {}; s.logg = s.logg || [];
      return Object.assign(n, s);
    }
  } catch (e) {}
  return nyttLage();
})();
function spara(){ try { localStorage.setItem(NYCKEL, JSON.stringify(S)); } catch (e) {} }

/* ---------------- speltid per dag ---------------- */
function tidIdag(){ if (!S.tid || S.tid.datum !== idag()) S.tid = { datum:idag(), sek:0, extra:0 }; return S.tid; }
function sekKvar(){ if (!S.maxtid) return Infinity; const t = tidIdag(); return Math.max(0, (S.maxtid + t.extra) * 60 - t.sek); }
let iNiva = null;   // nivån som pågår, annars null
setInterval(() => {
  if (!iNiva || document.hidden || $('#win').classList.contains('on')) return;
  const t = tidIdag(); t.sek++;
  if (t.sek % 5 === 0) spara();
}, 1000);

/* ---------------- grafiken på plats ---------------- */
const root = document.documentElement.style;
Object.entries({ plank:T.plank, stone:T.stone, cave:T.cave, deep:T.deep, stonefloor:T.stonefloor, dirt:T.dirt, grass:T.grass,
  leaves:T.leaves, log:T.log, crack:T.crack, lock:T.lock }).forEach(([k, v]) => root.setProperty('--t-' + k, `url(${v})`));
$$('[data-cloud]').forEach(el => el.style.backgroundImage = `url(${T.cloud})`);
$$('.hero').forEach(el => el.style.backgroundImage = `url(${T.hero})`);
$$('[data-tex]').forEach(el => el.style.backgroundImage = `url(${T[el.dataset.tex]})`);
$$('[data-tree]').forEach(el => {
  const h = +el.dataset.tree; const g = 'var(--g)';
  el.style.width = `calc(${g}*3)`; el.style.height = `calc(${g}*${h + 2})`;
  el.innerHTML = `<div class="log" style="left:calc(${g});bottom:0;width:calc(${g});height:calc(${g}*${h})"></div>
                  <div class="leaves" style="left:0;bottom:calc(${g}*${h - 1});width:calc(${g}*3);height:calc(${g}*2)"></div>
                  <div class="leaves" style="left:calc(${g});bottom:calc(${g}*${h + 1});width:calc(${g});height:calc(${g})"></div>`;
});

/* ---------------- ljud: inspelade filer + små effektljud ---------------- */
const Ljud = {
  el: new Audio(), ko: [], knapp: null,
  spela(ids, btn){
    this.el.pause(); this.ko = [].concat(ids);
    this.knapp && this.knapp.classList.remove('talking');
    this.knapp = btn || null; btn && btn.classList.add('talking');
    this.nasta();
  },
  nasta(){
    const id = this.ko.shift();
    if (!id){ this.knapp && this.knapp.classList.remove('talking'); this.knapp = null; return; }
    this.el.src = 'ljud/' + id + '.mp3';
    this.el.play().catch(() => this.nasta());   // en fil som inte går att spela hoppas över
  },
  tyst(){ this.ko = []; this.el.pause(); this.knapp && this.knapp.classList.remove('talking'); this.knapp = null; },
};
Ljud.el.preload = 'auto';
Ljud.el.onended = () => Ljud.nasta();
Ljud.el.onerror = () => Ljud.nasta();
document.addEventListener('visibilitychange', () => { if (document.hidden){ Ljud.tyst(); spara(); } });
window.addEventListener('pagehide', spara);

let actx = null;
function fx(type){
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination);
    const set = { pop:['square',520,180,.12,.09], ding:['triangle',880,1320,.25,.14], thunk:['sine',160,70,.18,.25], boop:['sine',260,180,.22,.1], tada:['triangle',660,990,.5,.13] }[type];
    o.type = set[0]; o.frequency.setValueAtTime(set[1], t); o.frequency.exponentialRampToValueAtTime(set[2], t + set[3]);
    g.gain.setValueAtTime(set[4], t); g.gain.exponentialRampToValueAtTime(.0001, t + set[3]);
    o.start(t); o.stop(t + set[3] + .02);
  } catch (e) {}
}

/* ---------------- ryggsäcken ---------------- */
function renderBags(){
  $$('[data-bag]').forEach(el => {
    el.innerHTML = `<div class="sack"></div>` + ORDN.map(m =>
      `<div class="item ${S.bag[m] ? '' : 'zero'}" data-m="${m}"><i style="background-image:url(${MAT[m].tex})"></i>${S.bag[m]}</div>`).join('');
    el.querySelector('.sack').style.backgroundImage = `url(${T.sack})`;
  });
  const n = ORDN.reduce((a, m) => a + S.bag[m], 0);
  $('#buildBadge').textContent = n; $('#buildBadge').style.display = n ? 'grid' : 'none';
}

/* ---------------- slottet ---------------- */
/* 13 brett. Trä = grunden med porten, sten = muren, järn = två torn + borgen,
   guld = tinnarna, diamant = topparna. Flaggor när allt är klart. */
const W = 13, H = 14;
const TORN = (() => {
  const c = []; const add = (m, x, y) => c.push({ m, x, y });
  for (let y=0;y<3;y++) for (let x=0;x<W;x++){ if (y < 2 && x >= 5 && x <= 7) continue; add('tra', x, y); }
  for (let y=3;y<5;y++) for (let x=0;x<W;x++){ if (y === 4 && (x === 2 || x === 10)) continue; add('sten', x, y); }
  add('sten', 3, 5); add('sten', 9, 5);
  const torn = x => x <= 2 || x >= 10, borg = x => x >= 4 && x <= 8;
  for (let y=5;y<8;y++) for (let x=0;x<W;x++){
    if (!(torn(x) || borg(x))) continue;
    if (y === 6 && (x === 1 || x === 11 || x === 6)) continue;
    add('jarn', x, y);
  }
  for (let x=0;x<W;x++) if (torn(x) || borg(x)) add('guld', x, 8);
  [0,2,10,12,4,6,8].forEach(x => add('guld', x, 9));
  [[1,9],[11,9],[5,9],[7,9],[6,10],[6,11]].forEach(([x, y]) => add('diamant', x, y));
  return c;
})();
const TOTAL = m => TORN.filter(c => c.m === m).length;

function renderTower(el, cell, opts = {}){
  el.style.width = `calc(${cell} * ${W})`; el.style.height = `calc(${cell} * ${H})`;
  const seen = {}; let nextMarked = false;
  const firstOpen = ORDN.find(m => S.built[m] < TOTAL(m));
  el.innerHTML = TORN.map((c, idx) => {
    seen[c.m] = (seen[c.m] || 0) + 1;
    const full = seen[c.m] <= S.built[c.m];
    let cls = full ? 'full' : 'ghost';
    if (!full && c.m !== firstOpen) cls += ' far';
    if (!full && opts.next && !nextMarked && S.bag[c.m] > 0 && c.m === nextMat()){
      if (seen[c.m] === S.built[c.m] + 1){ cls += ' next'; nextMarked = true; }
    }
    const bg = full ? `background-image:url(${MAT[c.m].tex});` : '';
    return `<div class="c ${cls}" data-i="${idx}" style="left:calc(${cell}*${c.x});bottom:calc(${cell}*${c.y});width:${cell};height:${cell};${bg}"></div>`;
  }).join('') + (ORDN.every(m => S.built[m] >= TOTAL(m)) ? [[1,10],[11,10],[6,12]].map(([x, y]) =>
    `<div class="pole" style="left:calc(${cell}*${x} + ${cell}*.4);bottom:calc(${cell}*${y});width:calc(${cell}*.2);height:calc(${cell}*1.8)"></div>
     <div class="flag" style="left:calc(${cell}*${x} + ${cell}*.6);bottom:calc(${cell}*${y + 1});width:calc(${cell}*1.1);height:calc(${cell}*.75)"></div>`).join('') : '');
}
function nextMat(){ return ORDN.find(m => S.bag[m] > 0 && S.built[m] < TOTAL(m)); }
const STOR_CELL = 'calc(var(--u)*3.8)';
function placeOne(){
  const m = nextMat(); if (!m) return null;
  S.bag[m]--; S.built[m]++; spara();
  renderTower($('#towerBig'), STOR_CELL, { next:true });
  const idx = TORN.findIndex((c, i) => c.m === m && TORN.slice(0, i + 1).filter(d => d.m === m).length === S.built[m]);
  const cell = $(`#towerBig .c[data-i="${idx}"]`);
  cell && cell.classList.add('drop');
  setTimeout(() => fx('thunk'), 380);
  renderBags();
  return S.built[m] === TOTAL(m) ? m : true;   // materialet om våningen just blev klar
}

/* ---------------- start ---------------- */
/* En nivå öppnas när den före är klarad en gång. */
const oppen = m => { const i = ORDN.indexOf(m); return i === 0 || S.klara[ORDN[i - 1]] > 0; };
function renderStart(){
  const senaste = [...NIVAER].reverse().find(oppen);
  $('#path').innerHTML = ORDN.map((m, i) => {
    const open = oppen(m), active = m === senaste;
    const stars = `<div class="stars">${[0,1,2].map(k => `<b class="${k < S.stjarnor[m] ? '' : 'off'}"></b>`).join('')}</div>`;
    return `<div class="step ${open ? '' : 'locked'} ${active ? 'active' : ''}" style="margin-bottom:calc(var(--u)*${i * 5})">
      ${stars}
      <button class="block" ${open ? `data-go="${m}"` : `data-locked="${m}"`} style="background-image:url(${MAT[m].tex})" aria-label="${MAT[m].namn}">
        ${open ? `<span class="play"><svg viewBox="0 0 24 24"><path fill="#fff" stroke="#2b2a26" stroke-width="1.2" d="M7 4.5v15l12-7.5z"/></svg></span>` : ''}
      </button>
      <div class="cap">${MAT[m].namn}<small>${MAT[m].steg}</small></div>
    </div>`;
  }).join('');
  renderTower($('#towerMini'), 'calc(var(--u)*1.5)');
}

/* ---------------- nivåerna: vad som frågas, vilka block som visas ---------------- */
/* mal = det Nils ska hitta i en runda. nyckel = det som sparas som fel (bokstav, stavelse, ord, mening). */
const MENING_TEXT = Object.fromEntries(MENINGAR);
const forstaOrd = id => MENING_TEXT[id].split(' ')[0];
/* Ord som liknar varandra: samma längd och flest bokstäver på samma plats, så att han måste läsa hela ordet. */
function likaOrd(x){
  const poang = o => (o.length === x.length ? 1 : 0) + [...o].filter((c, i) => c === x[i]).length;
  const andra = blanda(GULD_ORD.filter(o => o !== x)).sort((a, b) => poang(b) - poang(a));
  return blanda(andra.slice(0, 5)).slice(0, 2);
}
const NIVA = {
  tra: {
    pool: () => TRA_BOKSTAVER, nyckel: x => x, fraga: x => 'tra-hitta-' + x,
    block: x => blanda([x, ...blanda(TRA_BOKSTAVER.filter(b => b !== x)).slice(0, 3)]), ratt: x => x,
    visa: b => b, plate: '', rattLjud: () => [slump(BEROM)], felLjud: 'fel-prova',
  },
  sten: {
    pool: () => STEN_ORD, nyckel: x => x[0], fraga: x => 'forsta-' + x,
    block: x => blanda([x[0], ...blanda([...new Set(STEN_ORD.map(o => o[0]))].filter(b => b !== x[0])).slice(0, 2)]), ratt: x => x[0],
    visa: b => b, plate: '', rattLjud: x => ['ratt-ja', 'ord-' + x], felLjud: 'fel-lyssna',
  },
  jarn: {   // en med samma första bokstav (ma–mo) och en med samma vokal (ma–sa)
    pool: () => STAVELSER, nyckel: x => x, fraga: x => 'stav-' + x,
    block: x => blanda([x, slump(STAVELSER.filter(s => s[0] === x[0] && s !== x)), slump(STAVELSER.filter(s => s.slice(1) === x.slice(1) && s !== x))]), ratt: x => x,
    visa: b => b, plate: 'stav', rattLjud: x => ['ratt-ja', 'stav-' + x], felLjud: 'fel-lyssna',
  },
  guld: {
    pool: () => GULD_ORD, nyckel: x => x, fraga: x => 'ord-' + x,
    block: x => blanda([x, ...likaOrd(x)]), ratt: x => x,
    visa: b => b, plate: 'word', rattLjud: x => ['ratt-ja', 'ord-' + x], felLjud: 'fel-lyssna',
  },
  diamant: {   // helst meningar som börjar likadant, så att han måste läsa till slutet
    pool: () => MENINGAR.map(m => m[0]), nyckel: x => x, fraga: x => x,
    block: x => { const andra = blanda(MENINGAR.map(m => m[0]).filter(id => id !== x)).sort((a, b) => (forstaOrd(b) === forstaOrd(x)) - (forstaOrd(a) === forstaOrd(x)));
                  return blanda([x, ...andra.slice(0, 2)]); }, ratt: x => x,
    visa: id => MENING_TEXT[id], plate: 'mening', rattLjud: () => [slump(BEROM)], felLjud: 'fel-lyssna',
  },
};
const visaFel = (mat, k) => mat === 'tra' ? k.toUpperCase() + ' ' + k : mat === 'diamant' ? MENING_TEXT[k] : k;

/* ---------------- gemensamt för nivåerna ---------------- */
const Lvl = { mat:null, runda:0, miss:0, fel:0, forsta:0, busy:false, mal:[], pass:0 };
let pass = 0;   // ökas vid varje byte av skärm, så att en gammal runda inte fortsätter i bakgrunden
function progress(el, done, tex){
  el.innerHTML = Array.from({ length:RUNDOR }, (_, i) => `<span class="${i < done ? 'full' : ''}" style="${i < done ? `background-image:url(${tex})` : ''}"></span>`).join('');
}
/* Det som blev fel kommer tillbaka oftare: upp till hälften av rundorna tas bland det svåra. */
function valjMal(mat){
  const n = NIVA[mat], m = S.miss[mat], alla = n.pool();
  const svara = blanda(alla.filter(x => m[n.nyckel(x)] > 0)).slice(0, RUNDOR / 2);
  const resten = blanda(alla.filter(x => !svara.includes(x)));
  return blanda([...svara, ...resten.slice(0, RUNDOR - svara.length)]);
}
function startaNiva(mat){
  iNiva = mat;
  Object.assign(Lvl, { mat, runda:0, miss:0, fel:0, forsta:0, busy:false, pass });
  Lvl.mal = valjMal(mat);
  runda(!S.sett['intro-' + mat]);
  S.sett['intro-' + mat] = 1; spara();
}
function runda(medIntro){
  Object.assign(Lvl, { miss:0, busy:false });
  const mat = Lvl.mat, n = NIVA[mat], mal = Lvl.mal[Lvl.runda];
  if (mat === 'tra') $('#traBig').textContent = mal.toUpperCase();
  progress($(`#${mat}Prog`), Lvl.runda, MAT[mat].tex);
  const ratt = n.ratt(mal), rad = $(`#${mat}Row`);
  rad.innerHTML = n.block(mal).map((o, i) =>
    `<button class="block pop ${mat === 'diamant' ? 'mening' : ''}" data-l="${o}" ${o === ratt ? 'data-ok="1"' : ''} style="background-image:url(${MAT[mat].tex});animation-delay:${i * 70}ms"><span class="plate ${n.plate}">${n.visa(o)}</span></button>`).join('');
  rad.querySelectorAll('.block').forEach(b => b.onclick = () => valj(b));
  fraga(medIntro ? ['intro-' + mat] : []);
}
const fragaId = () => NIVA[Lvl.mat].fraga(Lvl.mal[Lvl.runda]);
function fraga(fore = []){ Ljud.spela([...fore, fragaId()], $(`#${Lvl.mat}Say`)); }

async function valj(b){
  if (Lvl.busy) return;
  const mat = Lvl.mat, n = NIVA[mat], mal = Lvl.mal[Lvl.runda], rad = b.parentElement;
  const nyckel = n.nyckel(mal), miss = S.miss[mat];
  if (b.dataset.ok){
    Lvl.busy = true; fx('ding');
    rad.querySelectorAll('.block').forEach(x => x.classList.remove('hint'));
    if (Lvl.miss === 0){ Lvl.forsta++; if (miss[nyckel] > 0 && --miss[nyckel] === 0) delete miss[nyckel]; }
    Ljud.spela(n.rattLjud(mal));
    await breakBlock(b, MAT[mat].tex, mat);
    if (Lvl.pass !== pass) return;   // Nils gick hem under tiden
    Lvl.runda++;
    if (Lvl.runda >= RUNDOR){ progress($(`#${mat}Prog`), RUNDOR, MAT[mat].tex); return klar(mat); }
    await sleep(mat === 'tra' || mat === 'diamant' ? 700 : 1100);
    if (Lvl.pass === pass) runda(false);
  } else {
    fx('boop'); Lvl.miss++; Lvl.fel++;
    if (Lvl.miss === 1) miss[nyckel] = Math.min(3, (miss[nyckel] || 0) + 1);
    spara();
    b.classList.remove('wobble'); void b.offsetWidth; b.classList.add('wobble');
    if (Lvl.miss >= 2){
      rad.querySelector('[data-ok]').classList.add('hint');
      Ljud.spela(['hjalp-07', fragaId()]);
    } else Ljud.spela([n.felLjud, fragaId()]);
  }
}

/* ---------------- blocket går sönder och flyger till ryggsäcken ---------------- */
async function breakBlock(b, tex, mat){
  b.classList.add('crack'); fx('pop');
  await sleep(230);
  const r = b.getBoundingClientRect();
  const screen = b.closest('.screen');
  const sack = screen.querySelector('[data-bag] .sack').getBoundingClientRect();
  const tx = sack.left + sack.width / 2, ty = sack.top + sack.height / 2;
  const n = 4, w = r.width / n, h = r.height / n, plate = b.querySelector('.plate');
  b.style.visibility = 'hidden';
  if (plate) {
    const pr = plate.getBoundingClientRect(), ghost = plate.cloneNode(true);
    Object.assign(ghost.style, { position:'fixed', left:pr.left + 'px', top:pr.top + 'px', width:pr.width + 'px', height:pr.height + 'px', inset:'auto', zIndex:55, fontSize:getComputedStyle(plate).fontSize });
    document.body.appendChild(ghost);
    ghost.animate([{ transform:'scale(1)', opacity:1 }, { transform:'scale(1.5)', opacity:0 }], { duration:420, easing:'ease-out' }).onfinish = () => ghost.remove();
  }
  const anims = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++){
    const p = document.createElement('div'); p.className = 'piece';
    Object.assign(p.style, { left:r.left + i * w + 'px', top:r.top + j * h + 'px', width:w + 'px', height:h + 'px',
      backgroundImage:`url(${tex})`, backgroundPosition:`${i / (n - 1) * 100}% ${j / (n - 1) * 100}%` });
    document.body.appendChild(p);
    const cx = r.left + i * w, cy = r.top + j * h;
    const bx = (i - 1.5) * w * (1.2 + Math.random()), by = (j - 1.5) * h * (1.2 + Math.random()) - h * 1.5;
    const a = p.animate([
      { transform:'translate(0,0) rotate(0) scale(1)' },
      { transform:`translate(${bx}px,${by}px) rotate(${(Math.random() - .5) * 180}deg) scale(.9)`, offset:.35 },
      { transform:`translate(${tx - cx - w / 2}px,${ty - cy - h / 2}px) rotate(${(Math.random() - .5) * 360}deg) scale(.25)` },
    ], { duration:800 + Math.random() * 250, delay:(i + j) * 18, easing:'cubic-bezier(.4,0,.6,1)', fill:'forwards' });
    anims.push(a.finished.then(() => p.remove()));
  }
  await Promise.race([Promise.all(anims), sleep(1400)]);
  S.bag[mat]++; spara(); renderBags();
  $$('.sack').forEach(s => { s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); });
  fx('pop');
}

/* ---------------- nivån klar: stjärnor, firande ---------------- */
const stjarnorFor = fel => fel <= 1 ? 3 : fel <= 3 ? 2 : 1;
function klar(mat){
  const st = stjarnorFor(Lvl.fel);
  const nasta = ORDN[ORDN.indexOf(mat) + 1], nyOppnad = nasta && S.klara[mat] === 0;
  S.klara[mat]++; S.stjarnor[mat] = Math.max(S.stjarnor[mat], st);
  S.logg.unshift({ datum:idag(), niva:mat, ratt:Lvl.forsta, fel:Lvl.fel, stjarnor:st });
  S.logg = S.logg.slice(0, 60);
  spara(); iNiva = null;
  fx('tada');
  $('#winStars').innerHTML = [0,1,2].map(k => `<b class="${k < st ? '' : 'off'}"></b>`).join('');
  $('#winLoot').innerHTML = Array.from({ length:RUNDOR }, (_, i) => `<i style="background-image:url(${MAT[mat].tex});animation-delay:${200 + i * 90}ms"></i>`).join('');
  $('#win').classList.add('on');
  Ljud.spela(nyOppnad ? ['vinst-' + mat, 'oppnad-' + nasta] : ['vinst-' + mat]);
  konfetti();
}
function konfetti(){
  const cols = ['#ffd84a','#5aa83a','#d6452b','#3c7fc4','#4fdedb'];
  for (let k = 0; k < 40; k++){
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.background = cols[k % cols.length]; c.style.left = (Math.random() * 100) + 'vw'; c.style.top = '-3vh';
    document.body.appendChild(c);
    c.animate([{ transform:'translateY(0) rotate(0)' }, { transform:`translateY(110vh) rotate(${Math.random() * 720}deg)` }],
      { duration:1600 + Math.random() * 1200, delay:Math.random() * 400, easing:'cubic-bezier(.3,.6,.6,1)' }).onfinish = () => c.remove();
  }
}
$('#winAgain').onclick = () => { $('#win').classList.remove('on'); go(Lvl.mat); };
$('#winBuild').onclick = () => { $('#win').classList.remove('on'); go('bygg'); };

/* ---------------- tiden är slut ---------------- */
function visaSlut(){
  iNiva = null; Ljud.spela('tid-slut');
  $('#slut').classList.add('on');
}
$('#slutBygg').onclick = () => { $('#slut').classList.remove('on'); go('bygg'); };
$('#slutHem').onclick = () => { $('#slut').classList.remove('on'); go('start'); };

/* ---------------- slottet: bygga ---------------- */
let building = false;
function hoppa(el){ el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); }
$('#towerBig').onclick = () => {
  if (building) return;
  const r = placeOne();
  if (!r) return Ljud.spela(slottKlart() ? 'klar-diamant' : 'torn-grav');
  if (typeof r === 'string'){ hoppa($('#heroBygg')); Ljud.spela('klar-' + r); if (slottKlart()) slottFardigt(); }
};
$('#buildAll').onclick = async () => {
  if (building) return; building = true;
  if (!nextMat()) { Ljud.spela(slottKlart() ? 'klar-diamant' : 'torn-grav'); building = false; return; }
  let klarVaning = null, r;
  while ((r = placeOne())){ if (typeof r === 'string') klarVaning = r; await sleep(260); }
  building = false; hoppa($('#heroBygg'));
  Ljud.spela(klarVaning ? ['torn-vaxer', 'klar-' + klarVaning] : 'torn-vaxer');
  if (slottKlart()) slottFardigt();
};
/* Hela slottet klart: konfetti, flaggor (ritas av renderTower) och knappen för ett nytt slott. */
const slottKlart = () => ORDN.every(m => S.built[m] >= TOTAL(m));
function slottFardigt(){ konfetti(); fx('tada'); visaNyttSlott(); }
function visaNyttSlott(){ $('#nyttSlott').style.display = slottKlart() ? 'grid' : 'none'; $('#slottRakning').textContent = S.slott ? '× ' + S.slott : ''; }
$('#nyttSlott').onclick = () => {
  S.slott = (S.slott || 0) + 1; S.built = noll(); spara();
  renderTower($('#towerBig'), STOR_CELL, { next:true }); visaNyttSlott(); renderBags();
  Ljud.spela('torn-tryck');
};

/* ---------------- föräldrakoden ---------------- */
function kodSkarm(rubrik, text, klarFn){
  go('kod');
  $('#kodRubrik').textContent = rubrik; $('#kodText').textContent = text; $('#kodFel').textContent = '';
  let inmat = '';
  const rita = () => [...$('#kodPrickar').children].forEach((p, i) => p.classList.toggle('fylld', i < inmat.length));
  rita();
  $('#kodPad').innerHTML = ['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k =>
    `<button class="${k === '' ? 'tom' : k === '⌫' ? 'sudd' : ''}" data-k="${k}" aria-label="${k === '⌫' ? 'Sudda' : k}">${k}</button>`).join('');
  $('#kodPad').querySelectorAll('button').forEach(b => b.onclick = () => {
    const k = b.dataset.k; $('#kodFel').textContent = '';
    if (k === '⌫') inmat = inmat.slice(0, -1);
    else if (k && inmat.length < 4) inmat += k;
    rita();
    if (inmat.length === 4) setTimeout(() => { const v = inmat; inmat = ''; rita(); klarFn(v, fel => $('#kodFel').textContent = fel); }, 150);
  });
}
function valjKod(klarFn){
  kodSkarm('Välj föräldrakod', 'Fyra siffror. Koden behövs för speltiden och föräldrasidan.', forsta => {
    kodSkarm('Skriv koden igen', 'Så att vi vet att den blev rätt.', (andra, fel) => {
      if (andra !== forsta){ valjKod(klarFn); setTimeout(() => $('#kodFel').textContent = 'Koderna var inte lika. Försök igen.', 0); return; }
      S.pin = andra; spara(); klarFn();
    });
  });
}
$('#kodAvbryt').onclick = () => go('start');
$('#gear').onclick = () => {
  if (!S.pin) return valjKod(visaForalder);
  kodSkarm('Föräldrar', 'Skriv föräldrakoden', (v, fel) => v === S.pin ? visaForalder() : fel('Fel kod'));
};
$('#fBytKod').onclick = () => valjKod(visaForalder);

/* ---------------- föräldravyn ---------------- */
const MAXVAL = [10, 15, 20, 30, 0];
const dagtext = d => { if (d === idag()) return 'I dag'; const [y, m, dd] = d.split('-'); return +dd + '/' + +m; };
const stjarnText = n => '★'.repeat(n) + '☆'.repeat(3 - n);
function visaForalder(){
  go('foralder');
  const t = tidIdag(), spelat = Math.floor(t.sek / 60), kvar = sekKvar();
  $('#fTidKvar').textContent = kvar === Infinity ? 'Ingen gräns' : Math.ceil(kvar / 60) + ' min kvar';
  $('#fTidText').textContent = `Spelat ${spelat} min i dag` + (S.maxtid ? ` av ${S.maxtid + t.extra} min` + (t.extra ? ` (varav ${t.extra} extra)` : '') : '') + '.';
  $('#fMaxtid').innerHTML = MAXVAL.map(m => `<button class="chip ${S.maxtid === m ? 'on' : ''}" data-max="${m}">${m ? m + ' min' : 'Ingen gräns'}</button>`).join('');
  $('#fNivaer').innerHTML = NIVAER.map(m => {
    const sen = S.logg.find(l => l.niva === m);
    return `<tr><td><b>${MAT[m].namn[0].toUpperCase() + MAT[m].namn.slice(1)}</b> · ${MAT[m].steg}${oppen(m) ? '' : ' (låst)'}</td><td>${S.klara[m]} ${S.klara[m] === 1 ? 'gång' : 'gånger'}</td><td>${S.klara[m] ? stjarnText(S.stjarnor[m]) : '–'}</td><td>${sen ? dagtext(sen.datum) : '–'}</td></tr>`;
  }).join('');
  const lista = (mat, rubrik) => {
    const e = Object.entries(S.miss[mat]).sort((a, b) => b[1] - a[1]);
    return `<p class="muted" style="margin:0 0 6px"><b>${rubrik}</b></p>` +
      (e.length ? `<div>${e.map(([b, n]) => `<span class="bokst ${mat === 'diamant' ? 'lang' : ''}">${visaFel(mat, b)}<small>${n}</small></span>`).join('')}</div>` : '<p class="muted">Inget just nu.</p>');
  };
  $('#fSvara').innerHTML = lista('tra', 'Trä: stor och liten bokstav') + lista('sten', 'Sten: första ljudet i ordet') +
    lista('jarn', 'Järn: stavelser') + lista('guld', 'Guld: ord') + lista('diamant', 'Diamant: meningar');
  $('#fSlott').textContent = (S.slott || 0) + ' färdiga slott, ' + ORDN.reduce((a, m) => a + S.built[m], 0) + ' av ' + TORN.length + ' block i det som byggs nu.';
  $('#fLogg').innerHTML = S.logg.length ? S.logg.slice(0, 12).map(l =>
    `<tr><td>${dagtext(l.datum)}</td><td>${MAT[l.niva].namn}</td><td>${l.ratt} av ${RUNDOR}</td><td>${l.fel}</td></tr>`).join('')
    : '<tr><td colspan="4" class="muted">Inga omgångar än.</td></tr>';
}
document.addEventListener('click', e => {
  const x = e.target.closest('[data-extra]'); if (x){ tidIdag().extra += +x.dataset.extra; spara(); visaForalder(); return; }
  const mx = e.target.closest('[data-max]'); if (mx){ S.maxtid = +mx.dataset.max; spara(); visaForalder(); }
});

/* ---------------- navigering ---------------- */
function go(id){
  Ljud.tyst(); iNiva = null; pass++; spara();
  const arNiva = ORDN.includes(id), slut = arNiva && sekKvar() <= 0;
  if (slut) id = 'start';
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  $('#win').classList.remove('on');
  if (id === 'start') renderStart();
  if (ORDN.includes(id)) startaNiva(id);   // id är redan "start" om tiden var slut
  if (id === 'bygg'){
    renderTower($('#towerBig'), STOR_CELL, { next:true });
    Ljud.spela(nextMat() ? 'torn-tryck' : slottKlart() ? 'klar-diamant' : 'torn-grav');
    visaNyttSlott();
  }
  renderBags();
  if (slut) visaSlut();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]'); if (b) { go(b.dataset.go); return; }
  const l = e.target.closest('[data-locked]');
  if (l){
    fx('boop'); l.classList.remove('nej'); void l.offsetWidth; l.classList.add('nej');
    if (!S.klara.tra) Ljud.spela('last');   // "Den är låst. Börja med trä!"
  }
});
ORDN.forEach(m => $(`#${m}Say`).onclick = () => fraga());
$('#hej').onclick = () => { hoppa($('#heroStart')); Ljud.spela('hej'); };
$('#heroStart').onclick = () => $('#hej').click();

renderStart(); renderBags();
