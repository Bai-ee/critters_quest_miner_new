# Design Context: Critters Quest Miner - UI/UX Enhancement

## 🎯 Project Goals

### Primary Objective
Transform the existing Critters Quest Miner application into a highly interactive, gamified experience with mobile-first design principles, while maintaining 100% compatibility with all existing functionality.

### Design Philosophy
- **Mobile-First**: All designs start with mobile experience, then scale up
- **Above the Fold**: Most game content visible without vertical scrolling
- **Modal-Based Interactions**: Game interactions occur in modals that overlay the main UI
- **Gamification**: Every element has hover states, active states, interactions, and sound effects
- **Zero Breaking Changes**: All existing features must continue to work exactly as before

---

## 🎨 Design Requirements

### Layout Strategy
1. **Homepage Layout**
   - Primary game view (grid, controls, stats) visible above the fold
   - Minimal vertical scrolling required
   - Secondary information accessible via modals or expandable sections

2. **Modal System**
   - Game interactions (deploy, claim, settings) open in modals
   - Modals should be visually engaging with animations
   - Smooth transitions and backdrop effects
   - Mobile-friendly modal sizing and positioning

3. **Visual Hierarchy**
   - Most important game elements (grid, controls) prominently displayed
   - Supporting information (stats, history) accessible but not dominant
   - Clear visual flow guiding user attention

### Interaction Design

#### Hover States
- All interactive elements must have hover states
- Visual feedback (scale, glow, color change, shadow)
- Smooth transitions (200-300ms)
- Sound effects on hover (optional, can be toggled)

#### Active States
- Clear visual indication when elements are active/selected
- Pressed/clicked state feedback
- Sound effects on interaction

#### Animations
- Smooth, performant animations using GSAP
- Entrance animations for modals and components
- Micro-interactions for button clicks, selections
- Loading states with engaging animations
- Winner celebrations and special effects

#### Sound Effects
- Hover sounds (subtle)
- Click/interaction sounds
- Success/error feedback sounds
- Background ambient sounds (optional, toggleable)
- Sound volume controls

### Gamification Elements
- Visual feedback for all actions
- Celebration animations for wins/rewards
- Progress indicators and visual progress bars
- Achievement-style notifications
- Engaging color schemes and gradients
- Particle effects for special moments (Three.js)
- 3D elements where appropriate (Three.js)

---

## 🛠️ Technical Stack

### Animation Libraries
- **GSAP (GreenSock) v3.14.2**: Primary animation library ✅ Installed
  - Timeline animations
  - ScrollTrigger (if needed)
  - Custom easing functions
  - Performance-optimized animations
  - Import: `import gsap from 'gsap'`

### 3D Graphics
- **Three.js v0.182.0**: For 3D elements and particle effects ✅ Installed
  - 3D models or visualizations (if needed)
  - Particle systems for celebrations
  - WebGL shaders for special effects
  - TypeScript types included (@types/three)
  - Import: `import * as THREE from 'three'`

### Styling
- **Tailwind CSS 4**: Existing styling system (maintain compatibility)
- **Custom CSS**: For complex animations and effects
- **CSS Variables**: For theme customization

### Sound
- **Howler.js v2.2.4**: Audio library for sound effects ✅ Installed
  - Sound file management and loading
  - Volume controls and mute functionality
  - Cross-browser compatibility
  - TypeScript types included (@types/howler)
  - Import: `import { Howl } from 'howler'`

---

## 📋 Implementation Guidelines

### Safe Modification Areas
✅ **SAFE TO MODIFY:**
- All component styling and layout
- Animation implementations
- Modal system creation
- Hover/active state styling
- Sound effect integration
- Visual effects and particles
- Responsive breakpoints
- Component structure (as long as props/data flow unchanged)

### Critical Constraints
❌ **DO NOT MODIFY:**
- `lib/accounts.ts` - Account parsing logic
- `lib/instructions.ts` - Transaction building
- `lib/instrucionsHooks.ts` - Transaction sending
- `hooks/useRoundData.ts` - Data fetching logic
- `lib/types.ts` - Type definitions
- Transaction logic in `MainControl.tsx`
- Reward calculation logic in `RoundResults.tsx`
- Data flow and prop passing structure

### Component Modification Strategy
1. **Preserve Props Interface**: Don't change component prop types
2. **Preserve Data Flow**: Don't modify how data flows from hooks to components
3. **Enhance, Don't Replace**: Add animations and styling without changing logic
4. **Test After Changes**: Verify all existing features still work

---

## 🎮 Game UI/UX Patterns

### Modal Patterns
```tsx
// Modal should:
- Animate in with GSAP (fade + scale)
- Have backdrop blur/overlay
- Close on backdrop click
- Close on ESC key
- Be responsive (full screen on mobile, centered on desktop)
- Support smooth transitions
```

### Button Interactions
```tsx
// Buttons should:
- Have hover scale/glow effect
- Have active/pressed state
- Play sound on click
- Show loading state with animation
- Disable state should be visually clear
```

### Grid Square Interactions
```tsx
// Grid squares should:
- Hover effect (scale, glow, border highlight)
- Selected state (clear visual indication)
- Winner state (celebration animation)
- Smooth transitions between states
- Sound feedback on selection
```

### Loading States
```tsx
// Loading should:
- Use engaging animations (not just spinner)
- Show progress when possible
- Be visually interesting
- Match game theme
```

### Success/Error Feedback
```tsx
// Feedback should:
- Use animations (slide in, fade, scale)
- Be visually prominent but not intrusive
- Auto-dismiss after appropriate time
- Have sound effects
- Match game aesthetic
```

