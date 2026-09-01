---
name: premium-frontend-design
description: Guidelines and patterns for modern, premium frontend UI/UX design, rich aesthetics, modern CSS layouts (container queries, fluid scaling, subgrid), glassmorphism, glowing layers, and cohesive design tokens. Use when designing or styling UI components, layouts, color systems, and visual hierarchy.
---

# Premium Frontend Design Skill

This skill provides expert patterns and implementation standards for state-of-the-art web interfaces that deliver a visual "WOW" factor while maintaining clean, modern code.

## 1. Visual Aesthetics & Token Architecture

### 1.1 Color Palettes & Modern Color Spaces
- Use `oklch()` or tailored HSL/Hex tokens with consistent lightness/chroma distribution.
- Implement dark mode with deep dark foundations (`#08090C`, `#0E121A`, `#131824`) rather than flat `#000000`.
- Use translucent surfaces (`rgba(...)` / `color-mix()`) with `backdrop-filter: blur(...)` to create layered glassmorphism.

```css
:root {
  /* Core Foundation */
  --bg-canvas: #090c10;
  --bg-surface-lowest: #0d1117;
  --bg-surface-card: rgba(19, 24, 35, 0.7);
  --bg-surface-elevated: rgba(28, 36, 52, 0.75);
  
  /* Brand Accents */
  --primary-accent: #00d2ff;
  --primary-glow: rgba(0, 210, 255, 0.35);
  --secondary-accent: #7928ca;
  --secondary-glow: rgba(121, 40, 202, 0.35);
  --accent-cyan: #00f2fe;
  --accent-emerald: #10b981;
  
  /* Typography Colors */
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  
  /* Glass Borders & Highlights */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.16);
  --border-active: rgba(0, 210, 255, 0.4);
}
```

### 1.2 Glassmorphism & Depth Layers
- **Base Canvas**: Low contrast, subtle dark background with radial ambient mesh gradients.
- **Card Surface**: Translucent background (`rgba(19, 24, 35, 0.7)`), `backdrop-filter: blur(16px)`, `1px solid var(--border-subtle)`.
- **Top Edge Specular Highlight**: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1)`.
- **Ambient Glow**: Soft outer glow on active/hovered components (`0 0 25px var(--primary-glow)`).

## 2. Responsive & Fluid Layout Systems

### 2.1 Fluid Typography & Spacing with `clamp()`
Never use fixed breakpoints for simple font scaling. Use fluid mathematical scales:

```css
:root {
  --font-display: 'Montserrat', 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Fluid typography */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);
  --text-3xl: clamp(2rem, 1.75rem + 1.25vw, 2.75rem);
  --text-4xl: clamp(2.5rem, 2.1rem + 2vw, 3.75rem);
  --text-hero: clamp(3rem, 2.4rem + 3vw, 5rem);
}
```

### 2.2 Container Queries (`@container`)
For modular components that adjust according to their container's width instead of the viewport:

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 480px) {
  .card-layout {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.5rem;
  }
}
```

### 2.3 Grid & Subgrid Alignment
- Use `display: grid` with `grid-template-rows: subgrid` to ensure card headers, body sections, and footers align consistently across varying text lengths.
- Employ CSS Grid `minmax()` and `auto-fit`/`auto-fill` for responsive card grids.

## 3. Stitch MCP Integration & Design Sync
- Harmonize CSS custom properties with Stitch's `design.md` structure:
  - Color tokens (`surface`, `surface-container`, `primary`, `secondary`, `outline`)
  - Typography scale (`display-lg`, `headline-md`, `body-lg`, `label-sm`)
  - Spacing rhythm (8px base grid) and corner radii (`rounded-sm`, `rounded-md`, `rounded-xl`, `rounded-full`).
