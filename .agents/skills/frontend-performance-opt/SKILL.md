---
name: frontend-performance-opt
description: Guide for high-performance frontend engineering, including sub-50ms INP (Interaction to Next Paint), non-blocking scheduler.yield() tasks, content-visibility optimization, and resource prioritization. Use when optimizing UI responsiveness, rendering heavy candidate lists/dashboards, or streaming real-time data.
---

# Frontend Performance Optimization Skill

This skill delivers advanced performance strategies to guarantee smooth 60/120fps interactions and instantaneous UI response times.

## 1. Non-Blocking Computation with `scheduler.yield()`

When processing candidate rankings, resume parsing, or search filtering, break up long tasks so the browser remains responsive to user clicks and inputs:

```javascript
export async function yieldToMain() {
  if ('scheduler' in window && 'yield' in window.scheduler) {
    return await window.scheduler.yield();
  }
  // Fallback for older browsers
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Example: Non-blocking batch processing of candidate scores
export async function processLargeDataset(items, chunkProcessFn, chunkSize = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunkProcessFn(chunk);
    
    // Yield execution to allow user inputs and frame renders
    await yieldToMain();
  }
}
```

## 2. Rendering Optimization with `content-visibility`

For complex dashboard views or long lists of candidate cards, defer layout and rendering calculations for off-screen elements:

```css
.candidate-card-list {
  display: grid;
  gap: 1.5rem;
}

.candidate-card-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 160px; /* Estimated height to prevent scroll jumps */
}
```

## 3. Resource Prioritization

- Use `fetchpriority="high"` on critical above-the-fold assets or avatar graphics:
```html
<img src="assets/avatar-hero.webp" alt="HireMind AI Lead" fetchpriority="high" decoding="async">
```
- Defer non-critical scripts and analytics using `requestIdleCallback` or dynamic imports.

## 4. IntersectionObserver for Heavy Off-Screen Visuals
Pause canvas animations, WebGL shaders, or high-frequency polling when off-screen:

```javascript
export function observeVisibility(element, onVisible, onHidden) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onVisible?.(entry);
      } else {
        onHidden?.(entry);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(element);
  return () => observer.disconnect();
}
```
