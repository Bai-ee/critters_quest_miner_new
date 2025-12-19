# Style Guide: Critters Quest Miner

## 🎰 Design Philosophy: Casino / Juicy Theme

The Critters Quest Miner UI follows a **bright, vibrant, flashy casino aesthetic** with **deep shadows and glossy depth**. The design emphasizes:

- **Warm Gold Accent** (`#FFCF84`) as the primary brand color throughout
- **Deep, dramatic shadows** for maximum visual depth
- **Glossy, juicy buttons** with shine overlays and thick borders
- **Slot machine tile aesthetic** for grid squares
- **Warm brown/copper backgrounds** that complement the gold accent
- **Bright, vibrant colors** with neon glows and effects

### Key Design Principles

1. **Depth & Shadow**: Every element uses deep shadows (`--shadow-button`, `--shadow-cabinet`) to create a 3D, arcade cabinet feel
2. **Glossy Surfaces**: Buttons and panels have shine overlays and bevel effects for a "juicy" tactile feel
3. **Warm Color Palette**: Shift from cool grays to warm browns/coppers that harmonize with the gold accent
4. **Bright Accents**: Gold (`#FFCF84`), purple (SOL), orange (QUEST), and neon glows create vibrant contrast
5. **Mobile-First**: All components are designed for thumb-friendly mobile interaction with responsive scaling

---

## 🎨 Visual Design System

### Casino / Juicy Theme

**Main Accent Color:** `#FFCF84` (Warm Gold) — The primary brand accent used throughout the UI for highlights, buttons, and special effects.

### Color Palette

#### Primary Colors (Backgrounds / Panels)
```css
/* Warm casino cabinet backgrounds */
--bg-primary: #140c05        /* Deep espresso - main background */
--bg-secondary: #241406      /* Warm brown panel - secondary surfaces */
--bg-tertiary: #3a230a       /* Bronze/brown lift - elevated elements */
--bg-card: rgba(36, 20, 6, 0.62)  /* Warm glass effect */

/* Text */
--text-primary: #ffffff       /* Pure white - primary text */
--text-secondary: #ffe7c7     /* Warm cream - secondary text */
--text-muted: #c7a67a         /* Muted gold-brown - muted text */
```

#### Status Colors
```css
/* Success/Green */
--success: #34d399 (green-400)
--success-dark: #10b981 (green-500)
--success-bg: rgba(6, 78, 59, 0.28)

/* Warning/Gold (matches brand accent) */
--warning: #FFCF84           /* Main brand accent */
--warning-dark: #e4a64f      /* Deeper amber */
--warning-bg: rgba(124, 45, 18, 0.22)

/* Error/Red */
--error: #f87171 (red-400)
--error-dark: #ef4444 (red-500)
--error-bg: rgba(127, 29, 29, 0.26)

/* Info/Blue */
--info: #60a5fa (blue-400)
--info-dark: #3b82f6 (blue-500)
--info-bg: rgba(30, 58, 138, 0.26)
```

#### Token Colors
```css
/* SOL (Violet) - Premium contrast against warm cabinet */
--sol: #a78bfa (purple-400)
--sol-dark: #7c3aed (purple-600)
--sol-bg: rgba(88, 28, 135, 0.26)

/* QUEST (Orange) - Warmer to harmonize with #FFCF84 */
--quest: #fb923c (orange-400)
--quest-dark: #ea580c (orange-600)
--quest-bg: rgba(124, 45, 18, 0.26)
```

#### Special / Jackpot Colors
```css
/* Motherlode/Gold - Main accent family */
--gold: #FFCF84              /* Main brand accent */
--gold-dark: #e4a64f         /* Deeper amber */
--gold-light: #ffe2b0         /* Light gold highlight */

/* Winner Highlight */
--winner: #FFCF84            /* Winner glow uses main accent */
--winner-glow: rgba(255, 207, 132, 0.55)
```

#### Jackpot Tier Colors
```css
/* GRAND: Red → Gold gradient (top rarity) */
--tier-grand-bg: linear-gradient(180deg, #ef4444 0%, #FFCF84 100%)
--tier-grand-text: #2b1300

/* MAJOR: Premium violet */
--tier-major-bg: linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)
--tier-major-text: #ffffff

/* MINOR: Green */
--tier-minor-bg: linear-gradient(180deg, #34d399 0%, #10b981 100%)
--tier-minor-text: #052e1b

/* MINI: Blue */
--tier-mini-bg: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)
--tier-mini-text: #061a3b
```

### Typography Scale

