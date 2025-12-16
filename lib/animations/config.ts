/**
 * Animation Configuration
 * 
 * Master control variables for all animations in the application.
 * Adjust these values to tweak the overall look and feel of animations.
 * 
 * All durations are in seconds.
 */

export const ANIMATION_CONFIG = {
  // Timing - Master durations
  timing: {
    // Fast interactions (buttons, hovers)
    fast: 0.2,
    // Medium transitions (cards, modals)
    medium: 0.4,
    // Slow transitions (page loads, major state changes)
    slow: 0.6,
    // Very slow (dramatic entrances)
    verySlow: 1.0,
  },

  // Easing functions - GSAP easing strings
  easing: {
    // Default smooth easing
    default: 'power2.out',
    // Bouncy/playful easing
    bounce: 'back.out(1.7)',
    // Elastic/springy easing
    elastic: 'elastic.out(1, 0.3)',
    // Smooth in-out
    smooth: 'power1.inOut',
    // Sharp/snappy
    sharp: 'power3.out',
    // Gentle
    gentle: 'power1.out',
  },

  // Card animations
  card: {
    // Entrance animation
    entrance: {
      duration: 0.4,
      delay: 0,
      ease: 'power2.out',
      from: { opacity: 0, y: 20, scale: 0.95 },
      to: { opacity: 1, y: 0, scale: 1 },
    },
    // Hover animation
    hover: {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.3,
        color: 'rgba(59, 130, 246, 0.5)', // blue-500
      },
    },
    // Exit animation
    exit: {
      duration: 0.3,
      ease: 'power2.in',
      to: { opacity: 0, y: -20, scale: 0.95 },
    },
  },

  // Modal animations
  modal: {
    // Backdrop animation
    backdrop: {
      duration: 0.3,
      ease: 'power2.out',
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    // Modal entrance
    entrance: {
      duration: 0.4,
      ease: 'back.out(1.7)',
      from: { 
        opacity: 0, 
        scale: 0.8, 
        y: 50,
        rotation: -5,
      },
      to: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        rotation: 0,
      },
    },
    // Modal exit
    exit: {
      duration: 0.3,
      ease: 'power2.in',
      to: { 
        opacity: 0, 
        scale: 0.8, 
        y: 50,
      },
    },
  },

  // Button animations
  button: {
    // Hover state
    hover: {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.4,
        color: 'rgba(59, 130, 246, 0.6)',
      },
    },
    // Active/pressed state
    active: {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in',
    },
    // Loading state pulse
    loading: {
      pulse: {
        duration: 1.5,
        ease: 'power1.inOut',
        scale: [1, 1.05, 1],
      },
    },
  },

  // Grid square animations
  gridSquare: {
    // Hover state
    hover: {
      scale: 1.1,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.5,
        color: 'rgba(59, 130, 246, 0.6)',
      },
    },
    // Selected state
    selected: {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.6,
        color: 'rgba(34, 197, 94, 0.7)', // green-500
      },
      pulse: {
        duration: 2,
        ease: 'power1.inOut',
        scale: [1.05, 1.08, 1.05],
      },
    },
    // Winner celebration
    winner: {
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
      from: { scale: 1 },
      to: { scale: 1.2 },
      glow: {
        intensity: 1,
        color: 'rgba(251, 191, 36, 0.8)', // yellow-400
      },
      bounce: {
        duration: 0.5,
        ease: 'bounce.out',
        y: [-10, 0],
      },
    },
  },

  // Particle effects
  particles: {
    // Celebration particles
    celebration: {
      count: 50,
      duration: 2,
      spread: 360,
      speed: { min: 50, max: 150 },
      gravity: 100,
      colors: [
        'rgba(251, 191, 36, 1)', // yellow
        'rgba(251, 146, 60, 1)', // orange
        'rgba(251, 113, 133, 1)', // pink
        'rgba(139, 92, 246, 1)', // purple
      ],
    },
    // Hover particles
    hover: {
      count: 10,
      duration: 0.8,
      spread: 180,
      speed: { min: 20, max: 60 },
      colors: [
        'rgba(59, 130, 246, 0.8)', // blue
        'rgba(147, 51, 234, 0.8)', // purple
      ],
    },
  },

  // Stagger animations (for lists, grids)
  stagger: {
    // Default stagger delay
    delay: 0.05,
    // Stagger ease
    ease: 'power2.out',
    // Stagger from direction
    from: 'start' as 'start' | 'center' | 'end',
  },

  // Page transitions
  page: {
    // Entrance
    entrance: {
      duration: 0.5,
      ease: 'power2.out',
      from: { opacity: 0, y: 20 },
      to: { opacity: 1, y: 0 },
    },
  },

  // Loading animations
  loading: {
    // Spinner rotation
    spinner: {
      duration: 1,
      ease: 'none',
      rotation: 360,
    },
    // Pulse animation
    pulse: {
      duration: 1.5,
      ease: 'power1.inOut',
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
    },
  },

  // Sound timing (sync with animations)
  sound: {
    // Delay before playing sound (in seconds)
    delay: 0.05,
    // Volume levels
    volume: {
      hover: 0.2,
      click: 0.3,
      success: 0.5,
      error: 0.4,
      ambient: 0.1,
    },
  },
} as const;

// Export individual configs for easy access
export const {
  timing,
  easing,
  card,
  modal,
  button,
  gridSquare,
  particles,
  stagger,
  page,
  loading,
  sound,
} = ANIMATION_CONFIG;

// Type exports for TypeScript
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type TimingConfig = typeof timing;
export type EasingConfig = typeof easing;

