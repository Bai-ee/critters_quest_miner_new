# Quick Reference Card

## 🚀 Start Development
```bash
pnpm install
pnpm dev
# App runs on http://localhost:3000
```

## 📁 Key Files

### ✅ Safe to Modify (UI/UX Only)
- `components/*.tsx` - All component files
- `app/page.tsx` - Main page layout
- `app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration
- `lib/animations/config.ts` - Animation configuration
- `lib/animations/*.ts` - Animation utilities (safe to extend)
- `hooks/useAnimation.ts` - Animation hooks

### ❌ DO NOT Modify
- `lib/accounts.ts` - Account parsing
- `lib/instructions.ts` - Transaction building
- `lib/instrucionsHooks.ts` - Transaction sending
- `hooks/useRoundData.ts` - Data fetching
- `lib/types.ts` - Type definitions

## 🎨 Common Patterns

### Card
```tsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
```

### Button Primary
```tsx
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold">
```

### Button Secondary
```tsx
<button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg border border-gray-600/50">
```

### Input
```tsx
<input className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
```

### Badge
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/50">
```

## 🎨 Colors

- **Background**: `gray-900`, `gray-800`
- **Text**: `white`, `gray-400`
- **SOL**: `purple-400`, `purple-600`
- **QUEST**: `orange-400`, `orange-600`
- **Success**: `green-400`, `green-500`
- **Warning**: `yellow-400`, `yellow-500`
- **Error**: `red-400`, `red-500`
- **Info**: `blue-400`, `blue-500`

## 📱 Responsive

```tsx
text-sm md:text-base lg:text-lg
flex flex-col md:flex-row
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
hidden md:block
```

## 🔗 Data Hooks

```tsx
const { round, miner, board, automation } = useRoundData();
const { balance: solBalance } = useSolBalance();
const { balance: tokenBalance } = useTokenBalance({...});
const { publicKey, connected } = useWallet();
```

## ⚠️ Common Mistakes

1. ❌ Don't modify transaction logic
2. ❌ Don't change account parsing
3. ❌ Don't alter calculation functions
4. ✅ Do modify styling and layout
5. ✅ Do add new UI components
6. ✅ Do improve responsive design

## 🧪 Test Checklist

- [ ] Wallet connects/disconnects
- [ ] Grid squares are clickable
- [ ] Buttons enable/disable correctly
- [ ] Mobile layout works
- [ ] No console errors
- [ ] Real-time updates work

## 🎬 Animation System

### Quick Usage
```tsx
import { useButtonAnimation } from '@/hooks/useAnimation';
import { Modal } from '@/components/Modal';
import { GlossyButton } from '@/components/GlossyButton';

// Button with animations
const { buttonRef, handleMouseEnter, handleMouseLeave } = useButtonAnimation();

// Glossy Button (December 2024)
<GlossyButton variant="success" size="md">Button Text</GlossyButton>

// Modal
<Modal isOpen={isOpen} onClose={onClose} title="Title">Content</Modal>
```

### Master Config
Tweak all animations in `lib/animations/config.ts`

### Sound Effects
```tsx
import { playClickSound, playSuccessSound } from '@/lib/animations';
playClickSound(); // Play sound
```

### Shake Animation (December 2024)
```tsx
// Applied to chosen cards when timer is running
className={`${isChosen && isTimerRunning ? 'animate-shake' : ''}`}
```

## 📚 Full Docs

- **Frontend Context**: `FRONTEND_CONTEXT.md` ⭐ **START HERE** - Complete overview of recent changes
- **Developer Guide**: `DEVELOPER_GUIDE.md` - Architecture and development guide
- **Style Guide**: `STYLE_GUIDE.md` - Detailed styling patterns
- **Design Context**: `DESIGN_CONTEXT.md` - Design philosophy and goals
- **Animation System**: `lib/animations/README.md` - Animation documentation

