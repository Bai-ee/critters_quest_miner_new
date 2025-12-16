# Style Guide: Critters Quest Miner

## 🎨 Visual Design System

### Color Palette

#### Primary Colors
```css
/* Backgrounds */
--bg-primary: #111827 (gray-900)
--bg-secondary: #1f2937 (gray-800)
--bg-tertiary: #374151 (gray-700)
--bg-card: rgba(31, 41, 55, 0.5) /* gray-800/50 with backdrop-blur */

/* Text */
--text-primary: #ffffff (white)
--text-secondary: #9ca3af (gray-400)
--text-muted: #6b7280 (gray-500)
```

#### Status Colors
```css
/* Success/Green */
--success: #34d399 (green-400)
--success-dark: #10b981 (green-500)
--success-bg: rgba(6, 78, 59, 0.3) /* green-900/30 */

/* Warning/Yellow */
--warning: #fbbf24 (yellow-400)
--warning-dark: #f59e0b (amber-500)
--warning-bg: rgba(120, 53, 15, 0.3) /* yellow-900/30 */

/* Error/Red */
--error: #f87171 (red-400)
--error-dark: #ef4444 (red-500)
--error-bg: rgba(127, 29, 29, 0.3) /* red-900/30 */

/* Info/Blue */
--info: #60a5fa (blue-400)
--info-dark: #3b82f6 (blue-500)
--info-bg: rgba(30, 58, 138, 0.3) /* blue-900/30 */
```

#### Token Colors
```css
/* SOL (Purple) */
--sol: #a78bfa (purple-400)
--sol-dark: #9333ea (purple-600)
--sol-bg: rgba(88, 28, 135, 0.3) /* purple-900/30 */

/* QUEST (Orange) */
--quest: #fb923c (orange-400)
--quest-dark: #ea580c (orange-600)
--quest-bg: rgba(124, 45, 18, 0.3) /* orange-900/30 */
```

#### Special Colors
```css
/* Motherlode/Gold */
--gold: #fbbf24 (yellow-400)
--gold-dark: #f59e0b (amber-500)
--gold-light: #fcd34d (yellow-300)

/* Winner Highlight */
--winner: #fbbf24 (yellow-400)
--winner-glow: rgba(251, 191, 36, 0.5) /* yellow-400/50 */
```

### Typography Scale

```css
/* Font Families */
--font-sans: Arial, Helvetica, sans-serif
--font-mono: ui-monospace, monospace /* For addresses, numbers */

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

### Shadows

```css
/* Card Shadow */
--shadow-card: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* Button Shadow */
--shadow-button: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

/* Glow Effects */
--shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.3)
--shadow-glow-purple: 0 0 20px rgba(147, 51, 234, 0.3)
--shadow-glow-yellow: 0 0 20px rgba(251, 191, 36, 0.5)
```

---

## 🧩 Component Patterns

### Card Component

**Base Pattern:**
```tsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
  {/* Content */}
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

**Primary Button:**
```tsx
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
  Button Text
</button>
```

**Secondary Button:**
```tsx
<button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500">
  Button Text
</button>
```

**Danger Button:**
```tsx
<button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold">
  Button Text
</button>
```

**Ghost Button:**
```tsx
<button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200">
  Button Text
</button>
```

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

### Grid Square Pattern

**Base Square:**
```tsx
<div className="relative rounded-lg p-4 transition-all duration-500 hover:scale-105 hover:shadow-lg cursor-pointer bg-blue-900/30 border border-blue-500">
  {/* Content */}
</div>
```

**Selected Square:**
```tsx
<div className="bg-green-600/50 border border-green-400 ring-2 ring-green-300">
```

**Winner Square:**
```tsx
<div className="animate-pulse bg-linear-to-br from-yellow-400 via-amber-500 to-yellow-600 border-4 border-yellow-300 ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-500/50 scale-110 z-10">
```

**Empty Square:**
```tsx
<div className="bg-gray-800/50 border border-gray-700">
```

### Stat Card Pattern

```tsx
<div className="bg-linear-to-br from-green-600 to-green-700 rounded-lg p-3 shadow-lg">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">📊</span>
      <div className="text-xs text-white/80 font-medium">Label</div>
    </div>
    <div className="text-lg font-bold text-white">Value</div>
  </div>
</div>
```

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

