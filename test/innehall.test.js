// Kollar att varje ljud appen kan spela finns som fil i ljud/. Kör: node test/innehall.test.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const rot = path.join(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(rot, 'ord.js'), 'utf8') + ';this.TRA_BOKSTAVER=TRA_BOKSTAVER;this.STEN_ORD=STEN_ORD;this.BEROM=BEROM;this.STAVELSER=STAVELSER;this.GULD_ORD=GULD_ORD;this.MENINGAR=MENINGAR;', ctx);
const app = fs.readFileSync(path.join(rot, 'app.js'), 'utf8');
const ids = new Set();
ctx.TRA_BOKSTAVER.forEach(b => ids.add('tra-hitta-' + b));
ctx.STEN_ORD.forEach(o => { ids.add('forsta-' + o); ids.add('ord-' + o); });
ctx.BEROM.forEach(b => ids.add(b));
ctx.STAVELSER.forEach(x => ids.add('stav-' + x));
ctx.GULD_ORD.forEach(x => ids.add('ord-' + x));
ctx.MENINGAR.forEach(([id]) => ids.add(id));
// fasta id:n i app.js: allt inom '' som ser ut som ett ljud-id och används med Ljud.spela
for (const m of app.matchAll(/'((?:intro|vinst|klar|oppnad|torn|fel|hjalp|tid|ratt)-[a-zåäö0-9-]+|hej|last)'/g)) ids.add(m[1]);
['tra', 'sten', 'jarn', 'guld', 'diamant'].forEach(m => { ids.add('intro-' + m); ids.add('vinst-' + m); ids.add('klar-' + m); });
['sten', 'jarn', 'guld', 'diamant'].forEach(m => ids.add('oppnad-' + m));
let fel = 0;
for (const id of ids) if (!fs.existsSync(path.join(rot, 'ljud', id + '.mp3'))) { console.log('SAKNAS ljud/' + id + '.mp3'); fel++; }
// järn behöver för varje stavelse en med samma första bokstav och en med samma vokal
for (const x of ctx.STAVELSER) {
  if (!ctx.STAVELSER.some(s => s[0] === x[0] && s !== x) || !ctx.STAVELSER.some(s => s.slice(1) === x.slice(1) && s !== x)) { console.log('Järn: ingen granne till ' + x); fel++; }
}
if (new Set(ctx.MENINGAR.map(m => m[1])).size !== ctx.MENINGAR.length) { console.log('Två meningar är likadana'); fel++; }
const forsta = new Set(ctx.STEN_ORD.map(o => o[0]));
if (ctx.STEN_ORD.length < 12) { console.log('För få ord i STEN_ORD'); fel++; }
if (forsta.size < 3) { console.log('Sten behöver minst 3 olika första bokstäver'); fel++; }
console.log(fel ? `${fel} fel` : `ok: ${ids.size} ljud finns`);
process.exit(fel ? 1 : 0);
