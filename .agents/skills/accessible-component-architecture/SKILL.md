---
name: accessible-component-architecture
description: Guide for building fully accessible (WCAG 2.1 AA), modular web components using native HTML5 and modern platform APIs (Popover, Dialog, CSS Anchor Positioning, View Transitions, ARIA live regions). Use when creating UI components, modals, popovers, navigation menus, forms, and design system elements.
---

# Accessible Component Architecture & Design Systems

This skill defines modular, accessible, and high-performance component patterns that leverage modern native web standards.

## 1. Native Component Architecture (Zero-Bloat)

### 1.1 Popover API & CSS Anchor Positioning
Create tooltips, dropdowns, and flyout menus natively without heavy third-party positioning libraries:

```html
<!-- Trigger Button -->
<button popovertarget="action-menu" style="anchor-name: --menu-trigger;" class="btn btn-secondary">
  Actions ▾
</button>

<!-- Popover Content anchored to the button -->
<div id="action-menu" popover class="glass-popover" style="position-anchor: --menu-trigger;">
  <button class="popover-item" role="menuitem">View Candidate</button>
  <button class="popover-item" role="menuitem">Schedule Interview</button>
  <button class="popover-item text-danger" role="menuitem">Archive</button>
</div>
```

```css
.glass-popover {
  position: absolute;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 8px;
  background: rgba(18, 24, 38, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.glass-popover:popover-open {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
```

### 1.2 Modal Dialogs with Light-Dismiss
Use the standard `<dialog>` element with backdrop blur and trap focus management:

```html
<dialog id="interview-modal" class="glass-dialog">
  <div class="dialog-header">
    <h2>Schedule AI Interview</h2>
    <button class="btn-close" aria-label="Close modal" onclick="this.closest('dialog').close()">✕</button>
  </div>
  <div class="dialog-body">
    <!-- Form contents -->
  </div>
</dialog>
```

```css
.glass-dialog {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(14, 18, 28, 0.9);
  backdrop-filter: blur(24px);
  color: #fff;
  padding: 24px;
  max-width: 600px;
  width: 90vw;
}

.glass-dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
}
```

## 2. Accessibility (a11y) & Usability

### 2.1 Focus Visibility & Keyboard Navigation
- Ensure all interactive elements have visible, styled focus rings:
```css
:focus-visible {
  outline: 2px solid var(--primary-accent);
  outline-offset: 3px;
}
```

### 2.2 Accessible Live Regions for Real-time AI Updates
When AI evaluates resumes, scores candidates, or updates statuses, notify assistive tech without visual disturbance:

```html
<div id="ai-status-live" class="sr-only" aria-live="polite" aria-atomic="true">
  <!-- Dynamically injected status updates -->
</div>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 2.3 Motion & Contrast Preferences
Always support user system preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (prefers-contrast: more) {
  :root {
    --border-subtle: rgba(255, 255, 255, 0.4);
    --text-secondary: #ffffff;
  }
}
```

## 3. Stitch MCP Design System Alignment
- Every component must map to Stitch MCP design system tokens (`colors`, `typography`, `rounded`, `spacing`).
- Maintain uniform component hierarchy: Atomic Tokens -> Base Components -> Layout Grids -> Feature Modules.
