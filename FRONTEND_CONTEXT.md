# Frontend Development Context: Critters Quest Miner

## 📋 Overview

This document provides a comprehensive context of all frontend/UI work completed on the Critters Quest Miner application. Use this as a starting point when beginning work on a fresh repository or merging changes.

**Last Updated:** December 2024  
**Status:** Production-ready, deployed to Vercel

---

## 🎯 Recent Major Changes

### 1. Wallet Connection System (December 2024)

**Component:** `components/WalletButton.tsx`

**Implementation:**
- Custom wallet button with image-based UI (`/img/wallet.png` and `/img/Attached_wallet.png`)
- Uses hidden `WalletMultiButton` from `@solana/wallet-adapter-react-ui` for wallet selection modal
- Custom modal for connected wallet options (Change Wallet, Disconnect)
- Modal uses existing `Modal` component with `z-index: 9999` to ensure visibility

**Key Features:**
- When disconnected: Clicking button opens wallet selection modal
- When connected: Clicking button opens custom modal with:
  - Connected wallet address display
  - "Change Wallet" button (opens selection modal)
  - "Disconnect" button
- Preserves all original wallet adapter functionality

**Files Modified:**
- `components/WalletButton.tsx` - Complete rewrite with custom modal
- `components/Modal.tsx` - Increased z-index to `z-[9999]` for backdrop
- `components/WalletProvider.tsx` - Uses explicit wallet adapters (Phantom, Solflare) with `autoConnect={false}`

---

### 2. Jackpot Cards Layout (December 2024)

**Component:** `components/JackpotTierCard.tsx` and `components/Motherlode.tsx`

**Implementation:**
- **GRAND Card**: Full-width, centered layout with "QUEST - ODDS - SOL" arrangement
  - QUEST and SOL values use `coin.png` and `solana_logo.png` images (not text labels)
  - Images positioned next to values, not on top
  - ODDS text between values with specific styling (smaller, same opacity, slight line height)
  - Large, prominent values with proper sizing
- **MAJOR and MINOR Cards**: Side-by-side layout (50% width each, 2px gap)
  - Scaled down version (scale: 0.9)
  - Same "Asset - Odds - Asset" layout but without text labels
  - Small QUEST and SOL logos next to values
  - Text is 1/4 smaller than GRAND
  - Odds formatted as two lines (e.g., `X/` on one line, `XXXX` on next) to save space

**Layout Details:**
- GRAND card: Full width, height 72px (non-scaled)
- MAJOR/MINOR cards: Each 50% width with 2px gap, height 40px (scaled)
- Motherlode container: `marginTop: '-82px'` to overlap with header
- MAJOR/MINOR container: `marginTop: '-12px'` to bring them closer to GRAND
- All containers use `overflow: visible` to prevent clipping

**Styling:**
- Tier-specific neon gradients:
  - GRAND: `linear-gradient(180deg, #4A002E 0%, #FF00A0 50%, #4A002E 100%)`
  - MAJOR: `linear-gradient(180deg, #0A004A 0%, #0077FF 50%, #0A004A 100%)`
  - MINOR: `linear-gradient(180deg, #002E1A 0%, #00A364 50%, #002E1A 100%)`
- Gold bezel around all cards: `linear-gradient(180deg, #FFD700 0%, #B8860B 100%)`
- Glossy overlay on top 45% of card
- Label images positioned absolutely at top

**Files Modified:**
- `components/JackpotTierCard.tsx` - Complete layout restructure
- `components/Motherlode.tsx` - Container spacing and layout adjustments

---

### 3. Mining Grid Selection State (December 2024)

**Component:** `components/Grid.tsx`

**Implementation:**
- Selected cards show green glossy indicator bubble (matching `GlossyButton` success variant)
- Selection state persists during and after deployment
- State is unified: cards show green bubble if either:
  - Selected in UI (`selectedSquares` state)
  - Already mined on-chain (`miner.deployed[index] > 0`)
- Green bubble replaces the miner count circle when selected
- Bubble includes glossy overlay effects (top highlight, bottom subtle highlight)

