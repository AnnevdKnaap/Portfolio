/**
 * ANNE VD KNAAP - ARCHIVE SCRAPBOOK SCRIPTS
 * Tactile interactions, darkroom lightbox, vinyl ambient player, view mode toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initViewSwitcher();
  initAmbientAudio();
  initNavScroll();
  initScrapbookTilt();
});

/* ==========================================================================
   1. DARKROOM LIGHTBOX
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !modalImg) return;

  // Select all zoomable images
  const zoomables = document.querySelectorAll('[data-zoomable], .targeted-poster-box img, .targeted-sheet-snippet img, .heavy-photo-main img, .heavy-proces-thumb img, .bluebirds-card-arch img, .bluebirds-voucher img, .stammie-box-photo img, .case-study-img-box img');

  zoomables.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const highRes = img.getAttribute('data-highres') || img.src;
      const caption = img.getAttribute('alt') || img.getAttribute('data-caption') || 'Archival Photographic Plate';
      
      modalImg.src = highRes;
      if (modalCaption) {
        modalCaption.textContent = caption;
      }
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content-box')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   2. VIEW SWITCHER (Scrapbook Desk vs Archival Index)
   ========================================================================== */
function initViewSwitcher() {
  const grid = document.getElementById('projectsGrid');
  const deskBtn = document.getElementById('btnViewDesk');
  const catalogBtn = document.getElementById('btnViewCatalog');

  if (!grid || !deskBtn || !catalogBtn) return;

  deskBtn.addEventListener('click', () => {
    grid.classList.remove('catalog-mode');
    deskBtn.classList.add('active');
    catalogBtn.classList.remove('active');
  });

  catalogBtn.addEventListener('click', () => {
    grid.classList.add('catalog-mode');
    catalogBtn.classList.add('active');
    deskBtn.classList.remove('active');
  });
}

/* ==========================================================================
   3. SELF-CONTAINED WEB AUDIO VINYL / DARKROOM AMBIENCE
   Synthesizes soft vintage vinyl crackle and warm analog hum using Web Audio API
   ========================================================================== */
function initAmbientAudio() {
  const toggleBtn = document.getElementById('ambientAudioBtn');
  const statusLabel = document.getElementById('ambientAudioStatus');
  if (!toggleBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let noiseNode = null;
  let humNode = null;
  let gainNode = null;

  function createAnalogNoise() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Buffer for vinyl dust / crackle
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Pink/Brown noise with occasional dust clicks
      const r = Math.random();
      if (r > 0.9992) {
        data[i] = (Math.random() * 2 - 1) * 0.45; // vinyl crackle pop
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.015; // low tape hiss
      }
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filter to give warm aged frequency response
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    // Subtle 50Hz mains hum
    humNode = audioCtx.createOscillator();
    humNode.type = 'sine';
    humNode.frequency.value = 55;
    const humGain = audioCtx.createGain();
    humGain.gain.value = 0.008;
    humNode.connect(humGain);

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.25;

    noiseNode.connect(filter);
    filter.connect(gainNode);
    humGain.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    humNode.start();
  }

  toggleBtn.addEventListener('click', () => {
    if (!isPlaying) {
      if (!audioCtx) {
        createAnalogNoise();
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isPlaying = true;
      toggleBtn.innerHTML = '❚❚';
      toggleBtn.setAttribute('aria-label', 'Pause Vinyl Ambience');
      if (statusLabel) statusLabel.textContent = 'PLAYING (VINYL AMBIENCE)';
    } else {
      if (audioCtx) {
        audioCtx.suspend();
      }
      isPlaying = false;
      toggleBtn.innerHTML = '▶';
      toggleBtn.setAttribute('aria-label', 'Play Vinyl Ambience');
      if (statusLabel) statusLabel.textContent = 'PAUSED (ANALOG TAPE)';
    }
  });
}

/* ==========================================================================
   4. NAVIGATION SCROLL SPY
   ========================================================================== */
function initNavScroll() {
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   5. SCRAPBOOK ANALOG HOVER TILT
   Gives interactive elements organic physical responsiveness
   ========================================================================== */
function initScrapbookTilt() {
  const cards = document.querySelectorAll('.photo-card, .project-scrap-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  });
}