```css
/* Font Families */
--font-sans: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif
--font-mono: 'Comic Neue', 'Comic Sans MS', ui-monospace, monospace /* For addresses, numbers */

/* Font Sizes */
--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
--text-3xl: 1.875rem (30px)
--text-4xl: 2.25rem (36px)

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing Scale

```css
/* Padding */
--p-1: 0.25rem (4px)
--p-2: 0.5rem (8px)
--p-3: 0.75rem (12px)
--p-4: 1rem (16px)
--p-6: 1.5rem (24px)
--p-8: 2rem (32px)

/* Margin/Gap */
--gap-1: 0.25rem (4px)
--gap-2: 0.5rem (8px)
--gap-3: 0.75rem (12px)
--gap-4: 1rem (16px)
--gap-6: 1.5rem (24px)
--gap-8: 2rem (32px)
```

### Border Radius

```css
--radius-sm: 0.25rem (4px)
--radius-md: 0.375rem (6px)
--radius-lg: 0.5rem (8px)
--radius-xl: 0.75rem (12px)
--radius-full: 9999px
```

### Shadows (Casino Depth)

```css
/* Card Shadow - Deep, dramatic depth */
--shadow-card: 0 14px 22px -8px rgba(0, 0, 0, 0.55)

/* Button Shadow - Heavy "arcade thunk" feel */
--shadow-button: 0 6px 0 rgba(0, 0, 0, 0.35), 0 14px 26px rgba(0, 0, 0, 0.5)

/* Cabinet/Frame Shadow - Maximum depth */
--shadow-cabinet: 0 22px 44px rgba(0, 0, 0, 0.65)

/* Glow Effects - Bright, vibrant neon glows */
--shadow-glow-blue: 0 0 22px rgba(59, 130, 246, 0.32)
--shadow-glow-purple: 0 0 22px rgba(167, 139, 250, 0.32)
--shadow-glow-gold: 0 0 26px rgba(255, 207, 132, 0.55)  /* Main accent glow */
```

### Grid Tile Tokens (Slot-Symbol Feel)

```css
/* Grid tile styling for slot machine aesthetic */
--grid-tile-bg: linear-gradient(180deg, #3a230a 0%, #241406 100%)
--grid-tile-border: rgba(255, 207, 132, 0.45)
--grid-tile-shadow: 
  inset 0 2px 0 rgba(255,255,255,0.10),
  inset 0 -8px 18px rgba(0,0,0,0.55),
  0 10px 18px rgba(0,0,0,0.45)

--grid-hover-glow: var(--shadow-glow-gold)
--grid-win-glow: 0 0 34px rgba(255, 207, 132, 0.75)
```

### Button Tokens (Juicy Casino Style)

```css
/* Primary Button - Big, glossy, golden */
--button-primary-bg: linear-gradient(180deg, #FFCF84 0%, #e4a64f 100%)
--button-primary-border: rgba(0,0,0,0.85)
--button-primary-text: #2b1300

/* Secondary Button - Subtle gold tint */
--button-secondary-bg: linear-gradient(180deg, rgba(255,207,132,0.28) 0%, rgba(255,207,132,0.12) 100%)
--button-secondary-border: rgba(255,207,132,0.45)
--button-secondary-text: #fff3e3

/* Danger Button - Red gradient */
--button-danger-bg: linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%)
--button-danger-text: #ffffff
```

---

## 🧩 Component Patterns

### Card Component

**Base Pattern (Casino Panel):**
```tsx
<div className="cq-panel p-4">
  {/* Content */}
</div>
```

**Cabinet Frame (Main Grid Container):**
```tsx
<div className="cq-cabinet p-6">
  {/* Content with deep shadow and warm glow */}
</div>
```

**Variations:**

**Primary Card:**
```tsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
```

**Elevated Card:**
```tsx
<div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600 shadow-2xl">
```

**Colored Card:**
```tsx
<div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/50">
```

### Button Components

**Primary Button (Glossy Gold):**
```tsx
<button className="cq-button-primary px-6 py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed">
  BUTTON TEXT
</button>
```
Uses: `--button-primary-bg`, `--button-primary-text`, `--shadow-button` with shine overlay (`::after` pseudo-element)

**Secondary Button (Subtle Gold):**
```tsx
<button className="cq-button-secondary px-4 py-2 text-sm font-bold">
  Button Text
</button>
```
Uses: `--button-secondary-bg`, `--button-secondary-text` with warm gold tint

**Danger Button:**
```tsx
<button className="px-6 py-3 text-base font-bold text-white rounded-full border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--button-danger-bg)', boxShadow: 'var(--shadow-button)' }}>
  DANGER ACTION
</button>
```
Uses: `--button-danger-bg`, `--button-danger-text` with red gradient

**Ghost Button (Minimal):**
```tsx
<button className="px-4 py-2 text-text-secondary hover:text-gold rounded-lg transition-all duration-200 hover:bg-bg-card">
  Button Text
</button>
```
Subtle hover effect with warm cream text

### Input Components

**Text Input:**
```tsx
<input
  type="text"
  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

**Number Input:**
```tsx
<input
  type="number"
  className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  step="0.001"
  min="0.001"
/>
```

### Badge Components

**Status Badge:**
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/50">
  Status
</span>
```

**Info Badge:**
```tsx
<span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-900/30 text-blue-400 border border-blue-500/50">
  Info
</span>
```

**Warning Badge:**
```tsx
<span className="px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-900/30 text-yellow-400 border border-yellow-500/50">
  Warning
</span>
```

### Grid Square Pattern (Slot Tile)

**Base Square:**
```tsx
<div className="cq-slot-tile cq-grid-tile">
  {/* Content */}
</div>
```
Uses: `--grid-tile-bg`, `--grid-tile-border`, `--grid-tile-shadow` with warm brown gradient

**Selected/Mined Square (December 2024 Update):**
```tsx
<div className="cq-slot-tile cq-slot-tile-selected">
  {/* Green glossy bubble replaces miner count */}
</div>
```
- Green gradient: `linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)`
- Border: `rgb(35,116,13)`
- White text with drop shadow
- Glossy overlay effects (top highlight, bottom subtle highlight)
- Shake animation when timer is running: `animate-shake` (0.3s ease-in-out infinite)

**Winner Square:**
```tsx
<div className="cq-slot-tile cq-slot-tile-winner">
```
Strong gold glow using `--grid-win-glow` and `--winner-glow` with sparkle animation

**Empty Square:**
```tsx
<div className="cq-slot-tile">
```
Same base styling, appears darker due to empty content

### Jackpot Card Pattern (December 2024 Update)

**GRAND Card:**
```tsx
<JackpotTierCard
  tier="GRAND"
  ore={data.grand.ore}
  sol={data.grand.sol}
  odds="1/2500"
  bgImage="/img/grand_award_bg.png"
  labelImage="/img/grand_winner_label.png"
  scale={1}