**Visual Details:**
- Green gradient: `linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)`
- Border color: `rgb(35,116,13)`
- White text with drop shadow
- Miner count displayed inside bubble

**Animation:**
- Subtle shake animation when card is chosen AND timer is running
- Shake uses CSS keyframes: `subtle-shake` (0.3s ease-in-out infinite)
- Rotation: `-1deg` to `1deg` back and forth
- Only applies when `isChosen && isTimerRunning`

**Timer Detection:**
- `isTimerRunning` determined by checking if round is finalized (has `slotHash`)
- If `slotHash` exists and has non-zero values, round is expired (timer not running)
- Otherwise, timer is considered running

**Files Modified:**
- `components/Grid.tsx` - Added selection state persistence, green bubble, shake animation
- `app/page.tsx` - Passes `currentSlot` prop to Grid component

---

### 4. Glossy Button Theme (December 2024)

**Component:** `components/GlossyButton.tsx`

**Implementation:**
- Restored glossy button component with three variants:
  - `primary`: Yellow/gold gradient (default)
  - `success`: Green gradient (used for selected cards)
  - `danger`: Red gradient
- GSAP-powered hover animations:
  - Scale up on hover (1.05x)
  - Scale down on click (0.95x)
  - Shine animation sweeps across on hover
- Glossy overlay effects (top highlight, bottom subtle highlight)
- Deep shadows for 3D effect

**Usage:**
- Used in `MainControl.tsx` for "ALL" and "RANDOM" buttons
- Used in `Timer.tsx` for timer styling
- Green variant used for selected mining cards

**Files Modified:**
- `components/GlossyButton.tsx` - Restored and enhanced
- `components/MainControl.tsx` - Uses `GlossyButton` with `variant="success"`

---

### 5. Timer Component (December 2024)

**Component:** `components/Timer.tsx`

**Implementation:**
- Glossy green capsule-style timer
- Dynamic progress bar with color changes:
  - Green (>50% remaining)
  - Orange (20-50% remaining)
  - Red (<20% remaining)
- Stopwatch image on left with ticking animation
- Progress bar fills from left to right
- Time format: MM:SS or HH:MM:SS
- States: "WAITING", countdown, or "00:00" (expired)

**Styling:**
- Black rounded capsule background
- Green border: `rgb(35,116,13)`
- Glossy overlay matching button style
- White text with drop shadow

**Files Modified:**
- `components/Timer.tsx` - Restored to glossy capsule style

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
- Gold Accent: `#FFCF84` (main brand color)
- Background: Warm browns/coppers (`#140c05`, `#241406`, `#3a230a`)

**Status Colors:**
- Success/Green: `#34d399`, `#52D43B`, `#3BA622`, `#23740D`
- Warning/Gold: `#FFCF84`, `#e4a64f`
- Error/Red: `#ef4444`, `#7f1d1d`
- Info/Blue: `#3b82f6`

**Token Colors:**
- SOL (Purple): `#a78bfa`, `#7c3aed`
- QUEST (Orange): `#fb923c`, `#ea580c`

**Jackpot Tier Gradients:**
- GRAND: `#4A002E → #FF00A0 → #4A002E`
- MAJOR: `#0A004A → #0077FF → #0A004A`
- MINOR: `#002E1A → #00A364 → #002E1A`

### Typography

- Font Family: `'Comic Neue', 'Comic Sans MS', cursive, sans-serif`
- Responsive sizing using container queries (`cqw` units) for grid cards
- Font sizes scale based on card size (scaled vs non-scaled)

### Spacing

- Motherlode container: `marginTop: '-82px'` (overlaps header)
- MAJOR/MINOR container: `marginTop: '-12px'` (brings closer to GRAND)
- Gap between MAJOR and MINOR: `2px`
- All containers: `overflow: visible` to prevent clipping

---

## 📁 Component Architecture

### Key Components

1. **WalletButton** (`components/WalletButton.tsx`)
   - Custom wallet connection UI
   - Modal for connected wallet options
   - Uses hidden `WalletMultiButton` for selection

2. **Grid** (`components/Grid.tsx`)
   - 5x5 mining grid with 3D flip animation (GSAP)
   - Selection state with green bubble indicator
   - Shake animation when chosen and timer running
   - Winner celebration animation

