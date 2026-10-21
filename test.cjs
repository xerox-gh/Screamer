// Dependency-free simulation checks. Run: node test.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const noop = () => {};
const context2d = new Proxy({}, { get: (target, key) => target[key] || noop, set: (target, key, value) => (target[key] = value, true) });
const nodes = new Map();
function node(selector) {
  if (!nodes.has(selector)) nodes.set(selector, { innerHTML: '', textContent: '', style: {}, dataset: {}, addEventListener: noop, focus: noop, getContext: () => context2d, setPointerCapture: noop, getBoundingClientRect: () => ({left:0,top:0,width:1100,height:690}) });
  return nodes.get(selector);
}
const storage = new Map();
const context = vm.createContext({ console, Math, JSON, Set, Blob, URL, performance, setTimeout: noop, clearTimeout: noop, requestAnimationFrame: () => 1, cancelAnimationFrame: noop, localStorage: { getItem:k=>storage.get(k), setItem:(k,v)=>storage.set(k,v) }, document: {querySelector:node,querySelectorAll:()=>[],addEventListener:noop}, window:{addEventListener:noop} });
vm.runInContext(code, context);
function run(s) { return vm.runInContext(s, context); }
assert.equal(run('valid(state)'), true);
assert.equal(run('schedule().length'), 14);
assert.equal(run('schedule().every(w=>new Set(w.flat()).size===8)'), true);
assert.equal(run('schedule().flat().filter(p=>p.includes(0)).length'), 14);
for (const shape of ['4-3-3','4-4-2','3-5-2']) assert.equal(run(`positions('${shape}',0).length`), 11);
for (const view of ['home','squad','formation','office','market','league','help','preview']) run(`go('${view}')`);
run('state.coins=10000;market();buy(0)');
assert.equal(run('state.squad.length'), 11);
run('start();game.dead=0;game.owner=-1;game.cooldown=1;game.ball={x:998,y:310,z:0,vx:500,vy:0,vz:0};update(.02)');
assert.equal(run('game.score[0]'), 1, 'Shot crossing between posts scores');
run('game.dead=0;game.owner=-1;game.cooldown=1;game.ball={x:998,y:310,z:90,vx:500,vy:0,vz:0};update(.02)');
assert.equal(run('game.score[0]'), 1, 'Over-bar shot does not score');
run('game.dead=0;game.owner=-1;game.cooldown=1;game.ball={x:998,y:120,z:0,vx:500,vy:0,vz:0};update(.02)');
assert.equal(run('game.score[0]'), 1, 'Wide shot does not score');
run('pause();globalThis.pausedAt=game.clock;update(1)');
assert.equal(run('game.clock===pausedAt'), true);
run('pause();game.dead=0;game.owner=8;game.selected=8;autoShoot()');
assert.equal(run('game.owner'), -1);
run('for(let i=0;i<6000&&!game.over;i++){update(1/60);if(i%60===0)draw()}');
assert.equal(run('game.over'), true);
assert.equal(run('state.week'), 1);
assert.equal(run('state.table.every(t=>t.p===1)'), true);
assert.equal(run('game.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))'), true);
assert.equal(run('valid(JSON.parse(localStorage.getItem(KEY)))'), true);
run('globalThis.weekBefore=state.week;finish()');
assert.equal(run('state.week===weekBefore'), true, 'Full-time rewards cannot duplicate');
// Finish the season, verify all fixtures and the next-season transition.
run('for(let w=1;w<14;w++){start();game.score=[2,1];finish()}');
assert.equal(run('state.table.every(t=>t.p===14)'), true);
run('game=null;screen="home";nextSeason()');
assert.equal(run('state.season'), 2);
assert.equal(run('state.week'), 0);
assert.equal(run('state.table.every(t=>t.p===0)'), true);
assert.equal(run('valid({...state,coins:-1})'), false);
assert.equal(run('valid({...state,club:null})'), false);
console.log('PASS: screens, formations, fixtures, transfers, scoring, misses, pause, shooting, 90-second simulation, save validation, season rollover.');
