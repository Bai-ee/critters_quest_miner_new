export const ANIMATION_CONFIG = {
  timing: {
    fast: 0.2,
    medium: 0.4,
    slow: 0.6,
    verySlow: 1.0,
  },

  easing: {
    default: 'power2.out',
    bounce: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.3)',
    smooth: 'power1.inOut',
    sharp: 'power3.out',
    gentle: 'power1.out',
  },

  card: {
    entrance: {
      duration: 0.4,
      delay: 0,
      ease: 'power2.out',
      from: { opacity: 0, y: 20, scale: 0.95 },
      to: { opacity: 1, y: 0, scale: 1 },
    },
    hover: {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.3,
        color: 'rgba(59, 130, 246, 0.5)',
      },
    },
    exit: {
      duration: 0.3,
      ease: 'power2.in',
      to: { opacity: 0, y: -20, scale: 0.95 },
    },
  },

  modal: {
    backdrop: {
      duration: 0.3,
      ease: 'power2.out',
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
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

  button: {
    hover: {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.4,
        color: 'rgba(59, 130, 246, 0.6)',
      },
    },
    active: {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in',
    },
    loading: {
      pulse: {
        duration: 1.5,
        ease: 'power1.inOut',
        scale: [1, 1.05, 1],
      },
    },
  },

  gridSquare: {
    hover: {
      scale: 1.1,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.5,
        color: 'rgba(59, 130, 246, 0.6)',
      },
    },
    selected: {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
      glow: {
        intensity: 0.6,
        color: 'rgba(34, 197, 94, 0.7)',
      },
      pulse: {
        duration: 2,
        ease: 'power1.inOut',
        scale: [1.05, 1.08, 1.05],
      },
    },
    winner: {
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
      from: { scale: 1 },
      to: { scale: 1.2 },
      glow: {
        intensity: 1,
        color: 'rgba(251, 191, 36, 0.8)',
      },
      bounce: {
        duration: 0.5,
        ease: 'bounce.out',
        y: [-10, 0],
      },
    },
  },

  particles: {
    celebration: {
      count: 50,
      duration: 2,
      spread: 360,
      speed: { min: 50, max: 150 },
      gravity: 100,
      colors: [
        'rgba(251, 191, 36, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(251, 113, 133, 1)',
        'rgba(139, 92, 246, 1)',
      ],
    },
    hover: {
      count: 10,
      duration: 0.8,
      spread: 180,
      speed: { min: 20, max: 60 },
      colors: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
      ],
    },
  },

  stagger: {
    delay: 0.05,
    ease: 'power2.out',
    from: 'start' as 'start' | 'center' | 'end',
  },

  page: {
    entrance: {
      duration: 0.5,
      ease: 'power2.out',
      from: { opacity: 0, y: 20 },
      to: { opacity: 1, y: 0 },
    },
  },

  loading: {
    spinner: {
      duration: 1,
      ease: 'none',
      rotation: 360,
    },
    pulse: {
      duration: 1.5,
      ease: 'power1.inOut',
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
    },
  },

  sound: {
    delay: 0.05,
    volume: {
      hover: 0.2,
      click: 0.3,
      success: 0.5,
      error: 0.4,
      ambient: 0.1,
    },
  },
} as const;

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

export type AnimationConfig = typeof ANIMATION_CONFIG;
export type TimingConfig = typeof timing;
export type EasingConfig = typeof easing;

