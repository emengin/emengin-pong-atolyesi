/* İlk çizimden önce temayı uygular. Kayıt engellense de tema değiştirilebilir. */
(function () {
  'use strict';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { preference = localStorage.getItem('pong-atolyesi-theme'); } catch (_) { /* Depolama isteğe bağlıdır. */ }
  if (!['light', 'dark'].includes(preference)) preference = null;

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111c19' : '#f6f4ec';
    const button = document.getElementById('theme-button');
    if (!button) return;
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? 'Açık temayı aç' : 'Koyu temayı aç';
    document.getElementById('theme-icon').textContent = dark ? '☀' : '☾';
    document.getElementById('theme-label').textContent = dark ? 'Açık tema' : 'Koyu tema';
  }

  apply(preference || (media.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.getElementById('theme-button').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('pong-atolyesi-theme', preference); } catch (_) { /* Tercih bu oturumda geçerli kalır. */ }
      apply(preference);
      document.dispatchEvent(new Event('pong-theme-change'));
    });
  });
  media.addEventListener('change', () => { if (!preference) apply(media.matches ? 'dark' : 'light'); });
})();
