# Animation System Documentation

## Overview

The animation system provides a centralized, configurable way to add smooth, performant animations throughout the Critters Quest Miner application. All animations are controlled by master configuration variables that can be easily tweaked to adjust the overall look and feel.

## Architecture

```
lib/animations/
├── config.ts          # Master animation configuration
├── gsap.ts            # GSAP animation utilities
├── sound.ts           # Sound manager
├── particles.ts       # Three.js particle systems
└── index.ts           # Main export file
```

## Quick Start

### Import Animation Utilities

```tsx
import {
  animateCardEntrance,
  animateButtonHover,
  playClickSound,
  createSimpleParticleBurst,
} from '@/lib/animations';
```

### Use Animation Hooks

```tsx
import { useButtonAnimation, useCardAnimation } from '@/hooks/useAnimation';

function MyComponent() {
  const { buttonRef, handleMouseEnter, handleMouseLeave } = useButtonAnimation();
  
  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      Click Me
    </button>
  );
}
```

## Master Configuration

All animations are controlled by `ANIMATION_CONFIG` in `lib/animations/config.ts`. Adjust these values to tweak the overall animation feel:

```typescript
import { ANIMATION_CONFIG } from '@/lib/animations';

// Change timing
ANIMATION_CONFIG.timing.fast = 0.15;  // Faster interactions
ANIMATION_CONFIG.timing.medium = 0.5; // Slower transitions

// Change easing
ANIMATION_CONFIG.easing.default = 'power3.out'; // Sharper easing

// Change card hover scale
ANIMATION_CONFIG.card.hover.scale = 1.03; // Less pronounced hover
```

## Common Patterns

### Card Animations

```tsx
import { animateCardEntrance, animateCardHover } from '@/lib/animations';
import { useEffect, useRef } from 'react';

function Card() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardRef.current) {
      animateCardEntrance(cardRef.current);
    }
  }, []);
  
  return (
    <div
      ref={cardRef}
      onMouseEnter={() => animateCardHover(cardRef.current!, true)}
      onMouseLeave={() => animateCardHover(cardRef.current!, false)}
      className="bg-gray-800 rounded-xl p-4"
    >
      Card Content
    </div>
  );
}
```

### Button Animations

```tsx
import { useButtonAnimation } from '@/hooks/useAnimation';

function Button() {
  const {
    buttonRef,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  } = useButtonAnimation();
  
  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      Click Me
    </button>
  );
}
```

### Modal Usage

```tsx
import { Modal } from '@/components/Modal';
import { useState } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
        size="md"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

### Sound Effects

```tsx
import { playClickSound, playSuccessSound, soundManager } from '@/lib/animations';

function MyComponent() {
  const handleClick = () => {
    playClickSound();
    // ... do something
    playSuccessSound();
  };
  
  // Control master volume
  soundManager.setMasterVolume(0.5); // 50% volume
  soundManager.setMuted(false);
  
  return <button onClick={handleClick}>Click</button>;
}
```

### Particle Effects

```tsx
import { createSimpleParticleBurst } from '@/lib/animations';
import { useRef } from 'react';

function WinnerSquare() {
  const squareRef = useRef<HTMLDivElement>(null);
  
  const handleWin = () => {
    if (squareRef.current) {
      createSimpleParticleBurst(squareRef.current, {
        count: 50,
        colors: ['#fbbf24', '#f59e0b', '#fb923c'],
      });
    }
  };
  
  return (
    <div ref={squareRef} onClick={handleWin}>
      Winner!
    </div>
  );
}
```

### Three.js Particle System (Advanced)

```tsx
import { createCelebrationParticles } from '@/lib/animations';
import { useEffect, useRef } from 'react';

function CelebrationEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { dispose } = createCelebrationParticles(containerRef.current, {
      count: 100,
      duration: 3,
      colors: ['#fbbf24', '#fb923c', '#f87171'],
    });
    
    return dispose;
  }, []);
  
  return <div ref={containerRef} className="w-full h-full" />;
}
```

## Configuration Reference

### Timing

- `fast`: 0.2s - Quick interactions (buttons, hovers)
- `medium`: 0.4s - Card transitions, modals
- `slow`: 0.6s - Page loads, major state changes
- `verySlow`: 1.0s - Dramatic entrances

### Easing

- `default`: 'power2.out' - Smooth default
- `bounce`: 'back.out(1.7)' - Playful bounce
- `elastic`: 'elastic.out(1, 0.3)' - Springy
- `smooth`: 'power1.inOut' - Gentle
- `sharp`: 'power3.out' - Snappy

### Component-Specific Configs

Each component type has its own configuration:
- `card` - Card animations
- `modal` - Modal animations
- `button` - Button animations
- `gridSquare` - Grid square animations
- `particles` - Particle effects
- `stagger` - Stagger animations
- `page` - Page transitions
- `loading` - Loading animations
- `sound` - Sound timing and volumes

## Best Practices

1. **Use Hooks When Possible**: The animation hooks (`useButtonAnimation`, `useCardAnimation`) handle refs and event handlers automatically.

2. **Respect Reduced Motion**: The system automatically checks for `prefers-reduced-motion` and adjusts animations accordingly.

3. **Performance**: Use `transform` and `opacity` properties for animations (GPU-accelerated). Avoid animating `width`, `height`, or `top/left`.

4. **Sound Management**: Sounds are disabled by default on mobile devices. Users can control volume and mute state.

5. **Cleanup**: Always clean up animations when components unmount. The hooks handle this automatically.

6. **Consistency**: Use the provided animation functions rather than creating custom GSAP animations to maintain consistency.

## Troubleshooting

### Animations Not Working

- Check that GSAP is installed: `npm list gsap`
- Verify the element ref is not null
- Check browser console for errors

### Sounds Not Playing

- Check that Howler.js is installed: `npm list howler`
- Verify sound files exist in `/public/sounds/`
- Check if sounds are muted: `soundManager.isEnabled()`
- Sounds are disabled by default on mobile

### Performance Issues

- Reduce particle count for mobile devices
- Use `createSimpleParticleBurst` instead of Three.js for simple effects
- Check that animations use `transform` and `opacity` only

## Next Steps

- Add sound files to `/public/sounds/` directory
- Customize animation config values to match your design vision
- Integrate animations into existing components
- Test on mobile devices for performance


