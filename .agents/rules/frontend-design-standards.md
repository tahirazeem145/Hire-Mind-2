# Frontend Design Standards for HireMind AI 2.0

## 1. Visual Excellence & "WOW" Factor
- **Rich Aesthetics**: Every screen must look premium, modern, and high-tech.
- **Palette**: Use sleek dark mode with vibrant brand accents (cyan, neon blue, purple glow). Avoid flat, washed-out, or generic colors.
- **Glassmorphism & Depth**: Apply translucent card surfaces, subtle specular top borders (`inset 0 1px 0 rgba(255,255,255,0.12)`), and multi-layer backdrop blurs.
- **No Placeholders**: Never use generic placeholders or broken assets. Generate rich SVG illustrations or dynamic canvas visuals.

## 2. Interaction & Micro-Animations
- **Micro-Interactions**: Implement smooth hover transforms (`scale(1.02)`), active feedback states, and magnetic button pulls.
- **Pointer Tracking**: Integrate cursor spotlight effects on cards and interactive components.
- **Interactive Avatar/Character**: Create reactive avatar components responding to user input, focus, and application state.
- **Physics-Based Transitions**: Use modern easing curves (springs with `linear()` or `cubic-bezier(0.16, 1, 0.3, 1)`).

## 3. Architecture, Accessibility & Performance
- **Zero Bloat / Modern Web Standards**: Use native `<dialog>`, Popover API, CSS Anchor Positioning, Container Queries (`@container`), and fluid `clamp()` sizing.
- **WCAG 2.1 AA Compliance**: High-contrast ratios, visible `:focus-visible` rings, ARIA live regions for AI status updates, and reduced-motion fallbacks.
- **Performance**: Maintain smooth 60/120fps with `content-visibility: auto`, `scheduler.yield()` for heavy computation, and `IntersectionObserver` throttling.
- **Stitch MCP Alignment**: Ensure all components match design system variables and tokens produced by Google Stitch MCP.
