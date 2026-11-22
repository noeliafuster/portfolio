/* ══════════════════════════════════════════════════════════
   NOELIA FUSTER — PORTFOLIO V4 · SCRIPT
   Vanilla JS — sin dependencias externas
   ══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const htmlEl = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // localStorage puede lanzar en modo privado o con cookies bloqueadas
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* sin persistencia */ } }
  };

  /* ── CONSENTIMIENTO DE COOKIES + ANALÍTICA ─────────────── */
  // Google Analytics / GTM solo se cargan tras aceptar (LSSI-CE art. 22.2 y RGPD).
  const GA_ID = 'G-CGS564ZRFT';
  const GTM_ID = 'GTM-MRWTKW25';

  function loadAnalytics() {
    if (window.__analyticsLoaded) return;
    window.__analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });

    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gtagScript);

    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(gtmScript);
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach(function (c) {
      const name = c.split('=')[0].trim();
      if (/^_ga/.test(name) || name === '_gid' || name === '_gat') {
        const host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + d;
        });
      }
    });
  }

  const pNotice = document.getElementById('p-notice');
  const acceptBtn = document.getElementById('accept-p-notice');
  const rejectBtn = document.getElementById('reject-p-notice');

  // moveFocus solo cuando lo abre el usuario ("Configurar cookies"): al cargar la
  // página no se roba el foco (y se evita un reflow forzado que retrasaba la carga)
  function showNotice(moveFocus) {
    if (!pNotice) return;
    pNotice.classList.add('show');
    if (moveFocus === true && acceptBtn) acceptBtn.focus({ preventScroll: true });
  }

  function hideNotice(status) {
    const previous = store.get('privacyConsent');
    store.set('privacyConsent', status);
    if (pNotice) pNotice.classList.remove('show');
    if (status === 'accepted') {
      loadAnalytics();
    } else {
      deleteAnalyticsCookies();
      // Si ya se había cargado GA, recargamos para detenerlo por completo
      if (previous === 'accepted' && window.__analyticsLoaded) location.reload();
    }
  }

  const consent = store.get('privacyConsent');
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (!consent && pNotice) {
    // Sin retraso: antes el aviso aparecía a los 1,2 s y era el LCP en móvil
    requestAnimationFrame(function () { showNotice(false); });
  }

  if (acceptBtn) acceptBtn.addEventListener('click', () => hideNotice('accepted'));
  if (rejectBtn) rejectBtn.addEventListener('click', () => hideNotice('rejected'));
  document.querySelectorAll('[data-open-cookie-settings]').forEach(btn => {
    btn.addEventListener('click', function () { showNotice(true); });
  });

  /* ── THEME TOGGLE (DARK / LIGHT) ──────────────────────── */
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    if (theme === 'light') {
      htmlEl.setAttribute('data-theme', 'light');
    } else {
      htmlEl.removeAttribute('data-theme');
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro');
    }
  }

  applyTheme(store.get('theme') === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      store.set('theme', next);
    });
  }

  /* ── CURSOR PERSONALIZADO ──────────────────────────────── */
  // Solo con ratón y sin movimiento reducido; si no, se mantiene el cursor nativo.
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (cursor && cursorRing && finePointer && !reducedMotion) {
    htmlEl.classList.add('has-custom-cursor');
    let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;
    let rafId = null;
    let shown = false;

    function animateCursor() {
      cx += (mx - cx) * 0.35;
      cy += (my - cy) * 0.35;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;

      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      // El bucle se detiene cuando el cursor alcanza al ratón
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
        rafId = requestAnimationFrame(animateCursor);
      } else {
        rafId = null;
      }
    }

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) {
        shown = true;
        cx = rx = mx; cy = ry = my;
        cursor.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
      if (!rafId) rafId = requestAnimationFrame(animateCursor);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      cursorRing.style.opacity = '0';
      shown = false;
    });

    const hoverSel = 'a, button, summary, [data-magnetic], .flip-card, .carousel-slide, .cs-visual';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) cursorRing.classList.add('hovered');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) cursorRing.classList.remove('hovered');
    });
  }

  /* ── NAVEGACIÓN ────────────────────────────────────────── */
  const navHeader = document.getElementById('navHeader');
  const hamburger = document.getElementById('navHamburger');
  const navMobile = document.getElementById('navMobile');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const handleScroll = () => {
    if (navHeader) navHeader.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  // En el siguiente frame para no forzar un layout síncrono durante la carga
  requestAnimationFrame(handleScroll);

  function setMobileMenu(open) {
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    navMobile.classList.toggle('open', open);
    navMobile.setAttribute('aria-hidden', String(!open));
    navMobile.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.getAttribute('aria-expanded') === 'true';
      setMobileMenu(!open);
      if (!open) {
        const first = navMobile.querySelector('a');
        if (first) first.focus();
      }
    });

    mobileLinks.forEach(link => link.addEventListener('click', () => setMobileMenu(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMobile.classList.contains('open')) {
        setMobileMenu(false);
        hamburger.focus();
      }
    });
  }

  /* ── FADE-UP — INTERSECTION OBSERVER ──────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window && !reducedMotion) {
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
  // El HTML ya contiene el valor final (sin JS o con movimiento reducido se ve tal cual).
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function animateCount(el, target, prefix, suffix, duration) {
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.round(easeOutCubic(progress) * target);
      el.textContent = prefix + value.toLocaleString('es-ES') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reducedMotion) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        animateCount(el, parseInt(el.dataset.count, 10), el.dataset.prefix || '', el.dataset.suffix || '',
          el.classList.contains('kpi-val') ? 2000 : 1800);
        countObs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countObs.observe(el));
  }

  /* ── MANIFIESTO — ROTATING TYPEWRITER ────────────────────── */
  const manifestoRotate = document.getElementById('manifestoRotate');
  if (manifestoRotate && 'IntersectionObserver' in window && !reducedMotion) {
    const phrases = [
      'que tengas que estar encima de cada detalle.',
      'que todo dependa de tu tiempo y energía.',
      'que te obliguen a apagar fuegos constantemente.',
      'que el crecimiento signifique más carga operativa.',
      'que el día a día del negocio te atrape.'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 45;
    const deleteSpeed = 25;
    const pauseAfterType = 2400;
    const pauseAfterDelete = 400;

    // Los lectores de pantalla leen la frase completa, no cada letra
    manifestoRotate.setAttribute('aria-hidden', 'true');
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = phrases.join(' / ');
    manifestoRotate.parentNode.insertBefore(srText, manifestoRotate);

    function typeEffect() {
      const current = phrases[phraseIndex];
      if (!isDeleting) {
        manifestoRotate.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          setTimeout(function () { isDeleting = true; typeEffect(); }, pauseAfterType);
          return;
        }
        setTimeout(typeEffect, typeSpeed);
      } else {
        manifestoRotate.textContent = current.substring(0, charIndex);
        charIndex--;
        if (charIndex < 0) {
          isDeleting = false;
          charIndex = 0;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeEffect, pauseAfterDelete);
          return;
        }
        setTimeout(typeEffect, deleteSpeed);
      }
    }

    const manifestoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          manifestoRotate.textContent = '';
          typeEffect();
          manifestoObs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    manifestoObs.observe(manifestoRotate);
  }

  /* ── EFECTO MAGNÉTICO EN BOTONES ───────────────────────── */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      let centerX, centerY;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let isHovered = false;
      let running = false;

      const updatePosition = () => {
        if (!isHovered && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
          el.style.transform = '';
          running = false;
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
        if (!running) { running = true; updatePosition(); }
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
  }

  /* ── ACTIVE NAV LINK EN SCROLL ─────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => sectionObs.observe(s));
  }

  /* ── FORMULARIO DE CONTACTO ────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const formStatus = document.getElementById('formStatus');
  const contactFormContent = document.getElementById('contactFormContent');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (contactForm && formSuccess) {
    const btn = contactForm.querySelector('.btn-submit');
    const btnLabel = btn ? btn.querySelector('.btn-submit-label') : null;

    const setSending = (sending) => {
      if (!btn) return;
      btn.disabled = sending;
      btn.style.opacity = sending ? '0.7' : '';
      if (btnLabel) btnLabel.textContent = sending ? 'Enviando...' : 'Enviar mensaje';
    };

    const showError = (msg) => {
      if (formStatus) formStatus.textContent = msg;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showError('');

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      setSending(true);
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        const data = await response.json().catch(() => ({}));
        const ok = response.ok && String(data.success) !== 'false';

        if (ok) {
          contactForm.reset();
          if (contactFormContent) contactFormContent.hidden = true;
          formSuccess.hidden = false;
          formSuccess.focus();
          if (window.gtag) window.gtag('event', 'generate_lead', { method: 'contact_form' });
        } else {
          showError('No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbeme a hola@noeliafuster.com o por WhatsApp.');
        }
      } catch (error) {
        showError('Error de conexión. Revisa tu conexión a internet e inténtalo de nuevo.');
      } finally {
        setSending(false);
      }
    });

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        formSuccess.hidden = true;
        if (contactFormContent) contactFormContent.hidden = false;
        const first = contactForm.querySelector('input:not([type="hidden"]):not([tabindex="-1"])');
        if (first) first.focus();
      });
    }
  }

  /* ── SMOOTH SCROLL PARA ANCLAS ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', hash);
      // Mueve el foco para teclado y lectores de pantalla
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ── AÑO ACTUAL EN FOOTER ───────────────────────────────── */
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ── CARRUSEL ──────────────────────────────────────────── */
  (function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carDots');
    const prevBtn = document.getElementById('carPrev');
    const nextBtn = document.getElementById('carNext');
    const status = document.getElementById('carouselStatus');
    if (!track) return;

    const allSlides = Array.from(track.querySelectorAll('.carousel-slide'));
    let visibleSlides = allSlides.slice();
    let currentIndex = 0;
    let inView = false;
    let suppressClick = false;

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      visibleSlides.forEach(function (slide, i) {
        const dot = document.createElement('button');
        const title = slide.querySelector('.cs-title');
        dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', 'Ir al proyecto ' + (i + 1) + (title ? ': ' + title.textContent : ''));
        dot.setAttribute('type', 'button');
        dot.addEventListener('click', function () { goTo(i); });
        dotsContainer.appendChild(dot);
      });
    }

    function syncVideos() {
      const active = visibleSlides[currentIndex];
      allSlides.forEach(function (s) {
        s.querySelectorAll('video').forEach(function (v) {
          if (s === active && inView && !reducedMotion) {
            const p = v.play();
            if (p && p.catch) p.catch(function () { });
          } else {
            v.pause();
          }
        });
      });
    }

    function updateCarousel(announce) {
      allSlides.forEach(function (s) {
        s.classList.remove('is-active', 'is-prev', 'is-next');
      });
      const total = visibleSlides.length;
      if (!total) return;

      const active = visibleSlides[currentIndex];
      active.classList.add('is-active');
      if (total > 1) visibleSlides[(currentIndex - 1 + total) % total].classList.add('is-prev');
      if (total > 2) visibleSlides[(currentIndex + 1) % total].classList.add('is-next');

      // Solo la slide activa es accesible por teclado
      allSlides.forEach(function (s) {
        const isActive = s === active;
        s.setAttribute('aria-hidden', String(!isActive));
        const visual = s.querySelector('.cs-visual[data-video]');
        if (visual) visual.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach(function (d, i) {
          d.classList.toggle('active', i === currentIndex);
          if (i === currentIndex) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }

      if (announce && status) {
        const title = active.querySelector('.cs-title');
        status.textContent = 'Proyecto ' + (currentIndex + 1) + ' de ' + total + (title ? ': ' + title.textContent : '');
      }

      syncVideos();
    }

    // La pista mide lo que la tarjeta visible más alta (antes tenía alturas fijas
    // y las tarjetas se salían por abajo, tapando los puntos)
    function fitTrackHeight() {
      let max = 0;
      visibleSlides.forEach(function (s) { max = Math.max(max, s.offsetHeight); });
      if (max) track.style.height = max + 'px';
    }

    let resizeRaf = null;
    window.addEventListener('resize', function () {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () { resizeRaf = null; fitTrackHeight(); });
    }, { passive: true });
    // Las imágenes tienen alto fijo por CSS, pero las fuentes pueden cambiar el alto del texto
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTrackHeight);

    function goTo(index) {
      const total = visibleSlides.length;
      if (!total) return;
      currentIndex = ((index % total) + total) % total;
      updateCarousel(true);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });

    // Click en slides laterales: solo las centra (no abre el modal)
    track.addEventListener('click', function (e) {
      if (suppressClick) {
        suppressClick = false;
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      const slide = e.target.closest('.carousel-slide');
      if (!slide) return;
      const idx = visibleSlides.indexOf(slide);
      if (idx !== -1 && idx !== currentIndex) {
        e.stopPropagation();
        goTo(idx);
      }
    }, true);

    // Swipe táctil
    let startX = 0;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 400);
        goTo(currentIndex + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });

    // Drag con ratón (un arrastre no cuenta como click)
    let mouseStartX = null;
    track.addEventListener('mousedown', function (e) { mouseStartX = e.clientX; });
    track.addEventListener('mouseup', function (e) {
      if (mouseStartX === null) return;
      const diff = mouseStartX - e.clientX;
      mouseStartX = null;
      if (Math.abs(diff) > 60) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 400);
        goTo(currentIndex + (diff > 0 ? 1 : -1));
      }
    });

    // Flechas del teclado dentro del carrusel
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1); }
    });

    // Tabs de filtro (patrón ARIA tabs con flechas)
    const tabs = Array.from(document.querySelectorAll('.ptab'));

    function selectTab(tab) {
      tabs.forEach(function (t) {
        const selected = t === tab;
        t.classList.toggle('active', selected);
        t.setAttribute('aria-selected', String(selected));
        t.setAttribute('tabindex', selected ? '0' : '-1');
      });

      const filter = tab.dataset.tab;
      allSlides.forEach(function (s) {
        s.hidden = !(filter === 'all' || s.dataset.tab === filter);
      });
      visibleSlides = allSlides.filter(function (s) { return !s.hidden; });
      currentIndex = 0;
      buildDots();
      updateCarousel(true);
      fitTrackHeight();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          selectTab(next);
        }
      });
    });

    // Los vídeos solo se reproducen mientras el carrusel está en pantalla
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        syncVideos();
      }, { threshold: 0.25 }).observe(track);
    }

    buildDots();
    updateCarousel(false);
    // Tras el primer pintado, para no forzar un layout síncrono durante la carga
    requestAnimationFrame(function () { setTimeout(fitTrackHeight, 0); });
  })();

  /* ── FLIP CARDS — TAP EN MÓVIL Y TECLADO ───────────────── */
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  document.querySelectorAll('.flip-card').forEach(function (card) {
    if (isTouchDevice) {
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
      });
    }
    card.addEventListener('keydown', function (e) {
      if (e.target !== card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  /* ── MODAL DE PROYECTOS ────────────────────────────────── */
  const modal = document.getElementById('videoModal');
  const modalClose = document.getElementById('modalClose');
  const modalBody = document.getElementById('modalBody');
  const modalOver = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  let lastFocused = null;

  const focusableSel = 'a[href], button:not([disabled]), video[controls], input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function trapFocus(e) {
    if (e.key !== 'Tab' || !modal.classList.contains('active')) return;
    const items = Array.from(modal.querySelectorAll(focusableSel)).filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openModal(visual) {
    if (!modal || !modalBody) return;
    const id = visual.dataset.video;
    lastFocused = document.activeElement;
    modalBody.innerHTML = '';
    modal.classList.remove('is-large');

    // El título sale de la propia tarjeta para que nunca se desincronice
    const slide = visual.closest('.carousel-slide');
    const cardTitle = slide ? slide.querySelector('.cs-title') : null;
    if (modalTitle) modalTitle.textContent = cardTitle ? cardTitle.textContent : 'Caso de estudio';

    if (id === 'mkt-bombon' || id === 'mkt-espinosa' || id === 'mkt-estetica') {
      const img = visual.querySelector('img');
      if (img) renderGenericImage(modalBody, img.getAttribute('src'), img.getAttribute('alt'));
    }
    else if (id === 'data-transport') renderVideoTemplate(modalBody, 'tmpl-transport-video', true);
    else if (id === 'data-rrhh') renderVideoTemplate(modalBody, 'tmpl-rrhh-video', true);
    else if (id === 'data-cafeteria') renderVideoTemplate(modalBody, 'tmpl-cafeteria-video', true);
    else if (id === 'auto-erp') renderVideoTemplate(modalBody, 'tmpl-erp-video', false);
    else if (id === 'web-dentista') {
      modal.classList.add('is-large');
      renderVideoTemplate(modalBody, 'tmpl-dentista-video', false);
    }
    else if (id === 'web-azketum') {
      modal.classList.add('is-large');
      renderVideoTemplate(modalBody, 'tmpl-azketum-video', false);
    }

    // Pausa los vídeos del carrusel mientras el modal está abierto
    document.querySelectorAll('#carouselTrack video').forEach(v => v.pause());

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Se aplaza para que el modal ya sea visible (visibility) cuando recibe el foco
    if (modalClose) setTimeout(() => modalClose.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active', 'is-large');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    modalBody.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    modalBody.innerHTML = '';

    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOver) modalOver.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    trapFocus(e);
  });

  document.querySelectorAll('.cs-visual[data-video]').forEach(visual => {
    visual.setAttribute('role', 'button');
    const slide = visual.closest('.carousel-slide');
    const title = slide ? slide.querySelector('.cs-title') : null;
    visual.setAttribute('aria-label', 'Ver caso de estudio' + (title ? ': ' + title.textContent : ''));
    visual.addEventListener('click', () => openModal(visual));
    visual.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(visual);
      }
    });
  });

  function renderVideoTemplate(container, templateId, withHotspots) {
    const tmpl = document.getElementById(templateId);
    if (!tmpl) return;
    container.appendChild(tmpl.content.cloneNode(true));
    if (reducedMotion) container.querySelectorAll('video').forEach(v => v.removeAttribute('autoplay'));
    if (!withHotspots) return;

    const video = container.querySelector('video');
    const hotspots = container.querySelectorAll('.video-hotspot');
    if (!video) return;
    video.addEventListener('timeupdate', () => {
      const curr = video.currentTime;
      hotspots.forEach(hs => {
        const s = parseFloat(hs.dataset.start);
        const e = parseFloat(hs.dataset.end);
        hs.classList.toggle('hidden', !(curr >= s && curr <= e));
      });
    });
  }

  function renderGenericImage(container, src, alt) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; justify-content:center; align-items:flex-start; min-height:100%; background:rgba(0,0,0,0.2); border-radius:12px; overflow:hidden;';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.style.cssText = 'max-width:100%; height:auto; display:block; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,0.5);';
    wrap.appendChild(img);
    container.appendChild(wrap);
  }

})();

