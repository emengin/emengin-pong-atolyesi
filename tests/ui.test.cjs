/* Gerçek uygulama betiklerini DOM ortamında çalıştırır; tarayıcı görsel testi değildir. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let passed = 0;
const cases = [];
const settle = () => new Promise(resolve => setImmediate(resolve));

function setup({ systemDark = false, preference = null, storageBlocked = false, coarse = false, portrait = false, fullscreen = 'unsupported' } = {}) {
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
    if (!media.has(query)) media.set(query, { matches: (query.includes('color-scheme') && systemDark) || (query.includes('coarse') && coarse) || (query.includes('orientation: portrait') && portrait), addEventListener(type, fn) { this.listener = fn; } });
    return media.get(query);
  };
  win.Math.random = () => 0.5;
  win.Element.prototype.setPointerCapture = () => {};
  $('game-canvas').getBoundingClientRect = () => ({ left: 0, top: 0, width: 960, height: 560 });
  $('court-stage').getBoundingClientRect = () => ({ left: 0, top: 0, width: 900, height: 500 });
  if (fullscreen === 'native') {
    $('arena-panel').requestFullscreen = async () => { doc.fullscreenElement = $('arena-panel'); doc.dispatchEvent(new win.Event('fullscreenchange')); };
    doc.exitFullscreen = async () => { doc.fullscreenElement = null; doc.dispatchEvent(new win.Event('fullscreenchange')); };
  } else if (fullscreen === 'denied') {
    $('arena-panel').requestFullscreen = async () => { throw new Error('Fullscreen denied'); };
  }
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
  win.eval(read('js/display.js'));
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
  function pointer(element, type, pointerId, x, y) {
    const event = new win.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
    Object.defineProperty(event, 'pointerId', { value: pointerId }); element.dispatchEvent(event);
  }
  tick();
  return { dom, win, doc, $, engine, tick, advance, change, key, pointer, media, drawCalls, errors };
}

function test(name, fn, options) {
  cases.push({ name, fn, options });
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
test('İmkânsız seçimi motora ve maç başlığına aktarılır', ({ $, doc, engine }) => {
  const radio = doc.querySelector('input[value="impossible"]'); radio.checked = true;
  radio.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
  assert.match($('difficulty-note').textContent, /Sekmeleri/);
  $('overlay-button').click(); assert.equal(engine.config.difficulty, 'impossible');
  assert.match($('match-label').textContent, /İMKÂNSIZ/);
});
test('Destek olmayan tarayıcıda geniş görünüm açılır ve Esc ile kapanır', ({ $, doc, win }) => {
  $('fullscreen-button').click(); assert.equal($('fullscreen-button').getAttribute('aria-pressed'), 'true');
  assert.ok($('arena-panel').classList.contains('is-expanded')); assert.equal(doc.querySelector('.settings-panel').inert, true);
  $('fullscreen-button').dispatchEvent(new win.KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }));
  assert.equal($('fullscreen-button').getAttribute('aria-pressed'), 'false');
  assert.ok(!doc.querySelector('.settings-panel').inert); assert.equal($('court').style.width, '');
});
test('Tam ekran geçişinde skor korunur ve oyun güvenle duraklatılır', ({ $, engine, advance, tick }) => {
  $('overlay-button').click(); advance(2.6); engine.score = [2, 1]; engine.activatePower('grow', 0);
  const remaining = engine.effects[0].remaining; $('fullscreen-button').click(); tick();
  assert.equal(engine.state, 'paused'); assert.equal(engine.score.join(':'), '2:1'); assert.equal(engine.effects[0].remaining, remaining);
  $('overlay-button').click(); tick(); assert.equal(engine.state, 'playing');
});
test('Mobil dikey geniş görünüm saha boyunu pencereye sığdırır', ({ $, win }) => {
  $('court-stage').getBoundingClientRect = () => ({ width: 350, height: 500 }); $('fullscreen-button').click();
  assert.equal($('court').style.width, '350px'); assert.ok(parseFloat($('court').style.height) <= 500);
  $('court-stage').getBoundingClientRect = () => ({ width: 700, height: 200 });
  win.dispatchEvent(new win.Event('resize')); assert.ok(parseFloat($('court').style.height) <= 200);
}, { coarse: true, portrait: true });
test('Mobil ekran yönü değişince basılı girdiler temizlenir ve oyun duraklar', ({ $, engine, advance, key, media, tick }) => {
  $('overlay-button').click(); advance(2.6); key('KeyW');
  const orientation = media.get('(orientation: portrait)'); orientation.matches = false; orientation.listener();
  assert.equal(engine.state, 'paused'); const y = engine.left.y;
  $('overlay-button').click(); tick(); assert.equal(engine.left.y, y);
}, { coarse: true, portrait: true });
test('İki parmak aynı anda iki ayrı raketi kontrol edebilir; bırakınca hareket durur', ({ $, doc, engine, pointer, tick }) => {
  const radio = doc.querySelector('input[value="multi"]'); radio.checked = true;
  radio.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
  $('overlay-button').click(); engine.state = 'playing'; const y = engine.left.y;
  pointer($('game-canvas'), 'pointerdown', 1, 100, 30); pointer($('game-canvas'), 'pointerdown', 2, 800, 530); tick();
  assert.ok(engine.left.y < y); assert.ok(engine.right.y > y);
  pointer($('game-canvas'), 'pointercancel', 1, 100, 30); pointer($('game-canvas'), 'pointerup', 2, 800, 530);
  const left = engine.left.y, right = engine.right.y; tick();
  assert.equal(engine.left.y, left); assert.equal(engine.right.y, right);
}, { coarse: true });
test('Dokunmatik ok basılı tutulur, pointercancel ile takılmadan durur', ({ $, doc, engine, pointer, tick }) => {
  $('overlay-button').click(); engine.state = 'playing';
  const up = doc.querySelector('.touch-controls button[data-side="left"][data-direction="-1"]'); const y = engine.left.y;
  pointer(up, 'pointerdown', 3, 0, 0); tick(); assert.ok(engine.left.y < y);
  pointer(up, 'pointercancel', 3, 0, 0); const stopped = engine.left.y; tick(); assert.equal(engine.left.y, stopped);
}, { coarse: true });
test('Native tam ekran açılır, dışarıdan çıkışta görünüm ve odak düzelir', async ({ $, doc, win }) => {
  $('fullscreen-button').click(); await settle();
  assert.equal(doc.fullscreenElement, $('arena-panel')); assert.equal($('fullscreen-label').textContent, 'Küçült');
  assert.equal($('fullscreen-button').disabled, false);
  doc.fullscreenElement = null; doc.dispatchEvent(new win.Event('fullscreenchange'));
  assert.equal($('fullscreen-button').getAttribute('aria-pressed'), 'false');
  assert.equal(doc.activeElement.id, 'fullscreen-button');
}, { fullscreen: 'native' });
test('Native tam ekranda aynı düğmeyle güvenli çıkış yapılır', async ({ $, doc }) => {
  $('fullscreen-button').click(); await settle();
  $('fullscreen-button').click(); await settle();
  assert.equal(doc.fullscreenElement, null); assert.ok(!$('arena-panel').classList.contains('is-expanded'));
}, { fullscreen: 'native' });
test('Tarayıcı tam ekran isteğini reddederse oyun geniş görünümde açılır', async ({ $, doc }) => {
  $('fullscreen-button').click(); await settle();
  assert.ok($('arena-panel').classList.contains('is-expanded')); assert.ok(!doc.fullscreenElement);
  assert.equal($('fullscreen-button').disabled, false);
  $('fullscreen-button').click(); await settle(); assert.ok(!$('arena-panel').classList.contains('is-expanded'));
}, { fullscreen: 'denied' });

(async () => {
  for (const { name, fn, options } of cases) {
    const app = setup(options);
    try { await fn(app); assert.equal(app.errors.length, 0, app.errors[0]?.message); passed++; console.log('PASS ' + name); }
    finally { app.dom.window.close(); }
  }
  console.log(`${passed} UI tests passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