/>
```
- Full-width, centered "QUEST - ODDS - SOL" layout
- Large values with `coin.png` and `solana_logo.png` images next to values
- Height: 72px (non-scaled)
- Gradient: `linear-gradient(180deg, #4A002E 0%, #FF00A0 50%, #4A002E 100%)`
- Gold bezel: `linear-gradient(180deg, #FFD700 0%, #B8860B 100%)`

**MAJOR/MINOR Cards:**
```tsx
<div className="flex flex-row w-full gap-[2px]">
  <JackpotTierCard tier="MAJOR" scale={0.9} />
  <JackpotTierCard tier="MINOR" scale={0.9} />
</div>
```
- Side-by-side (50% width each, 2px gap)
- Scaled down (0.9), height: 40px
- Smaller text (1/4 smaller than GRAND)
- Two-line odds format
- Small QUEST/SOL logos next to values
- MAJOR gradient: `linear-gradient(180deg, #0A004A 0%, #0077FF 50%, #0A004A 100%)`
- MINOR gradient: `linear-gradient(180deg, #002E1A 0%, #00A364 50%, #002E1A 100%)`

### Gradient Backgrounds

**Primary Gradient:**
```tsx
<div className="bg-linear-to-br from-blue-900 to-blue-800">
```

**Success Gradient:**
```tsx
<div className="bg-linear-to-br from-green-600 to-green-700">
```

**Purple Gradient:**
```tsx
<div className="bg-linear-to-r from-blue-500 to-purple-600">
```

**Gold Gradient:**
```tsx
<div className="bg-linear-to-br from-yellow-400 to-orange-500">
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Responsive Patterns

**Text Sizing:**
```tsx
<h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
  Responsive Heading
</h1>
```

**Spacing:**
```tsx
<div className="p-3 sm:p-4 md:p-6">
  Responsive Padding
</div>
```

**Layout:**
```tsx
<div className="flex flex-col md:flex-row gap-4">
  Responsive Layout
</div>
```

**Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive Grid
</div>
```

**Visibility:**
```tsx
<div className="hidden md:block">
  Hidden on mobile, visible on tablet+
</div>
```

---

## ✨ Animation Patterns

### Loading Spinner
```tsx
<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
```

### Pulse Animation
```tsx
<div className="animate-pulse bg-gray-800/50"></div>
```

### Bounce Animation
```tsx
<div className="animate-bounce">👑</div>
```

### Hover Effects
```tsx
<div className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
  Hoverable Element
</div>
```

### Smooth Transitions
```tsx
<div className="transition-all duration-500">
  Smooth Transition
</div>
```

### Glow Effect
```tsx
<div className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
  Glowing Element
</div>
```

---

## 🎯 Visual Hierarchy

### Heading Levels

**Page Title (H1):**
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
  Page Title
</h1>
```

**Section Title (H2):**
```tsx
<h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
  <span>📊</span>
  Section Title
</h2>
```

**Subsection Title (H3):**
```tsx
<h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
  Subsection
</h3>
```

### Text Hierarchy

**Primary Text:**
```tsx
<span className="text-white font-bold">Important Value</span>
```

**Secondary Text:**
```tsx
<span className="text-gray-300">Supporting Text</span>
```

**Muted Text:**
```tsx
<span className="text-gray-400 text-sm">Helper Text</span>
```

**Label Text:**
```tsx
<span className="text-xs text-gray-400">Label</span>
```

---

## 🎨 Icon Usage

### Emoji Icons (Current Pattern)

```tsx
{/* Mining/Grid */}
<span>⛏️</span>  {/* Mining Grid */}
<span>💰</span>  {/* Balance/Money */}
<span>📊</span>  {/* Stats */}
<span>📈</span>  {/* Charts */}

{/* Rewards */}
<span>💎</span>  {/* Motherlode */}
<span>👑</span>  {/* Winner */}
<span>🏆</span>  {/* Trophy */}

{/* Status */}
<span>⏰</span>  {/* Timer */}
<span>⚡</span>  {/* Live/Active */}
<span>✅</span>  {/* Success */}
<span>⚠️</span>  {/* Warning */}

{/* Actions */}
<span>🔗</span>  {/* Connect */}
<span>📤</span>  {/* Send */}
<span>📥</span>  {/* Receive */}
```

### Icon Sizing

```tsx
<span className="text-sm">📊</span>      /* Small icons */
<span className="text-xl">📊</span>      /* Medium icons */
<span className="text-2xl">📊</span>     /* Large icons */
<span className="text-4xl">👑</span>     /* Hero icons */
```

---

## 🔤 Number Formatting

### SOL Display
```tsx
{solBalance.toFixed(4)} SOL
// Example: 1.2345 SOL
```

### QUEST Display
```tsx
{questBalance.toFixed(2)} $QUEST
// Example: 123.45 $QUEST
```

### Large Numbers
```tsx
{number.toLocaleString()}
// Example: 1,234,567
```

### Address Formatting
```tsx
{address.slice(0, 4)}...{address.slice(-4)}
// Example: AbCd...XyZz
```

---

## 🎭 State Styles

### Loading State
```tsx
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
  <p className="ml-4 text-gray-400">Loading...</p>
</div>
```

### Error State
```tsx
<div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
  <div className="flex items-center gap-2 text-red-400">
    <span>⚠️</span>
    <span className="font-semibold">Error Message</span>
  </div>
  <p className="text-xs text-red-300/80 mt-1">Error details</p>
</div>
```

### Success State
```tsx
<div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
  <div className="flex items-center gap-2 text-green-400">
    <span>✅</span>
    <span className="font-semibold">Success Message</span>
  </div>
</div>
```

### Empty State
```tsx
<div className="text-center py-12 text-gray-400">
  <p>No data available</p>
</div>
```

### Disabled State
```tsx
<button className="opacity-50 cursor-not-allowed" disabled>
  Disabled Button
</button>
```

---

## 🎪 Special Effects

### Glassmorphism
```tsx
<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
  Glass Effect
</div>
```

### Gradient Text
```tsx
<h1 className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Glow Effect
```tsx
<div className="shadow-lg shadow-blue-500/20">
  Glowing Element
</div>
```

### Animated Background
```tsx
<div className="relative overflow-hidden">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-transparent via-white to-transparent animate-pulse" />
  </div>
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

---

## 📋 Quick Reference

### Common Class Combinations

**Card:**
```
bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700
```

**Button Primary:**
```
px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold
```

**Button Secondary:**
```
px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 border border-gray-600/50
```

**Input:**
```
px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
```

**Badge:**
```
px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/50
```

---

## 🎨 Customization Guide

### Changing Theme Colors

1. **Update Tailwind Config** (`tailwind.config.ts`):
```typescript
theme: {
  extend: {
    colors: {
      'custom-primary': '#your-color',
      'custom-secondary': '#your-color',
    }
  }
}
```

2. **Update CSS Variables** (`app/globals.css`):
```css
:root {
  --background: #your-bg-color;
  --foreground: #your-text-color;
}
```

### Adding New Component Variants

1. Create a new component file
2. Follow existing patterns
3. Use the style guide classes
4. Test responsive design
5. Document in this guide

---

**Remember:** Consistency is key. Always follow existing patterns when possible, and only deviate when necessary for new features.

