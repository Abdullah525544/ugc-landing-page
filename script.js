/* ============================================
   ABDULLAH — UGC AD CREATIVE STUDIO
   Interactions
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     1. NAV: scroll state + mobile menu
  ------------------------------------------ */
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (nav) {
      nav.classList.toggle('is-scrolled', y > 16);
    }

    // Scroll progress
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }

    // Hide mobile sticky CTA near footer
    const sticky = document.querySelector('.mobile-sticky-cta');
    if (sticky) {
      const footer = document.querySelector('.footer');
      if (footer) {
        const fr = footer.getBoundingClientRect();
        const visible = fr.top < window.innerHeight - 80;
        sticky.classList.toggle('is-hidden', visible);
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && mobileMenu) {
    const toggleMenu = (force) => {
      const open = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  /* ------------------------------------------
     2. PORTFOLIO FILTER
  ------------------------------------------ */
  const filters = document.querySelectorAll('.filter');
  const grid = document.getElementById('portfolioGrid');
  const emptyState = document.getElementById('workEmpty');

  if (filters.length && grid) {
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.filter;

        // Toggle active state
        filters.forEach((f) => {
          f.classList.remove('is-active');
          f.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        const items = grid.querySelectorAll('.portfolio-item');
        let visibleCount = 0;

        items.forEach((item, i) => {
          const cat = item.dataset.category;
          const show = target === 'all' || cat === target;

          if (show) {
            visibleCount++;
            // Reveal animation
            item.classList.remove('is-hidden');
            item.classList.add('is-entering');
            // Force reflow then transition
            // eslint-disable-next-line no-unused-expressions
            item.offsetWidth;
            setTimeout(() => {
              item.classList.remove('is-entering');
            }, 50 + i * 40);
          } else {
            item.classList.add('is-hidden');
          }
        });

        if (emptyState) {
          emptyState.hidden = visibleCount > 0;
        }
      });
    });
  }

  /* ------------------------------------------
     3. VIDEO MODAL
  ------------------------------------------ */
  const modal = document.getElementById('videoModal');
  const modalFrame = document.getElementById('modalFrame');
  const modalCat = document.getElementById('modalCat');
  const modalTitle = document.getElementById('modalTitle');
  const modalObjective = document.getElementById('modalObjective');
  const closeEls = modal ? modal.querySelectorAll('[data-close]') : [];
  let lastFocused = null;

  function openModal(card) {
    if (!modal || !modalFrame) return;

    const id = card.dataset.id;
    const cat = card.dataset.category || '';
    const title = card.dataset.title || '';
    const objective = card.dataset.objective || '';

    lastFocused = document.activeElement;

    // Build embed URL — enable autoplay, modest branding
    const url =
      'https://www.youtube.com/embed/' +
      encodeURIComponent(id) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';

    modalFrame.innerHTML =
      '<iframe src="' + url + '" title="' + escapeAttr(title) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';

    if (modalCat) modalCat.textContent = cat;
    if (modalTitle) modalTitle.textContent = title;
    if (modalObjective) modalObjective.textContent = objective;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the close button
    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalFrame) modalFrame.innerHTML = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  if (modal) {
    // Open on any video card click
    document.querySelectorAll('.video-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't open if user clicked an inner button that doesn't exist yet, but be safe
        if (card.dataset.id) openModal(card);
      });

      // Keyboard support
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (card.dataset.id) openModal(card);
        }
      });
    });

    // Close handlers
    closeEls.forEach((el) => el.addEventListener('click', closeModal));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ------------------------------------------
     4. REVEAL ON SCROLL
  ------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    reveals.forEach((el) => io.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------
     5. Smooth anchor scroll (with offset for fixed navbar)
  ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------
     6. FAQ: keep only one open at a time (optional)
  ------------------------------------------ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ------------------------------------------
     7. Subtle parallax on hero showcase (desktop only)
  ------------------------------------------ */
  const showcase = document.querySelector('.showcase-grid');
  if (showcase && window.matchMedia('(min-width: 1024px)').matches) {
    const items = showcase.querySelectorAll('.showcase-item');
    showcase.addEventListener('mousemove', (e) => {
      const rect = showcase.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      items.forEach((item, i) => {
        const depth = (i + 1) * 4;
        item.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });
    showcase.addEventListener('mouseleave', () => {
      items.forEach((item) => {
        item.style.transform = '';
      });
    });
  }

})();