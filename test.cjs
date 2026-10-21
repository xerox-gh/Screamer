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
// Seeded randomness makes AI and transfer failures reproducible.
let seed = 48271;
const seededMath = Object.create(Math);
seededMath.random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
const context = vm.createContext({ console, Math: seededMath, JSON, Set, Map, Blob, URL, performance, setTimeout: noop, clearTimeout: noop, requestAnimationFrame: () => 1, cancelAnimationFrame: noop, localStorage: { getItem:k=>storage.get(k), setItem:(k,v)=>storage.set(k,v) }, document: {querySelector:node,querySelectorAll:()=>[],addEventListener:noop}, window:{addEventListener:noop} });
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
run('for(let i=0;i<20000&&!game.over;i++){update(1/60);if(i%60===0)draw()}');
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
// Camera transforms must preserve pointer targeting at every zoom/position.
run('start();game.dead=0');
for (const [x, y] of [[20,20],[500,310],[980,600]]) {
  assert.equal(run(`dist(screenToPitch(viewPoint(project(${x},${y}))),{x:${x},y:${y}})<1e-8`), true);
}
// The market stays empty after all players are purchased until the next matchday.
run('state.market=[];state.marketWeek=state.season+":"+state.week;market()');
assert.equal(run('state.market.length'), 0);
// Take players out of the path, then test ball events without AI interference.
function isolate() {
  run('game.replay=null;game.dead=0;game.owner=-1;game.cooldown=0;game.players.forEach(p=>{p.x=500;p.y=15;p.dive=0});game.lastKicker=8;game.lastKickTime=-1;game.passFrom=-1;game.shotTeam=null;game.buffer=[]');
}
isolate();
run('game.lastTeam=1;game.ball={x:998,y:190,z:0,vx:500,vy:0,vz:0};stepBall(.02)');
assert.equal(run('game.restart'), 'CORNER', 'Defender touch over own goal line gives a corner');
assert.equal(run('game.players[game.owner].team'), 0);
isolate();
run('game.lastTeam=0;game.ball={x:998,y:190,z:0,vx:500,vy:0,vz:0};stepBall(.02)');
assert.equal(run('game.restart'), 'GOAL KICK', 'Attacking touch over goal line gives a goal kick');
isolate();
run('game.ball={x:998,y:235,z:0,vx:500,vy:0,vz:0};stepBall(.02)');
assert.equal(run('game.ball.vx<0'), true, 'Post rebounds toward the field');
assert.equal(run('game.score[0]'), 0);
isolate();
run('game.players[11].x=960;game.players[11].y=310;game.shotTeam=0;game.ball={x:940,y:310,z:0,vx:500,vy:0,vz:0};stepBall(.06)');
assert.equal(run('game.owner'), 11, 'Keeper catches a swept shot that passes through his position');
assert.equal(run('game.stats.saves[1]'), 1);
isolate();
run('game.ball={x:300,y:90,z:0,vx:500,vy:0,vz:0,curl:.65};stepBall(.1)');
assert.equal(run('game.ball.vy>0'), true, 'Curl bends the trajectory');
// A deliberate tackle changes possession; mere proximity does not.
isolate();
run('game.owner=19;game.selected=8;game.players[19].x=600;game.players[19].y=300;game.players[8].x=580;game.players[8].y=300;game.players[8].tackle=0;game.players[8].stunned=0;tackle()');
assert.equal(run('game.owner'), 8);
assert.equal(run('game.players[19].stunned>0'), true);
assert.equal(run('game.stats.tackles[0]'), 1);
// A completed pass only increments once even if possession is sampled again.
run('game.dead=0;game.owner=8;game.players[8].x=550;game.players[6].x=700;game.players[6].y=300;passTo(game.players[6],true)');
assert.equal(run('game.passTarget'), 6);
run('takeBall(6);takeBall(6)');
assert.equal(run('game.stats.complete[0]'), 1);
// The computer can shoot during its protected first touch, before defenders
// earlier in the update order get a chance to steal the ball.
isolate();
run('game.owner=20;game.cooldown=.2;game.players[20].x=210;game.players[20].y=310;game.players[20].think=0;playerAI(game.players[20],20,.01,game.players[20],[[],[]])');
assert.equal(run('game.stats.shots[1]'), 1);
assert.equal(run('game.owner'), -1);
// Replays do not advance the clock or award goals more than once.
run('game.buffer=Array.from({length:10},()=>({players:game.players.map(p=>({...p})),ball:{...game.ball},camera:{...game.camera}}));game.clock=10;scoreGoal(0);globalThis.replayClock=game.clock;update(.5);draw()');
assert.equal(run('game.clock'), 10);
assert.equal(run('game.score[0]'), 1);
run('skipReplay();update(.6);update(.01)');
assert.equal(run('game.replay'), null);
assert.equal(run('game.owner>=0'), true);
assert.equal(run('game.score[0]'), 1);
// A malformed import is rejected, while first-release saves still load.
run('globalThis.legacy=fresh();delete legacy.options;delete legacy.marketWeek');
assert.equal(run('valid(legacy)'), true);
assert.equal(run('valid({...legacy,squad:[null,...legacy.squad.slice(1)]})'), false);
assert.equal(run('valid({...legacy,schedule:Array(14).fill([[0,0],[2,3],[4,5],[6,7]])})'), false);
assert.equal(run('valid({...legacy,options:{difficulty:"impossible"}})'), false);
assert.equal(run('valid({...legacy,squad:legacy.squad.map((p,i)=>i?p:{...p,goals:"<img>"})})'), false);
console.log('PASS: full match and season, transfers, saves, controls, camera mapping, keeper saves, corners, posts, curl, tackling, passing, replay and legacy-save compatibility.');
