/* DOM bağlantıları, kullanıcı girdileri, çizim ve isteğe bağlı sesler. */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('game-canvas');
  const context = canvas.getContext('2d');
  const keys = new Set();
  const pointers = new Map();
  const touchDirections = new Map();
  const trails = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let powerFlash = null;
  let toastUntil = 0;
  let lastEffectKey = '';
  let lastPickupStatus = '';
  let soundEnabled = false;
  let audio = null;
  let bestRally = 0;
  let restartPending = false;
  let lastState = '';
  let lastScore = '';
  let lastRally = -1;
  let lastTime = 0;
  let frameId = 0;
  let announcement = '';
  let announcementUntil = 0;

  try { bestRally = Math.max(0, Number(localStorage.getItem('pong-atolyesi-best')) || 0); } catch (_) { /* Gizli modda kayıt olmadan oyun devam eder. */ }
  $('best-rally').textContent = bestRally;

  const engine = new Pong.Engine(handleEvent);
  const names = () => engine.config.mode === 'multi' ? ['OYUNCU 1', 'OYUNCU 2'] : ['SEN', 'BİLGİSAYAR'];
  const selected = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
  const readConfig = () => ({ mode: selected('mode'), difficulty: selected('difficulty'), target: Number(selected('target')), powerups: $('powerups-toggle').checked });
  const difficultyNames = { easy: 'KOLAY', normal: 'NORMAL', hard: 'ZOR', impossible: 'İMKÂNSIZ' };
  const difficultyNotes = { easy: 'Daha sakin tempo, alışmak için ideal.', normal: 'Dengeli tempo, keyifli bir rekabet.', hard: 'Hızlı top, daha çevik bir rakip.', impossible: 'Sekmeleri hesaplayan, çok hızlı bir rakip. Hazır mısın?' };

  function clearInput() {
    keys.clear();
    pointers.clear();
    touchDirections.clear();
  }

  function unlockAudio() {
    if (!soundEnabled) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioClass) return;
      if (!audio) audio = new AudioClass();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch (_) { /* Ses desteği oyunun çalışmasını etkilemez. */ }
  }

  function beep(frequency, duration = 0.07, volume = 0.035, delay = 0) {
    if (!soundEnabled || !audio || audio.state !== 'running') return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + delay;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  function handleEvent(event) {
    if (event.type === 'hit') {
      beep(480 + Math.min(event.rally, 15) * 24);
      if (event.rally > bestRally) {
        bestRally = event.rally;
        $('best-rally').textContent = bestRally;
        try { localStorage.setItem('pong-atolyesi-best', String(bestRally)); } catch (_) { /* Kayıt isteğe bağlıdır. */ }
      }
    } else if (event.type === 'wall') beep(240, 0.045, 0.018);
    else if (event.type === 'score') {
      trails.clear();
      powerFlash = null;
      toastUntil = 0;
      beep(320, 0.14);
      announcement = `${names()[event.side]} sayı aldı. Yeni servis hazırlanıyor.`;
      announcementUntil = performance.now() + 1400;
    } else if (event.type === 'powerup') {
      const power = Pong.POWERUPS[event.power];
      $('power-toast').textContent = `${names()[event.side]} · ${power.title}${power.duration ? ` · ${power.duration} sn` : ' · 3 top oyunda!'}`;
      $('power-toast').style.setProperty('--toast-color', power.color);
      toastUntil = engine.playTime + 2.4;
      powerFlash = { x: event.x, y: event.y, color: power.color, started: engine.playTime };
      beep(720, 0.12); beep(960, 0.15, 0.035, 0.08);
    } else if (event.type === 'serve') beep(650, 0.09);
    else if (event.type === 'finish') {
      beep(440, 0.15); beep(550, 0.15, 0.035, 0.14); beep(660, 0.25, 0.035, 0.28);
      clearInput();
    }
  }

  function syncSettings() {
    const config = readConfig();
    const multi = config.mode === 'multi';
    $('difficulty-field').disabled = multi;
    $('difficulty-note').textContent = multi ? 'İki oyunculu modda seviye eşittir.' : difficultyNotes[config.difficulty];
    $('right-touch').hidden = !multi;
    $('touch-controls').dataset.mode = config.mode;
    $('right-key-guide').hidden = !multi;
    $('arrow-guide').hidden = multi;
    $('overlay-hint').textContent = matchMedia('(pointer: coarse)').matches
      ? 'Sahada sürükle veya alttaki okları kullan'
      : multi ? 'Sol raket: W / S · Sağ raket: ↑ / ↓' : 'W / S veya ↑ / ↓ ile hareket et';
    $('settings-note').innerHTML = `Ayarlarını seç, korta çık.<br>İlk ${config.target} sayıya ulaşan maçı alır.`;
    if (engine.state === 'ready' || engine.state === 'ended') {
      engine.config = config;
      $('match-label').textContent = `${multi ? 'İKİ OYUNCU' : 'TEK OYUNCU'} · ${multi ? 'DOSTLUK MAÇI' : difficultyNames[config.difficulty]} · ${config.target} SAYI`;
      $('left-name').textContent = multi ? 'OYUNCU 1' : 'SEN';
      $('right-name').textContent = multi ? 'OYUNCU 2' : 'BİLGİSAYAR';
      if (engine.state === 'ready') $('overlay-copy').textContent = `Raketini hazırla. İlk ${config.target} sayıya ulaşan kazanır.`;
    }
  }

  function lockSettings(locked) {
    document.querySelectorAll('input[name="mode"],input[name="difficulty"],input[name="target"],#powerups-toggle').forEach((input) => { input.disabled = locked; });
    $('settings-note').innerHTML = locked ? 'Ayarları değiştirmek için<br>“Yeni maç” düğmesine bas.' : `Ayarlarını seç, korta çık.<br>İlk ${readConfig().target} sayıya ulaşan maçı alır.`;
  }

  function startMatch() {
    unlockAudio();
    restartPending = false;
    clearInput();
    trails.clear();
    powerFlash = null;
    toastUntil = 0;
    announcementUntil = 0;
    engine.start(readConfig());
    lockSettings(true);
    lastState = '';
    updateInterface();
    canvas.focus({ preventScroll: true });
  }

  function togglePause() {
    if (restartPending) return;
    if (engine.state === 'paused') { engine.resume(); unlockAudio(); canvas.focus({ preventScroll: true }); }
    else if (engine.pause()) clearInput();
    updateInterface();
  }

  function newMatch() {
    const active = ['playing', 'countdown', 'between', 'paused'].includes(engine.state);
    if (!active) { returnToSetup(); return; }
    engine.pause();
    clearInput();
    restartPending = true;
    // İkinci tıklama yerine oyun içindeki açık onay, yanlışlıkla skor kaybını önler.
    showOverlay('YENİ BİR BAŞLANGIÇ', 'Skor sıfırlansın mı?', 'Yeni maça geçersen mevcut skor silinir.', 'Evet, maçı sıfırla', 'Vazgeçmek için “Devam et” düğmesine bas.');
    $('pause-button').innerHTML = '<span aria-hidden="true">▷</span> Devam et';
    $('pause-button').disabled = false;
    $('game-status').textContent = 'Yeni maç onayı bekleniyor.';
  }

  function returnToSetup() {
    engine.reset();
    restartPending = false;
    trails.clear();
    powerFlash = null;
    toastUntil = 0;
    clearInput();
    lockSettings(false);
    syncSettings();
    lastState = '';
    updateInterface();
  }

  function showOverlay(tag, title, copy, button, hint) {
    $('game-overlay').hidden = false;
    $('overlay-tag').textContent = tag;
    $('overlay-title').textContent = title;
    $('overlay-copy').textContent = copy;
    $('overlay-button').innerHTML = `${button} <span aria-hidden="true">↗</span>`;
    $('overlay-hint').textContent = hint;
  }

  function updateInterface() {
    const state = engine.state;
    updatePowerInterface();
    if (lastScore !== engine.score.join(':')) {
      $('left-score').textContent = engine.score[0];
      $('right-score').textContent = engine.score[1];
      lastScore = engine.score.join(':');
    }
    if (lastRally !== engine.rally) {
      $('rally-count').innerHTML = `${engine.rally} <small>vuruş</small>`;
      $('rally-fill').style.width = `${Math.min(engine.rally / 20 * 100, 100)}%`;
      lastRally = engine.rally;
    }
    $('countdown').hidden = !['countdown', 'between'].includes(state);
    if (!$('countdown').hidden) $('countdown').textContent = state === 'between' ? 'SERVİS' : Math.ceil(engine.timer / 0.8);
    $('countdown').style.fontSize = state === 'between' ? '24px' : '';
    if (restartPending) return;
    if (state !== lastState) {
      $('pause-button').disabled = ['ready', 'ended'].includes(state);
      $('restart-button').disabled = state === 'ready';
      $('pause-button').innerHTML = state === 'paused' ? '<span aria-hidden="true">▷</span> Devam et' : '<span aria-hidden="true">Ⅱ</span> Duraklat';
      if (state === 'ready') {
        showOverlay('KORT SENİN', 'İlk servis senden.', `Raketini hazırla. İlk ${readConfig().target} sayıya ulaşan kazanır.`, 'Maça başla', '');
        syncSettings();
      } else if (state === 'paused') {
        showOverlay('KISA BİR MOLA', 'Ralli seni bekliyor.', 'Skorun güvende. Hazır olduğunda devam et.', 'Oyuna dön', 'Boşluk tuşuyla da devam edebilirsin.');
      } else if (state === 'ended') {
        const winner = engine.score[0] > engine.score[1] ? 0 : 1;
        const heading = engine.config.mode === 'single' ? (winner === 0 ? 'Kort senin!' : 'Bir rövanşa ne dersin?') : `${winner + 1}. oyuncu kazandı!`;
        showOverlay('MAÇ TAMAMLANDI', heading, `${engine.score[0]} – ${engine.score[1]} · Maçın en uzun rallisi: ${engine.matchBest} vuruş.`, 'Rövanşa başla', 'Ayarlar açıldı. İstersen yeni bir mod seç.');
        lockSettings(false);
      } else $('game-overlay').hidden = true;
      lastState = state;
    }
    let status = { ready: 'Hazır olduğunda maça başla.', countdown: 'Servis için hazırlan…', between: announcement || 'Yeni servis hazırlanıyor.', paused: 'Oyun duraklatıldı.', ended: 'Maç bitti. Bir rövanş daha?' }[state];
    if (state === 'playing') status = performance.now() < announcementUntil ? announcement : 'Topu karşıla. Açıyı sen belirle.';
    if ($('game-status').textContent !== status) $('game-status').textContent = status;
  }

  function updatePowerInterface() {
    const enabled = engine.config.powerups;
    $('power-mode-label').textContent = enabled ? '✳ GÜÇLER AÇIK' : '○ KLASİK PONG';
    let status = enabled ? 'Topla yakala, son vuran kazansın.' : 'Özel güçler kapalı.';
    if (enabled && engine.state === 'playing') status = engine.pickups.length
      ? `Sahada ${engine.pickups.length} güç · ${engine.balls.length} top oyunda`
      : `Yeni güç: ${Math.ceil(engine.spawnTimer)} sn · ${engine.balls.length} top oyunda`;
    if (status !== lastPickupStatus) { $('pickup-status').textContent = status; lastPickupStatus = status; }
    const effects = engine.getActiveEffects();
    const key = effects.map(effect => `${effect.type}:${effect.side}:${Math.ceil(effect.remaining)}`).join('|');
    if (key !== lastEffectKey) {
      const chips = effects.map(effect => {
        const power = Pong.POWERUPS[effect.type];
        const chip = document.createElement('span');
        chip.className = 'effect-chip';
        chip.style.setProperty('--effect-color', power.color);
        const dot = document.createElement('span'); dot.className = 'effect-dot'; dot.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        const title = { grow: 'Büyük raket', shrink: 'Küçük raket', haste: 'Hızlı raket', slow: 'Yavaş raket' }[effect.type] || power.title;
        label.textContent = `${effect.side === null ? 'SAHA' : names()[effect.side]} · ${title}`;
        chip.append(dot, label);
        if (effect.remaining !== null) {
          const timer = document.createElement('time');
          timer.textContent = `${Math.ceil(effect.remaining)} sn`;
          timer.setAttribute('datetime', `PT${Math.ceil(effect.remaining)}S`);
          chip.append(timer);
        }
        return chip;
      });
      $('active-effects').replaceChildren(...chips);
      lastEffectKey = key;
    }
    $('power-toast').hidden = !toastUntil || engine.playTime >= toastUntil || engine.state !== 'playing';
  }

  function buildPowerLegend() {
    for (const power of Object.values(Pong.POWERUPS)) {
      const item = document.createElement('div'); item.className = 'power-item';
      const glyph = document.createElement('span'); glyph.className = 'power-glyph';
      glyph.style.setProperty('--effect-color', power.color); glyph.textContent = power.glyph; glyph.setAttribute('aria-hidden', 'true');
      const copy = document.createElement('div');
      const heading = document.createElement('h3'); heading.textContent = power.title;
      const description = document.createElement('p'); description.textContent = power.description;
      copy.append(heading, description); item.append(glyph, copy); $('power-legend').append(item);
    }
  }

  function inputState() {
    const multi = engine.config.mode === 'multi';
    const direction = (up, down) => Number(down) - Number(up);
    const pointerTargets = { left: undefined, right: undefined };
    pointers.forEach((pointer) => { pointerTargets[pointer.side] = pointer.y; });
    const touch = (side) => { let sum = 0; touchDirections.forEach((p) => { if (p.side === side) sum += p.direction; }); return Math.sign(sum); };
    return {
      left: touch('left') || direction(keys.has('KeyW') || (!multi && keys.has('ArrowUp')), keys.has('KeyS') || (!multi && keys.has('ArrowDown'))),
      right: touch('right') || direction(keys.has('ArrowUp'), keys.has('ArrowDown')),
      leftTarget: pointerTargets.left,
      rightTarget: pointerTargets.right
    };
  }

  function draw() {
    const w = Pong.WIDTH, h = Pong.HEIGHT;
    context.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    context.clearRect(0, 0, w, h);
    const dark = document.documentElement.dataset.theme === 'dark';
    context.fillStyle = dark ? '#10271f' : '#18312b'; context.fillRect(0, 0, w, h);
    // Saha çizgileri sabit koordinatlarda çizilir; CSS yalnızca görünümü ölçekler.
    context.strokeStyle = '#3c5546'; context.lineWidth = 1;
    context.strokeRect(20, 20, w - 40, h - 40);
    context.beginPath(); context.setLineDash([6, 11]); context.moveTo(w / 2, 22); context.lineTo(w / 2, h - 22); context.stroke(); context.setLineDash([]);
    context.beginPath(); context.arc(w / 2, h / 2, 66, 0, Math.PI * 2); context.strokeStyle = '#304b3e'; context.stroke();
    context.fillStyle = '#aecb94'; context.globalAlpha = 0.35;
    [[20, 20], [w - 24, 20], [20, h - 24], [w - 24, h - 24]].forEach(([x, y]) => context.fillRect(x, y, 4, 4));
    context.globalAlpha = 1;
    if (!reducedMotion.matches) {
      trails.forEach(trail => trail.forEach((point, i) => {
        context.beginPath(); context.arc(point.x, point.y, Pong.BALL_RADIUS * i / trail.length, 0, Math.PI * 2);
        context.fillStyle = `rgba(221,234,193,${i / trail.length * 0.16})`; context.fill();
      }));
    }
    drawPickups();
    context.fillStyle = '#d7edb0'; context.fillRect(engine.left.x, engine.left.y, Pong.PADDLE_WIDTH, engine.left.height);
    context.fillStyle = '#ee9a76'; context.fillRect(engine.right.x, engine.right.y, Pong.PADDLE_WIDTH, engine.right.height);
    for (const ball of engine.balls) {
      context.beginPath(); context.arc(ball.x, ball.y, Pong.BALL_RADIUS, 0, Math.PI * 2);
      context.fillStyle = ball.boostRemaining > 0 ? '#f3d77c' : ball.id === engine.ball.id ? '#f6f4df' : '#aee4eb';
      context.fill();
      if (ball.boostRemaining > 0) { context.strokeStyle = '#fff3c2'; context.lineWidth = 2; context.stroke(); }
    }
    if (powerFlash && !reducedMotion.matches) {
      const age = engine.playTime - powerFlash.started;
      if (age < 0.6) {
        context.save(); context.globalAlpha = Math.max(0, 1 - age / 0.6); context.strokeStyle = powerFlash.color;
        context.lineWidth = 3; context.beginPath(); context.arc(powerFlash.x, powerFlash.y, 30 + age * 100, 0, Math.PI * 2); context.stroke(); context.restore();
      } else powerFlash = null;
    }
  }

  function resizeCanvas() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const density = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(box.width * density);
    const height = Math.round(box.height * density);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  }

  function drawPickups() {
    for (const pickup of engine.pickups) {
      const power = Pong.POWERUPS[pickup.type];
      const pulse = reducedMotion.matches ? 1 : 1 + Math.sin(engine.playTime * 3) * 0.055;
      context.save(); context.translate(pickup.x, pickup.y); context.scale(pulse, pulse);
      context.globalAlpha = pickup.remaining < 2 ? 0.6 : 1;
      context.shadowColor = power.color; context.shadowBlur = reducedMotion.matches ? 0 : 15;
      context.fillStyle = '#172c25'; context.strokeStyle = power.color; context.lineWidth = 2;
      context.beginPath(); context.roundRect(-27, -24, 54, 48, 12); context.fill(); context.stroke();
      context.shadowBlur = 0; context.fillStyle = power.color; context.font = 'bold 29px Consolas, monospace';
      context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(power.glyph, 0, 0);
      context.fillStyle = '#edf2df'; context.font = '12px Segoe UI, Arial, sans-serif'; context.fillText(power.title, 0, 40);
      context.restore();
    }
  }

  function frame(time) {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    engine.update(delta, inputState());
    const ballIds = new Set(engine.balls.map(ball => ball.id));
    for (const id of trails.keys()) { if (!ballIds.has(id)) trails.delete(id); }
    if (engine.state === 'playing') {
      for (const ball of engine.balls) {
        if (!trails.has(ball.id)) trails.set(ball.id, []);
        const trail = trails.get(ball.id);
        trail.push({ x: ball.x, y: ball.y });
        if (trail.length > 9) trail.shift();
      }
    }
    updateInterface();
    draw();
    frameId = requestAnimationFrame(frame);
  }

  document.querySelectorAll('input[type="radio"]').forEach((input) => input.addEventListener('change', syncSettings));
  $('powerups-toggle').addEventListener('change', () => { syncSettings(); updatePowerInterface(); });
  $('overlay-button').addEventListener('click', () => {
    if (restartPending) returnToSetup();
    else if (engine.state === 'paused') { togglePause(); canvas.focus({ preventScroll: true }); }
    else startMatch();
  });
  $('pause-button').addEventListener('click', () => {
    if (restartPending) { restartPending = false; lastState = ''; }
    togglePause();
  });
  $('restart-button').addEventListener('click', newMatch);
  $('sound-button').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('sound-button').setAttribute('aria-pressed', String(soundEnabled));
    $('sound-button').title = soundEnabled ? 'Oyun seslerini kapat' : 'Oyun seslerini aç';
    $('sound-label').textContent = soundEnabled ? 'açık' : 'kapalı';
    if (soundEnabled) { unlockAudio(); beep(600, 0.1); }
    if (['playing', 'countdown', 'between'].includes(engine.state)) canvas.focus({ preventScroll: true });
  });
  document.addEventListener('pong-theme-change', () => {
    if (['playing', 'countdown', 'between'].includes(engine.state)) canvas.focus({ preventScroll: true });
  });
  document.addEventListener('pong-view-change', () => {
    clearInput();
    lastTime = 0;
    if (engine.pause()) { updateInterface(); $('overlay-button').focus({ preventScroll: true }); }
  });

  window.addEventListener('keydown', (event) => {
    const interactive = event.target.closest('button,input,select,textarea,summary,a');
    if (interactive) return;
    if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(event.code) && !['ready', 'ended'].includes(engine.state)) {
      event.preventDefault(); keys.add(event.code);
    }
    if (event.code === 'Space' && !event.repeat) {
      if (['ready', 'ended'].includes(engine.state)) { event.preventDefault(); startMatch(); }
      else if (!restartPending) { event.preventDefault(); togglePause(); }
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  function loseFocus() {
    clearInput();
    if (engine.pause()) updateInterface();
  }
  window.addEventListener('blur', loseFocus);
  document.addEventListener('visibilitychange', () => { if (document.hidden) loseFocus(); });

  function setPointer(event, first) {
    const rect = canvas.getBoundingClientRect();
    const current = pointers.get(event.pointerId);
    const side = first ? (engine.config.mode === 'multi' && event.clientX > rect.left + rect.width / 2 ? 'right' : 'left') : current?.side;
    if (side) pointers.set(event.pointerId, { side, y: (event.clientY - rect.top) / rect.height * Pong.HEIGHT });
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (!['playing', 'countdown', 'between'].includes(engine.state)) return;
    event.preventDefault(); canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId); setPointer(event, true);
  });
  canvas.addEventListener('pointermove', (event) => { if (pointers.has(event.pointerId)) setPointer(event, false); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => canvas.addEventListener(name, (event) => pointers.delete(event.pointerId)));
  document.querySelectorAll('.touch-controls button').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      if (!['playing', 'countdown', 'between'].includes(engine.state)) return;
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      touchDirections.set(event.pointerId, { side: button.dataset.side, direction: Number(button.dataset.direction) });
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => button.addEventListener(name, (event) => touchDirections.delete(event.pointerId)));
  });

  window.addEventListener('pagehide', () => { cancelAnimationFrame(frameId); loseFocus(); });
  window.addEventListener('pageshow', (event) => { if (event.persisted) { lastTime = 0; frameId = requestAnimationFrame(frame); } });
  buildPowerLegend();
  window.addEventListener('resize', resizeCanvas);
  if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(canvas);
  resizeCanvas();
  syncSettings();
  updateInterface();
  frameId = requestAnimationFrame(frame);
})();
