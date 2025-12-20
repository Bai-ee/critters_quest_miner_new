# Changelog - Critters Quest Miner

This document tracks all code updates and UI changes made to the Critters Quest Miner application.

## Session Updates - December 19, 2025

### 🎨 UI/UX Improvements

#### 1. Wallet UI Enhancements (`app/page.tsx`)
- **X Button Styling**: Updated the disconnect button (red bubble with X) in the connected wallet UI
  - Font: Changed to non-bold Comic Sans MS
  - Size: `fontSize: '13px'`, `paddingBottom: '1.75px'`
  - Position: Adjusted margins and positioning for better alignment
  - Parent container: Set `marginTop: '0'` and `paddingTop: '0'`

- **SOL Value Display**: 
  - Added "SOL" prefix with lower opacity (30%) for better visual hierarchy
  - Adjusted positioning to align with right-side SOL balance pill
  - Format: Shows up to 4 digits before decimal (e.g., "9999.99")

#### 2. Top Navigation Pills (`app/page.tsx`)
- **Wallet & SOL Balance Pills**: Restored original styling
  - Golden gradient border: `linear-gradient(180deg, #FFD700 0%, #B8860B 100%)`
  - Dark gradient background: `linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)`
  - White text for better contrast
  - Inset shadow: `inset 0 6px 15px rgba(0,0,0,0.7)`
  - Glossy overlay effect maintained

#### 3. Manual/Auto Toggle Button (`app/page.tsx`)
- **Color Scheme**: Changed sliding indicator to black for both states
  - Background: `linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)`
  - Border: `2px solid rgb(0,0,0)`
  - Shadow: `0 2px 0 rgb(0,0,0)`
- Both manual and auto states now use consistent black styling

#### 4. Selected Tiles Display (`components/Grid.tsx`)
- **Text Updates**: Changed "xVALUE Selected" to "xVALUE TILES SELECTED"
  - Format: Single line display (e.g., "x2 TILES SELECTED")
  - Removed separate "Selected" label below

- **Deployed Value Preview**:
  - Only shows when tile is selected (`isChosen`)
  - Displays: `userSol + deployAmount` (preview of what will be deployed)
  - Styling:
    - Font size: `text-[22cqw]` (matching screenshot specifications)
    - Color: White (`text-white`)
    - Alignment: Left-justified
    - Format: No "SOL" suffix, only numeric value (e.g., "0.01")
    - Background: Semi-transparent white (`bg-white/50`)

#### 5. Mining Cards Styling (`components/Grid.tsx`)
- **Background Images Removed**: Replaced with CSS-based styling
  - Removed dependency on `/img/card_bg.png`
  - Implemented golden gradient border matching GRAND label style
  - Added glossy overlay effects using CSS gradients

- **Border Style**: Matches GRAND label design
  - Outer container: Golden gradient with `2px` padding
  - Border radius: `13px` outer, `11px` inner
  - Box shadow: `0 10px 25px rgba(0,0,0,0.6)`
  - Removed inset box shadow from inner content

- **Card Background Colors**:
  - Default: `#ffb84a` (orange/gold)
  - Selected: `rgb(12, 12, 12)` (dark gray/black)
  - Applied to both front and back faces

- **Animation Enhancements**:
  - Shake intensity increased by 25%
  - Rotation: `2deg` → `2.5deg` (both directions)
  - Animation: `subtle-shake` keyframes updated

- **Treasure Chest Image**:
  - Moved up 5 pixels: Added `transform: 'translateY(-5px)'` to container
  - Maintains centered positioning with vertical offset

#### 6. Total Deployed Section (`app/page.tsx`)
- **Background Removed**: Removed `bg-black/20 border border-black/30 rounded-lg` classes
- **Text Styling**: "Total You Deployed" value
  - Color: Green (`#00ff00`)
  - Glow effect: Multiple text shadows
    ```css
    textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00'
    ```
  - Maintains original font size and weight

