/* Gerçek uygulama betiklerini DOM ortamında çalıştırır; tarayıcı görsel testi değildir. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let passed = 0;

function setup({ systemDark = false, preference = null, storageBlocked = false } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(read('index.html'), { url: 'https://pong.test/', runScripts: 'outside-only', virtualConsole });
  const win = dom.window;
  const doc = win.document;
  const $ = id => doc.getElementById(id);
  const drawCalls = [];
  const ctx = new Proxy({}, { get(target, key) { return target[key] ?? ((...args) => { drawCalls.push([key, ...args]); }); } });
  win.HTMLCanvasElement.prototype.getContext = () => ctx;
  const media = new Map();
  win.matchMedia = query => {
    if (!media.has(query)) media.set(query, { matches: query.includes('color-scheme') && systemDark, addEventListener() {} });
    return media.get(query);
  };
  win.Math.random = () => 0.5;
  if (preference) win.localStorage.setItem('pong-atolyesi-theme', preference);
  if (storageBlocked) Object.defineProperty(win, 'localStorage', { get() { throw new Error('Storage blocked'); } });
  let callback;
  let time = 0;
  let engine;
  win.requestAnimationFrame = next => { callback = next; return 1; };
  win.cancelAnimationFrame = () => { callback = null; };
  win.eval(read('js/theme.js'));
  win.eval(read('js/engine.js'));
  const Engine = win.Pong.Engine;
  win.Pong.Engine = class extends Engine { constructor(...args) { super(...args); engine = this; } };
  win.eval(read('js/app.js'));
  doc.dispatchEvent(new win.Event('DOMContentLoaded'));
  function tick(milliseconds = 1000 / 60) {
    time += milliseconds;
    const next = callback; callback = null;
    assert.ok(next, 'Animasyon döngüsü çalışıyor olmalı'); next(time);
    assert.equal(errors.length, 0, errors[0]?.message);
  }
  function advance(seconds) { for (let i = 0; i < seconds * 60; i++) tick(); }
  function change(id, checked) { $(id).checked = checked; $(id).dispatchEvent(new win.Event('change', { bubbles: true })); }
  function key(code, type = 'keydown') { $('game-canvas').dispatchEvent(new win.KeyboardEvent(type, { code, bubbles: true, cancelable: true })); }
  tick();
  return { dom, win, doc, $, engine, tick, advance, change, key, drawCalls };
}

function test(name, fn, options) {
  const app = setup(options);
  try { fn(app); passed++; console.log('PASS ' + name); }
  finally { app.dom.window.close(); }
}

test('Tema varsayılan olarak sistem tercihini kullanır ve seçim kaydedilir', ({ $, doc, win }) => {
  assert.equal(doc.documentElement.dataset.theme, 'dark'); assert.equal($('theme-button').getAttribute('aria-pressed'), 'true');
  $('theme-button').click(); assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(win.localStorage.getItem('pong-atolyesi-theme'), 'light'); assert.equal($('theme-label').textContent, 'Koyu tema');
}, { systemDark: true });
test('Kaydedilmiş açık tema sistemin koyu tercihinin önüne geçer', ({ doc }) => {
  assert.equal(doc.documentElement.dataset.theme, 'light');
}, { systemDark: true, preference: 'light' });
test('Depolama engellense de tema düğmesi ve oyun başlatma çalışır', ({ $, doc, engine }) => {
  $('theme-button').click(); assert.equal(doc.documentElement.dataset.theme, 'dark');
  $('overlay-button').click(); assert.equal(engine.state, 'countdown');
}, { storageBlocked: true });
test('Altı gücün simgesi ve açıklaması arayüzde oluşturulur', ({ $ }) => {
  assert.equal($('power-legend').children.length, 6); assert.match($('power-legend').textContent, /Çoklu top/);
});
test('Klasik mod tercihi motora aktarılır ve maç sırasında kilitlenir', ({ $, change, engine, tick }) => {
  change('powerups-toggle', false); $('overlay-button').click(); tick();
  assert.equal(engine.config.powerups, false); assert.equal($('powerups-toggle').disabled, true);
  assert.match($('power-mode-label').textContent, /KLASİK/);
});
test('Top teması bildirim ve hedef oyuncunun süreli etki göstergesini oluşturur', ({ $, engine, advance, tick }) => {
  $('overlay-button').click(); advance(2.6); engine.ball.lastHit = 1;
  engine.pickups.push({ type: 'grow', x: engine.ball.x, y: engine.ball.y, remaining: 12 }); tick();
  assert.ok(engine.right.height > 96); assert.match($('active-effects').textContent, /BİLGİSAYAR.*Büyük raket.*8 sn/);
  assert.equal($('power-toast').hidden, false); assert.match($('power-toast').textContent, /BİLGİSAYAR.*Raketi büyüt/);
});
test('Duraklatma etki süresini dondurur ve devamda klavye odağı geri gelir', ({ $, doc, engine, advance, tick }) => {
  $('overlay-button').click(); advance(2.6); engine.activatePower('haste', 0); tick();
  $('pause-button').click(); const remaining = engine.effects[0].remaining; advance(2);
  assert.equal(engine.effects[0].remaining, remaining); assert.equal(engine.state, 'paused');
  $('overlay-button').click(); tick(); assert.equal(engine.state, 'playing'); assert.ok(engine.effects[0].remaining < remaining);
  assert.equal(doc.activeElement.id, 'game-canvas');
});
test('Yeni maçtan vazgeçme skoru korur, onaylama topları ve etkileri sıfırlar', ({ $, engine, advance, tick }) => {
  $('overlay-button').click(); advance(2.6); engine.score = [2, 1]; engine.activatePower('multiball', 0); engine.activatePower('grow', 0);
  $('restart-button').click(); tick(); assert.match($('overlay-title').textContent, /sıfırlansın/);
  $('pause-button').click(); assert.equal(engine.score.join(':'), '2:1');
  $('restart-button').click(); $('overlay-button').click(); tick();
  assert.equal(engine.state, 'ready'); assert.equal(engine.score.join(':'), '0:0'); assert.equal(engine.balls.length, 1);
  assert.equal(engine.effects.length, 0); assert.equal($('active-effects').children.length, 0); assert.equal($('powerups-toggle').disabled, false);
});
test('İki oyunculu arayüz ayrı tuşları bağımsız raketlere yönlendirir', ({ $, doc, engine, key, tick }) => {
  const radio = doc.querySelector('input[value="multi"]'); radio.checked = true;
  radio.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
  $('overlay-button').click(); engine.state = 'playing'; const y = engine.left.y;
  key('KeyW'); key('ArrowDown'); tick(); key('KeyW', 'keyup'); key('ArrowDown', 'keyup');
  assert.ok(engine.left.y < y); assert.ok(engine.right.y > y); assert.equal($('right-key-guide').hidden, false);
});
test('Tema değişimi sırasında maç skoru ve etkiler korunur', ({ $, engine, advance, tick, doc }) => {
  $('overlay-button').click(); advance(2.6); engine.score = [1, 2]; engine.activatePower('slow', 0);
  const remaining = engine.effects[0].remaining; $('theme-button').click();
  assert.equal(engine.score.join(':'), '1:2'); assert.equal(engine.effects[0].remaining, remaining);
  assert.equal(doc.activeElement.id, 'game-canvas'); tick();
});
test('Çoklu toplar ve bütün güç simgeleri çizim yolunda hata üretmez', ({ $, win, engine, advance, tick, drawCalls }) => {
  $('overlay-button').click(); advance(2.6); engine.activatePower('multiball', 0);
  engine.pickups = Object.keys(win.Pong.POWERUPS)
    .map((type, i) => ({ type, x: 180 + i * 100, y: 450, remaining: 12 }));
  tick(); assert.equal(engine.balls.length, 3); assert.match($('active-effects').textContent, /Çoklu top/);
  assert.ok(drawCalls.some(call => call[0] === 'fillText' && call[1] === '×3'));
});
console.log(`${passed} UI tests passed.`);
