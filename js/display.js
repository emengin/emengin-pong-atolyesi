/* Native tam ekran ve desteklenmediğinde pencereyi kaplayan oyun görünümü. */
(function () {
  'use strict';
  const panel = document.getElementById('arena-panel');
  const stage = document.getElementById('court-stage');
  const court = document.getElementById('court');
  const button = document.getElementById('fullscreen-button');
  const label = document.getElementById('fullscreen-label');
  const status = document.getElementById('display-status');
  const coarse = matchMedia('(any-pointer: coarse)');
  const portrait = matchMedia('(orientation: portrait)');
  const inertElements = new Map();
  let expanded = false;
  let fallback = false;
  let busy = false;

  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;

  function isolateGame(active) {
    if (!active) {
      inertElements.forEach((previous, element) => { element.inert = previous; });
      inertElements.clear();
      return;
    }
    let current = panel;
    while (current.parentElement && current !== document.body) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && !['SCRIPT', 'STYLE'].includes(sibling.tagName)) {
          inertElements.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
      current = current.parentElement;
    }
  }

  function fitCourt() {
    if (!expanded) { court.style.removeProperty('width'); court.style.removeProperty('height'); return; }
    const box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const ratio = coarse.matches && portrait.matches ? 1.3 : Pong.WIDTH / Pong.HEIGHT;
    const width = Math.min(box.width, box.height * ratio);
    court.style.width = `${width}px`;
    court.style.height = `${width / ratio}px`;
  }

  function syncView() {
    const active = fallback || fullscreenElement() === panel;
    if (expanded === active) { fitCourt(); return; }
    expanded = active;
    panel.classList.toggle('is-expanded', active);
    document.body.classList.toggle('game-expanded', active);
    button.setAttribute('aria-pressed', String(active));
    label.textContent = active ? 'Küçült' : 'Tam ekran';
    button.title = active ? 'Oyun görünümünü küçült' : 'Oyunu tam ekranda aç';
    status.textContent = active
      ? 'Oyun ekranı büyütüldü. Küçült düğmesiyle veya Esc tuşuyla çıkabilirsin.'
      : 'Normal oyun görünümüne dönüldü.';
    isolateGame(active);
    fitCourt();
    if (!active) button.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('pong-view-change', { detail: { expanded: active } }));
  }

  async function toggleFullscreen() {
    if (busy) return;
    busy = true;
    button.disabled = true;
    try {
      if (expanded) {
        if (fullscreenElement() === panel) {
          const exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) await exit.call(document);
        } else fallback = false;
        syncView();
      } else {
        const enter = panel.requestFullscreen || panel.webkitRequestFullscreen;
        if (enter) {
          try { await enter.call(panel); }
          catch (_) { fallback = true; }
        } else fallback = true;
        syncView();
      }
    } catch (_) {
      status.textContent = 'Çıkmak için tarayıcının tam ekran düğmesini veya Esc tuşunu kullan.';
    } finally { busy = false; button.disabled = false; }
  }

  button.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', syncView);
  document.addEventListener('webkitfullscreenchange', syncView);
  window.addEventListener('keydown', event => {
    if ((event.key === 'Escape' || event.code === 'Escape') && fallback) {
      event.preventDefault(); fallback = false; syncView();
    }
  });
  window.addEventListener('resize', fitCourt);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fitCourt);
  portrait.addEventListener('change', () => {
    fitCourt();
    document.dispatchEvent(new CustomEvent('pong-view-change', { detail: { expanded } }));
  });
  if (window.ResizeObserver) new ResizeObserver(fitCourt).observe(stage);
})();
