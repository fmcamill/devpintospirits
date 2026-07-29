/* Content loader — reads content.json and populates all editable sections */
(function () {
  function escAttr(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  fetch('/content.json')
    .then(function (r) { return r.json(); })
    .then(function (c) {

      /* ── Hero ── */
      if (c.hero) {
        var heroBg = document.getElementById('psHeroBg');
        if (heroBg && c.hero.bg_image) {
          heroBg.style.backgroundImage = 'url(' + encodeURI(c.hero.bg_image) + ')';
          heroBg.style.backgroundSize = 'cover';
          heroBg.style.backgroundPosition = 'center';
        }
        var eyebrow = document.getElementById('psHeroEyebrow');
        if (eyebrow && c.hero.eyebrow) eyebrow.textContent = c.hero.eyebrow;
        var h1 = document.getElementById('psHeroH1');
        if (h1 && c.hero.headline) {
          var parts = c.hero.headline.split(' ');
          h1.innerHTML = parts.length > 1
            ? escAttr(parts[0]) + '<br>' + escAttr(parts.slice(1).join(' '))
            : escAttr(c.hero.headline);
        }
        var sub = document.getElementById('psHeroSub');
        if (sub && c.hero.subtitle) sub.textContent = c.hero.subtitle;
        var cta = document.getElementById('psHeroCta');
        if (cta && c.hero.cta_text) cta.textContent = c.hero.cta_text;
      }

      /* ── About ── */
      if (c.about) {
        var imgWrap = document.getElementById('psAboutImageWrap');
        if (imgWrap) {
          imgWrap.innerHTML = c.about.photo
            ? '<img src="' + escAttr(c.about.photo) + '" alt="' + escAttr(c.about.heading || 'Pinto Spirits') + '">'
            : '';
        }
        var heading = document.getElementById('psAboutHeading');
        if (heading && c.about.heading) heading.textContent = c.about.heading;
        var b1 = document.getElementById('psAboutBody1');
        if (b1 && c.about.body_1) b1.textContent = c.about.body_1;
        var b2 = document.getElementById('psAboutBody2');
        if (b2 && c.about.body_2) b2.textContent = c.about.body_2;
        var quote = document.getElementById('psAboutQuote');
        if (quote && c.about.quote) quote.innerHTML = '<p>“' + escAttr(c.about.quote) + '”</p>';
      }

      /* ── Brands ── */
      if (c.brands) {
        var intro = document.getElementById('psBrandsIntro');
        if (intro && c.brands.intro) intro.textContent = c.brands.intro;
        var grid = document.getElementById('psBrandsGrid');
        if (grid && c.brands.items && c.brands.items.length) {
          grid.innerHTML = c.brands.items.map(function (brand) {
            var galleryUrls = (brand.gallery || []).map(function (g) {
              return typeof g === 'string' ? g : (g.src || '');
            }).filter(Boolean);
            var imgHtml = brand.image
              ? '<img src="' + escAttr(brand.image) + '" alt="' + escAttr(brand.name) + '">'
              : '<div class="ps-brand-card__placeholder"></div>';
            return '<div class="ps-brand-card"' +
              ' data-name="' + escAttr(brand.name) + '"' +
              ' data-tag="' + escAttr(brand.tag) + '"' +
              ' data-story="' + escAttr(brand.story) + '"' +
              ' data-gallery=\'' + escAttr(JSON.stringify(galleryUrls)) + '\'>' +
              imgHtml +
              '<div class="ps-brand-card__overlay"></div>' +
              '<div class="ps-brand-card__content">' +
                '<span class="ps-brand-tag">' + escAttr(brand.tag) + '</span>' +
                '<h3>' + escAttr(brand.name) + '</h3>' +
                '<p class="ps-brand-tagline">' + escAttr(brand.tagline) + '</p>' +
                '<span class="ps-brand-discover">Discover →</span>' +
              '</div>' +
            '</div>';
          }).join('');
          if (window.initBrandCards) window.initBrandCards();
        }
      }

      /* ── Gallery ── */
      if (c.gallery && c.gallery.images && c.gallery.images.length) {
        var slider = document.getElementById('psGallerySlider');
        if (slider) {
          slider.innerHTML = c.gallery.images.map(function (img) {
            var src = typeof img === 'string' ? img : (img.src || '');
            return '<div class="ps-gallery__slide"><img src="' + escAttr(src) + '" alt="Pinto Spirits" loading="lazy"></div>';
          }).join('');
          if (window.initGallerySlider) window.initGallerySlider();
        }
      }

      /* ── Contact (footer icons) ── */
      if (c.contact) {
        var phoneEl = document.getElementById('psFooterPhone');
        if (phoneEl && c.contact.phone) {
          phoneEl.href = 'tel:' + c.contact.phone.replace(/\s+/g, '');
        }
        var igEl = document.getElementById('psFooterIg');
        if (igEl && c.contact.ig_url) {
          igEl.href = c.contact.ig_url;
        }
      }

      /* ── Settings ── */
      if (c.site && c.site.show_journal === false) {
        var blog = document.getElementById('blog');
        if (blog) blog.style.display = 'none';
        var navJournal = document.getElementById('psNavJournal');
        if (navJournal) navJournal.style.display = 'none';
        var mobileJournal = document.getElementById('psMobileJournal');
        if (mobileJournal) mobileJournal.style.display = 'none';
      }
    })
    .catch(function () { /* keep hardcoded defaults if fetch fails */ });
})();
