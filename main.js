/* ============================================
   Progression Labs — Animations & Interactions
   GSAP 3.12 + ScrollTrigger
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Register GSAP plugins ----
  gsap.registerPlugin(ScrollTrigger);

  // ---- Global GSAP defaults ----
  gsap.defaults({
    ease: 'power2.out',
    duration: 0.8
  });

  // ---- Mobile menu toggle ----
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
      });
    });
  }

  // ---- Nav background on scroll ----
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.direction === 1 && self.scroll() > 80) {
        nav.style.borderBottomColor = 'rgba(0,0,0,0.12)';
      } else if (self.scroll() <= 80) {
        nav.style.borderBottomColor = 'rgba(0,0,0,0.08)';
      }
    }
  });

  // ---- Hero animations (on load, not scroll) ----
  const heroTimeline = gsap.timeline({ delay: 0.2 });

  heroTimeline
    .fromTo('.hero-title',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.5'
    )
    .fromTo('.hero-actions',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo('.gradient-bar',
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1.2, ease: 'power2.inOut' },
      '-=0.3'
    );

  // ---- Fade up animations (scroll-triggered) ----
  const fadeUpElements = document.querySelectorAll('.fade-up:not(.hero-title):not(.hero-subtitle):not(.hero-actions)');
  fadeUpElements.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Fade in animations ----
  document.querySelectorAll('.fade-in').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Service cards staggered entrance ----
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length) {
    // Group cards by their visual row
    const rows = [];
    let currentRow = [];
    serviceCards.forEach((card, i) => {
      currentRow.push(card);
      // Check if next element is a divider or end of list
      if (currentRow.length === 3 || i === serviceCards.length - 1) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });

    rows.forEach((row) => {
      gsap.fromTo(row,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          scrollTrigger: {
            trigger: row[0],
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  // ---- Platform features slide in ----
  document.querySelectorAll('.slide-left').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  document.querySelectorAll('.slide-right').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: 40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Metric count-up animation ----
  const metricValues = document.querySelectorAll('.metric-value');
  metricValues.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.decimal === 'true';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (isDecimal) {
              el.textContent = obj.val.toFixed(1) + suffix;
            } else {
              el.textContent = Math.round(obj.val) + suffix;
            }
          }
        });
      }
    });
  });

  // ---- Pricing cards stagger ----
  const pricingCards = document.querySelectorAll('.pricing-card');
  if (pricingCards.length) {
    gsap.fromTo(pricingCards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        scrollTrigger: {
          trigger: pricingCards[0],
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Resource cards stagger ----
  const resourceCards = document.querySelectorAll('.resource-card');
  if (resourceCards.length) {
    gsap.fromTo(resourceCards,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        scrollTrigger: {
          trigger: resourceCards[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Platform mockup bars animation ----
  const mockupBars = document.querySelectorAll('.mockup-card-bar-fill');
  if (mockupBars.length) {
    mockupBars.forEach((bar) => {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';

      ScrollTrigger.create({
        trigger: bar,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(bar, {
            width: targetWidth,
            duration: 1.2,
            ease: 'power2.out',
            delay: 0.3
          });
        }
      });
    });
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#login' || href === '#get-started') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        gsap.to(window, {
          scrollTo: { y: targetPosition, autoKill: false },
          duration: 0.8,
          ease: 'power2.inOut'
        });
      }
    });
  });

});
