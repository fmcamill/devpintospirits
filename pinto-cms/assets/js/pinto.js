/* Pinto Spirits — Main JS */
(function () {
  'use strict';

  /* ── Nav scroll ── */
  var nav = document.getElementById('psNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  /* ── Mobile nav ── */
  var hamburger = document.getElementById('psHamburger');
  var mobileNav = document.getElementById('psMobileNav');
  var navClose  = document.getElementById('psNavClose');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }
  function closeMobileNav() {
    if (mobileNav) {
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }
  if (navClose) navClose.addEventListener('click', closeMobileNav);
  document.querySelectorAll('.ps-mobile-link').forEach(function (l) {
    l.addEventListener('click', closeMobileNav);
  });

  /* ── Scroll reveal ── */
  var revealEls = document.querySelectorAll('.ps-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { obs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Gallery slider ── */
  var galCurPage = 0;

  function initGallerySlider() {
    var slider   = document.getElementById('psGallerySlider');
    var dotsWrap = document.getElementById('psGalleryDots');

    if (!slider) return;

    galCurPage = 0;
    var slides = slider.querySelectorAll('.ps-gallery__slide');
    var total  = slides.length;

    function perView() { return window.innerWidth > 900 ? 2 : 1; }
    function pageCount() { return Math.ceil(total / perView()); }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i < pageCount(); i++) {
        var d = document.createElement('button');
        d.className = 'ps-gallery__dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.dataset.idx = i;
        d.addEventListener('click', function () { goTo(parseInt(this.dataset.idx)); });
        dotsWrap.appendChild(d);
      }
    }

    function goTo(idx) {
      var pages = pageCount();
      galCurPage = (idx + pages) % pages;
      var pct = perView() === 2 ? 50 : 85;
      slider.style.transform = 'translateX(-' + (galCurPage * perView() * pct) + '%)';
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.ps-gallery__dot').forEach(function (d, i) {
          d.classList.toggle('is-active', i === galCurPage);
        });
      }
    }

    /* Clone prev/next to clear any stale event listeners from prior init */
    var btnPrevOld = document.getElementById('psGalPrev');
    var btnNextOld = document.getElementById('psGalNext');
    if (btnPrevOld) {
      var btnPrev = btnPrevOld.cloneNode(true);
      btnPrevOld.parentNode.replaceChild(btnPrev, btnPrevOld);
      btnPrev.addEventListener('click', function () { goTo(galCurPage - 1); });
    }
    if (btnNextOld) {
      var btnNext = btnNextOld.cloneNode(true);
      btnNextOld.parentNode.replaceChild(btnNext, btnNextOld);
      btnNext.addEventListener('click', function () { goTo(galCurPage + 1); });
    }

    buildDots();
  }

  window.initGallerySlider = initGallerySlider;
  initGallerySlider();
  window.addEventListener('resize', function () { initGallerySlider(); });

  /* ── Brand modal ── */
  var modal      = document.getElementById('psBrandModal');
  var modalClose = document.getElementById('psBrandModalClose');
  var modalHero  = document.getElementById('psBrandModalHero');
  var modalBody  = document.getElementById('psBrandModalBody');

  function buildModalGallery(hero, gallery, name) {
    if (!hero) return;
    if (!gallery || gallery.length === 0) { hero.innerHTML = ''; return; }
    if (gallery.length === 1) {
      hero.innerHTML = '<img src="' + gallery[0] + '" alt="' + name + '">';
      return;
    }
    var slideHTML = gallery.map(function (url, i) {
      return '<div class="ps-mgal__slide' + (i === 0 ? ' is-active' : '') + '">' +
        '<img src="' + url + '" alt="' + name + ' — image ' + (i + 1) + '" loading="lazy"></div>';
    }).join('');
    var dotHTML = gallery.map(function (_, i) {
      return '<button class="ps-mgal__dot' + (i === 0 ? ' is-active' : '') + '" data-idx="' + i + '" aria-label="Image ' + (i + 1) + '"></button>';
    }).join('');
    hero.innerHTML =
      '<div class="ps-mgal">' +
        '<div class="ps-mgal__track">' + slideHTML + '</div>' +
        '<button class="ps-mgal__btn ps-mgal__prev" aria-label="Previous">‹</button>' +
        '<button class="ps-mgal__btn ps-mgal__next" aria-label="Next">›</button>' +
        '<div class="ps-mgal__dots">' + dotHTML + '</div>' +
      '</div>';

    var current    = 0;
    var allSlides  = hero.querySelectorAll('.ps-mgal__slide');
    var allDots    = hero.querySelectorAll('.ps-mgal__dot');

    function goToSlide(idx) {
      allSlides[current].classList.remove('is-active');
      allDots[current].classList.remove('is-active');
      current = (idx + gallery.length) % gallery.length;
      allSlides[current].classList.add('is-active');
      allDots[current].classList.add('is-active');
    }
    hero.querySelector('.ps-mgal__prev').addEventListener('click', function () { goToSlide(current - 1); });
    hero.querySelector('.ps-mgal__next').addEventListener('click', function () { goToSlide(current + 1); });
    allDots.forEach(function (dot) {
      dot.addEventListener('click', function () { goToSlide(parseInt(this.dataset.idx)); });
    });
  }

  function openModal(card) {
    if (!modal) return;
    var name     = card.dataset.name    || '';
    var tag      = card.dataset.tag     || '';
    var story    = card.dataset.story   || '';
    var gallery  = [];
    var products = [];
    try { gallery  = JSON.parse(card.dataset.gallery  || '[]'); } catch (e) {}
    try { products = JSON.parse(card.dataset.products || '[]'); } catch (e) {}

    buildModalGallery(modalHero, gallery, name);

    var productsHTML = '';
    if (products.length) {
      productsHTML = '<p class="ps-modal__products-label">Products</p><div class="ps-products-grid">';
      products.forEach(function (p) {
        productsHTML += '<div class="ps-product-card"><h4>' + p.name + '</h4><p>' + p.note + '</p></div>';
      });
      productsHTML += '</div>';
    }
    if (modalBody) {
      modalBody.innerHTML =
        '<span class="ps-brand-tag">' + tag + '</span>' +
        '<h2>' + name + '</h2>' +
        '<p>' + story + '</p>' +
        productsHTML;
    }
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initBrandCards() {
    document.querySelectorAll('.ps-brand-card').forEach(function (card) {
      card.addEventListener('click', function () { openModal(this); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(this); }
      });
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });
  }

  window.initBrandCards = initBrandCards;
  initBrandCards();

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ── Contact form — Netlify Forms ── */
  var form = document.getElementById('psContactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn     = form.querySelector('.ps-form-submit');
      var success = document.getElementById('psFormSuccess');
      var error   = document.getElementById('psFormError');

      btn.disabled = true;
      btn.textContent = 'Sending…';
      if (success) success.classList.remove('is-visible');
      if (error)   error.classList.remove('is-visible');

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function () {
          form.reset();
          if (success) success.classList.add('is-visible');
        })
        .catch(function () {
          if (error) { error.textContent = 'Network error. Please try again.'; error.classList.add('is-visible'); }
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = 'Send Message';
        });
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var navH = nav ? nav.offsetHeight : 0;
        var top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: top, behavior: 'smooth' });
        closeMobileNav();
      }
    });
  });

  /* ── Footer year ── */
  var yearEl = document.getElementById('psYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
