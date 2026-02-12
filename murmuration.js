/* ============================================
   Progression Labs — Murmuration v3
   Smoke-like flowing flock with color gradient wave
   ============================================ */

(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var PI  = Math.PI;

  /* ── Configuration ────────────────────────── */
  var C = {
    count:      800,
    maxSpeed:   1.8,
    minSpeed:   0.4,
    maxForce:   0.04,
    perception: 160,       /* large — particles influence each other across distance */
    sepDist:    30,        /* more space between particles = diffuse smoke */

    /* Smoke-like: strong alignment (flow together) + gentle cohesion */
    sepW:   1.0,
    aliW:   2.0,
    cohW:   0.5,

    /* Spring centering — proportional to distance, keeps cloud centered without collapsing.
       At 500px from center: F = 0.000045 * 500 = 0.0225 (counters wind drift). */
    springK: 0.000045,

    /* Mouse avoidance */
    mouseR: 180,
    mouseF: 0.4,

    /* Hard boundary — particles never leave canvas */
    pad:  60,
    padF: 0.5,

    /* Breathing: wind surges create group turns → shimmer */
    breathT:    12000,     /* 12 second cycle */
    windBase:   0.015,
    windPulse:  0.025,     /* extra wind during sweep phase */

    /* Velocity damping — smooths out jerky motion */
    damp: 0.97,

    /* Per-particle wander — organic Brownian micro-motion */
    wanderF:   0.025,
    wanderSpd: 0.003,

    /* Traveling color gradient wave */
    gWaveSpd:  0.0008,    /* how fast the wave moves */
    gDirSpd:   0.00015,   /* how fast wave direction rotates */
    gWaveLen:  400,        /* pixels per full color cycle */
    gVivid:    0.75,       /* color intensity 0-1 */

    /* Depth layers: [radius, baseAlpha, speedMult, spawnWeight] */
    layers: [
      [1.2, 0.12, 0.8, 0.30],
      [2.0, 0.30, 1.0, 0.45],
      [3.0, 0.50, 1.2, 0.25],
    ],

    /* Brand palette */
    salmon: [255, 160, 122],
    orchid: [186, 85,  211],
    blue:   [70,  70,  255],
    grey:   [180, 180, 180],

    gridCell: 80,
  };

  /* ── Spatial Hash Grid ─────────────────────── */

  function Grid(w, h, cell) {
    this.cell = cell;
    this.cols = Math.ceil(w / cell) + 1;
    this.rows = Math.ceil(h / cell) + 1;
    this.data = new Array(this.cols * this.rows);
    for (var i = 0; i < this.data.length; i++) this.data[i] = [];
  }

  Grid.prototype.clear = function () {
    for (var i = 0; i < this.data.length; i++) this.data[i].length = 0;
  };

  Grid.prototype.insert = function (p) {
    var c = (p.x / this.cell) | 0;
    var r = (p.y / this.cell) | 0;
    if (c >= 0 && c < this.cols && r >= 0 && r < this.rows)
      this.data[c + r * this.cols].push(p);
  };

  Grid.prototype.query = function (p, radius, out) {
    out.length = 0;
    var cr = Math.ceil(radius / this.cell);
    var c0 = (p.x / this.cell) | 0;
    var r0 = (p.y / this.cell) | 0;
    var rSq = radius * radius;
    for (var dc = -cr; dc <= cr; dc++) {
      var cc = c0 + dc;
      if (cc < 0 || cc >= this.cols) continue;
      for (var dr = -cr; dr <= cr; dr++) {
        var rr = r0 + dr;
        if (rr < 0 || rr >= this.rows) continue;
        var bucket = this.data[cc + rr * this.cols];
        for (var i = 0; i < bucket.length; i++) {
          var o = bucket[i];
          if (o === p) continue;
          var dx = p.x - o.x, dy = p.y - o.y;
          if (dx * dx + dy * dy < rSq) out.push(o);
        }
      }
    }
  };

  /* ── Particle ──────────────────────────────── */

  function Particle(x, y) {
    /* Assign depth layer */
    var roll = Math.random(), cum = 0;
    this.li = 0;
    for (var i = 0; i < C.layers.length; i++) {
      cum += C.layers[i][3];
      if (roll < cum) { this.li = i; break; }
    }
    var L = C.layers[this.li];

    this.x  = x;
    this.y  = y;
    this.r  = L[0];
    this.ba = L[1];                   /* base alpha */
    this.ms = C.maxSpeed * L[2];      /* layer max speed */

    var a = Math.random() * TAU;
    this.vx = Math.cos(a) * this.ms * 0.4;
    this.vy = Math.sin(a) * this.ms * 0.4;
    this.ax = 0;
    this.ay = 0;

    /* Unique seed for organic wander */
    this.seed = Math.random() * 10000;

    /* 10% of particles are "wisps" with weaker cohesion — creates smoke-like tendrils */
    this.cohMult = Math.random() < 0.10 ? 0.4 : 1.0;
  }

  Particle.prototype.flock = function (nb, cohW) {
    var sepX = 0, sepY = 0, sepN = 0;
    var aliX = 0, aliY = 0;
    var cohX = 0, cohY = 0;
    var n = nb.length;
    if (n === 0) return;

    for (var i = 0; i < n; i++) {
      var o  = nb[i];
      var dx = this.x - o.x, dy = this.y - o.y;
      var d  = Math.sqrt(dx * dx + dy * dy);
      if (d < C.sepDist && d > 0) {
        sepX += dx / d;
        sepY += dy / d;
        sepN++;
      }
      aliX += o.vx;
      aliY += o.vy;
      cohX += o.x;
      cohY += o.y;
    }

    var mf = C.maxForce, ms = this.ms;
    var sx, sy, m;

    /* Separation */
    if (sepN > 0) {
      sx = sepX / sepN; sy = sepY / sepN;
      m = Math.sqrt(sx * sx + sy * sy);
      if (m > 0) { sx = sx / m * ms - this.vx; sy = sy / m * ms - this.vy; }
      m = Math.sqrt(sx * sx + sy * sy);
      if (m > mf) { sx = sx / m * mf; sy = sy / m * mf; }
      this.ax += sx * C.sepW;
      this.ay += sy * C.sepW;
    }

    /* Alignment */
    sx = aliX / n; sy = aliY / n;
    m = Math.sqrt(sx * sx + sy * sy);
    if (m > 0) { sx = sx / m * ms - this.vx; sy = sy / m * ms - this.vy; }
    m = Math.sqrt(sx * sx + sy * sy);
    if (m > mf) { sx = sx / m * mf; sy = sy / m * mf; }
    this.ax += sx * C.aliW;
    this.ay += sy * C.aliW;

    /* Cohesion — weight is dynamic (breathing) and per-particle (wisps) */
    sx = cohX / n - this.x; sy = cohY / n - this.y;
    m = Math.sqrt(sx * sx + sy * sy);
    if (m > 0) { sx = sx / m * ms - this.vx; sy = sy / m * ms - this.vy; }
    m = Math.sqrt(sx * sx + sy * sy);
    if (m > mf) { sx = sx / m * mf; sy = sy / m * mf; }
    this.ax += sx * cohW * this.cohMult;
    this.ay += sy * cohW * this.cohMult;
  };

  Particle.prototype.update = function () {
    this.vx = (this.vx + this.ax) * C.damp;
    this.vy = (this.vy + this.ay) * C.damp;

    var spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > this.ms) {
      this.vx = this.vx / spd * this.ms;
      this.vy = this.vy / spd * this.ms;
    }
    if (spd > 0 && spd < C.minSpeed) {
      this.vx = this.vx / spd * C.minSpeed;
      this.vy = this.vy / spd * C.minSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.ax = 0;
    this.ay = 0;
  };

  /* ── Color helpers ─────────────────────────── */

  function lerp3(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  }

  /* Map a 0-1 phase to the brand gradient: salmon → orchid → blue → loop */
  function brandColor(phase) {
    phase = phase - Math.floor(phase);   /* wrap to 0-1 */
    if (phase < 0.333)
      return lerp3(C.salmon, C.orchid, phase / 0.333);
    if (phase < 0.666)
      return lerp3(C.orchid, C.blue, (phase - 0.333) / 0.333);
    return lerp3(C.blue, C.salmon, (phase - 0.666) / 0.334);
  }

  /* ── Murmuration Controller ────────────────── */

  function Murmuration(id) {
    this.canvas = document.getElementById(id);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ps = [];
    this.mouse = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.t0 = performance.now();
    this.visible = true;
    this._nb = [];

    this._resize();
    this._spawn();
    this._bind();
    this._loop();
  }

  Murmuration.prototype._resize = function () {
    var el = this.canvas.parentElement;
    this.w = el.offsetWidth;
    this.h = el.offsetHeight;
    this.canvas.width  = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width  = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.grid = new Grid(this.w, this.h, C.gridCell);
  };

  Murmuration.prototype._targetN = function () {
    return Math.max(200, Math.min(C.count, (this.w * this.h / 1200) | 0));
  };

  Murmuration.prototype._spawn = function () {
    var n  = this._targetN();
    var cx = this.w * 0.5;
    var cy = this.h * 0.45;
    this.ps = [];
    for (var i = 0; i < n; i++) {
      /* Gaussian-like cloud spawn — wide spread for smoke-like initial shape */
      var angle = Math.random() * TAU;
      var dist  = (Math.random() + Math.random() + Math.random()) / 3 * 350;
      this.ps.push(new Particle(
        cx + Math.cos(angle) * dist,
        cy + Math.sin(angle) * dist
      ));
    }
  };

  Murmuration.prototype._bind = function () {
    var self = this;
    var hero = this.canvas.closest('.hero') || this.canvas.parentElement;

    hero.addEventListener('mousemove', function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    hero.addEventListener('mouseleave', function () { self.mouse = null; });
    hero.addEventListener('touchmove', function (e) {
      var r = self.canvas.getBoundingClientRect();
      var t = e.touches[0];
      self.mouse = { x: t.clientX - r.left, y: t.clientY - r.top };
    }, { passive: true });
    hero.addEventListener('touchend', function () { self.mouse = null; });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        self._resize();
        var target = self._targetN();
        var cx = self.w * 0.5, cy = self.h * 0.45;
        while (self.ps.length < target)
          self.ps.push(new Particle(cx + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 200));
        while (self.ps.length > target) self.ps.pop();
      }, 200);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        self.visible = e[0].isIntersecting;
      }, { threshold: 0.05 }).observe(this.canvas);
    }
  };

  Murmuration.prototype._loop = function () {
    var self = this;
    requestAnimationFrame(function () { self._loop(); });
    if (!this.visible) return;

    var now = performance.now();
    var t   = now - this.t0;
    var ctx = this.ctx;
    var ps  = this.ps;
    var grid = this.grid;
    var nb  = this._nb;
    var w   = this.w, h = this.h;
    var n   = ps.length;

    /* ── Breathing cycle (modulates wind strength) ── */
    var breathPhase = Math.sin(t * TAU / C.breathT);
    var windMag = C.windBase + C.windPulse * (breathPhase * 0.5 + 0.5);
    /* Shimmer boost during sweep phase — colors get vivid as wind surges */
    var shimmerBoost = breathPhase > 0 ? breathPhase * 0.22 : 0;

    /* ── Wind (multi-frequency, breathing-modulated) ── */
    var wa = Math.sin(t * 0.00008) * PI
           + Math.cos(t * 0.00005) * PI * 0.5
           + Math.sin(t * 0.0002) * 0.4;
    var windX = Math.cos(wa) * windMag;
    var windY = Math.sin(wa) * windMag;

    /* ── Canvas center for spring force ── */
    var centerX = w * 0.5;
    var centerY = h * 0.45;

    /* ── Color gradient wave direction (slowly rotates) ── */
    var gAngle = t * C.gDirSpd;
    var gdx = Math.cos(gAngle);
    var gdy = Math.sin(gAngle);
    var gTimeOff = t * C.gWaveSpd;

    /* ── Clear canvas ── */
    ctx.clearRect(0, 0, w, h);

    /* ── Build spatial grid ── */
    grid.clear();
    for (var i = 0; i < n; i++) grid.insert(ps[i]);

    /* ── Update each particle ── */
    for (var i = 0; i < n; i++) {
      var p = ps[i];

      /* Flocking */
      grid.query(p, C.perception, nb);
      if (nb.length > 0) p.flock(nb, C.cohW);

      /* Mouse avoidance */
      if (self.mouse) {
        var dx = p.x - self.mouse.x;
        var dy = p.y - self.mouse.y;
        var dSq = dx * dx + dy * dy;
        if (dSq < C.mouseR * C.mouseR && dSq > 0) {
          var d   = Math.sqrt(dSq);
          var str = C.mouseF * (1 - d / C.mouseR);
          p.ax += dx / d * str;
          p.ay += dy / d * str;
        }
      }

      /* Spring centering — force proportional to distance from center.
         Near-center particles feel almost nothing; far particles gently pulled back.
         This keeps the cloud spread out instead of collapsing to a point. */
      p.ax += (centerX - p.x) * C.springK;
      p.ay += (centerY - p.y) * C.springK;

      /* Wind */
      p.ax += windX;
      p.ay += windY;

      /* Organic wander (sinusoidal, per-particle seed = Brownian-like) */
      var wAngle = Math.sin(t * C.wanderSpd + p.seed) * PI
                 + Math.cos(t * C.wanderSpd * 0.7 + p.seed * 1.3) * PI * 0.4;
      p.ax += Math.cos(wAngle) * C.wanderF;
      p.ay += Math.sin(wAngle) * C.wanderF;

      /* Hard boundary force — ramps up sharply near edges */
      var pad = C.pad;
      if (p.x < pad)     p.ax += C.padF * ((pad - p.x) / pad);
      if (p.x > w - pad) p.ax -= C.padF * ((p.x - (w - pad)) / pad);
      if (p.y < pad)     p.ay += C.padF * ((pad - p.y) / pad);
      if (p.y > h - pad) p.ay -= C.padF * ((p.y - (h - pad)) / pad);

      p.update();

      /* Hard clamp — absolute guarantee particles stay in canvas */
      if (p.x < 1)     { p.x = 1;     p.vx = Math.abs(p.vx) * 0.5; }
      if (p.x > w - 1) { p.x = w - 1; p.vx = -Math.abs(p.vx) * 0.5; }
      if (p.y < 1)     { p.y = 1;     p.vy = Math.abs(p.vy) * 0.5; }
      if (p.y > h - 1) { p.y = h - 1; p.vy = -Math.abs(p.vy) * 0.5; }
    }

    /* ── Render ── */
    for (var i = 0; i < n; i++) {
      var p = ps[i];

      /* Traveling gradient: project position onto rotating wave direction */
      var proj  = p.x * gdx + p.y * gdy;
      var phase = proj / C.gWaveLen + gTimeOff;
      var rgb   = brandColor(phase);

      /* Mix brand color with grey based on vivid setting */
      var cr = C.grey[0] + (rgb[0] - C.grey[0]) * C.gVivid;
      var cg = C.grey[1] + (rgb[1] - C.grey[1]) * C.gVivid;
      var cb = C.grey[2] + (rgb[2] - C.grey[2]) * C.gVivid;

      /* Opacity: base + wave-driven fade in/out + shimmer boost during condense */
      var alphaWave = Math.sin(phase * TAU) * 0.5 + 0.5;
      var alpha = p.ba + alphaWave * 0.20 + shimmerBoost;
      if (alpha > 0.80) alpha = 0.80;
      if (alpha < 0.04) alpha = 0.04;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgb(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  /* ── Boot ──────────────────────────────────── */

  function boot() {
    window.__murmuration = new Murmuration('murmuration-canvas');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
