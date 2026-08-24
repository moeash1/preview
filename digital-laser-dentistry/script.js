// ============================================
// Digital Laser Dentistry — luxury edition
// ============================================

document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const smallViewport = matchMedia('(max-width: 720px)');
const coarsePointer = matchMedia('(pointer: coarse)');

/* ---------- Preloader ---------- */
const preloader = document.getElementById('preloader');
const dismissPreloader = () => {
  preloader.classList.add('done');
  setTimeout(() => { preloader.remove(); startHeroSequence(); }, 850);
};
if (reducedMotion.matches) {
  dismissPreloader();
} else {
  window.addEventListener('load', () => setTimeout(dismissPreloader, 1400));
}

/* ---------- Hero word-by-word reveal ---------- */
function startHeroSequence() {
  const words = document.querySelectorAll('#heroH1 [data-lang="en"] .hero-word, #heroH1 [data-lang="ru"] .hero-word');
  words.forEach((w, i) => setTimeout(() => w.classList.add('in'), i * 70));
  document.getElementById('heroSub').classList.add('in');
  document.getElementById('heroActions').classList.add('in');
  document.getElementById('heroStats').classList.add('in');
  runCounters();
}

/* ---------- Animated counters ---------- */
function runCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ---------- Header scroll state ---------- */
const header = document.getElementById('siteHeader');
const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

/* ---------- Mobile nav ---------- */
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
function closeMobileNav() {
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileNav.classList.toggle('open', open);
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

/* ---------- Language toggle (EN / RU) ---------- */
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setLang === lang);
  });
  try { localStorage.setItem('dld_lang', lang); } catch (e) {}
}
document.querySelectorAll('[data-set-lang]').forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.setLang));
});
try {
  const stored = localStorage.getItem('dld_lang');
  if (stored === 'ru' || stored === 'en') setLanguage(stored);
} catch (e) {}

/* ---------- Hero image fade-in ---------- */
const heroImg = document.getElementById('heroImg');
if (heroImg.complete) heroImg.classList.add('loaded');
else heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));

/* ---------- Hero video (poster-first, reduced-motion aware) ---------- */
const heroVideo = document.getElementById('heroVideo');
const heroVideoToggle = document.getElementById('heroVideoToggle');

function loadHeroVideo() {
  if (reducedMotion.matches || smallViewport.matches) return;
  if (heroVideo.src) return;
  heroVideo.src = 'assets/video/hero.mp4';
  heroVideo.load();
  heroVideo.addEventListener('playing', () => {
    heroVideo.classList.add('playing');
    heroVideoToggle.hidden = false;
  }, { once: true });
  heroVideo.addEventListener('ended', () => {
    heroVideo.classList.remove('playing');
    heroVideoToggle.hidden = true;
  }, { once: true });
  const attempt = heroVideo.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => { /* autoplay blocked; poster stays as hero */ });
  }
}

if (heroImg.complete) loadHeroVideo();
else heroImg.addEventListener('load', loadHeroVideo);

heroVideoToggle.addEventListener('click', () => {
  if (heroVideo.paused) {
    heroVideo.play();
    heroVideoToggle.classList.remove('paused');
    heroVideoToggle.setAttribute('aria-label', 'Pause background video');
  } else {
    heroVideo.pause();
    heroVideoToggle.classList.add('paused');
    heroVideoToggle.setAttribute('aria-label', 'Play background video');
  }
});

reducedMotion.addEventListener('change', (e) => {
  if (e.matches) {
    heroVideo.pause();
    heroVideo.classList.remove('playing');
    heroVideoToggle.hidden = true;
  } else {
    loadHeroVideo();
  }
});

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Cursor glow (desktop only, respects reduced motion) ---------- */
if (!coarsePointer.matches && !reducedMotion.matches) {
  const glow = document.getElementById('cursorGlow');
  let mx = 0, my = 0, gx = 0, gy = 0, raf = null;
  function move() {
    gx += (mx - gx) * 0.18;
    gy += (my - gy) * 0.18;
    glow.style.transform = `translate(${gx - glow.offsetWidth/2}px, ${gy - glow.offsetHeight/2}px)`;
    if (Math.abs(mx - gx) > 0.5 || Math.abs(my - gy) > 0.5) raf = requestAnimationFrame(move);
    else raf = null;
  }
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    glow.classList.add('on');
    if (!raf) raf = requestAnimationFrame(move);
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('on'));

  const hoverables = document.querySelectorAll('a, button, .service-row, .why-card, .tech-item, .review-card');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('hover'));
    el.addEventListener('mouseleave', () => glow.classList.remove('hover'));
  });
}

/* ---------- Button shine (mouse position tracked) ---------- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
});

/* ---------- Pause animations on hidden tab ---------- */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
});