---

## 📱 Mobile-First Design Principles

### Breakpoint Strategy
- **Mobile**: < 640px (primary focus)
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

### Mobile Considerations
- Touch-friendly targets (min 44x44px)
- Swipe gestures where appropriate
- Full-screen modals on mobile
- Optimized animations for mobile performance
- Reduced particle effects on mobile (performance)
- Sound effects can be disabled on mobile (battery/data)

### Above the Fold Priority
1. **Must be visible**: Grid, Deploy controls, Timer
2. **Should be visible**: Stats, Balance
3. **Can be below fold**: History table, Detailed stats

---

## 🎨 Visual Design Direction

### Style Enhancements
- More vibrant colors and gradients
- Enhanced shadows and glows
- Smooth transitions everywhere
- Particle effects for special moments
- 3D depth where appropriate
- Glassmorphism effects (already in use, enhance)

### Animation Principles
- **Easing**: Use custom easing for game feel (bounce, elastic where appropriate)
- **Duration**: Fast for interactions (200-300ms), slower for transitions (500ms+)
- **Performance**: Use transform and opacity for animations (GPU accelerated)
- **Accessibility**: Respect `prefers-reduced-motion`

### Color Enhancements
- More saturated colors for game feel
- Better contrast for accessibility
- Gradient overlays for depth
- Glow effects for important elements

---

## 🔧 Development Workflow

### Before Making Changes
1. Review existing component structure
2. Identify safe modification areas
3. Plan animation/effect approach
4. Test on mobile device/browser
5. Verify no breaking changes

### During Development
1. Make incremental changes
2. Test after each significant change
3. Verify all existing features work
4. Check mobile responsiveness
5. Test animations performance

### After Changes
1. Full feature testing
2. Mobile testing (multiple devices if possible)
3. Performance testing (animations, sound)
4. Accessibility check (keyboard navigation, screen readers)
5. Update this context file if goals/approach change

---

## 📝 Current Status

### Phase 1: Foundation ✅ COMPLETE
- [x] Context file created
- [x] GSAP installation and setup (v3.14.2)
- [x] Three.js installation and setup (v0.182.0)
- [x] Sound system setup (Howler.js v2.2.4)
- [x] Animation configuration with master control variables
- [x] GSAP animation utilities and helpers
- [x] Modal system architecture
- [x] Sound manager utility
- [x] Three.js particle system utilities
- [x] React hooks for easy animation integration
- [x] Documentation and README

### Phase 2: Core Enhancements ✅ COMPLETE (December 2024)
- [x] Homepage layout optimization (above the fold)
- [x] Apply animations to existing components
- [x] Button interaction enhancements (GlossyButton restored)
- [x] Grid square animations (3D flip, shake on selection)
- [x] Loading state improvements
- [x] Card entrance animations
- [x] Wallet connection UI (custom modal)
- [x] Jackpot cards layout (centered Asset-Odds-Asset)
- [x] Selection state persistence (green bubble indicator)
- [x] Timer component (glossy green capsule style)

### Phase 3: Advanced Features (In Progress)
- [x] Celebration animations (winner animation)
- [x] Advanced hover states (GSAP-powered)
- [ ] Particle effects (Three.js) - Optional future enhancement
- [ ] Sound effects integration - Optional future enhancement
- [ ] 3D elements (if needed) - Optional future enhancement

### Phase 4: Polish ✅ MOSTLY COMPLETE
- [x] Performance optimization (container queries, memoization)
- [x] Mobile optimization (responsive design, touch-friendly)
- [x] Final testing (deployed to production)
- [ ] Accessibility improvements - Future enhancement

---

## 🎯 Success Criteria

### Functional
- ✅ All existing features work exactly as before
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ All transactions work correctly
- ✅ Real-time updates work

### Visual
- ✅ Most content above the fold
- ✅ Smooth animations throughout
- ✅ Engaging hover/active states
- ✅ Professional game UI feel
- ✅ Mobile-optimized layout

### Performance
- ✅ 60fps animations
- ✅ Fast page load
- ✅ Smooth scrolling
- ✅ No jank or stutter

### User Experience
- ✅ Intuitive interactions
- ✅ Clear visual feedback
- ✅ Engaging and fun
- ✅ Accessible (keyboard navigation, screen readers)

---

## 📚 Reference Documents

- **Developer Guide**: `DEVELOPER_GUIDE.md` - Architecture and critical files
- **Quick Reference**: `QUICK_REFERENCE.md` - Quick patterns and common mistakes
- **Style Guide**: `STYLE_GUIDE.md` - Existing styling patterns

---

## 🔄 Update Log

### December 2024 - Major UI Enhancements
- **Wallet Connection**: Custom wallet button with image-based UI and modal for connected wallet options
- **Jackpot Cards**: Complete layout restructure with centered "Asset - OdDS - Asset" design
  - GRAND: Full-width with large values and images
  - MAJOR/MINOR: Side-by-side, scaled down, two-line odds format
- **Mining Grid**: Selection state persistence with green glossy bubble indicator
- **Animations**: Shake animation for chosen cards when timer is running
- **Glossy Buttons**: Restored and enhanced with GSAP hover effects
- **Timer**: Restored to glossy green capsule style with dynamic progress bar
- **Deployment**: All changes deployed to Vercel production

### 2024 - Initial Context Creation
- Defined design goals and technical approach
- Established constraints and safe modification areas
- Outlined implementation strategy
- Created success criteria

---

**Note**: This file should be updated as the project evolves. Document any changes to goals, approach, or learnings here.

