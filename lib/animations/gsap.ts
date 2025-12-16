/**
 * GSAP Animation Utilities
 * 
 * Reusable animation functions using GSAP with the master config.
 * These functions provide consistent animations throughout the app.
 */

import gsap from 'gsap';
import { ANIMATION_CONFIG } from './config';

/**
 * Animate card entrance
 */
export function animateCardEntrance(
  element: gsap.TweenTarget,
  delay: number = 0,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.card.entrance;
  
  return gsap.fromTo(
    element,
    {
      ...config.from,
      opacity: config.from.opacity,
    },
    {
      ...config.to,
      opacity: config.to.opacity,
      duration: config.duration,
      delay: delay + config.delay,
      ease: config.ease,
      onComplete,
    }
  );
}

/**
 * Animate card hover
 */
export function animateCardHover(
  element: gsap.TweenTarget,
  isHovering: boolean
) {
  const config = ANIMATION_CONFIG.card.hover;
  
  if (isHovering) {
    gsap.to(element, {
      scale: config.scale,
      duration: config.duration,
      ease: config.ease,
    });
    
    // Add glow effect if element has box-shadow support
    gsap.to(element, {
      boxShadow: `0 0 ${config.glow.intensity * 20}px ${config.glow.color}`,
      duration: config.duration,
      ease: config.ease,
    });
  } else {
    gsap.to(element, {
      scale: 1,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: config.duration,
      ease: config.ease,
    });
  }
}

/**
 * Animate card exit
 */
export function animateCardExit(
  element: gsap.TweenTarget,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.card.exit;
  
  return gsap.to(element, {
    ...config.to,
    duration: config.duration,
    ease: config.ease,
    onComplete,
  });
}

/**
 * Animate modal backdrop
 */
export function animateModalBackdrop(
  element: gsap.TweenTarget,
  isOpening: boolean,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.modal.backdrop;
  
  if (isOpening) {
    return gsap.fromTo(
      element,
      config.from,
      {
        ...config.to,
        duration: config.duration,
        ease: config.ease,
        onComplete,
      }
    );
  } else {
    return gsap.to(element, {
      ...config.from,
      duration: config.duration,
      ease: config.ease,
      onComplete,
    });
  }
}

/**
 * Animate modal entrance
 */
export function animateModalEntrance(
  element: gsap.TweenTarget,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.modal.entrance;
  
  return gsap.fromTo(
    element,
    config.from,
    {
      ...config.to,
      duration: config.duration,
      ease: config.ease,
      onComplete,
    }
  );
}

/**
 * Animate modal exit
 */
export function animateModalExit(
  element: gsap.TweenTarget,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.modal.exit;
  
  return gsap.to(element, {
    ...config.to,
    duration: config.duration,
    ease: config.ease,
    onComplete,
  });
}

/**
 * Animate button hover
 */
export function animateButtonHover(
  element: gsap.TweenTarget,
  isHovering: boolean
) {
  const config = ANIMATION_CONFIG.button.hover;
  
  if (isHovering) {
    gsap.to(element, {
      scale: config.scale,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: `0 0 ${config.glow.intensity * 20}px ${config.glow.color}`,
      duration: config.duration,
      ease: config.ease,
    });
  } else {
    gsap.to(element, {
      scale: 1,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: config.duration,
      ease: config.ease,
    });
  }
}

/**
 * Animate button active/pressed
 */
export function animateButtonActive(
  element: gsap.TweenTarget,
  isActive: boolean
) {
  const config = ANIMATION_CONFIG.button.active;
  
  if (isActive) {
    gsap.to(element, {
      scale: config.scale,
      duration: config.duration,
      ease: config.ease,
    });
  } else {
    gsap.to(element, {
      scale: 1,
      duration: config.duration,
      ease: config.ease,
    });
  }
}

/**
 * Animate button loading pulse
 */
