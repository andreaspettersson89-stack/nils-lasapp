// Provkörning av hela appen i en iPad-webbläsare (Playwright, liggande). Kör från en mapp som har playwright, t.ex.:
//   cp test/robot.mjs ../traningsportal/_nils_robot.mjs && cd ../traningsportal && node _nils_robot.mjs "<sökväg till nils-lasapp>" <utmapp>
// Ta bort kopian efteråt. Startar en egen liten webbserver. Skapar också ikon-180.png från ikon.svg.
// Mot sidan på nätet: lägg adressen sist, t.ex. ... <utmapp> https://andreaspettersson89-stack.github.io/nils-lasapp/
import { chromium, devices } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, mapp, ut, live] = process.argv;
const typ = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.mp3':'audio/mpeg', '.json':'application/json' };
const server = http.createServer((q, r) => {
  const f = path.join(mapp, decodeURIComponent(q.url.split('?')[0].split('#')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(mapp) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': typ[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const URL = live || `http://localhost:${server.address().port}/`;
const b = await chromium.launch();
if (!live) { const p = await b.newPage({ viewport: { width: 180, height: 180 } });
  await p.goto(URL + 'ikon.svg'); await p.screenshot({ path: mapp + '/ikon-180.png' }); await p.close(); }

const ctx = await b.newContext({ ...devices['iPad Pro 11 landscape'] });
const p = await ctx.newPage();
const fel = [];
p.on('pageerror', e => fel.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/fonts/.test(m.text())) fel.push(m.text()); });
const ok = (v, t) => { if (!v) { fel.push('MISSLYCKADES: ' + t); console.log('FEL  ' + t); } else console.log('ok   ' + t); };
const S = () => p.evaluate(() => JSON.parse(localStorage.getItem('ljuda-ihop-v1') || 'null'));
const bild = n => p.screenshot({ path: `${ut}/${n}.png` });

async function spelaNiva(niva, felPaRunda = {}) {
  const rad = niva === 'tra' ? '#traRow' : '#stenRow', prog = niva === 'tra' ? '#traProg' : '#stenProg';
  for (let r = 0; r < 6; r++) {
    await p.waitForSelector(`${rad} .block[data-ok]`, { state: 'visible' });
    await p.waitForTimeout(450);
    for (let k = 0; k < (felPaRunda[r] || 0); k++) { await p.click(`${rad} .block:not([data-ok]) >> nth=${k}`, { force: true }); await p.waitForTimeout(300); }
    if (felPaRunda[r] >= 2) ok(await p.$(`${rad} .block.hint[data-ok]`), `${niva}: rätt block lyser efter två fel`);
    if (r === 1) await bild(niva + '-runda');
    await p.click(`${rad} .block[data-ok]`, { force: true });
    if (r < 5) await p.waitForFunction(([s, n]) => document.querySelectorAll(s + ' span.full').length === n, [prog, r + 1], { timeout: 6000 });
  }
  await p.waitForSelector('#win.on', { timeout: 6000 });
}

await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
for (const id of ['hej', 'tra-hitta-å', 'forsta-säl', 'ord-mås']) {
  const st = await p.evaluate(async u => (await fetch(u)).status, 'ljud/' + id + '.mp3');
  ok(st === 200, `ljudfilen ${id}.mp3 går att hämta`);
}
await p.waitForTimeout(500);
await bild('1-start');
ok(await p.$('#path [data-go="tra"]'), 'start: trä går att spela');
ok(await p.$('#path [data-locked="sten"]'), 'start: sten låst från början');
ok(await p.$('#path [data-locked="jarn"]'), 'start: järn låst');

// trä med två fel i första rundan
await p.click('#path [data-go="tra"]', { force: true });
ok((await p.textContent('#traBig')).length === 1, 'trä: stor bokstav på skylten');
await spelaNiva('tra', { 0: 2 });
await bild('2-tra-klar');
ok((await p.$$('#winStars b:not(.off)')).length === 2, 'trä: två fel ger två stjärnor');
let s = await S();
ok(s.bag.tra === 6 && s.klara.tra === 1, 'trä: sex block i ryggsäcken, en klar omgång sparad');
ok(Object.keys(s.miss.tra).length === 1, 'trä: felet sparat som bokstav att öva på');
ok(s.logg[0].ratt === 5 && s.logg[0].fel === 2, 'trä: loggen 5 av 6 rätt på första försöket, 2 fel');

// bygga
await p.click('#winBuild', { force: true }); await p.waitForTimeout(300);
ok(await p.isVisible('#bygg'), 'slottet visas');
await p.click('#buildAll', { force: true }); await p.waitForTimeout(6 * 260 + 900);
s = await S(); ok(s.built.tra === 6 && s.bag.tra === 0, 'slottet: sex träblock byggda');
await bild('3-slottet');
await p.click('#towerBig', { force: true }); await p.waitForTimeout(200);
ok((await S()).built.tra === 6, 'slottet: inget byggs utan block');

// sten nu öppen
await p.click('#bygg [data-go="start"]', { force: true }); await p.waitForTimeout(300);
ok(await p.$('#path [data-go="sten"]'), 'start: sten upplåst efter trä');
await bild('4-start-sten-oppen');
await p.click('#path [data-go="sten"]', { force: true });
await spelaNiva('sten');
ok((await p.$$('#winStars b:not(.off)')).length === 3, 'sten: inga fel ger tre stjärnor');
s = await S(); ok(s.bag.sten === 6 && s.klara.sten === 1, 'sten: sex stenblock sparade');

// hem mitt i en runda: inget firande dyker upp efteråt
await p.click('#winAgain', { force: true }); await p.waitForSelector('#stenRow .block[data-ok]'); await p.waitForTimeout(450);
await p.click('#stenRow .block[data-ok]', { force: true }); await p.waitForTimeout(100);
await p.click('#sten [data-go="start"]', { force: true }); await p.waitForTimeout(3000);
ok(await p.isVisible('#start') && !(await p.isVisible('#win.on')), 'hem mitt i: startsidan står kvar, inget firande');

// sparas över omladdning
await p.reload(); await p.waitForTimeout(400);
s = await S(); ok(s.built.tra === 6 && s.klara.sten === 1, 'omladdning: slott och nivåer finns kvar');
ok((await p.$$('#towerMini .c.full')).length === 6, 'start: lilla slottet visar sex block');

// föräldrakoden
await p.click('#gear', { force: true }); await p.waitForTimeout(200);
ok((await p.textContent('#kodRubrik')).includes('Välj'), 'kod: får välja kod första gången');
const kod = async k => { for (const c of k) await p.click(`#kodPad [data-k="${c}"]`, { force: true }); await p.waitForTimeout(350); };
await kod('1234'); await kod('9999');
ok((await p.textContent('#kodFel')).includes('inte lika'), 'kod: olika koder ger fel');
await kod('1234'); await kod('1234');
ok(await p.isVisible('#foralder'), 'föräldravyn öppnas');
await bild('5-foralder');
ok((await p.textContent('#fNivaer')).includes('1 gång'), 'föräldravyn: nivåerna räknade');
ok((await p.$$('#fLogg tr')).length >= 2, 'föräldravyn: historiken visas');
await p.click('[data-max="10"]', { force: true }); ok((await S()).maxtid === 10, 'föräldravyn: maxtid 10 min sparad');
await p.click('[data-extra="5"]', { force: true }); ok((await S()).tid.extra === 5, 'föräldravyn: +5 min i dag');
await p.click('#foralder [data-go="start"]', { force: true });
await p.click('#gear', { force: true }); await kod('0000');
ok((await p.textContent('#kodFel')).includes('Fel kod'), 'kod: fel kod släpper inte in');
await p.click('#kodAvbryt', { force: true });

// tiden räknas i en nivå och tar slut
const fore = (await S()).tid.sek;
await p.click('#path [data-go="tra"]', { force: true }); await p.waitForTimeout(5600);
await p.click('#tra [data-go="start"]', { force: true });
ok((await S()).tid.sek >= fore + 5, 'tid: sekunderna räknas inne i en nivå');
// (appen sparar sitt eget läge när sidan laddas om, så tiden ändras inne i appen)
await p.evaluate(() => { S.tid.sek = 99999; spara(); });
await p.click('#path [data-go="tra"]', { force: true }); await p.waitForTimeout(400);
ok(await p.isVisible('#slut.on') && await p.isVisible('#start'), 'tid slut: rutan visas, ingen nivå startar');
await bild('6-tid-slut');
await p.click('#slutBygg', { force: true }); await p.waitForTimeout(300);
ok(await p.isVisible('#bygg'), 'tid slut: slottet går ändå att öppna');

// stående
await p.setViewportSize({ width: 834, height: 1194 }); await p.waitForTimeout(200);
ok(await p.isVisible('.turn'), 'stående: "Vänd paddan" visas');

await b.close(); server.close();
console.log(fel.length ? `\n${fel.length} FEL:\n` + fel.join('\n') : '\nInga fel.');
process.exit(fel.length ? 1 : 0);
