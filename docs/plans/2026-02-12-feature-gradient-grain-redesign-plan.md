# Gradient & Grain Redesign — Plan

## Objective
Apply the color scheme and grain texture from the Progression Labs company deck (reference: `website.png`) to the landing page hero section and key sections. Create an immersive, animated gradient background with film grain overlay that responds to mouse movement. Deploy to a feature branch for Vercel preview — do NOT touch main.

## Reference Image Analysis
The deck slide uses:
- **Vertical gradient**: Electric blue (top) → purple/indigo → teal/cyan → warm peach/salmon (bottom)
- **Horizontal pixelated banding**: Visible horizontal color strips, like a low-res posterized gradient
- **Heavy film grain**: Noisy texture overlaid across the entire surface
- **Rich, saturated color palette**: Not washed out — vivid blues, purples, teals, corals

### Extracted Color Palette
| Position | Color | Hex |
|----------|-------|-----|
| Top | Electric blue | `#1a3af0` |
| Upper-mid | Royal indigo | `#4030c0` |
| Mid-upper | Purple-teal | `#5070b8` |
| Mid | Teal cyan | `#5098b0` |
| Mid-lower | Light teal | `#70b8b0` |
| Lower-mid | Warm mint/yellow | `#a0c898` |
| Lower | Peach | `#d0a088` |
| Bottom | Salmon coral | `#d08890` |

## Architecture Overview

**Files modified**: `styles.css`, `index.html`, `main.js`
**New file**: `grain.js` (~80 lines — grain + mouse-reactive gradient logic)
**No new dependencies** — vanilla CSS + SVG filters + existing GSAP
**Branch**: `feature/gradient-grain-redesign` (from `main`)

### Core Techniques
| Effect | Method | Performance |
|--------|--------|-------------|
| Film grain | SVG `feTurbulence` filter as `::after` pseudo-element | ~0.5ms (static, cached) |
| Pixelated gradient | CSS `linear-gradient` with hard color stops (40+ bands) | Native CSS, zero JS cost |
| Mouse-reactive glow | CSS `radial-gradient` via custom properties + `requestAnimationFrame` | ~2ms/frame |
| Color animation | GSAP tweening gradient hue shifts on slow loop | ~1ms/frame |
| Scroll transition | Hero dark gradient → lighter content sections with smooth blend | GSAP ScrollTrigger |

## Work Breakdown

### Unit 1: Branch Setup & SVG Grain Filter
**Files**: `index.html`
- Create branch `feature/gradient-grain-redesign` from `main`
- Add inline SVG filter definition for grain (`feTurbulence`, `fractalNoise`, `baseFrequency: 0.65`, `numOctaves: 4`)
- Add `<div class="grain-overlay">` as fixed full-viewport layer
- **Verification**: Serve locally, screenshot showing visible grain texture

### Unit 2: Hero Gradient Background — Pixelated Banding
**Files**: `styles.css`
- Replace hero white-smoke background with full-bleed dark gradient
- Build gradient using ~40 hard color stops matching the reference palette (blue → purple → teal → salmon)
- Each band is a discrete horizontal stripe (not smooth transitions) to match the pixelated deck aesthetic
- Hero section becomes dark — update hero text colors to white
- Update nav to use transparent/glass style over dark hero background
- Update hero buttons for dark-on-light contrast
- **Verification**: Screenshot matching reference color banding

### Unit 3: Mouse-Reactive Gradient Glow
**Files**: `grain.js`
- Track mouse position via `mousemove` listener
- Lerp-interpolated `requestAnimationFrame` loop updates CSS custom properties `--mouse-x`, `--mouse-y`
- Render a `radial-gradient` overlay at cursor position — soft glow using brand colors
- Glow follows cursor with smooth damping (factor: 0.08)
- On mobile/touch: disable mouse tracking, use slow ambient drift instead
- **Verification**: Move cursor around hero — glow follows smoothly

### Unit 4: Ambient Gradient Animation
**Files**: `grain.js`
- Slow continuous hue rotation using GSAP timeline on loop
- Shifts the gradient color stops subtly (±15° hue) over 20s cycle
- Creates living, breathing background that never looks static
- Subtle opacity pulse on grain layer (0.18 → 0.25 → 0.18 over 8s)
- **Verification**: Watch for 30s — colors shift perceptibly but not distractingly

### Unit 5: Section Transitions & Polish
**Files**: `styles.css`, `index.html`
- Hero gradient fades to lighter section backgrounds via a gradient blend div at hero bottom
- Services section keeps light background but with subtle grain overlay (lower opacity: 0.08)
- Metrics section (already dark) gets matching gradient treatment
- CTA section gets gradient background matching hero
- Footer already dark — harmonize colors
- Gradient-bar below hero: update to match new palette
- Ensure all text remains readable (WCAG AA contrast)
- Responsive: gradient works on all breakpoints
- IntersectionObserver pauses grain animation when off-screen
- **Verification**: Full-page screenshot, contrast check, mobile screenshot

## Tech Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Grain method | SVG feTurbulence | 0.5ms static render, no JS overhead, excellent browser support |
| Gradient method | CSS hard-stop linear-gradient | Native CSS, matches the pixelated banding aesthetic, zero runtime cost |
| Mouse tracking | CSS custom properties + rAF | Lightest approach (~2ms/frame), works everywhere |
| Animation engine | GSAP (existing) | Already loaded, excellent for SVG attribute animation and timelines |
| New dependencies | None | Keeping it vanilla — no need for additional libraries |

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Grain too heavy on mobile | Reduce opacity to 0.1 on `max-width: 768px`, disable animation |
| Text unreadable on gradient | Pre-defined safe text colors with text-shadow fallback |
| Performance on low-end devices | SVG grain is static (cached), mouse tracking uses rAF with frame-skip |
| Gradient looks different from reference | 40+ color stops closely sampled from reference image |

## Verification Strategy
1. Local server screenshot of hero section — compare side-by-side with `website.png`
2. Move cursor across hero — confirm smooth glow tracking
3. Wait 30s — confirm ambient color shift visible
4. Scroll full page — confirm section transitions smooth
5. Check mobile viewport (375px) — responsive, readable
6. Push branch → Vercel preview URL for final check
