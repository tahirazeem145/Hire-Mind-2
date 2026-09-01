---
name: motion-cursor-interactions
description: Implementation guide for modern web animations, micro-interactions, physics-based springs, View Transitions, interactive cursor spotlights, magnetic elements, and animated character/illustration interactions. Use when building interactive visual effects, cursor listeners, animated transitions, or interactive character assets.
---

# Motion, Cursor & Character Interactions Skill

This skill provides advanced, performant patterns for fluid animations, micro-interactions, custom interactive cursor effects, and character interactions.

## 1. Physics-Based Animations & Easing

### 1.1 Spring Easing with `linear()`
Use modern spring curve functions instead of generic `ease-in-out`:

```css
:root {
  /* Fluid spring curves */
  --ease-spring-bounce: linear(
    0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017 20.2%,
    1.049 23.6%, 1.055 27.3%, 1.009 38.3%, 0.995 47.1%, 1.001 56.4%, 1
  );
  --ease-spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 1.2 `@starting-style` for DOM Entry Animations
Animate elements when entering/exiting without external animation libraries:

```css
.modal-overlay, .dropdown-menu {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.25s var(--ease-spring-snappy),
              transform 0.25s var(--ease-spring-snappy),
              display 0.25s allow-discrete,
              overlay 0.25s allow-discrete;
}

@starting-style {
  .modal-overlay[open], .dropdown-menu.active {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
}
```

## 2. Interactive Cursor & Spotlight Effects

### 2.1 Mouse-Following Spotlight (Radial Glow)
Attach CSS custom properties `--mouse-x` and `--mouse-y` dynamically to containers or cards:

```javascript
// High performance pointer tracking using requestAnimationFrame
export function initSpotlightCards(selector = '.spotlight-card') {
  const cards = document.querySelectorAll(selector);
  
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
```

```css
.spotlight-card {
  position: relative;
  overflow: hidden;
}

.spotlight-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 210, 255, 0.12),
    transparent 40%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.spotlight-card:hover::before {
  opacity: 1;
}
```

### 2.2 Magnetic Button Interaction
Pull interactive elements gently toward the cursor within a hover threshold:

```javascript
export function initMagneticElements(selector = '.magnetic-target') {
  const elements = document.querySelectorAll(selector);

  elements.forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.3;
      const deltaY = (e.clientY - centerY) * 0.3;

      el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = 'translate3d(0px, 0px, 0px)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    el.addEventListener('pointerenter', () => {
      el.style.transition = 'none';
    });
  });
}
```

## 3. Character & Illustration Interactions

### 3.1 Dynamic SVG Character Avatars
- Build vector characters with layered SVG groups (`#character-eyes`, `#character-head`, `#character-glow`).
- Track pointer coordinates to rotate pupils/head toward the user's focus or cursor:

```javascript
export function initInteractiveAvatar(avatarContainerId = 'ai-assistant-avatar') {
  const container = document.getElementById(avatarContainerId);
  if (!container) return;

  const pupils = container.querySelectorAll('.avatar-pupil');
  const head = container.querySelector('.avatar-head');

  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const distance = Math.min(6, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 30);
    
    const pupilX = Math.cos(angle) * distance;
    const pupilY = Math.sin(angle) * distance;
    
    pupils.forEach(pupil => {
      pupil.style.transform = `translate3d(${pupilX}px, ${pupilY}px, 0)`;
    });

    if (head) {
      const tiltX = (e.clientX - centerX) / 80;
      const tiltY = (e.clientY - centerY) / 80;
      head.style.transform = `rotate(${tiltX * 0.5}deg) translate3d(${tiltX}px, ${tiltY}px, 0)`;
    }
  });
}
```

### 3.2 State Reactions (Idle, Thinking, Speaking, Success)
- **Idle**: Gentle breathing/floating keyframe animation (`translateY(0)` to `translateY(-6px)`).
- **Thinking / Processing**: Pulsing ambient energy ring with cyan/violet gradient rotation.
- **Success**: Quick celebratory bounce and particle burst.
