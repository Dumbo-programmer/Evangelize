// Main JS for countdown, music lottery and gallery lightbox

// ============ CONFIG ============
// ASSUMPTION: set the event date here. Updated to match event details from site (gates open at 4:00pm on Nov 21, 2025).
const EVENT_DATE = '2025-11-21T16:00:00';

// YouTube video IDs provided by the user
const MUSIC_VIDEOS = [
  'HcpeLDp0Foo',
  'G2XtRuPfaAU',
  'nQWFzMvCfLE',
  'iJCV_2H9xD0'
];

// ============ COUNTDOWN ============
function startCountdown(targetIso) {
  const target = new Date(targetIso).getTime();
  const d = id => document.getElementById(id);

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (d('days')) d('days').textContent = days;
    if (d('hours')) d('hours').textContent = String(hours).padStart(2,'0');
    if (d('minutes')) d('minutes').textContent = String(minutes).padStart(2,'0');
    if (d('seconds')) d('seconds').textContent = String(seconds).padStart(2,'0');
  }

  tick();
  setInterval(tick, 1000);
}

// ============ MUSIC LOTTERY ============
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setMusicIframe(videoId, autoplay = false) {
  // Preferred path: use the YT player instance if available.
  if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
    try {
      window.ytPlayer.loadVideoById({videoId});
      if (autoplay && typeof window.ytPlayer.playVideo === 'function') {
        window.ytPlayer.playVideo();
      }
      return;
    } catch (e) {
      // fallthrough to iframe fallback
    }
  }

  // Fallback: create a hidden iframe to autoplay audio-only.
  const existing = document.getElementById('ytHiddenFallback');
  if (existing) existing.remove();
  const iframe = document.createElement('iframe');
  iframe.id = 'ytHiddenFallback';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  // start playback at 10 seconds into each video to skip intros
  iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=${autoplay?1:0}&controls=0&playsinline=1&start=10`;
  document.body.appendChild(iframe);
}

function wireMusicControls() {
  // No visible music controls by design. If a track list element exists, populate it
  // (kept hidden or informational).
  const listEl = document.getElementById('trackList');
  if (listEl) {
    listEl.innerHTML = MUSIC_VIDEOS.map(id => `<li>${id}</li>`).join('');
  }
}

// ============ YouTube IFrame API integration for autoplay + auto-next ============
// We'll dynamically load the API and create a player that will autoplay a random track
// on the evangelize page and automatically pick another when the current ends.
function loadYouTubeAPIIfNeeded() {
  if (!document.getElementById('ytAudioPlayer')) return; // nothing to do
  if (window.YT && window.YT.Player) {
    // API already available
    initYTPlayer();
    return;
  }

  // Create script tag for IFrame API
  if (!document.getElementById('youtube-iframe-api')) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  // API will call this global function when ready
  window.onYouTubeIframeAPIReady = function() {
    initYTPlayer();
  };
}

function initYTPlayer() {
  const el = document.getElementById('ytAudioPlayer');
  if (!el) return;

  // Create player on the hidden container. Player will be visually hidden.
    try {
    // create YT player that starts playback at 10s
    window.ytPlayer = new YT.Player('ytAudioPlayer', {
      height: '0',
      width: '0',
      videoId: pickRandom(MUSIC_VIDEOS),
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3,
        disablekb: 1,
        start: 10
      },
      events: {
        onReady: function(event) {
          try { event.target.playVideo(); } catch (e) { /* ignore */ }
        },
        onStateChange: function(event) {
          if (event.data === YT.PlayerState.ENDED) {
            const next = pickRandom(MUSIC_VIDEOS);
            try {
              // ensure next track also starts at 10s
              window.ytPlayer.loadVideoById({videoId: next, startSeconds: 10});
              window.ytPlayer.playVideo();
            } catch (e) {
              setMusicIframe(next, true);
            }
          }
        }
      }
    });
  } catch (e) {
    // fallback: hidden iframe autoplay starting at 10s
    setMusicIframe(pickRandom(MUSIC_VIDEOS), true);
  }
}

// ============ GALLERY LIGHTBOX ============
function wireGallery() {
  const gridItems = document.querySelectorAll('.grid-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  if (!gridItems || !lightbox) return;

  gridItems.forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const href = a.getAttribute('href');
      lbImg.src = href;
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  if (lbClose) lbClose.addEventListener('click', () => lightbox.setAttribute('aria-hidden', 'true'));
  lightbox.addEventListener('click', (ev) => { if (ev.target === lightbox) lightbox.setAttribute('aria-hidden','true'); });
}

// ============ NAV HIGHLIGHT ============
function highlightNav() {
  const path = location.pathname.split('/').pop();
  const links = document.querySelectorAll('.nav-list a');
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (href === 'index.html' && path === '')) a.classList.add('active');
  });
}

// ============ BOOT ============
document.addEventListener('DOMContentLoaded', () => {
  // Start countdown (change EVENT_DATE above if needed)
  try { startCountdown(EVENT_DATE); } catch(e) { /* ignore */ }

  wireMusicControls();
  // If the evangelize page is present, load the YouTube API and start background audio
  try { loadYouTubeAPIIfNeeded(); } catch (e) { /* ignore */ }
  wireGallery();
  highlightNav();
  wireThemeToggle();
  try { initHeroParallax(); } catch (e) { /* ignore */ }
  try{ initPageLoader(); } catch(e) { /* ignore */ }
});

// Section title animation when scrolled into view
function wireSectionTitleAnimations(){
  // observe both section titles and any elements with .reveal for entrance animations
  const els = document.querySelectorAll('.section-title, .reveal, .footer-grid > div');
  if (!els.length) return;
  const io = new IntersectionObserver((items)=>{
    items.forEach(i=>{
      if(i.isIntersecting) {
        i.target.classList.add('in-view');
        // optionally unobserve to keep static after animation
        io.unobserve(i.target);
      }
    })
  },{threshold:0.2});
  els.forEach(el=>io.observe(el));
}

// call after DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
  try{ wireSectionTitleAnimations(); }catch(e){}
});

// Parallax hero movement based on scroll and pointer movement
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const layers = hero.querySelectorAll('.parallax-layer');

  function update() {
    const rect = hero.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    const scrollFactor = center / window.innerHeight;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.5;
      const y = scrollFactor * 40 * speed;
      layer.style.transform = `translateY(${y}px)`;
    });
  }

  // small parallax on mouse move
  hero.addEventListener('mousemove', (ev) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = (ev.clientX - w/2) / (w/2);
    const y = (ev.clientY - h/2) / (h/2);
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.5;
      const tx = x * 10 * speed;
      const ty = y * 8 * speed;
      layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  });

  window.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
}

// Page loader: hide the loader after the window finishes loading
function initPageLoader(){
  const loader = document.getElementById('pageLoader');
  if(!loader) return;

  // Ensure the loader is visible for at least this many ms so the animation is visible
  const minVisible = 1400; // milliseconds
  const start = performance.now();

  // When window load fires (images/fonts etc), fade out the loader after minVisible elapsed
  window.addEventListener('load', ()=>{
    const now = performance.now();
    const elapsed = now - start;
    const remaining = Math.max(0, minVisible - elapsed);
    setTimeout(()=>{
      loader.classList.add('loaded');
      // remove from DOM after transition
      setTimeout(()=>{ try{ loader.remove(); }catch(e){} }, 650);
    }, remaining);
  });

  // Fallback: if load doesn't fire in 6s, hide it to avoid stuck loaders
  setTimeout(()=>{
    if(document.body.contains(loader) && !loader.classList.contains('loaded')){
      // also respect minVisible on fallback
      const now = performance.now();
      const elapsed = now - start;
      const remaining = Math.max(0, minVisible - elapsed);
      setTimeout(()=>{
        loader.classList.add('loaded');
        setTimeout(()=>{ try{ loader.remove(); }catch(e){} },650);
      }, remaining);
    }
  }, 6000);
}

// ============ THEME TOGGLE ============
function applyTheme(theme) {
  const body = document.body;
  if (theme === 'light') {
    body.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme','light');
  } else {
    body.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.setItem('theme','dark');
  }
  // update aria-pressed for any toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => btn.setAttribute('aria-pressed', String(theme === 'dark')));
}

function wireThemeToggle() {
  const stored = localStorage.getItem('theme');
  // default dark unless user stored light
  applyTheme(stored === 'light' ? 'light' : 'dark');

  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });
  });
}
