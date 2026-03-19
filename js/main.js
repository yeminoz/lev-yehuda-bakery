/* ========================================
   מאפיית לב יהודה — JavaScript ראשי
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== HERO — immediate fade in on page load =====
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(() => heroContent.classList.add('visible'), 100);
  }

  // ===== SCROLL FADE-IN (Intersection Observer) =====
  const fadeEls = document.querySelectorAll('.fade-in:not(.hero-content)');

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeEls.forEach(el => observer.observe(el));


  // ===== HEADER SCROLL STATE =====
  const header = document.getElementById('site-header');

  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });


  // ===== MOBILE HAMBURGER =====
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileNav.setAttribute('aria-hidden', true);
      document.body.style.overflow = '';
    });
  });


  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ===== PRODUCT SLIDER (single image, full-width, 16:9) =====
  const slider = document.getElementById('productSlider');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dots = document.querySelectorAll('.slider-dots .dot');

  if (slider && prevBtn && nextBtn) {
    const slides = slider.querySelectorAll('.product-slide');
    const total = slides.length; // 9
    let current = 0;

    const slideTo = (index) => {
      current = (index + total) % total;
      slider.style.transform = `translateX(${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    prevBtn.addEventListener('click', () => slideTo(current - 1));
    nextBtn.addEventListener('click', () => slideTo(current + 1));

    dots.forEach(dot => {
      dot.addEventListener('click', () => slideTo(Number(dot.dataset.index)));
    });

    // Touch/swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? slideTo(current + 1) : slideTo(current - 1);
      }
    });

    // Keyboard
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') slideTo(current - 1);
      if (e.key === 'ArrowLeft') slideTo(current + 1);
    });

    // Auto-advance every 3s
    let autoTimer = setInterval(() => slideTo(current + 1), 3000);
    [prevBtn, nextBtn, ...dots].forEach(el => {
      el.addEventListener('click', () => {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => slideTo(current + 1), 3000);
      });
    });

    slideTo(0);
  }


  // ===== VIDEO REEL — autoplay when visible =====
  const reelVideo = document.getElementById('reelVideo');

  if (reelVideo) {
    // Try immediate autoplay (works when muted)
    reelVideo.play().catch(() => {});

    // Also use IntersectionObserver as fallback — play when scrolled into view
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          reelVideo.play().catch(() => {});
        } else {
          reelVideo.pause();
        }
      });
    }, { threshold: 0.3 });

    videoObserver.observe(reelVideo);
  }


  // ===== ACCORDION =====
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.accordion-header').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.hidden = true;
        }
      });
      btn.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
    });
  });


  // ===== STORE SEARCH =====
  const searchInput = document.getElementById('storeSearch');
  const accordion = document.getElementById('regionAccordion');
  const noResults = document.getElementById('noResults');

  if (searchInput && accordion) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();

      if (!q) {
        // Reset: show all, close all
        accordion.querySelectorAll('.accordion-item').forEach(item => {
          item.hidden = false;
        });
        accordion.querySelectorAll('.neighborhood-group').forEach(grp => {
          grp.hidden = false;
        });
        accordion.querySelectorAll('.store-item').forEach(item => {
          item.hidden = false;
        });
        if (noResults) noResults.hidden = true;
        return;
      }

      let anyVisible = false;

      accordion.querySelectorAll('.accordion-item').forEach(regionItem => {
        let regionHasMatch = false;

        // Check region name
        const regionData = (regionItem.dataset.region || '').toLowerCase();

        // Check neighborhoods
        regionItem.querySelectorAll('.neighborhood-group').forEach(grp => {
          const nhData = (grp.dataset.neighborhood || '').toLowerCase();
          let nhHasMatch = false;

          grp.querySelectorAll('.store-item').forEach(store => {
            const searchData = (store.dataset.search || '').toLowerCase();
            const matches = searchData.includes(q) || regionData.includes(q) || nhData.includes(q);
            store.hidden = !matches;
            if (matches) { nhHasMatch = true; regionHasMatch = true; anyVisible = true; }
          });

          grp.hidden = !nhHasMatch;
        });

        // Plain store-items (no neighborhood group)
        regionItem.querySelectorAll('.accordion-body > .store-list > .store-item').forEach(store => {
          const searchData = (store.dataset.search || '').toLowerCase();
          const matches = searchData.includes(q) || regionData.includes(q);
          store.hidden = !matches;
          if (matches) { regionHasMatch = true; anyVisible = true; }
        });

        regionItem.hidden = !regionHasMatch;

        // Auto-open matching regions
        if (regionHasMatch) {
          const btn = regionItem.querySelector('.accordion-header');
          const body = regionItem.querySelector('.accordion-body');
          btn.setAttribute('aria-expanded', 'true');
          body.hidden = false;
        }
      });

      if (noResults) noResults.hidden = anyVisible;
    });
  }


  // ===== GEOLOCATION — Find nearest store =====
  const STORES = [
    // קרית ארבע
    { name: 'סופר דקל', address: 'סולם אלדד 2, קרית ארבע', lat: 31.5249, lng: 35.1105, waze: 'https://waze.com/ul?q=סולם אלדד 2 קרית ארבע&navigate=yes' },
    { name: 'סופר ציפו', address: 'הרב צבי יהודה קוק 123, קרית ארבע', lat: 31.5230, lng: 35.1150, waze: 'https://waze.com/ul?q=הרב צבי יהודה קוק 123 קרית ארבע&navigate=yes' },
    // ירושלים - גרמנית/בקעה/ארנונה
    { name: "מעדני צ'ונה", address: 'התנופה 11, ירושלים', lat: 31.7451, lng: 35.2255, waze: 'https://waze.com/ul?q=התנופה 11 ירושלים&navigate=yes' },
    { name: 'מינימרקט שקורי', address: 'עין גדי 19, ירושלים', lat: 31.7481, lng: 35.2241, waze: 'https://waze.com/ul?q=עין גדי 19 ירושלים&navigate=yes' },
    { name: 'סופר ספיר חברון', address: 'דרך חברון 101, ירושלים', lat: 31.7540, lng: 35.2046, waze: 'https://waze.com/ul?q=דרך חברון 101 ירושלים&navigate=yes' },
    { name: 'מעדניית בית לחם', address: 'דרך בית לחם 33, ירושלים', lat: 31.7567, lng: 35.2100, waze: 'https://waze.com/ul?q=דרך בית לחם 33 ירושלים&navigate=yes' },
    { name: 'סופר דיל בית לחם', address: 'דרך בית לחם 77, ירושלים', lat: 31.7494, lng: 35.2144, waze: 'https://waze.com/ul?q=דרך בית לחם 77 ירושלים&navigate=yes' },
    { name: 'סל המושבה הגרמנית', address: 'עמק רפאים 43, ירושלים', lat: 31.7588, lng: 35.2134, waze: 'https://waze.com/ul?q=עמק רפאים 43 ירושלים&navigate=yes' },
    // ירושלים - רחביה/קרית שמואל
    { name: 'NIVA COFFEE', address: 'הפלמ"ח 42, ירושלים', lat: 31.7657, lng: 35.2198, waze: 'https://waze.com/ul?q=הפלמח 42 ירושלים&navigate=yes' },
    { name: 'סופר פילבוקס', address: 'עזה 40, ירושלים', lat: 31.7716, lng: 35.2146, waze: 'https://waze.com/ul?q=עזה 40 ירושלים&navigate=yes' },
    { name: 'סופר נמירוב', address: 'קרן קיימת לישראל 26, ירושלים', lat: 31.7749, lng: 35.2108, waze: 'https://waze.com/ul?q=קרן קיימת לישראל 26 ירושלים&navigate=yes' },
    { name: 'סופר ספיר ברזיל', address: 'ברזיל 2, ירושלים', lat: 31.7683, lng: 35.2137, waze: 'https://waze.com/ul?q=ברזיל 2 ירושלים&navigate=yes' },
    { name: "דולצ'ה קאסה", address: "דולצ'ין 26, ירושלים", lat: 31.7676, lng: 35.2165, waze: 'https://waze.com/ul?q=אריה דולצין 26 ירושלים&navigate=yes' },
    { name: 'סופר מכולת', address: 'אבן שפורט 1, ירושלים', lat: 31.7783, lng: 35.2083, waze: 'https://waze.com/ul?q=אבן שפורט 1 ירושלים&navigate=yes' },
    // ירושלים - בית הכרם/בית וגן/הר נוף
    { name: 'מרקט בית הכרם', address: 'החלוץ 72, ירושלים', lat: 31.7794, lng: 35.1794, waze: 'https://waze.com/ul?q=החלוץ 72 ירושלים&navigate=yes' },
    { name: 'מעדני צדקיהו בית הכרם', address: 'אביזוהר 8, ירושלים', lat: 31.7785, lng: 35.1800, waze: 'https://waze.com/ul?q=אביזוהר 8 ירושלים&navigate=yes' },
    { name: 'שף אליהו ליזרוביץ בית וגן', address: 'הפסגה 25, ירושלים', lat: 31.7582, lng: 35.1906, waze: 'https://waze.com/ul?q=הפסגה 25 ירושלים&navigate=yes' },
    { name: 'שף אליהו ליזרוביץ הר נוף', address: 'שאולזון 51, ירושלים', lat: 31.7840, lng: 35.1678, waze: 'https://waze.com/ul?q=שאולזון 51 ירושלים&navigate=yes' },
    // ירושלים - הר חומה
    { name: 'סופר ספיר הר חומה', address: 'אליהו קורן 25, ירושלים', lat: 31.7116, lng: 35.2439, waze: 'https://waze.com/ul?q=אליהו קורן 25 ירושלים&navigate=yes' },
    // ירושלים - גבעת שאול/רוממה
    { name: "צ'ולנט בר", address: 'משמר העם 5, ירושלים', lat: 31.7835, lng: 35.2200, waze: 'https://waze.com/ul?q=משמר העם 5 ירושלים&navigate=yes' },
    { name: 'שאבעט מרקט', address: 'ירמיהו 68, ירושלים', lat: 31.7925, lng: 35.2107, waze: 'https://waze.com/ul?q=ירמיהו 68 ירושלים&navigate=yes' },
    // גוש עציון
    { name: 'סופר דיל הדבש', address: 'שערי אליהו, אפרת', lat: 31.6594, lng: 35.1605, waze: 'https://waze.com/ul?q=שערי אליהו אפרת&navigate=yes' },
    { name: 'סופר שוק העיר', address: 'זית שמן 2, אפרת', lat: 31.6605, lng: 35.1590, waze: 'https://waze.com/ul?q=זית שמן 2 אפרת&navigate=yes' },
    { name: 'סופר עמדי ידידי', address: 'הקטורת 1, אפרת', lat: 31.6610, lng: 35.1580, waze: 'https://waze.com/ul?q=הקטורת 1 אפרת&navigate=yes' },
    { name: 'סופר דיל הדקל', address: 'הדקל 8, אפרת', lat: 31.6580, lng: 35.1610, waze: 'https://waze.com/ul?q=הדקל 8 אפרת&navigate=yes' },
    { name: 'מעדני צדקיהו', address: 'מרכז מסחרי תאנה, אפרת', lat: 31.6550, lng: 35.1625, waze: 'https://waze.com/ul?q=מרכז מסחרי תאנה אפרת&navigate=yes' },
    { name: 'סופר הכל כאן תקוע', address: 'יישוב תקוע', lat: 31.6414, lng: 35.1750, waze: 'https://waze.com/ul?q=תקוע גוש עציון&navigate=yes' },
    { name: 'סופר הכל כאן נוקדים', address: 'יישוב נוקדים', lat: 31.6333, lng: 35.2000, waze: 'https://waze.com/ul?q=נוקדים גוש עציון&navigate=yes' },
    { name: 'סופר בכרם', address: 'כרמי צור', lat: 31.5844, lng: 35.1044, waze: 'https://waze.com/ul?q=כרמי צור&navigate=yes' },
  ];

  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const geoBtn = document.getElementById('geoBtn');
  const geoResult = document.getElementById('geoResult');

  if (geoBtn && geoResult) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        geoResult.hidden = false;
        geoResult.innerHTML = '<p>הדפדפן שלך אינו תומך באיתור מיקום.</p>';
        return;
      }

      geoBtn.disabled = true;
      geoBtn.textContent = 'מאתר מיקום...';

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          let nearest = null;
          let minDist = Infinity;

          STORES.forEach(store => {
            const d = haversine(latitude, longitude, store.lat, store.lng);
            if (d < minDist) { minDist = d; nearest = store; }
          });

          geoBtn.disabled = false;
          geoBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
            מצא נקודת מכירה קרובה אליי
          `;

          const distText = minDist < 1
            ? `${Math.round(minDist * 1000)} מטר ממך`
            : `${minDist.toFixed(1)} ק"מ ממך`;

          geoResult.hidden = false;
          geoResult.innerHTML = `
            <p class="geo-store-name">${nearest.name}</p>
            <p class="geo-store-addr">${nearest.address}</p>
            <p class="geo-distance">📍 ${distText}</p>
            <a class="btn-geo-nav" href="${nearest.waze}" target="_blank" rel="noopener">🗺 נווט ב-Waze</a>
            <span style="margin: 0 8px; color: #ccc">|</span>
            <a class="btn-geo-nav" style="background:#4285f4" href="https://maps.google.com/?q=${encodeURIComponent(nearest.address)}" target="_blank" rel="noopener">📍 Google Maps</a>
          `;
        },
        () => {
          geoBtn.disabled = false;
          geoBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
            מצא נקודת מכירה קרובה אליי
          `;
          geoResult.hidden = false;
          geoResult.innerHTML = '<p style="color:#c0392b">לא ניתן לאתר מיקום. נא לאפשר גישה למיקום בהגדרות.</p>';
        },
        { timeout: 10000 }
      );
    });
  }


  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('#name').value.trim();
      const email = contactForm.querySelector('#email').value.trim();

      if (!name || !email) {
        const missing = !name ? 'שם' : 'אימייל';
        alert(`נא למלא את שדה ה${missing}`);
        return;
      }

      const formContainer = contactForm.parentElement;
      contactForm.style.opacity = '0';
      contactForm.style.transition = 'opacity 0.3s ease';

      setTimeout(() => {
        contactForm.remove();
        const successDiv = document.createElement('div');
        successDiv.className = 'contact-form form-success fade-in';
        successDiv.innerHTML = `
          <div class="form-success-icon">✉️</div>
          <h3>תודה, ${name}!</h3>
          <p>ההודעה שלך התקבלה. נחזור אליך בהקדם.</p>
        `;
        formContainer.appendChild(successDiv);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { successDiv.classList.add('visible'); });
        });
      }, 350);
    });
  }


  // ===== SCROLL TO TOP =====
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.setAttribute('aria-label', 'חזרה לראש הדף');
  scrollTopBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  `;
  document.body.appendChild(scrollTopBtn);

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ===== ACTIVE NAV HIGHLIGHT on scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(section => sectionObserver.observe(section));

  const style = document.createElement('style');
  style.textContent = `.nav-list a.active { color: var(--color-burgundy); font-weight: 600; }`;
  document.head.appendChild(style);

});
