/* İsteğe bağlı geliştirici testi: Node.js varsa `node tests/engine.test.cjs`. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const box = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/engine.js'), 'utf8'), box);
const { Engine, WIDTH, HEIGHT, PADDLE_HEIGHT, BALL_RADIUS } = box.Pong;
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function active(config = {}) {
  const events = [];
  const e = new Engine(event => events.push(event), () => 0.5);
  e.start({ mode: 'multi', difficulty: 'normal', target: 5, ...config });
  e.state = 'playing';
  return { e, events };
}
function run(e, seconds, input = {}) { for (let i = 0; i < seconds * 120; i++) e.update(1 / 120, input); }

test('Açılış sayımı tamamlanınca servis başlar', () => {
  const e = new Engine(() => {}, () => 0.5); e.start();
  assert.equal(e.state, 'countdown');
  run(e, 2.5); assert.equal(e.state, 'playing'); assert.notEqual(e.ball.x, WIDTH / 2);
});
test('Raketler sahanın dışına çıkamaz', () => {
  const { e } = active(); run(e, 2, { left: -1, right: 1 });
  assert.equal(e.left.y, 0); assert.equal(e.right.y, HEIGHT - PADDLE_HEIGHT);
});
test('Üst ve alt duvarlar topu geri yansıtır', () => {
  const { e } = active(); e.ball.y = BALL_RADIUS + 1; e.ball.vx = 50; e.ball.vy = -300;
  e.update(0.02); assert.ok(e.ball.vy > 0); assert.ok(e.ball.y >= BALL_RADIUS);
  e.ball.y = HEIGHT - BALL_RADIUS - 1; e.ball.vy = 300;
  e.update(0.02); assert.ok(e.ball.vy < 0); assert.ok(e.ball.y <= HEIGHT - BALL_RADIUS);
});
test('Raket ortası düz vuruş, kenarı açılı vuruş üretir', () => {
  for (const offset of [0, -36, 36]) {
    const { e } = active(); e.ball.x = 70; e.ball.y = e.left.y + PADDLE_HEIGHT / 2 + offset;
    e.ball.vx = -420; e.ball.vy = 0; e.update(0.04);
    assert.ok(e.ball.vx > 0); assert.equal(e.rally, 1);
    if (offset === 0) assert.ok(Math.abs(e.ball.vy) < 0.01);
    else assert.equal(Math.sign(e.ball.vy), Math.sign(offset));
    assert.ok(e.ball.speed > 420);
  }
});
test('En hızlı top raketin içinden geçmez', () => {
  const { e } = active(); e.ball.x = 90; e.ball.y = HEIGHT / 2;
  e.ball.speed = 850; e.ball.vx = -850; e.ball.vy = 0; e.update(0.05);
  assert.ok(e.ball.vx > 0); assert.equal(e.rally, 1); assert.ok(e.ball.speed <= 850);
});
test('Raketin dışından geçen top sayı verir ve ralli sıfırlanır', () => {
  const { e } = active(); e.ball.x = 25; e.ball.y = 70; e.ball.vx = -420; e.ball.vy = 0;
  e.rally = 8; run(e, 0.2);
  assert.equal(e.score[1], 1); assert.equal(e.score[0], 0); assert.equal(e.rally, 0);
  assert.equal(e.state, 'between'); assert.equal(e.ball.x, WIDTH / 2);
});
test('Hedef skorda maç bir kez biter, sonraki karelerde skor artmaz', () => {
  const { e, events } = active(); e.score[0] = 4; e.ball.x = WIDTH + 8; e.ball.vx = 420;
  e.update(0.02); run(e, 2);
  assert.equal(e.state, 'ended'); assert.equal(e.score[0], 5);
  assert.equal(events.filter(event => event.type === 'finish').length, 1);
});
test('Duraklatınca top ve sayaç donar; aynı aşamadan devam eder', () => {
  const e = new Engine(); e.start(); const timer = e.timer; e.pause(); run(e, 1);
  assert.equal(e.timer, timer); e.resume(); assert.equal(e.state, 'countdown');
  e.state = 'playing'; const x = e.ball.x; e.pause(); run(e, 1); assert.equal(e.ball.x, x);
  e.resume(); e.update(0.02); assert.notEqual(e.ball.x, x);
});
test('İki oyuncunun girdileri birbirinden bağımsızdır', () => {
  const { e } = active(); const y = e.right.y;
  e.update(0.03, { left: -1, right: 1 });
  assert.ok(e.left.y < y); assert.ok(e.right.y > y);
});
test('Dokunma hedefi raketi hareket ettirir ve hız sınırını korur', () => {
  const { e } = active(); const y = e.left.y; e.update(0.02, { leftTarget: 0 });
  assert.ok(e.left.y < y); assert.ok(y - e.left.y <= 510 * 0.02 + 0.001);
});
test('Bilgisayar yalnız tek oyunculu modda kendi hareket eder', () => {
  const { e } = active({ mode: 'single', difficulty: 'hard' });
  const y = e.right.y; e.ball.x = 700; e.ball.y = 100; e.ball.vx = 420; e.ball.vy = 0;
  e.update(0.02); assert.ok(e.right.y < y); assert.ok(y - e.right.y <= 445 * 0.02 + 0.001);
});
test('Yeni maç skor ve raketleri sıfırlar, seçilen hedefi kullanır', () => {
  const { e } = active(); e.score = [3, 2]; e.left.y = 0;
  e.start({ mode: 'single', difficulty: 'easy', target: 11 });
  assert.equal(e.score.join(':'), '0:0'); assert.equal(e.config.target, 11);
  assert.equal(e.left.y, (HEIGHT - PADDLE_HEIGHT) / 2); assert.equal(e.state, 'countdown');
});
test('Güçler oyun sırasında güvenli saha bölgelerinde rastgele doğar', () => {
  let seed = 12345;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const e = new Engine(() => {}, random); e.start(); e.state = 'playing';
  e.spawnTimer = 0; e.update(0.01);
  assert.equal(e.pickups.length, 1);
  const first = e.pickups[0];
  assert.ok(first.x >= 180 && first.x <= WIDTH - 180);
  assert.ok(first.y >= 160 && first.y <= HEIGHT - 80);
  e.spawnTimer = 0; e.update(0.01);
  assert.equal(e.pickups.length, 2);
  assert.notEqual(e.pickups[0].x, e.pickups[1].x);
  e.spawnTimer = 0; e.update(0.01); assert.equal(e.pickups.length, 2);
});
test('Top gücü toplar; büyütme son vuran oyuncuya gider', () => {
  const { e, events } = active(); e.ball.lastHit = 1;
  e.pickups.push({ type: 'grow', x: e.ball.x, y: e.ball.y, remaining: 12 });
  e.update(0.01);
  assert.ok(e.right.height > PADDLE_HEIGHT); assert.equal(e.left.height, PADDLE_HEIGHT);
  assert.equal(e.pickups.length, 0); assert.equal(events.filter(event => event.type === 'powerup').length, 1);
});
test('Henüz rakete değmeyen servis topu güç toplayamaz', () => {
  const { e } = active(); e.ball.lastHit = null;
  e.pickups.push({ type: 'grow', x: e.ball.x, y: e.ball.y, remaining: 12 }); e.update(0.01);
  assert.equal(e.pickups.length, 1); assert.equal(e.effects.length, 0);
});
test('Küçültme ve yavaşlatma iki tarafta da rakibe uygulanır', () => {
  for (const side of [0, 1]) {
    const { e } = active(); const self = side === 0 ? e.left : e.right; const opponent = side === 0 ? e.right : e.left;
    e.activatePower('shrink', side); e.activatePower('slow', side);
    assert.equal(self.height, PADDLE_HEIGHT); assert.equal(self.speedMultiplier, 1);
    assert.ok(opponent.height < PADDLE_HEIGHT); assert.ok(opponent.speedMultiplier < 1);
  }
});
test('Hızlı raket gerçek hareket mesafesini artırır, yavaşlatma azaltır', () => {
  const normal = active().e; const fast = active().e; const slow = active().e;
  fast.activatePower('haste', 0); slow.activatePower('slow', 1);
  for (const e of [normal, fast, slow]) { e.update(0.03, { left: -1 }); }
  assert.ok(fast.left.y < normal.left.y); assert.ok(slow.left.y > normal.left.y);
});
test('Boyut etkisi merkez konumunu korur ve saha sınırında kalır', () => {
  const { e } = active(); const center = e.left.y + e.left.height / 2;
  e.activatePower('grow', 0); assert.ok(Math.abs(e.left.y + e.left.height / 2 - center) < 0.001);
  e.left.y = HEIGHT - e.left.height; e.activatePower('shrink', 1);
  assert.ok(e.left.y >= 0 && e.left.y + e.left.height <= HEIGHT);
});
test('Büyüyen raketin yeni kenarı topa fiziksel olarak çarpar', () => {
  const { e } = active(); e.activatePower('grow', 0);
  e.ball.x = 70; e.ball.y = e.left.y + 5; e.ball.vx = -420; e.ball.vy = 0; e.update(0.04);
  assert.ok(e.ball.vx > 0); assert.equal(e.rally, 1);
});
test('Küçülen raketin eski kenarında hayali çarpışma oluşmaz', () => {
  const { e } = active(); const oldY = e.left.y; e.activatePower('shrink', 1);
  e.ball.x = 70; e.ball.y = oldY; e.ball.vx = -420; e.ball.vy = 0; e.update(0.04);
  assert.ok(e.ball.vx < 0); assert.equal(e.rally, 0);
});
test('Aynı güç birikmez, süresi yenilenir; karşıt güç yerini alır', () => {
  const { e } = active(); e.activatePower('grow', 0); const height = e.left.height;
  e.updatePowers(3); e.activatePower('grow', 0);
  assert.equal(e.left.height, height); assert.equal(e.effects.length, 1); assert.equal(e.effects[0].remaining, 8);
  e.activatePower('shrink', 1); assert.equal(e.effects.length, 1); assert.ok(e.left.height < PADDLE_HEIGHT);
  e.activatePower('haste', 0); assert.equal(e.effects.length, 2);
});
test('Süre bitince boyut ve hareket hızı normale döner', () => {
  const { e } = active(); e.activatePower('grow', 0); e.activatePower('haste', 0);
  e.updatePowers(8.01);
  assert.equal(e.left.height, PADDLE_HEIGHT); assert.equal(e.left.speedMultiplier, 1); assert.equal(e.effects.length, 0);
});
test('Duraklatma güç, turbo ve harita simgesi sürelerini de dondurur', () => {
  const { e } = active(); e.activatePower('grow', 0); e.activatePower('turbo', 0);
  e.pickups.push({ type: 'slow', x: 200, y: 200, remaining: 12 }); e.pause(); run(e, 2);
  assert.equal(e.effects[0].remaining, 8); assert.equal(e.ball.boostRemaining, 6); assert.equal(e.pickups[0].remaining, 12);
});
test('Turbo hızı artırır, tekrar alınınca katlanmaz, bitince normale döner', () => {
  const { e } = active(); const speed = e.ball.speed;
  e.activatePower('turbo', 0); const boosted = e.ball.speed; assert.ok(boosted > speed);
  e.updatePowers(2); e.activatePower('turbo', 0); assert.equal(e.ball.speed, boosted); assert.equal(e.ball.boostRemaining, 6);
  e.updatePowers(6.01); assert.ok(Math.abs(e.ball.speed - speed) < 0.001); assert.equal(e.ball.boostRemaining, 0);
});
test('Çoklu top üç farklı yörünge üretir ve sınırsız çoğalmaz', () => {
  const { e } = active(); e.ball.lastHit = 0; e.activatePower('multiball', 0);
  assert.equal(e.balls.length, 3); assert.equal(new Set(e.balls.map(ball => ball.id)).size, 3);
  assert.equal(new Set(e.balls.map(ball => ball.vy)).size, 3);
  assert.ok(e.balls.every(ball => ball.lastHit === 0 && Number.isFinite(ball.vx)));
  e.activatePower('multiball', 0); assert.equal(e.balls.length, 3);
});
test('Turbo çoklu toplara da uygulanır ve yeni toplar turboyu devralır', () => {
  const { e } = active(); e.activatePower('turbo', 0); e.activatePower('multiball', 0);
  assert.ok(e.balls.every(ball => ball.boostRemaining === 6));
  const speeds = e.balls.map(ball => ball.speed); e.activatePower('turbo', 0);
  assert.ok(e.balls.every((ball, i) => ball.speed === speeds[i]));
});
test('Dik açıdaki çoklu toplar da birbirinden farklı yörüngelere ayrılır', () => {
  for (const angle of [-Math.PI / 3, Math.PI / 3]) {
    const { e } = active(); e.ball.vx = Math.cos(angle) * 420; e.ball.vy = Math.sin(angle) * 420;
    e.activatePower('multiball', 0);
    assert.equal(new Set(e.balls.map(ball => ball.vy.toFixed(4))).size, 3);
  }
});
test('Aynı karede kaçan üç top yalnız bir sayı verir ve güçler silinir', () => {
  const { e } = active(); e.activatePower('multiball', 0); e.activatePower('grow', 0);
  e.balls.forEach(ball => { ball.x = WIDTH + 8; ball.vx = 420; }); e.update(0.02);
  assert.equal(e.score.join(':'), '1:0'); assert.equal(e.balls.length, 1);
  assert.equal(e.effects.length, 0); assert.equal(e.left.height, PADDLE_HEIGHT);
});
test('Klasik modda güçler hiç doğmaz ve top onları toplayamaz', () => {
  const { e } = active({ powerups: false }); e.spawnTimer = 0; e.ball.lastHit = 0;
  e.update(0.01); assert.equal(e.pickups.length, 0);
  e.pickups.push({ type: 'grow', x: e.ball.x, y: e.ball.y, remaining: 12 }); e.update(0.01);
  assert.equal(e.left.height, PADDLE_HEIGHT); assert.equal(e.effects.length, 0);
});
test('Yeni maç bütün topları, simgeleri ve etkileri temizler', () => {
  const { e } = active(); e.activatePower('multiball', 0); e.activatePower('grow', 0); e.spawnPickup();
  e.reset(); assert.equal(e.state, 'ready'); assert.equal(e.balls.length, 1);
  assert.equal(e.effects.length, 0); assert.equal(e.pickups.length, 0); assert.equal(e.left.height, PADDLE_HEIGHT);
});
test('Bilgisayar hızı da yavaşlatma etkisinden etkilenir', () => {
  const { e } = active({ mode: 'single', difficulty: 'hard' }); e.activatePower('slow', 0);
  e.ball.x = 700; e.ball.y = 100; e.ball.vx = 420; const y = e.right.y; e.update(0.02);
  assert.ok(e.right.y < y); assert.ok(y - e.right.y <= 445 * 0.6 * 0.02 + 0.001);
});
console.log(`${passed} test passed.`);
