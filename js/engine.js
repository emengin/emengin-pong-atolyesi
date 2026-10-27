/* Oyun kuralları arayüzden ayrıdır. Çarpışmalar ve güçler bağımsız denenebilir. */
(function (root) {
  'use strict';

  const WIDTH = 960;
  const HEIGHT = 560;
  const PADDLE_WIDTH = 14;
  const PADDLE_HEIGHT = 96;
  const BALL_RADIUS = 9;
  const PLAYER_SPEED = 510;
  const EFFECT_DURATION = 8;
  const TURBO_DURATION = 6;
  const TURBO_FACTOR = 1.35;
  const MAX_BALLS = 3;
  const PICKUP_RADIUS = 28;
  const LEVELS = {
    easy: { speed: 265, reaction: 0.23, error: 58, ballSpeed: 360 },
    normal: { speed: 350, reaction: 0.14, error: 32, ballSpeed: 420 },
    hard: { speed: 445, reaction: 0.075, error: 15, ballSpeed: 480 }
  };
  const POWERUPS = {
    turbo: { title: 'Turbo top', glyph: '»', color: '#f3d77c', description: 'Tüm topları 6 saniye hızlandırır.', duration: TURBO_DURATION },
    shrink: { title: 'Rakibi küçült', glyph: '−', color: '#f0a6cb', description: 'Rakibin raketini 8 saniye küçültür.', duration: EFFECT_DURATION },
    grow: { title: 'Raketi büyüt', glyph: '+', color: '#d7edb0', description: 'Kendi raketini 8 saniye büyütür.', duration: EFFECT_DURATION },
    haste: { title: 'Hızlı raket', glyph: '↑', color: '#8ddfe7', description: 'Kendi raketini 8 saniye hızlandırır.', duration: EFFECT_DURATION },
    slow: { title: 'Rakibi yavaşlat', glyph: '↓', color: '#bfb1f4', description: 'Rakibin raketini 8 saniye yavaşlatır.', duration: EFFECT_DURATION },
    multiball: { title: 'Çoklu top', glyph: '×3', color: '#f3ac7c', description: 'Top sayısını üçe çıkarır. İlk kaçan top sayı verir.', duration: null }
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  class PongEngine {
    constructor(onEvent = () => {}, random = Math.random) {
      this.onEvent = onEvent;
      this.random = random;
      this.config = { mode: 'single', difficulty: 'normal', target: 7, powerups: true };
      this.nextBallId = 0;
      this.left = { x: 36, y: 0, height: PADDLE_HEIGHT, speedMultiplier: 1 };
      this.right = { x: WIDTH - 36 - PADDLE_WIDTH, y: 0, height: PADDLE_HEIGHT, speedMultiplier: 1 };
      this.reset();
    }

    get ball() { return this.balls[0]; }

    createBall() {
      return { id: this.nextBallId++, x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, speed: 420, lastHit: null, boostRemaining: 0 };
    }

    reset() {
      this.state = 'ready';
      this.previousState = 'playing';
      this.time = 0;
      this.playTime = 0;
      this.timer = 0;
      this.score = [0, 0];
      this.rally = 0;
      this.matchBest = 0;
      this.balls = [this.createBall()];
      this.clearPowers();
      this.centerPaddles();
    }

    start(config = this.config) {
      this.config = {
        mode: config.mode === 'multi' ? 'multi' : 'single',
        difficulty: LEVELS[config.difficulty] ? config.difficulty : 'normal',
        target: [5, 7, 11].includes(Number(config.target)) ? Number(config.target) : 7,
        powerups: config.powerups !== false
      };
      this.reset();
      this.prepareServe(this.random() < 0.5 ? -1 : 1, 2.4);
      this.state = 'countdown';
      this.onEvent({ type: 'start' });
    }

    centerPaddles() {
      this.left.y = (HEIGHT - this.left.height) / 2;
      this.right.y = (HEIGHT - this.right.height) / 2;
      this.aiTarget = HEIGHT / 2;
      this.aiTimer = 0;
    }

    clearPowers() {
      this.effects = [];
      this.pickups = [];
      this.spawnTimer = 1.8;
      this.left.height = this.right.height = PADDLE_HEIGHT;
      this.left.speedMultiplier = this.right.speedMultiplier = 1;
      this.left.y = clamp(this.left.y, 0, HEIGHT - PADDLE_HEIGHT);
      this.right.y = clamp(this.right.y, 0, HEIGHT - PADDLE_HEIGHT);
    }

    prepareServe(direction, delay) {
      this.clearPowers();
      const ball = this.createBall();
      ball.speed = this.config.mode === 'multi' ? 420 : LEVELS[this.config.difficulty].ballSpeed;
      const angle = this.random() * 0.7 - 0.35;
      ball.vx = Math.cos(angle) * ball.speed * direction;
      ball.vy = Math.sin(angle) * ball.speed;
      this.balls = [ball];
      this.timer = delay;
      this.rally = 0;
    }

    pause() {
      if (!['playing', 'countdown', 'between'].includes(this.state)) return false;
      this.previousState = this.state;
      this.state = 'paused';
      return true;
    }

    resume() {
      if (this.state !== 'paused') return false;
      this.state = this.previousState;
      return true;
    }

    update(dt, input = {}) {
      if (!['playing', 'countdown', 'between'].includes(this.state)) return;
      let remaining = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05);
      while (remaining > 0.000001) {
        // Küçük adımlar, turbo topların bile raketin içinden geçmesini önler.
        const step = Math.min(remaining, 1 / 240);
        this.step(step, input);
        remaining -= step;
        if (this.state === 'ended') break;
      }
    }

    step(dt, input) {
      this.time += dt;
      if (this.state === 'playing') {
        this.playTime += dt;
        this.updatePowers(dt);
      }
      this.movePaddle(this.left, input.left || 0, input.leftTarget, dt);
      if (this.config.mode === 'multi') this.movePaddle(this.right, input.right || 0, input.rightTarget, dt);
      else this.moveComputer(dt);
      if (this.state === 'countdown' || this.state === 'between') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'playing';
          this.onEvent({ type: 'serve' });
        }
        return;
      }
      // Kopya dizi sayesinde bu adımda üretilen yeni toplar sonraki adımda ilerler.
      for (const ball of [...this.balls]) {
        const scorer = this.moveBall(ball, dt);
        if (scorer !== null) {
          // Çoklu topta ilk kaçan top tek sayı verir; diğer toplar kaldırılır.
          this.awardPoint(scorer);
          return;
        }
        this.collectPickup(ball);
      }
    }

    moveBall(ball, dt) {
      const oldX = ball.x;
      const oldY = ball.y;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y < BALL_RADIUS && ball.vy < 0) {
        ball.y = BALL_RADIUS + (BALL_RADIUS - ball.y);
        ball.vy = -ball.vy;
        this.onEvent({ type: 'wall' });
      } else if (ball.y > HEIGHT - BALL_RADIUS && ball.vy > 0) {
        ball.y = HEIGHT - BALL_RADIUS - (ball.y - (HEIGHT - BALL_RADIUS));
        ball.vy = -ball.vy;
        this.onEvent({ type: 'wall' });
      }
      const side = ball.vx < 0 ? 0 : 1;
      const paddle = side === 0 ? this.left : this.right;
      const plane = side === 0 ? paddle.x + PADDLE_WIDTH + BALL_RADIUS : paddle.x - BALL_RADIUS;
      const crossed = side === 0 ? oldX >= plane && ball.x <= plane : oldX <= plane && ball.x >= plane;
      if (crossed) {
        const fraction = (plane - oldX) / (ball.x - oldX);
        const collisionY = oldY + (ball.y - oldY) * fraction;
        if (collisionY + BALL_RADIUS >= paddle.y && collisionY - BALL_RADIUS <= paddle.y + paddle.height) {
          const offset = clamp((collisionY - (paddle.y + paddle.height / 2)) / (paddle.height / 2), -1, 1);
          const angle = offset * Math.PI / 3;
          ball.speed = Math.min(ball.boostRemaining > 0 ? 1100 : 850, ball.speed * 1.055 + 8);
          ball.vx = Math.cos(angle) * ball.speed * (side === 0 ? 1 : -1);
          ball.vy = Math.sin(angle) * ball.speed;
          ball.x = plane + (side === 0 ? 0.1 : -0.1);
          ball.lastHit = side;
          this.rally += 1;
          this.matchBest = Math.max(this.matchBest, this.rally);
          this.onEvent({ type: 'hit', rally: this.rally });
        }
      }
      if (ball.x < -BALL_RADIUS) return 1;
      if (ball.x > WIDTH + BALL_RADIUS) return 0;
      return null;
    }

    movePaddle(paddle, direction, target, dt) {
      const distance = PLAYER_SPEED * paddle.speedMultiplier * dt;
      let movement = clamp(direction, -1, 1) * distance;
      if (Number.isFinite(target) && direction === 0) movement = clamp(target - paddle.height / 2 - paddle.y, -distance, distance);
      paddle.y = clamp(paddle.y + movement, 0, HEIGHT - paddle.height);
    }

    moveComputer(dt) {
      const level = LEVELS[this.config.difficulty];
      this.aiTimer -= dt;
      if (this.aiTimer <= 0) {
        // Çoklu topta kendi tarafına en erken ulaşacak topa öncelik verir.
        const approaching = this.balls.filter(ball => ball.vx > 0 && ball.x <= this.right.x)
          .sort((a, b) => (this.right.x - a.x) / a.vx - (this.right.x - b.x) / b.vx)[0];
        this.aiTarget = approaching && this.state === 'playing'
          ? approaching.y + (this.random() * 2 - 1) * level.error : HEIGHT / 2;
        this.aiTimer = level.reaction;
      }
      const distance = level.speed * this.right.speedMultiplier * dt;
      const desired = this.aiTarget - this.right.height / 2;
      this.right.y = clamp(this.right.y + clamp(desired - this.right.y, -distance, distance), 0, HEIGHT - this.right.height);
    }

    updatePowers(dt) {
      if (!this.config.powerups) return;
      for (const effect of this.effects) effect.remaining -= dt;
      const expired = this.effects.filter(effect => effect.remaining <= 0);
      if (expired.length) {
        this.effects = this.effects.filter(effect => effect.remaining > 0);
        for (const effect of expired) this.updateModifiers(effect.side);
      }
      for (const ball of this.balls) {
        if (ball.boostRemaining > 0) {
          ball.boostRemaining = Math.max(0, ball.boostRemaining - dt);
          if (ball.boostRemaining === 0) this.changeBallSpeed(ball, Math.min(850, ball.speed / TURBO_FACTOR));
        }
      }
      this.pickups.forEach(pickup => { pickup.remaining -= dt; });
      this.pickups = this.pickups.filter(pickup => pickup.remaining > 0);
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        if (this.pickups.length < 2) this.spawnPickup();
        this.spawnTimer = 3.8 + this.random() * 2.2;
      }
    }

    spawnPickup() {
      const available = Object.keys(POWERUPS).filter(type => type !== 'multiball' || this.balls.length < MAX_BALLS);
      const type = available[Math.min(available.length - 1, Math.floor(this.random() * available.length))];
      let x, y;
      for (let attempt = 0; attempt < 8; attempt++) {
        x = 180 + this.random() * (WIDTH - 360);
        y = 160 + this.random() * (HEIGHT - 240);
        if (this.pickups.every(pickup => Math.hypot(pickup.x - x, pickup.y - y) > 110)) break;
      }
      this.pickups.push({ type, x, y, remaining: 12 });
      this.onEvent({ type: 'spawn', power: type });
    }

    collectPickup(ball) {
      if (ball.lastHit === null || !this.config.powerups) return;
      const index = this.pickups.findIndex(pickup => Math.hypot(pickup.x - ball.x, pickup.y - ball.y) <= PICKUP_RADIUS + BALL_RADIUS);
      if (index === -1) return;
      const pickup = this.pickups.splice(index, 1)[0];
      this.activatePower(pickup.type, ball.lastHit, ball);
      this.onEvent({ type: 'powerup', power: pickup.type, side: ball.lastHit, x: pickup.x, y: pickup.y });
    }

    activatePower(type, side, source = this.ball) {
      if (!POWERUPS[type] || ![0, 1].includes(side)) return;
      if (type === 'turbo') {
        for (const ball of this.balls) {
          if (ball.boostRemaining <= 0) this.changeBallSpeed(ball, Math.min(1100, ball.speed * TURBO_FACTOR));
          ball.boostRemaining = TURBO_DURATION;
        }
      } else if (type === 'multiball') {
        const angle = Math.atan2(source.vy, Math.abs(source.vx));
        const limit = Math.PI / 3;
        const offsets = angle > limit - 0.4 ? [-0.4, -0.8] : angle < -limit + 0.4 ? [0.4, 0.8] : [-0.4, 0.4];
        let cloneIndex = 0;
        while (this.balls.length < MAX_BALLS) {
          const clone = { ...source, id: this.nextBallId++ };
          const rotated = clamp(angle + offsets[cloneIndex++ % 2], -limit, limit);
          clone.vx = Math.cos(rotated) * source.speed * (source.vx < 0 ? -1 : 1);
          clone.vy = Math.sin(rotated) * source.speed;
          this.balls.push(clone);
        }
      } else {
        const target = ['shrink', 'slow'].includes(type) ? 1 - side : side;
        const slot = ['grow', 'shrink'].includes(type) ? 'size' : 'speed';
        // Aynı özellik birikmez: yenisi öncekinin yerini alır veya süresini yeniler.
        this.effects = this.effects.filter(effect => effect.side !== target || effect.slot !== slot);
        this.effects.push({ type, side: target, slot, remaining: EFFECT_DURATION });
        this.updateModifiers(target);
      }
    }

    updateModifiers(side) {
      const paddle = side === 0 ? this.left : this.right;
      const center = paddle.y + paddle.height / 2;
      const size = this.effects.find(effect => effect.side === side && effect.slot === 'size');
      const speed = this.effects.find(effect => effect.side === side && effect.slot === 'speed');
      paddle.height = PADDLE_HEIGHT * (size ? (size.type === 'grow' ? 1.6 : 0.62) : 1);
      paddle.speedMultiplier = speed ? (speed.type === 'haste' ? 1.5 : 0.6) : 1;
      paddle.y = clamp(center - paddle.height / 2, 0, HEIGHT - paddle.height);
    }

    changeBallSpeed(ball, speed) {
      const magnitude = Math.hypot(ball.vx, ball.vy);
      if (magnitude > 0) { ball.vx *= speed / magnitude; ball.vy *= speed / magnitude; }
      ball.speed = speed;
    }

    getActiveEffects() {
      const effects = this.effects.map(effect => ({ ...effect }));
      const turbo = Math.max(0, ...this.balls.map(ball => ball.boostRemaining));
      if (turbo > 0) effects.push({ type: 'turbo', side: null, remaining: turbo });
      if (this.balls.length > 1) effects.push({ type: 'multiball', side: null, remaining: null });
      return effects;
    }

    awardPoint(side) {
      this.score[side] += 1;
      if (this.score[side] >= this.config.target) {
        this.state = 'ended';
        this.clearPowers();
        this.balls = [this.ball];
        this.ball.boostRemaining = 0;
        this.onEvent({ type: 'finish', winner: side, best: this.matchBest });
      } else {
        this.prepareServe(side === 0 ? 1 : -1, 1.1);
        this.centerPaddles();
        this.state = 'between';
        this.onEvent({ type: 'score', side });
      }
    }
  }

  root.Pong = { Engine: PongEngine, WIDTH, HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, LEVELS, POWERUPS, PICKUP_RADIUS, MAX_BALLS };
})(typeof window !== 'undefined' ? window : globalThis);