3. **JackpotTierCard** (`components/JackpotTierCard.tsx`)
   - Individual jackpot tier card (GRAND, MAJOR, MINOR)
   - Responsive scaling (scaled vs non-scaled)
   - Centered "Asset - Odds - Asset" layout
   - Tier-specific gradients and styling

4. **Motherlode** (`components/Motherlode.tsx`)
   - Container for all three jackpot cards
   - Handles layout and spacing
   - Passes data from `useRoundData` hook

5. **GlossyButton** (`components/GlossyButton.tsx`)
   - Reusable glossy button component
   - Three variants: primary, success, danger
   - GSAP hover animations

6. **Timer** (`components/Timer.tsx`)
   - Round countdown timer
   - Dynamic progress bar
   - Glossy green capsule style

### Data Flow

```
useRoundData() → Provides: round, miner, board, treasury, automation
    ↓
app/page.tsx → Orchestrates layout and passes data to components
    ↓
Components receive props and render UI
```

**Important:** Never modify the data fetching logic in `hooks/useRoundData.ts` or account parsing in `lib/accounts.ts`.

---

## 🛠️ Technical Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP 3.14.2
- **Wallet:** @solana/wallet-adapter-react
- **State:** React hooks (useState, useEffect, useMemo, useRef)

---

## 🎯 Key Patterns

### Container Queries

Grid cards use container queries (`cqw` units) for responsive sizing:
```tsx
style={{ containerType: 'inline-size' }}
className="text-[10cqw]" // Scales with container
```

### State Persistence

Selection state persists by checking both:
1. UI state: `selectedSquares.has(index)`
2. On-chain state: `miner.deployed[index] > 0`

### Animation Patterns

- **GSAP**: Used for 3D card flips, button hover effects
- **CSS Keyframes**: Used for shake animation, ticking timer
- **CSS Transitions**: Used for smooth state changes

### Responsive Design

- Mobile-first approach
- Container queries for grid cards
- Responsive text sizing: `text-[14px] sm:text-[24px]`
- Flexible layouts: `flex flex-col md:flex-row`

---

## ⚠️ Important Notes

### DO NOT Modify

- `lib/accounts.ts` - Account parsing logic
- `lib/instructions.ts` - Transaction building
- `lib/instrucionsHooks.ts` - Transaction sending
- `hooks/useRoundData.ts` - Data fetching
- `lib/types.ts` - Type definitions

### Safe to Modify

- All component styling and layout
- Animation implementations
- Modal system
- Visual effects
- Responsive breakpoints

---

## 🚀 Deployment

**Current Status:** Deployed to Vercel production

**Deployment Command:**
```bash
git add .
git commit -m "Your commit message"
git push origin_new design
vercel --prod --yes
```

**Branch:** `design` (main development branch)

---

## 📚 Related Documentation

- `DEVELOPER_GUIDE.md` - Complete architecture and development guide
- `DESIGN_CONTEXT.md` - Design philosophy and goals
- `STYLE_GUIDE.md` - Detailed styling patterns
- `QUICK_REFERENCE.md` - Quick patterns and common mistakes

---

## 🔄 Recent Git History

**Key Commits:**
- "UI: persist selected/mined state on cards during and after deployment"
- "UI: add subtle shake animation to chosen cards when timer is running"
- "UI: refine jackpot card layouts and spacing"
- "UI: implement custom wallet connection modal"

---

## 🎓 Learning Resources

When starting fresh, review these files in order:
1. `FRONTEND_CONTEXT.md` (this file) - Current state overview
2. `DEVELOPER_GUIDE.md` - Architecture and patterns
3. `STYLE_GUIDE.md` - Styling system
4. `QUICK_REFERENCE.md` - Quick patterns

Then examine these key components:
1. `components/Grid.tsx` - Selection state and animations
2. `components/JackpotTierCard.tsx` - Responsive card layout
3. `components/WalletButton.tsx` - Custom wallet UI
4. `components/GlossyButton.tsx` - Reusable button component

---

**Last Updated:** December 2024  
**Maintained By:** Development Team

