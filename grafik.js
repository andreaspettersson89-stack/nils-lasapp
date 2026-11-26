/* Ljuda ihop – grafiken. Allt ritas av koden som små pixelbilder (inga bildfiler). Från skiss 1. */
'use strict';
/* ---------------- pixeltexturer ---------------- */
function rng(seed){ return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; }
const pick = (r, a) => a[Math.floor(r() * a.length)];
function canvasTex(n, seed, fn){
  const c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d'); const r = rng(seed);
  const p = (i, j, col) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
  fn(p, r, n, x); return c.toDataURL();
}
function noise(cols, seed){ return canvasTex(16, seed, (p, r) => { for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, cols)); }); }
function bevelBlock(base, light, dark, extra, seed){
  return canvasTex(16, seed, (p, r) => {
    for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, base));
    for (let i=0;i<16;i++){ p(i,0,light); p(0,i,light); p(i,15,dark); p(15,i,dark); }
    for (let i=1;i<15;i++){ p(i,1,light); p(1,i,light); p(i,14,dark); p(14,i,dark); }
    extra && extra(p, r);
  });
}
const T = {};
T.plank = canvasTex(16, 3, (p, r) => {
  const cols = ['#b8864b','#ad7c42','#c08f54','#b38147'];
  for (let j=0;j<16;j++) for (let i=0;i<16;i++) p(i, j, pick(r, cols));
  for (let row=0; row<4; row++){
    const y = row*4+3; for (let i=0;i<16;i++) p(i, y, '#7d5628');
    const sx = row % 2 ? 4 : 11; for (let k=0;k<3;k++) p(sx, row*4+k, '#8a6130');
    for (let k=0;k<3;k++){ const gx = Math.floor(r()*16), gy = row*4 + Math.floor(r()*3); p(gx, gy, '#9c6e37'); }
  }
});
T.stone = canvasTex(16, 11, (p, r) => {
  for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, ['#8c8c8c','#828282','#979797','#8a8a8a','#9e9e9e']));
  [[2,3],[3,3],[4,4],[10,2],[11,3],[11,4],[6,10],[7,10],[7,11],[13,12],[12,13],[2,13],[3,12]].forEach(([i,j]) => p(i, j, '#6a6a6a'));
});
T.cave = canvasTex(16, 21, (p, r) => {
  for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, ['#4a4a4f','#444449','#505056','#3f3f44']));
  [[3,4],[4,4],[5,5],[11,9],[12,10],[7,13],[8,13]].forEach(([i,j]) => p(i, j, '#323236'));
});
T.deep = noise(['#3a3a3f','#34343a','#404046'], 31);
T.stonefloor = canvasTex(16, 41, (p, r) => {
  for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, j < 3 ? ['#9a9a9a','#a4a4a4','#8e8e8e'] : ['#6a6a70','#626268','#707076']));
});
T.dirt = noise(['#8a5a35','#7d4f2d','#9a6940','#734828','#86562f'], 5);
T.grass = canvasTex(16, 7, (p, r) => {
  for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, ['#8a5a35','#7d4f2d','#9a6940','#734828']));
  for (let i=0;i<16;i++){ const h = 3 + Math.floor(r()*3); for (let j=0;j<h;j++) p(i, j, pick(r, ['#5aa83a','#4e9b31','#69b947','#5fae3e'])); }
});
T.leaves = canvasTex(16, 13, (p, r) => { for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, pick(r, ['#3e8a2c','#357a25','#4a9a36','#2f6e21','#44923a'])); });
T.log = canvasTex(16, 17, (p, r) => { for (let i=0;i<16;i++) for (let j=0;j<16;j++) p(i, j, (i % 4 === 0) ? '#4f3520' : pick(r, ['#6b4a2b','#5f4126','#74522f'])); });
T.iron  = bevelBlock(['#d4d4d4','#cbcbcb','#dcdcdc'], '#f4f4f4', '#9a9a9a', p => { [[4,4],[11,4],[4,11],[11,11]].forEach(([i,j]) => { p(i,j,'#8a8a8a'); p(i+1,j,'#b0b0b0'); }); }, 51);
T.gold  = bevelBlock(['#f2c12e','#e9b421','#f7cd45'], '#fff1a3', '#b4850d', p => { for (let k=0;k<5;k++){ p(4+k, 3+k, '#fff6c6'); p(5+k, 3+k, '#ffe680'); } }, 61);
T.diamant = bevelBlock(['#4fdedb','#3fcfcd','#69e9e6'], '#d6fffd', '#1f9a9a', p => { for (let k=2;k<14;k++){ p(k, k, '#a8f7f5'); p(15-k, k, '#2fbaba'); } p(7,7,'#ffffff'); p(8,8,'#ffffff'); }, 71);
T.crack = canvasTex(16, 0, p => {
  [[8,2],[8,3],[7,4],[7,5],[8,6],[9,7],[9,8],[8,9],[10,9],[11,10],[6,7],[5,8],[4,8],[8,10],[7,11],[7,12],[12,11],[13,12],[3,9]].forEach(([i,j]) => p(i, j, 'rgba(30,20,10,.85)'));
});
T.lock = canvasTex(10, 0, p => {
  const m = ['..####....','.#....#...','.#....#...','########..','#..##..#..','#..##..#..','#...#..#..','########..'];
  m.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') p(i, j + 1, '#2b2a26'); }));
  for (let i=1;i<7;i++) for (let j=5;j<8;j++) if (!['4,5','4,6','3,5','3,6','4,7'].includes(i+','+j)) p(i, j, '#f2c12e');
});
T.cloud = canvasTex(12, 0, p => {
  ['...####.....','..######.##.','.###########','############'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') p(i, j, j === 3 ? '#e6f3fb' : '#ffffff'); }));
});
T.arrow = canvasTex(7, 0, p => {
  ['..###..','..###..','..###..','#######','.#####.','..###..','...#...'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') p(i, j, '#ffd84a'); }));
});
T.sack = canvasTex(12, 0, p => {
  const m = ['....dddd....','...d....d...','..cccccccc..','.bbbbbbbbbb.','bbbbbbbbbbbb','bbbbllllbbbb','bbbbl..lbbbb','bbbbllllbbbb','bbbbbbbbbbbb','bbbbbbbbbbbb','.bbbbbbbbbb.','..dddddddd..'];
  const c = { d:'#5e3b1d', c:'#c99a5b', b:'#9a6a35', l:'#e8c06a', '.':null };
  m.forEach((row, j) => [...row].forEach((ch, i) => { if (c[ch]) p(i, j, c[ch]); }));
});
/* Egen figur (12x16): gruvhjälm med lampa, röd overall. */
T.hero = (() => {
  /* Åsk-Monstret (namnet valt av Nils 26/11): eget grönt blockmonster med åskhjälm och blixt. Medvetet INTE en creeper: vita ögon med pupiller,
     glad mun med tänder, armar och korta ben. */
  const c = document.createElement('canvas'); c.width = 14; c.height = 16; const x = c.getContext('2d');
  const m = [
    '.....HHHH.....',
    '....HHHYHH....',
    '...HHHYYHHH...',
    '..hhhhYhhhhh..',
    '.GGGGGlGGGGGG.',
    '.GWWWGGGGWWWG.',
    '.GWEWGGlGWEWG.',
    '.GWWWGGGGWWWG.',
    '.GGGGGGGGGlGG.',
    'GGGMMMMMMMMGGG',
    'GGGMTMMMMTMGGG',
    'G.GGMMMMMMGG.G',
    '.gGGlGGGGGGlg.',
    '.gggggggggggg.',
    '..KKK....KKK..',
    '..KKK....KKK..'];
  const col = { H:'#45506e', h:'#2c3550', Y:'#ffe14d', G:'#5cc23a', l:'#8be06a', g:'#3f8f26', W:'#ffffff', E:'#2b2a26', M:'#8c2f22', T:'#ffffff', K:'#2f6e1f' };
  m.forEach((row, j) => [...row].forEach((ch, i) => { if (col[ch]) { x.fillStyle = col[ch]; x.fillRect(i, j, 1, 1); } }));
  return c.toDataURL();
})();
