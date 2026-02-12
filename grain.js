/* ============================================
   Progression Labs — Grain & Interactive Gradient
   Mouse-reactive glow + ambient color animation
   ============================================ */

(function () {
  'use strict';

  // --- Mouse-reactive glow ---
  var targetX = 50;
  var targetY = 50;
  var currentX = 50;
  var currentY = 50;
  var damping = 0.08;
  var isTouch = 'ontouchstart' in window;
  var root = document.documentElement;
  var glowEl = document.querySelector('.glow-overlay');

  if (!isTouch) {
    document.addEventListener('mousemove', function (e) {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
    });
  }

  // --- Ambient drift for mobile/no-mouse ---
  var driftAngle = 0;
  var driftSpeed = 0.0004;

  function updateDrift() {
    driftAngle += driftSpeed;
    targetX = 50 + Math.sin(driftAngle) * 25;
    targetY = 50 + Math.cos(driftAngle * 0.7) * 20;
  }

  // --- Animation loop ---
  var running = true;

  function animate() {
    if (!running) return;

    if (isTouch) {
      updateDrift();
    }

    // Lerp toward target
    currentX += (targetX - currentX) * damping;
    currentY += (targetY - currentY) * damping;

    root.style.setProperty('--mouse-x', currentX + '%');
    root.style.setProperty('--mouse-y', currentY + '%');

    requestAnimationFrame(animate);
  }

  animate();

  // --- Ambient grain opacity pulse ---
  var grainEl = document.querySelector('.grain-overlay');
  if (grainEl && typeof gsap !== 'undefined') {
    gsap.to(grainEl, {
      opacity: 0.28,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  // --- Nav scroll state ---
  var nav = document.getElementById('nav');
  if (nav) {
    var heroSection = document.getElementById('hero');
    var heroBottom = heroSection ? heroSection.offsetHeight : 600;

    function checkNav() {
      heroBottom = heroSection ? heroSection.offsetHeight : 600;
      if (window.scrollY > heroBottom - 100) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }

    window.addEventListener('scroll', checkNav, { passive: true });
    window.addEventListener('resize', function () {
      heroBottom = heroSection ? heroSection.offsetHeight : 600;
    }, { passive: true });

    // Initial check
    checkNav();
  }

  // --- Pause grain animation when off-screen ---
  if ('IntersectionObserver' in window && grainEl) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        running = entry.isIntersecting;
        if (running) animate();
      });
    }, { threshold: 0 });

    // Observe the body — grain is always visible so check viewport
    observer.observe(document.body);
  }

})();
