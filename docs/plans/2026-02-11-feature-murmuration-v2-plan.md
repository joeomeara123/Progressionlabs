# Murmuration V2 - Realistic Flock Animation Plan

## Objective
Rewrite the hero section ASCII murmuration from scratch to create a realistic, premium starling-flock effect using tiny dots with brand-colored shimmer. Full hero coverage, subtle and ambient.

## Architecture Overview

**Single file rewrite**: `murmuration.js` (~300 lines)
**No new dependencies** — vanilla Canvas 2D API
**Integration**: Existing `<canvas id="murmuration-canvas">` in hero section (already in place)

### Core Algorithm Changes (v1 → v2)

| Aspect | V1 (current) | V2 (target) |
|--------|--------------|-------------|
| Neighbor model | Fixed radius (50px) | **Topological: 7 nearest neighbors** |
| Rendering | ASCII characters (9-16px) | **Tiny filled circles (1.5-3.5px)** |
| Separation:Alignment:Cohesion | 2.0 : 1.0 : 0.4 | **1.2 : 1.8 : 1.2** |
| Shimmer | None | **Banking angle → color shift (salmon↔orchid↔blue)** |
| Performance | O(n²) brute force | **Spatial hash grid** |
| Particle count | 500 | **800-1200** (dots are cheaper to render) |
| Depth simulation | Random font size | **Size + opacity + speed layers** |
| Wind | Gentle sine (0.025) | **Stronger multi-wave sweep (0.06)** |

## Work Breakdown

### Unit 1: Core Boid Engine
- Spatial hash grid for O(n) neighbor lookups
- Topological neighbor finding (7 nearest per boid)
- Three flocking forces with rebalanced weights
- Soft edge steering
- Mouse avoidance (strong, immediate)

### Unit 2: Banking & Shimmer System
- Track `bankingAngle` per particle (how sharply it's turning)
- Banking angle = cross product of velocity change (detects turns)
- Shimmer: banking angle maps to color interpolation along brand gradient
  - Straight flight → base color (subtle grey/black)
  - Banking left → shifts toward salmon
  - Banking right → shifts toward orchid
  - Sharp turn → flash toward blue/white
- Opacity also pulses with banking (brighter during turns)
- Banking propagates through neighbors creating a visible wave

### Unit 3: Dot Rendering
- Small filled circles (1.5-3.5px radius)
- 3 depth layers via size + opacity + speed:
  - Far: 1.5px, opacity 0.15, speed 0.7x
  - Mid: 2.5px, opacity 0.35, speed 1.0x
  - Near: 3.5px, opacity 0.55, speed 1.3x
- No rotation needed (dots are symmetric)
- Batch rendering: group by color/opacity to minimize state changes

### Unit 4: Global Forces & Organic Movement
- Multi-frequency wind with stronger magnitude
- Curl noise perturbation for organic micro-movement
- Attractor points that slowly drift across canvas (flock follows)
- Predator-like "pulse" every 8-12s that triggers dramatic group turn + shimmer wave

### Unit 5: Integration & Polish
- Canvas sizing with DPR handling
- IntersectionObserver for off-screen pause
- Responsive particle count scaling
- Performance monitoring (drop particles if FPS < 45)

## Verification Strategy
- Playwright screenshot after 3s to verify visual density
- Browser console FPS check (target: 60fps with 800+ particles)
- Visual comparison: flowing cohesive flock vs scattered particles

## Risks
- **Performance with 1000 dots**: Mitigated by spatial hashing + batch rendering
- **Shimmer too subtle**: Can increase banking sensitivity
- **Flock too dense/distracting**: Opacity is configurable, can dial down
