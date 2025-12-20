export { ANIMATION_CONFIG } from './config';
export type { AnimationConfig, TimingConfig, EasingConfig } from './config';

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

export { springBounceAnimation } from './springBounce';


