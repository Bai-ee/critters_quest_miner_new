/**
 * Animation System - Main Export
 * 
 * Central export point for all animation utilities.
 * Import from here for easy access to all animation functions.
 */

// Config
export { ANIMATION_CONFIG } from './config';
export type { AnimationConfig, TimingConfig, EasingConfig } from './config';

// GSAP utilities
export {
  animateCardEntrance,
  animateCardHover,
  animateCardExit,
  animateModalBackdrop,
  animateModalEntrance,
  animateModalExit,
  animateButtonHover,
  animateButtonActive,
  animateButtonLoading,
  animateGridSquareHover,
  animateGridSquareSelected,
  animateGridSquareWinner,
  animateStagger,
  animatePageEntrance,
  animateLoadingSpinner,
  animateLoadingPulse,
  prefersReducedMotion,
  getAnimationDuration,
} from './gsap';

// Sound manager
export {
  soundManager,
  playHoverSound,
  playClickSound,
  playSuccessSound,
  playErrorSound,
  playDeploySound,
  playClaimSound,
  playWinnerSound,
} from './sound';

// Particle systems
export {
  createCelebrationParticles,
  createHoverParticles,
  createSimpleParticleBurst,
} from './particles';
export type { ParticleSystemOptions } from './particles';