/* ---------- Before / After slider ---------- */
const baSlider = document.getElementById('baSlider');
if (baSlider) {
  const beforeWrap = document.getElementById('baBeforeWrap');
  const beforeInner = document.getElementById('baBeforeInner');
  const handle = document.getElementById('baHandle');
  let baDragging = false;

  function setBA(pct) {
    pct = Math.max(0, Math.min(100, pct));
    beforeWrap.style.width = pct + '%';
    handle.style.left = pct + '%';
    // keep the before image full-width relative to the slider, not the clipped wrapper
    beforeInner.style.width = baSlider.offsetWidth + 'px';
  }
  function baFromEvent(clientX) {
    const r = baSlider.getBoundingClientRect();
    setBA(((clientX - r.left) / r.width) * 100);
  }
  setBA(50);
  window.addEventListener('resize', () => setBA(parseFloat(handle.style.left) || 50));

  baSlider.addEventListener('mousedown', (e) => { baDragging = true; baFromEvent(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (baDragging) baFromEvent(e.clientX); });
  window.addEventListener('mouseup', () => { baDragging = false; });
  baSlider.addEventListener('touchstart', (e) => { baDragging = true; baFromEvent(e.touches[0].clientX); }, { passive: true });
  baSlider.addEventListener('touchmove', (e) => { if (baDragging) baFromEvent(e.touches[0].clientX); }, { passive: true });
  baSlider.addEventListener('touchend', () => { baDragging = false; });
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close others
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').style.maxHeight = null;
      }
    });
    item.classList.toggle('open', !isOpen);
    q.setAttribute('aria-expanded', String(!isOpen));
    a.style.maxHeight = isOpen ? null : a.scrollHeight + 'px';
  });
});

/* ---------- Sticky booking bar ---------- */
const stickyCta = document.getElementById('stickyCta');
let stickyDismissed = false;
try { stickyDismissed = sessionStorage.getItem('dld_sticky_dismissed') === '1'; } catch (e) {}
const heroSection = document.getElementById('home');
if (stickyCta && heroSection && !stickyDismissed) {
  const stickyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // show once hero is scrolled out of view, hide near the footer/contact
      stickyCta.classList.toggle('show', !entry.isIntersecting && !stickyDismissed);
    });
  }, { threshold: 0, rootMargin: '-40% 0px 0px 0px' });
  stickyObserver.observe(heroSection);
}
document.getElementById('stickyCtaDismiss')?.addEventListener('click', () => {
  stickyDismissed = true;
  stickyCta.classList.remove('show');
  try { sessionStorage.setItem('dld_sticky_dismissed', '1'); } catch (e) {}
});

/* ---------- Cookie consent ---------- */
const cookieBanner = document.getElementById('cookieBanner');
let cookieChoice = null;
try { cookieChoice = localStorage.getItem('dld_cookie_consent'); } catch (e) {}
if (cookieBanner && !cookieChoice) {
  setTimeout(() => cookieBanner.classList.add('show'), 1800);
}
function resolveCookie(choice) {
  try { localStorage.setItem('dld_cookie_consent', choice); } catch (e) {}
  cookieBanner.classList.remove('show');
}
document.getElementById('cookieAccept')?.addEventListener('click', () => resolveCookie('accepted'));
document.getElementById('cookieDecline')?.addEventListener('click', () => resolveCookie('declined'));

/* ---------- Contact form ---------- */
const bookingForm = document.getElementById('bookingForm');
const contactFormWrap = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  contactFormWrap.classList.add('submitted');
  formSuccess.classList.add('show');
});

/* ============================================
   Chat widget — ready to wire into n8n + Claude
   ============================================
   Paste your n8n webhook URL below. The webhook receives:
     { message, sessionId, lang }
   and should respond with JSON: { "reply": "..." }
------------------------------------------------------------- */
const CHATBOT_WEBHOOK_URL = 'https://aiautoproject.app.n8n.cloud/webhook/dental-website-chat';

const chatLauncher = document.getElementById('chatLauncher');
const chatPanel = document.getElementById('chatPanel');
const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const chatPlaceholders = { en: 'Type a message...', ru: 'Напишите сообщение...' };
function updateChatPlaceholder() {
  chatInput.placeholder = chatPlaceholders[document.documentElement.lang] || chatPlaceholders.en;
}
updateChatPlaceholder();
document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', updateChatPlaceholder));

function getSessionId() {
  let id = sessionStorage.getItem('dld_chat_session');
  if (!id) {
    id = 'dld-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem('dld_chat_session', id);
  }
  return id;
}

function toggleChat(open) {
  const isOpen = open ?? !chatPanel.classList.contains('open');
  chatPanel.classList.toggle('open', isOpen);
  chatLauncher.classList.toggle('open', isOpen);
  chatLauncher.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) setTimeout(() => chatInput.focus(), 300);
}
chatLauncher.addEventListener('click', () => toggleChat());

function addMessage(text, who) {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  return div;
}

const fallbackReply = {
  en: "This assistant isn't connected yet — the clinic team will add that shortly. In the meantime, please call +971 4 557 8479 or use the contact form below.",
  ru: "Ассистент пока не подключён — команда клиники добавит его в ближайшее время. Пока свяжитесь по номеру +971 4 557 8479 или через форму ниже."
};

async function sendToWebhook(message) {
  const lang = document.documentElement.lang || 'en';
  if (!CHATBOT_WEBHOOK_URL) return fallbackReply[lang] || fallbackReply.en;
  try {
    const res = await fetch(CHATBOT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: getSessionId(), lang })
    });
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    return data.reply || "Sorry, I didn't quite get that — could you rephrase?";
  } catch (err) {
    return "I'm having trouble connecting right now. Please try again shortly, or call +971 4 557 8479.";
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatInput.value = '';
  const typing = addMessage('...', 'bot');
  const reply = await sendToWebhook(text);
  typing.textContent = reply;
  chatBody.scrollTop = chatBody.scrollHeight;
});