/* ══════════════════════════════════════════════════════════
   HERO SHADER — WebGL Plasma Background
   Solo escritorio, sin movimiento reducido, y pausado fuera de pantalla
   ══════════════════════════════════════════════════════════ */
(function initHeroShader() {
  const canvas = document.getElementById('heroShader');
  const heroSection = document.getElementById('inicio');
  if (!canvas || !heroSection) return;

  // En móvil/táctil los orbes CSS ya dan el fondo animado
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  // mediump en lugar de highp: imperceptible visualmente y bastante más rápido en GPU
  const fsSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed = 0.2;
    const float gridSmoothWidth = 0.015;
    const float scale = 5.0;
    const vec4 lineColor = vec4(0.55, 0.3, 1.0, 1.0);
    const float minLineWidth = 0.01;
    const float maxLineWidth = 0.18;
    const float lineSpeed = 1.0 * overallSpeed;
    const float lineAmplitude = 1.0;
    const float lineFrequency = 0.2;
    const float warpSpeed = 0.2 * overallSpeed;
    const float warpFrequency = 0.5;
    const float warpAmplitude = 1.0;
    const float offsetFrequency = 0.5;
    const float offsetSpeed = 1.33 * overallSpeed;
    const float minOffsetSpread = 0.6;
    const float maxOffsetSpread = 2.0;
    const int linesPerGroup = 16;

    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
    #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }

    float getPlasmaY(float x, float horizontalFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

      float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

      vec4 lines = vec4(0.0);

      for (int l = 0; l < linesPerGroup; l++) {
        float normalizedLineIndex = float(l) / float(linesPerGroup);
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * offsetFrequency;
        float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
        float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
        float linePosition = getPlasmaY(space.x, horizontalFade, offset);
        float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

        float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
        float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

        line = line + circle;
        lines += line * lineColor * rand;
      }

      // Fondo transparente donde no hay líneas
      float maxIntensity = max(max(lines.r, lines.g), lines.b);
      gl_FragColor = vec4(lines.rgb, maxIntensity);
    }
  `;

  let gl = null;
  let programInfo = null;
  let positionBuffer = null;
  let rafId = null;
  let startTime = null;
  let initialized = false;
  let isRunning = false;
  let stopTimer = null;

  function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initShader() {
    gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
    if (!gl) return false;

    const vs = loadShader(gl.VERTEX_SHADER, vsSource);
    const fs = loadShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return false;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    programInfo = {
      program,
      attrib: gl.getAttribLocation(program, 'aVertexPosition'),
      uResolution: gl.getUniformLocation(program, 'iResolution'),
      uTime: gl.getUniformLocation(program, 'iTime')
    };

    resizeCanvas();
    return true;
  }

  // Resolución interna limitada (el CSS la estira a pantalla completa):
  // en monitores 2K/4K evita calcular millones de píxeles por frame.
  const MAX_RENDER_WIDTH = 1280;

  function resizeCanvas() {
    const scale = Math.min(1, MAX_RENDER_WIDTH / window.innerWidth);
    canvas.width = Math.round(window.innerWidth * scale);
    canvas.height = Math.round(window.innerHeight * scale);
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // 30 fps son suficientes para un fondo que se mueve despacio
  const FRAME_MS = 1000 / 30;
  let lastFrame = 0;

  function render(now) {
    if (!isRunning) return;
    rafId = requestAnimationFrame(render);
    if (now && now - lastFrame < FRAME_MS) return;
    lastFrame = now || 0;
    const t = (Date.now() - startTime) / 1000;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    gl.uniform2f(programInfo.uResolution, canvas.width, canvas.height);
    gl.uniform1f(programInfo.uTime, t);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attrib);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function startShader() {
    // Cancela una parada pendiente si el hero vuelve a entrar en pantalla
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
    if (!initialized) {
      if (!initShader()) return;
      initialized = true;
      window.addEventListener('resize', resizeCanvas, { passive: true });
    }
    if (isRunning) return;
    isRunning = true;
    startTime = startTime || Date.now();
    render();
  }

  function stopShader() {
    stopTimer = null;
    isRunning = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  const scheduleWhenIdle = window.requestIdleCallback
    ? (cb) => requestIdleCallback(cb, { timeout: 2000 })
    : (cb) => setTimeout(cb, 300);

  // Pausa también cuando la pestaña no está visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopShader();
    else if (canvas.classList.contains('is-visible')) startShader();
  });

  if ('IntersectionObserver' in window) {
    const shaderObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          canvas.classList.add('is-visible');
          if (!initialized) scheduleWhenIdle(startShader);
          else startShader();
        } else {
          canvas.classList.remove('is-visible');
          // Espera a que termine el fade-out CSS antes de parar
          if (stopTimer) clearTimeout(stopTimer);
          stopTimer = setTimeout(stopShader, 1200);
        }
      });
    }, { threshold: 0.05 });
    shaderObs.observe(heroSection);
  } else {
    scheduleWhenIdle(() => {
      canvas.classList.add('is-visible');
      startShader();
    });
  }
})();