export function animateButtonLoading(element: gsap.TweenTarget) {
  const config = ANIMATION_CONFIG.button.loading.pulse;
  
  return gsap.to(element, {
    scale: config.scale,
    duration: config.duration,
    ease: config.ease,
    repeat: -1,
    yoyo: true,
  });
}

/**
 * Animate grid square hover
 */
export function animateGridSquareHover(
  element: gsap.TweenTarget,
  isHovering: boolean
) {
  const config = ANIMATION_CONFIG.gridSquare.hover;
  
  if (isHovering) {
    gsap.to(element, {
      scale: config.scale,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: `0 0 ${config.glow.intensity * 20}px ${config.glow.color}`,
      duration: config.duration,
      ease: config.ease,
    });
  } else {
    gsap.to(element, {
      scale: 1,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: config.duration,
      ease: config.ease,
    });
  }
}

/**
 * Animate grid square selected
 */
export function animateGridSquareSelected(
  element: gsap.TweenTarget,
  isSelected: boolean
) {
  const config = ANIMATION_CONFIG.gridSquare.selected;
  
  if (isSelected) {
    gsap.to(element, {
      scale: config.scale,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: `0 0 ${config.glow.intensity * 20}px ${config.glow.color}`,
      duration: config.duration,
      ease: config.ease,
    });
    
    // Add pulse animation
    gsap.to(element, {
      scale: config.pulse.scale,
      duration: config.pulse.duration,
      ease: config.pulse.ease,
      repeat: -1,
      yoyo: true,
    });
  } else {
    gsap.killTweensOf(element);
    gsap.to(element, {
      scale: 1,
      duration: config.duration,
      ease: config.ease,
    });
    
    gsap.to(element, {
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: config.duration,
      ease: config.ease,
    });
  }
}

/**
 * Animate grid square winner celebration
 */
export function animateGridSquareWinner(
  element: gsap.TweenTarget,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.gridSquare.winner;
  
  const tl = gsap.timeline({ onComplete });
  
  // Scale and glow
  tl.to(element, {
    scale: config.to.scale,
    boxShadow: `0 0 ${config.glow.intensity * 30}px ${config.glow.color}`,
    duration: config.duration,
    ease: config.ease,
  });
  
  // Bounce
  tl.to(element, {
    y: config.bounce.y,
    duration: config.bounce.duration,
    ease: config.bounce.ease,
  }, '-=0.3');
  
  return tl;
}

/**
 * Stagger animation for multiple elements
 */
export function animateStagger(
  elements: gsap.TweenTarget,
  animation: (element: gsap.TweenTarget) => gsap.core.Tween,
  delay: number = ANIMATION_CONFIG.stagger.delay
) {
  const config = ANIMATION_CONFIG.stagger;
  
  return gsap.utils.toArray(elements).forEach((element, index) => {
    const anim = animation(element);
    if (anim) {
      anim.delay(index * delay);
    }
  });
}

/**
 * Page entrance animation
 */
export function animatePageEntrance(
  element: gsap.TweenTarget,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.page.entrance;
  
  return gsap.fromTo(
    element,
    config.from,
    {
      ...config.to,
      duration: config.duration,
      ease: config.ease,
      onComplete,
    }
  );
}

/**
 * Loading spinner animation
 */
export function animateLoadingSpinner(element: gsap.TweenTarget) {
  const config = ANIMATION_CONFIG.loading.spinner;
  
  return gsap.to(element, {
    rotation: config.rotation,
    duration: config.duration,
    ease: config.ease,
    repeat: -1,
  });
}

/**
 * Loading pulse animation
 */
export function animateLoadingPulse(element: gsap.TweenTarget) {
  const config = ANIMATION_CONFIG.loading.pulse;
  
  return gsap.to(element, {
    scale: config.scale,
    opacity: config.opacity,
    duration: config.duration,
    ease: config.ease,
    repeat: -1,
    yoyo: true,
  });
}

/**
 * Utility to check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration with reduced motion support
 */
export function getAnimationDuration(baseDuration: number): number {
  return prefersReducedMotion() ? 0 : baseDuration;
}

