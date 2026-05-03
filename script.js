/* ══════════════════════════════════════════════════════════
   NOELIA FUSTER — PORTFOLIO V4 · SCRIPT
   Vanilla JS — sin dependencias externas
   ══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CURSOR PERSONALIZADO ──────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (cursor && cursorRing) {
    let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;
    let initialMove = false;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!initialMove) {
        initialMove = true;
        cursor.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
    });

    (function animateCursor() {
      // Smooth dot movement
      cx += (mx - cx) * 0.25;
      cy += (my - cy) * 0.25;
      // Smooth ring movement (delayed)
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;

      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(animateCursor);
    })();

    // Delegation for better hover state management
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [data-magnetic], .flip-card, .carousel-slide, .cs-visual')) {
        cursorRing.classList.add('hovered');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [data-magnetic], .flip-card, .carousel-slide, .cs-visual')) {
        cursorRing.classList.remove('hovered');
      }
    });
  }

  /* ── NAVEGACIÓN ────────────────────────────────────────── */
  const navHeader   = document.getElementById('navHeader');
  const hamburger   = document.getElementById('navHamburger');
  const navMobile   = document.getElementById('navMobile');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const handleScroll = () => {
    if (navHeader) navHeader.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!open));
      navMobile.classList.toggle('open', !open);
      navMobile.setAttribute('aria-hidden', String(open));
      document.body.style.overflow = open ? '' : 'hidden';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.setAttribute('aria-expanded', 'false');
        navMobile.classList.remove('open');
        navMobile.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMobile.classList.contains('open')) {
        hamburger.setAttribute('aria-expanded', 'false');
        navMobile.classList.remove('open');
        navMobile.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  /* ── FADE-UP — INTERSECTION OBSERVER ──────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => fadeObserver.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ── CONTADOR ANIMADO ──────────────────────────────────── */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function animateCount(el, target, prefix, duration) {
    prefix   = prefix   || '';
    duration = duration || 1600;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutCubic(progress) * target);
      el.textContent = prefix + value.toLocaleString('es-ES');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Stats
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (statNums.length && 'IntersectionObserver' in window) {
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCount(el, target, '', 1800);
          statObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statObs.observe(el));
  }

  // KPIs dashboard
  const kpiVals = document.querySelectorAll('.kpi-val[data-count]');
  if (kpiVals.length && 'IntersectionObserver' in window) {
    const kpiObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const prefix = el.dataset.prefix || '';
          animateCount(el, target, prefix, 2000);
          kpiObs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    kpiVals.forEach(el => kpiObs.observe(el));
  }

  /* ── MANIFIESTO — WORD REVEAL ──────────────────────────── */
  const manifestoText = document.getElementById('manifestoText');
  if (manifestoText && 'IntersectionObserver' in window) {
    const words = manifestoText.textContent.trim().split(/\s+/);
    manifestoText.innerHTML = words
      .map((w, i) => '<span class="word" style="transition-delay:' + (i * 0.04) + 's">' + w + '</span>')
      .join(' ');

    const manifestoObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.word').forEach(w => w.classList.add('show'));
          manifestoObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    manifestoObs.observe(manifestoText);
  }

  /* ── EFECTO MAGNÉTICO EN BOTONES ───────────────────────── */
  const magneticEls = document.querySelectorAll('[data-magnetic]');
  magneticEls.forEach(el => {
    let centerX, centerY;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isHovered = false;

    const updatePosition = () => {
      if (!isHovered && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
        el.style.transform = '';
        return;
      }
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(updatePosition);
    };

    el.addEventListener('mouseenter', () => {
      const r = el.getBoundingClientRect();
      centerX = r.left + r.width / 2;
      centerY = r.top + r.height / 2;
      isHovered = true;
      updatePosition();
    });

    el.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - centerX) * 0.35;
      targetY = (e.clientY - centerY) * 0.35;
    });

    el.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    });
  });

  /* ── ACTIVE NAV LINK EN SCROLL ─────────────────────────── */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => sectionObs.observe(s));
  }

  /* ── FORMULARIO DE CONTACTO ────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const contactFormContent = document.getElementById('contactFormContent');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit');
      const originalBtnContent = btn.innerHTML;

      if (btn) {
        btn.innerHTML = 'Enviando...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          if (contactFormContent) contactFormContent.style.display = 'none';
          formSuccess.hidden = false;
          formSuccess.style.display = 'flex'; // Aseguramos que se vea
          formSuccess.focus();
          contactForm.reset();
        } else {
          alert('Ups! Hubo un problema con el envío. Por favor, inténtalo de nuevo o contacta directamente por WhatsApp.');
          btn.innerHTML = originalBtnContent;
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      } catch (error) {
        alert('Error de conexión. Revisa tu internet e inténtalo de nuevo.');
        btn.innerHTML = originalBtnContent;
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    });

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        formSuccess.hidden = true;
        formSuccess.style.display = 'none';
        if (contactFormContent) contactFormContent.style.display = 'flex';
        
        const btn = contactForm.querySelector('.btn-submit');
        if (btn) {
          btn.innerHTML = `
            Enviar mensaje
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          `;
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      });
    }
  }

  /* ── SMOOTH SCROLL PARA ANCLAS ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── AÑO ACTUAL EN FOOTER ───────────────────────────────── */
  const yearEl = document.querySelector('.footer-copy');
  if (yearEl) {
    yearEl.textContent = yearEl.textContent.replace(/\d{4}/, new Date().getFullYear());
  }

  /* ── CARRUSEL 3D ───────────────────────────────────────── */
  (function initCarousel() {
    const track         = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carDots');
    const prevBtn       = document.getElementById('carPrev');
    const nextBtn       = document.getElementById('carNext');
    if (!track) return;

    let allSlides     = Array.from(track.querySelectorAll('.carousel-slide'));
    let visibleSlides = allSlides.slice();
    let currentIndex  = 0;

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      visibleSlides.forEach(function (_, i) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', 'Ir al proyecto ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); });
        dotsContainer.appendChild(dot);
      });
    }

    function updateCarousel() {
      allSlides.forEach(function (s) {
        s.classList.remove('is-active', 'is-prev', 'is-next');
      });
      const total = visibleSlides.length;
      if (!total) return;

      visibleSlides[currentIndex].classList.add('is-active');
      if (total > 1) {
        const prevIdx = (currentIndex - 1 + total) % total;
        visibleSlides[prevIdx].classList.add('is-prev');
      }
      if (total > 2) {
        const nextIdx = (currentIndex + 1) % total;
        visibleSlides[nextIdx].classList.add('is-next');
      }

      // actualizar dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach(function (d, i) {
          d.classList.toggle('active', i === currentIndex);
        });
      }
    }

    function goTo(index) {
      const total = visibleSlides.length;
      if (!total) return;
      currentIndex = ((index % total) + total) % total;
      updateCarousel();
      // Pause videos on non-active slides, play on active
      allSlides.forEach(function(s, i) {
        const vids = s.querySelectorAll('video');
        vids.forEach(function(v) {
          if (s === visibleSlides[currentIndex]) {
            v.play && v.play().catch(function() {});
          } else {
            v.pause && v.pause();
          }
        });
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });

    // Click en slides laterales para centrarlas
    track.addEventListener('click', function (e) {
      const slide = e.target.closest('.carousel-slide');
      if (!slide) return;
      const idx = visibleSlides.indexOf(slide);
      if (idx !== -1 && idx !== currentIndex) goTo(idx);
    });

    // Swipe táctil
    let startX = 0;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // Drag con ratón
    let mouseStartX = 0;
    track.addEventListener('mousedown', function (e) { mouseStartX = e.clientX; });
    track.addEventListener('mouseup', function (e) {
      const diff = mouseStartX - e.clientX;
      if (Math.abs(diff) > 60) goTo(currentIndex + (diff > 0 ? 1 : -1));
    });

    // Tabs de filtro
    document.querySelectorAll('.ptab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.ptab').forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const filter = tab.dataset.tab;
        allSlides.forEach(function (s) {
          const match = filter === 'all' || s.dataset.tab === filter;
          s.style.display = match ? '' : 'none';
        });
        visibleSlides = allSlides.filter(function (s) { return s.style.display !== 'none'; });
        currentIndex  = 0;
        buildDots();
        updateCarousel();
      });
    });

    // Inicializar
    buildDots();
    updateCarousel();
  })();

  /* ── FLIP CARDS — TAP EN MÓVIL ─────────────────────────── */
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (isTouchDevice) {
    document.querySelectorAll('.flip-card').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
      });
    });
  }

  /* ── MODAL DE PROYECTOS ────────────────────────────────── */
  const modal      = document.getElementById('videoModal');
  const modalClose = document.getElementById('modalClose');
  const modalBody  = document.getElementById('modalBody');
  const modalOver  = document.getElementById('modalOverlay');

  // Titles per project
  const modalTitles = {
    'mkt-bombon':     'Campaña Performance — Bombón de Limón',
    'mkt-espinosa':   'Estrategia Visual — Espinosa Pastelería',
    'mkt-estetica':   'Estrategia Visual — Centro de Estética',
    'mkt-cafeteria':  'Estrategia Visual — Espinosa Pastelería',
    'data-transport': 'Dashboard BI — Empresa de Transporte',
    'data-rrhh':      'Dashboard RRHH — Empresa Industrial',
    'web-dentista':   'Rediseño Web — Clínica Dental',
    'data-cafeteria': 'Business Intelligence — Origen Café Artesanal'
  };

  function openModal(id) {
    if (!modal || !modalBody) return;
    modalBody.innerHTML = '';

    // Reset size class
    modal.classList.remove('is-large');

    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = modalTitles[id] || 'Caso de estudio';

    // Mapeo de renderers
    if (id === 'mkt-bombon') renderGenericImage(modalBody, 'Marketing/BombonDeLimon.png');
    else if (id === 'mkt-espinosa') renderGenericImage(modalBody, 'Marketing/EspinosaFeed.jpg');
    else if (id === 'mkt-estetica') renderGenericImage(modalBody, 'Marketing/FEED ESTETICA.svg');
    else if (id === 'data-transport') renderTransportVideo(modalBody);
    else if (id === 'data-rrhh') renderRRHHVideo(modalBody);
    else if (id === 'web-dentista') {
      modal.classList.add('is-large');
      renderDentistaVideo(modalBody);
    }
    else if (id === 'data-cafeteria') renderCafeteriaVideo(modalBody);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.classList.remove('is-large');
    document.body.style.overflow = '';
    
    // Detener videos
    const videos = modalBody.querySelectorAll('video');
    videos.forEach(v => { v.pause(); v.src = ""; v.load(); });
    modalBody.innerHTML = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOver) modalOver.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
  });

  // Accessibility: make cs-visual keyboard-navigable
  document.querySelectorAll('.cs-visual[data-video]').forEach(visual => {
    visual.setAttribute('role', 'button');
    visual.setAttribute('tabindex', '0');
    visual.setAttribute('aria-label', 'Ver caso de estudio completo');
    visual.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(visual.dataset.video);
      }
    });
  });

  // Click en visuales del carrusel
  document.querySelectorAll('.cs-visual').forEach(visual => {
    visual.addEventListener('click', () => {
      const videoId = visual.dataset.video;
      if (videoId) openModal(videoId);
    });
  });

  // Renderers específicos
  function renderBoutiqueModa(container) {
    const tmpl = document.getElementById('tmpl-boutique-moda');
    if (tmpl) container.appendChild(tmpl.content.cloneNode(true));
    initBASlider();
  }

  function initBASlider() {
    const slider = document.getElementById('baSlider');
    const after  = document.getElementById('baAfter');
    const handle = document.getElementById('baHandle');
    if (!slider || !after || !handle) return;

    let isDragging = false;
    const update = (x) => {
      const r = slider.getBoundingClientRect();
      let pos = ((x - r.left) / r.width) * 100;
      pos = Math.max(0, Math.min(100, pos));
      after.style.clipPath = `inset(0 0 0 ${pos}%)`;
      handle.style.left = `${pos}%`;
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      update(x);
    };

    handle.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', onMove);
    handle.addEventListener('touchstart', () => isDragging = true, {passive:true});
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', onMove, {passive:true});
  }

  function renderTransportVideo(container) {
    const tmpl = document.getElementById('tmpl-transport-video');
    if (!tmpl) return;
    container.appendChild(tmpl.content.cloneNode(true));
    const video = container.querySelector('video');
    const hotspots = container.querySelectorAll('.video-hotspot');
    if (video) {
      video.addEventListener('timeupdate', () => {
        const curr = video.currentTime;
        hotspots.forEach(hs => {
          const s = parseFloat(hs.dataset.start);
          const e = parseFloat(hs.dataset.end);
          hs.classList.toggle('hidden', !(curr >= s && curr <= e));
        });
      });
    }
  }

  function renderRRHHVideo(container) {
    const tmpl = document.getElementById('tmpl-rrhh-video');
    if (!tmpl) return;
    container.appendChild(tmpl.content.cloneNode(true));
    const video = container.querySelector('video');
    if (video) video.volume = 0.25;
    const hotspots = container.querySelectorAll('.video-hotspot');
    if (video) {
      video.addEventListener('timeupdate', () => {
        const curr = video.currentTime;
        hotspots.forEach(hs => {
          const s = parseFloat(hs.dataset.start);
          const e = parseFloat(hs.dataset.end);
          hs.classList.toggle('hidden', !(curr >= s && curr <= e));
        });
      });
    }
  }

  function renderCafeteriaVideo(container) {
    const tmpl = document.getElementById('tmpl-cafeteria-video');
    if (!tmpl) return;
    container.appendChild(tmpl.content.cloneNode(true));
    const video = container.querySelector('video');
    const hotspots = container.querySelectorAll('.video-hotspot');
    if (video) {
      video.addEventListener('timeupdate', () => {
        const curr = video.currentTime;
        hotspots.forEach(hs => {
          const s = parseFloat(hs.dataset.start);
          const e = parseFloat(hs.dataset.end);
          hs.classList.toggle('hidden', !(curr >= s && curr <= e));
        });
      });
    }
  }

  function renderGenericImage(container, src) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:flex-start; min-height:100%; background:rgba(0,0,0,0.2); border-radius:12px; overflow:hidden;">
        <img src="${src}" style="max-width:100%; height:auto; display:block; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
      </div>
    `;
  }

  function renderDentistaVideo(container) {
    const tmpl = document.getElementById('tmpl-dentista-video');
    if (tmpl) container.appendChild(tmpl.content.cloneNode(true));
  }

  /* ── LÓGICA DE COOKIES ─────────────────────────────────── */
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');

  if (cookieBanner && !localStorage.getItem('cookieConsent')) {
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 1500); // 1.5s delay
  }

  const hideBanner = (status) => {
    localStorage.setItem('cookieConsent', status);
    cookieBanner.classList.remove('show');
  };

  if (acceptBtn) acceptBtn.addEventListener('click', () => hideBanner('accepted'));
  if (rejectBtn) rejectBtn.addEventListener('click', () => hideBanner('rejected'));

})();
