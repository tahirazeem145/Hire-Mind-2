# HireMind AI 2.0 — Official Authentication Experience (Stitch Design Specification)

## 1. Project Overview & Stitch Metadata
- **Stitch Project Name:** `projects/14866338409671978121`
- **Project Title:** `HireMind AI 2.0 — Immersive Authentication Experience`
- **Design System Asset ID:** `assets/e7ec1477adf1460092d1415c5a91e1a1`
- **Theme:** *HireMind Dark Cyber-Fantasy*
- **Primary Color:** Electric Cyan (`#00E5FF`)
- **Secondary Color:** Mystic Violet (`#8A2BE2`)
- **Tertiary Accent:** Cyber Magenta (`#FF007F`)
- **Foundation Background:** Obsidian Deep Space (`#04060A`)

---

## 2. Generated Stitch Screens & Assets

### Desktop Viewport (2560x2048 / 1440x900 Fluid)
- **Screen Resource:** `projects/14866338409671978121/screens/e8be34e777ab4a09996316d1fba54ce7`
- **Title:** `HireMind AI 2.0 - Secure Access`
- **Preview / Screenshot:** [View Desktop Screen Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WTZiy5wsi7b_ONuiCnRjsFX-1yzkDfmA7F54U0k8BRDstNkClmlITb2TdTyqOURcK5dnv30Y_BC9m15CYcm4KGNOZ87O8JMFTYZhXNowatQbZVTVut7Bgz_ejm7wUXYXYQnxesBNiWMF5Tkj8EjRmon0uqA3bRR73WNTjTp_Zr3M-0E8zekx3MBiXqrpiNqWBFM0je4YwRudD-DgHOaUOEeaR991h-qMByFwCBRJSgaQzuO5ZR6u-cPs0)

### Mobile Viewport (390x844 / 780x1974 Scaled)
- **Screen Resource:** `projects/14866338409671978121/screens/e7e44e791714496995afe2a1b918b7d9`
- **Title:** `HireMind AI 2.0 - Mobile Access`
- **Preview / Screenshot:** [View Mobile Screen Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WkAn6NsWowtFXkzoieXj5cfNg7qxhTx7Pc0DdFGAhGTxrUo-IAHZdyqenadV4Yy4LXL7q2NBqL72fytA_gNsYeERrdcuCqVxyGTksThb6TK-yH85x51zrYZPF2kwaT0fW1hF16ieVRHxGpFCogIjLt0xZSPI73RwH41B-QoKEXsKe_ttqELYvJ3Wa1EKab1w-UgTwXvUmciVCcNHbjSLeSx5l2Bbx9MBPF-ohFdsI4Kpzbnd72y8HS7aKY)

---

## 3. Experience Architecture & Interaction Mechanics

### 3.1 Two-Column Cinematic Layout (Desktop)
- **Unified Environment:** Both sides are seamlessly fused into one continuous sci-fi realm via background cosmic nebula shaders, soft drifting stardust particles, and light rays bridging the AI companion to the login console.
- **Left Column (Nexus — The AI Career Mentor):**
  - High-quality stylized 3D/cyber-fantasy companion floating in a multi-ring luminous energy field.
  - Luminous cyan eyes engineered for continuous cursor tracking.
  - Floating holographic badges: *Skill Matrix*, *AI Interview Simulator*, *Career Pathing*.
- **Right Column (Smoked Glassmorphic Authentication Portal):**
  - 75% opacity dark obsidian glass with 24px backdrop blur, 1px subtle border, and specular top edge reflection (`inset 0 1px 0 rgba(255,255,255,0.15)`).
  - Glowing HireMind brandmark, "Welcome Back", "Your next opportunity starts here."
  - Floating label email and password inputs with cyan active glow rings.
  - Password visibility toggle icon.
  - Glowing Electric Cyan to Mystic Violet "Sign In" button with animated specular sheen.
  - "Continue with Google" secondary glass button with authentic Google emblem.
  - "Don't have an account? Create account" cyan link.
  - Micro security badge: "Encrypted AI Neural Link • 256-bit Security".

### 3.2 Primary Interaction: Cursor-Reactive Eye & Character Tracking
1. **Pointer Coordinates Stream:** Real-time mouse position tracked relative to the character's bounding center.
2. **Physics Damping / Spring Interpolation:** Eyes smoothly rotate and translate with damped linear interpolation (lerp: 0.1) to avoid jarring snapping.
3. **Form Focus Reaction:** When the user focuses on the Email or Password input, Nexus gently tilts head and looks attentively toward the form.
4. **Password Obfuscation Reaction:** When typing passwords, the companion subtly averts gaze or blinks reassuringly.
5. **Idle Loop:** Subtle vertical hovering respiration (±4px translateY, 4s cycle) and periodic natural blinks.

### 3.3 Mobile & Responsive Adaptation
- **Stacked Hierarchy:** Nexus companion is placed prominently in the top third with interactive touch/idle breathing animation; followed by the finger-friendly glassmorphic login card.
- **Touch-First UI:** 48px minimum touch targets, high-contrast labels, and clear touch active feedback.
- **Reduced Motion Support:** Gracefully disables particle physics and heavy transforms when `prefers-reduced-motion: reduce` is active.
