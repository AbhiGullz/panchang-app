// Standalone documents only. Embedded Guide uses the app's existing ad slots.
(() => {
  if (window.self !== window.top || location.hostname !== 'gajaapanchang.org') return;
  const mount = document.createElement('aside');
  mount.style.cssText = 'display:flex;justify-content:center;max-width:100%;overflow:hidden;margin:24px auto';
  const parent = document.querySelector('main');
  if (!parent) return;
  parent.appendChild(mount);
  let country = null;
  let frame = null;
  function render() {
    let consent = null;
    try { consent = localStorage.getItem('gajaa-adsterra-consent-v1'); } catch {}
    const allowed = !navigator.globalPrivacyControl && consent !== 'denied' && (consent === 'granted' || country === 'US' || country === 'IN');
    if (!allowed) { mount.replaceChildren(); frame = null; return; }
    const desktop = window.innerWidth >= 832;
    const unit = desktop ? 'desktop' : 'mobile';
    if (frame && frame.dataset.unit === unit) return;
    frame = document.createElement('iframe');
    frame.dataset.unit = unit;
    frame.title = ({ hi: 'विज्ञापन', mr: 'जाहिरात', ta: 'விளம்பரம்', te: 'ప్రకటన', kn: 'ಜಾಹೀರಾತು', ml: 'പരസ്യം', gu: 'જાહેરાત', bn: 'বিজ্ঞাপন', pa: 'ਇਸ਼ਤਿਹਾਰ' })[document.documentElement.lang] || 'Advertisement';
    frame.width = desktop ? '728' : '320'; frame.height = desktop ? '90' : '50';
    frame.style.cssText = 'border:0;max-width:100%';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = 'https://ads.gajaapanchang.org/advertising/banner.html?unit=' + unit;
    mount.replaceChildren(frame);
  }
  render();
  window.addEventListener('gajaa-advertising-consent', render);
  window.addEventListener('storage', render);
  window.addEventListener('resize', render);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  fetch('/cdn-cgi/trace', { cache: 'no-store', signal: controller.signal })
    .then(response => response.ok ? response.text() : '')
    .then(trace => { country = (/^loc=([A-Z]{2})$/m.exec(trace) || [])[1] || null; render(); })
    .catch(() => {})
    .finally(() => clearTimeout(timer));
})();
