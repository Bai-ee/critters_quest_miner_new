# Developer Guide: Critters Quest Miner

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Critical Features & Logic](#critical-features--logic)
4. [UI/UX Development Guidelines](#uiux-development-guidelines)
5. [Animation System](#animation-system)
6. [Style Guide](#style-guide)
7. [What NOT to Touch](#what-not-to-touch)
8. [Common Patterns](#common-patterns)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm (or npm/yarn)
- Solana wallet extension (Phantom or Solflare)
- MongoDB (for rounds history API)

### Local Development Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Solana RPC Endpoint (required)
   NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
   # Or use a paid RPC like Helius, QuickNode, etc.
   
   # MongoDB Connection (required for /api/rounds)
   MONGODB_URI=mongodb://localhost:27017/critters_quest
   # Or your MongoDB Atlas connection string
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   App runs on `http://localhost:3000`

4. **Production Build**
   ```bash
   pnpm build
   pnpm start
   ```

### Using PM2 (Production)
```bash
pm2 start pm2.config.js
pm2 logs critters_quest_miner
```

---

## 🏗️ Architecture Overview

### Project Structure
```
critters_quest_miner/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes (MongoDB queries)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Grid.tsx           # 5x5 mining grid
│   ├── MainControl.tsx    # Deploy/Claim controls
│   ├── WalletButton.tsx   # Wallet connection
│   ├── Timer.tsx          # Round countdown
│   ├── Stats.tsx          # Round statistics
│   ├── Motherlode.tsx     # Jackpot tiers
│   ├── RoundResults.tsx   # User results display
│   ├── RoundsTable.tsx    # Historical rounds
│   └── WalletProvider.tsx # Solana wallet context
├── hooks/                 # Custom React hooks
│   ├── useRoundData.ts    # Real-time blockchain data
│   ├── useSolBalance.ts   # SOL balance tracking
│   └── useTokenBalance.ts # Token balance tracking
├── lib/                   # Core business logic
│   ├── accounts.ts       # Account fetching/parsing
│   ├── instructions.ts   # Transaction building
│   ├── instrucionsHooks.ts # Transaction hooks
│   ├── solana.ts         # Connection setup
│   ├── mongodb.ts        # Database connection
│   ├── types.ts          # TypeScript types
│   ├── formatters.ts     # Data formatting
│   └── models/          # MongoDB models
└── public/              # Static assets
```

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP 3.14.2
- **3D/Particles**: Three.js 0.182.0
- **Audio**: Howler.js 2.2.4
- **Blockchain**: Solana Web3.js
- **Wallet**: @solana/wallet-adapter-react
- **Database**: MongoDB (Mongoose)
- **State**: React hooks + WebSocket subscriptions

---

## ⚙️ Critical Features & Logic

### 1. Real-Time Data Flow (`hooks/useRoundData.ts`)

**DO NOT MODIFY** the data fetching logic. This hook:
- Subscribes to blockchain accounts via WebSocket
- Parses binary account data from Solana
- Updates UI in real-time when accounts change
- Handles round transitions automatically

**Key Subscriptions:**
- `Board` account → Current round ID, slots
- `Round` account → Grid data, winners, rewards
- `Miner` account → User's deployments, rewards
- `Automation` account → Auto-deployment settings
- `Treasury` account → Motherlode jackpots

**When to Touch:**
- Only if you need to add new account subscriptions
- Only if blockchain data structure changes

### 2. Transaction Building (`lib/instructions.ts`)

**DO NOT MODIFY** instruction serialization. These functions:
- Build Solana transactions with correct account layouts
- Serialize instruction data in exact format expected by program
- Handle PDA derivations correctly

**Critical Instructions:**
- `createDeployInstruction` - Deploy SOL to squares
- `createCheckpointInstruction` - Settle rewards
- `createClaimSolInstruction` - Claim SOL rewards
- `createClaimOreInstruction` - Claim QUEST tokens
- `createAutomateInstruction` - Setup automation

**When to Touch:**
- Only if Solana program instruction format changes
- Only if new instructions are added to the program

### 3. Account Parsing (`lib/accounts.ts`)

**DO NOT MODIFY** account deserialization. This file:
- Parses binary account data from Solana
- Converts to TypeScript types matching Rust structs
- Handles BigInt conversions safely

**Critical Functions:**
- `fetchBoard()` - Get current round info
- `fetchRound()` - Get round grid data
- `fetchMiner()` - Get user's miner account
- `fetchAutomation()` - Get automation settings
- `getWinningSquare()` - Calculate winner from slot hash

**When to Touch:**
- Only if on-chain account structure changes
- Only if you need to add new account fields

### 4. Transaction Hooks (`lib/instrucionsHooks.ts`)

**DO NOT MODIFY** transaction sending logic. These hooks:
- Build and send transactions to Solana
- Handle checkpoint logic (when needed)
- Wait for confirmations

**Critical Hooks:**
- `useDeployToSquares()` - Deploy SOL
- `useCheckpoint()` - Settle round
- `useClaimSol()` - Claim SOL
- `useClaimOre()` - Claim QUEST
- `useClaimAll()` - Claim both
- `useAutomation()` - Manage automation

**When to Touch:**
- Only to add new transaction types
- Only to modify confirmation handling

---

## 🎨 Animation System

### Overview

The application uses a centralized animation system built on GSAP, Three.js, and Howler.js. All animations are controlled by master configuration variables for easy tweaking.

### Key Files

- `lib/animations/config.ts` - Master animation configuration (tweak here!)
- `lib/animations/gsap.ts` - GSAP animation utilities
- `lib/animations/sound.ts` - Sound manager (Howler.js)
- `lib/animations/particles.ts` - Particle system utilities (Three.js)
- `hooks/useAnimation.ts` - React hooks for easy animation integration
- `components/Modal.tsx` - Reusable modal component with animations

### Quick Usage

**Using Animation Hooks:**
```tsx
import { useButtonAnimation } from '@/hooks/useAnimation';

function MyButton() {
  const { buttonRef, handleMouseEnter, handleMouseLeave } = useButtonAnimation();
  
  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      Animated Button
    </button>
  );
}
```

**Using Modal Component:**
```tsx
import { Modal } from '@/components/Modal';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="My Modal">
  Content here
</Modal>
```

**Tweaking Animations:**
All animations can be adjusted in `lib/animations/config.ts`:
```typescript
ANIMATION_CONFIG.timing.fast = 0.2;      // Adjust speed
ANIMATION_CONFIG.card.hover.scale = 1.02; // Adjust hover effect
```

### Dependencies

- **GSAP v3.14.2** - Animation library
- **Three.js v0.182.0** - 3D graphics and particles
- **Howler.js v2.2.4** - Sound effects

### Documentation

See `lib/animations/README.md` for complete documentation and examples.

---

## 🎨 UI/UX Development Guidelines

### Safe Areas for UI/UX Work

✅ **SAFE TO MODIFY:**
- All files in `components/` (except logic-heavy parts)
- `app/page.tsx` (layout and presentation only)
- `app/globals.css`
- `tailwind.config.ts`
- Styling classes in any component
- Component structure and layout
- Loading states and animations
- Error message displays
- Responsive breakpoints

❌ **DO NOT MODIFY:**
- `hooks/useRoundData.ts` - Core data fetching
- `lib/accounts.ts` - Account parsing
- `lib/instructions.ts` - Transaction building
- `lib/instrucionsHooks.ts` - Transaction sending
- `lib/types.ts` - Type definitions (unless adding new types)
- Transaction logic in `MainControl.tsx`
- Data calculation logic in `RoundResults.tsx`

### Component Responsibilities

#### `app/page.tsx` - Main Dashboard
**Your Role:** Layout, component arrangement, responsive design
**Don't Touch:** Data fetching logic, transaction logic

**Key Sections:**
- Header with wallet and balance
- Motherlode tiers display
- Grid + Controls layout
- Timer and Stats cards
- Rounds table

#### `components/Grid.tsx` - Mining Grid
**Your Role:** Visual styling, animations, hover effects, selection UI
**Don't Touch:** Square calculation logic, winner detection

**Key Props:**
- `round: Round` - Grid data (read-only)
- `miner?: Miner | null` - User's miner account (for on-chain state)
- `currentSlot: bigint` - Current slot (for timer detection)
- `selectedSquares: Set<number>` - Selection state
- `toggleSquare: (index: number) => void` - Selection handler

**Recent Changes (December 2024):**
- Selection state persistence: Cards show green bubble if selected OR already mined on-chain
- Green glossy indicator bubble replaces miner count when chosen (matches `GlossyButton` success variant)
- Shake animation when card is chosen AND timer is running
- Timer detection: Checks if round is finalized (has `slotHash`) to determine if timer is running

#### `components/MainControl.tsx` - Deploy/Claim Controls
**Your Role:** Button styling, form layouts, validation messages, loading states
**Don't Touch:** Transaction building, amount calculations, checkpoint logic

**Key Sections:**
- Manual/Auto mode tabs
- Amount input
- Square selection controls
- Deploy button
- Rewards display
- Claim buttons

#### `components/Timer.tsx` - Round Countdown
**Your Role:** Visual countdown display, progress bar, styling
**Don't Touch:** Time calculation logic (but you can adjust display format)

**Recent Changes (December 2024):**
- Restored to glossy green capsule style
- Dynamic progress bar with color changes (green → orange → red)
- Stopwatch image with ticking animation
- Glossy overlay matching button style

#### `components/Stats.tsx` - Round Statistics
**Your Role:** Card styling, layout, visual hierarchy
**Don't Touch:** Calculation logic

#### `components/RoundResults.tsx` - User Results
**Your Role:** Results display, card layouts, visual feedback
**Don't Touch:** Reward calculation logic (lines 15-119)

#### `components/Motherlode.tsx` - Jackpot Display
**Your Role:** Tier card styling, gradients, animations, layout spacing
**Don't Touch:** Data fetching (uses `useRoundData` hook)

**Recent Changes (December 2024):**
- GRAND card: Full-width, centered "QUEST - ODDS - SOL" layout with images
- MAJOR/MINOR cards: Side-by-side (50% width each, 2px gap), scaled down
- Container spacing: `marginTop: '-82px'` for Motherlode, `marginTop: '-12px'` for MAJOR/MINOR
- All containers use `overflow: visible` to prevent clipping

#### `components/JackpotTierCard.tsx` - Individual Jackpot Card
**Your Role:** Card styling, responsive scaling, layout, icon placement
**Don't Touch:** Data calculation (receives props from parent)

**Recent Changes (December 2024):**
- Centered "Asset - Odds - Asset" layout for all tiers
- GRAND: Large values with QUEST/SOL images next to values
- MAJOR/MINOR: Scaled down (0.9), smaller text, two-line odds format
- Tier-specific neon gradients with gold bezel
- Glossy overlay effects

#### `components/WalletButton.tsx` - Wallet Connection
**Your Role:** Button styling, modal UI, user experience
**Don't Touch:** Wallet adapter integration (uses `@solana/wallet-adapter-react`)

**Recent Changes (December 2024):**
- Custom image-based button UI
- Custom modal for connected wallet options (Change Wallet, Disconnect)
- Uses hidden `WalletMultiButton` for wallet selection
- Modal z-index set to `9999` for visibility

#### `components/RoundsTable.tsx` - History Table
**Your Role:** Table styling, responsive design, tab UI
**Don't Touch:** Data fetching from API

---

## 🎨 Style Guide

### Color Palette

The app uses a dark theme with specific color meanings:

```typescript
// Primary Colors
Background: gray-900 (main), gray-800 (cards)
Text: white (primary), gray-400 (secondary)

// Status Colors
Success/Green: green-400, green-500, green-600
Warning/Yellow: yellow-400, yellow-500
Error/Red: red-400, red-500
Info/Blue: blue-400, blue-500, blue-600

// Token Colors
SOL (Purple): purple-400, purple-500, purple-600
QUEST (Orange): orange-400, orange-500, orange-600

// Special Colors
Motherlode (Gold): yellow-400, amber-500, orange-500
Winner (Gold): yellow-400, yellow-600
```

### Typography

```css
/* Headings */
h1: text-3xl, text-4xl, font-bold
h2: text-xl, text-2xl, font-bold
h3: text-lg, font-semibold

/* Body */
Default: text-sm, text-base
Small: text-xs
Monospace: font-mono (for addresses, numbers)

/* Weights */
Bold: font-bold (important numbers, labels)
Semibold: font-semibold (section headers)
Medium: font-medium (secondary labels)
```

### Spacing System

```css
/* Padding */
Cards: p-4, p-6
Sections: p-3, p-4
Buttons: px-4 py-2, px-6 py-3

/* Gaps */
Between elements: gap-2, gap-3, gap-4
Grid gaps: gap-1.5, gap-2, gap-3

/* Margins */
Section spacing: mb-4, mb-6, mb-8
Component spacing: mt-2, mt-3, mt-4
```

### Component Patterns

#### Card Component
```tsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
  {/* Card content */}
</div>
```

#### Button Primary
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold">
  Button Text
</button>
```

#### Button Secondary
```tsx
<button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 border border-gray-600/50">
  Button Text
</button>
```

#### Status Badge
```tsx
<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/50">
  Status
</span>
```

#### Input Field
```tsx
<input
  type="number"
  className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

#### Gradient Background
```tsx
<div className="bg-linear-to-br from-blue-900 to-blue-800 rounded-xl p-6">
  {/* Content */}
</div>
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
Default: Mobile (< 640px)
sm: 640px+ (Small tablets)
md: 768px+ (Tablets)
lg: 1024px+ (Laptops)
xl: 1280px+ (Desktops)

/* Usage Example */
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### Animation Patterns

```css
/* Hover Effects */
hover:scale-105 hover:shadow-lg
transition-all duration-200

/* Loading Spinner */
animate-spin rounded-full h-16 w-16 border-b-2 border-white

/* Pulse Animation */
animate-pulse

/* Bounce (for winners) */
animate-bounce
```

### Glassmorphism Effect

```css
/* Backdrop blur with transparency */
backdrop-blur-sm bg-gray-800/50 border border-gray-700
```

### Gradient Patterns

```css
/* Primary Gradient */
bg-linear-to-r from-blue-500 to-purple-600

/* Success Gradient */
bg-linear-to-br from-green-600 to-green-700

/* Warning Gradient */
bg-linear-to-br from-yellow-400 to-orange-500

/* Card Gradient */
bg-linear-to-br from-gray-700 to-gray-800
```

---

## 🚫 What NOT to Touch

### Critical Files (DO NOT MODIFY)

1. **`lib/accounts.ts`**
   - Account deserialization logic
   - PDA derivation functions
   - Binary data parsing

2. **`lib/instructions.ts`**
   - Instruction serialization
   - Transaction account layouts
   - Discriminator values

3. **`lib/instrucionsHooks.ts`**
   - Transaction sending logic
   - Checkpoint detection
   - Confirmation waiting

4. **`hooks/useRoundData.ts`**
   - WebSocket subscriptions
   - Account change handlers
   - Data parsing logic

5. **`lib/types.ts`**
   - Type definitions matching Rust structs
   - Constants (PROGRAM_ID, etc.)

### Critical Logic Sections

1. **`components/MainControl.tsx`**
   - Lines 46-84: Automation setup logic
   - Lines 123-163: Deploy transaction logic
   - Lines 165-212: Claim transaction logic
   - Lines 104-121: Cost calculations

2. **`components/RoundResults.tsx`**
   - Lines 15-119: Reward calculation function
   - Don't modify the math, only styling

3. **`app/page.tsx`**
   - Line 19: `useRoundData()` hook usage
   - Lines 24-28: Token balance hook (but fix the hardcoded address!)
   - Don't modify data flow

### Safe Modification Examples

✅ **GOOD - Styling Only:**
```tsx
// Before
<div className="bg-gray-800 p-4">

// After (Safe)
<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
```

✅ **GOOD - Layout Only:**
```tsx
// Before
<div className="flex gap-2">

// After (Safe)
<div className="flex flex-col md:flex-row gap-4">
```

❌ **BAD - Logic Modification:**
```tsx
// Don't change this
const amountLamports = BigInt(Math.floor(amount * 1e9));

// Don't change this
const squaresBitmask = squareIndices.reduce((acc, idx) => acc | (1 << idx), 0);
```

---

## 📐 Common Patterns

### Adding a New UI Component

1. Create file in `components/YourComponent.tsx`
2. Use TypeScript interfaces for props
3. Follow the style guide patterns
4. Make it responsive (mobile-first)
5. Use existing hooks for data (don't create new blockchain logic)

**Example:**
```tsx
'use client';

import { useRoundData } from '@/hooks/useRoundData';

interface YourComponentProps {
  // Props here
}

export function YourComponent({ }: YourComponentProps) {
  const { round, miner } = useRoundData();
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      {/* Your UI here */}
    </div>
  );
}
```

### Modifying Existing Components

1. **Identify the component** in `components/`
2. **Check what props it receives** - these are your data sources
3. **Modify styling only** - use Tailwind classes
4. **Test responsive design** - check mobile, tablet, desktop
5. **Don't touch calculation logic** - if you see math, leave it alone

### Adding New Styling

1. **Use Tailwind utilities first** - check if what you need exists
2. **Add to `tailwind.config.ts`** if you need custom values
3. **Use CSS variables** in `globals.css` for theme-wide changes
4. **Follow existing patterns** - match the style of similar components

### Responsive Design Checklist

- [ ] Test on mobile (320px - 640px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Check text readability at all sizes
- [ ] Ensure buttons are tappable on mobile (min 44x44px)
- [ ] Verify spacing doesn't break on small screens

### Loading States

Always show loading states for async operations:
```tsx
{loading ? (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
) : (
  <div>{/* Content */}</div>
)}
```

### Error States

Always show user-friendly error messages:
```tsx
{error ? (
  <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
    <p className="text-red-300">{error}</p>
  </div>
) : (
  <div>{/* Content */}</div>
)}
```

---

## 🧪 Testing Your Changes

### Visual Testing Checklist

1. **Wallet Connection**
   - [ ] Connect wallet works
   - [ ] Disconnect works
   - [ ] Balance displays correctly

2. **Grid Interaction**
   - [ ] Squares are clickable
   - [ ] Selection highlights correctly
   - [ ] Winner animation shows (when applicable)

3. **Deploy Flow**
   - [ ] Amount input works
   - [ ] Square selection works
   - [ ] Deploy button enables/disables correctly
   - [ ] Transaction sends successfully

4. **Responsive Design**
   - [ ] Mobile layout works
   - [ ] Tablet layout works
   - [ ] Desktop layout works
   - [ ] No horizontal scrolling

5. **Real-Time Updates**
   - [ ] Balance updates automatically
   - [ ] Grid updates when round changes
   - [ ] Timer counts down correctly

### Common Issues to Watch For

1. **TypeScript Errors**
   - Run `pnpm build` to check for type errors
   - Fix any `any` types you introduce

2. **Console Errors**
   - Check browser console for runtime errors
   - Watch for WebSocket connection issues

3. **Layout Breaking**
   - Test with different screen sizes
   - Check for overflow issues

4. **Performance**
   - Watch for unnecessary re-renders
   - Check network tab for excessive requests

---

## 📝 Notes

### Known Issues to Fix (Future)

1. **Hardcoded Wallet Address** (`app/page.tsx:26`)
   - Should use `publicKey` from wallet hook
   - Currently uses hardcoded address

2. **Filename Typo** (`lib/instrucionsHooks.ts`)
   - Should be `instructionsHooks.ts`
   - But don't rename without updating all imports

3. **Magic Numbers**
   - `525600` in `app/page.tsx:188` should be a constant
   - `60` in `components/Timer.tsx:130` should be calculated

### Environment-Specific Notes

- **Development**: Uses devnet or mainnet based on `NEXT_PUBLIC_RPC_URL`
- **Production**: Should use paid RPC (Helius, QuickNode, etc.)
- **MongoDB**: Only needed for `/api/rounds` endpoint (historical data)

---

## 🆘 Getting Help

### When Stuck

1. **Check the console** - Look for error messages
2. **Check network tab** - See if API calls are failing
3. **Review this guide** - Make sure you're not touching critical logic
4. **Check TypeScript** - Run `pnpm build` to see type errors

### Common Questions

**Q: Can I change the grid size?**
A: No, the grid is hardcoded as 5x5 (25 squares) in the Solana program.

**Q: Can I add new colors?**
A: Yes, add them to `tailwind.config.ts` or use existing Tailwind colors.

**Q: Can I modify the reward calculations?**
A: No, these are calculated on-chain. You can only change how they're displayed.

**Q: Can I add new features?**
A: Yes, but only UI features. Blockchain features require program changes.

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter Documentation](https://github.com/solana-labs/wallet-adapter)

---

---

## 🎨 Recent UI Enhancements (December 2024)

### Wallet Connection System
- Custom wallet button with image-based UI
- Custom modal for connected wallet options
- Uses hidden `WalletMultiButton` for wallet selection
- Modal z-index: `9999` for visibility

### Jackpot Cards Layout
- GRAND: Full-width, centered "QUEST - ODDS - SOL" layout with images
- MAJOR/MINOR: Side-by-side (50% width each, 2px gap), scaled down
- Tier-specific neon gradients with gold bezel
- Responsive scaling using container queries

### Mining Grid Selection State
- Green glossy indicator bubble for selected/mined cards
- Selection state persists during and after deployment
- Shake animation when chosen and timer is running
- Unified state: UI selection OR on-chain deployment

### Glossy Button Theme
- Restored glossy button component with three variants
- GSAP-powered hover animations
- Used throughout UI for consistent styling

See `FRONTEND_CONTEXT.md` for complete details on recent changes.

---

**Last Updated:** December 2024
**Maintained By:** Development Team