#### 7. Treasure Box Value Display (`app/page.tsx`)
- **QUEST Balance**: Uncommented and activated
  - Format: `0001.34` (7 digits with leading zeros)
  - Display: Uses `AnimatedNumber` component
  - Fallback: Shows `1.34` if token balance is unavailable
  - Background: Uses `/img/quest_amount.png` image

### 🐛 Bug Fixes

1. **Monster Animation Overlap**: Fixed sequential animation logic
   - Added `isAnimating` flag to prevent overlapping monsters
   - Implemented proper timeout management with `timeoutId`
   - Ensures one monster completes before next starts

2. **Layout Breakage**: Fixed top navigation width issues
   - Maintained original `width: '4000px'` with centering transform
   - Preserved margin values for main content area

### 📦 Component Updates

#### `components/Grid.tsx`
- Added `deployAmount` prop to `GridProps` interface
- Updated function signature to accept `deployAmount` parameter
- Conditional rendering for user's deployed value
- Updated card styling to use CSS gradients instead of images
- Enhanced shake animation keyframes

#### `app/page.tsx`
- Updated wallet UI disconnect button styling
- Modified SOL balance display formatting
- Updated toggle button color scheme
- Removed background from deployed text section
- Added green glow effect to deployed value
- Uncommented and updated QUEST balance display
- Passed `deployAmount` prop to Grid component

#### `components/JackpotTierCard.tsx`
- Adjusted GRAND winner border thickness to match other borders
- Changed padding from conditional `isScaled ? '2px' : '4px'` to fixed `'2px'`

### 🎬 Animation Updates

1. **Monster Walking Animation** (`app/page.tsx` - `SlimeAnimation` component):
   - Sequential animation system
   - Random monster selection from `/img/monsters/` folder
   - Alternating directions (right-to-left and left-to-right)
   - Horizontal flip for left-to-right movement
   - Size handling: `slime_IDLE_LEFT_WS.gif` (250px), others (200px)
   - Position: `calc(50% + 15px)` from top
   - Animation duration: 12 seconds per monster
   - 2-second delay between monsters

2. **Card Shake Animation** (`components/Grid.tsx`):
   - Increased intensity: `2deg` → `2.5deg` (25% increase)
   - Applied to selected cards when timer is running

### 📝 Code Quality

- **TypeScript**: All changes maintain type safety
- **Linting**: No linter errors introduced
- **Git**: All changes committed with descriptive messages
- **Deployment**: Successfully deployed to Vercel production

### 🔧 Configuration Updates

- **`.gitignore`**: Added temporary directories to ignore
- **`tsconfig.json`**: Excluded `critters_quest_miner-main` from compilation
- **`next.config.js`**: Updated for Next.js 16 Turbopack compatibility
- **`.vercelignore`**: Created to exclude unnecessary files from deployment

### 📊 Files Modified

1. `app/page.tsx` - Multiple UI updates, wallet styling, toggle buttons, deployed text
2. `components/Grid.tsx` - Card styling, animations, value displays
3. `components/JackpotTierCard.tsx` - Border thickness adjustment
4. `.gitignore` - Added ignore patterns
5. `tsconfig.json` - Excluded directories
6. `next.config.js` - Turbopack configuration

### 🚀 Deployment

- **Commit**: `57f948e` - "Update UI: treasure box value, remove deployed text background, add green glow"
- **Vercel Deployment**: Successfully deployed to production
- **Production URL**: https://crittersquestminer-egsauefat-baiees-projects.vercel.app

---

## Related Documentation

- **DEVELOPER_GUIDE.md**: Comprehensive development guide
- **STYLE_GUIDE.md**: Design system and styling guidelines
- **FRONTEND_CONTEXT.md**: Frontend architecture documentation
- **lib/animations/README.md**: Animation system documentation

---

## Notes for Future Development

1. **Card Styling**: Cards now use pure CSS gradients - no image dependencies
2. **Animation System**: Monster animations use sequential logic to prevent overlaps
3. **Value Displays**: Selected tiles show preview amounts before deployment
4. **Color Scheme**: Black toggle buttons for consistent UI
5. **Glow Effects**: Green glow used for deployed values to draw attention

---

*Last Updated: December 19, 2025*

