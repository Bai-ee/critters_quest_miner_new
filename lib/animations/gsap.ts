import gsap from 'gsap';
import { ANIMATION_CONFIG } from './config';

export function animateCardEntrance(
  element: gsap.TweenTarget,
  delay: number = 0,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.card.entrance;
  
  return gsap.fromTo(
    element,
    config.from,
    {
      ...config.to,
      duration: config.duration,
      delay: delay + config.delay,
      ease: config.ease,
      onComplete,
    }
  );
}

export function animateCardHover(
  element: gsap.TweenTarget,
  isHovering: boolean
) {
  const config = ANIMATION_CONFIG.card.hover;
  
  if (isHovering) {
    gsap.to(element, {
      scale: config.scale,
      boxShadow: `0 0 ${config.glow.intensity * 20}px ${config.glow.color}`,
      duration: config.duration,
      ease: config.ease,
    });
  } else {
    gsap.to(element, {
      scale: 1,
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: config.duration,
      ease: config.ease,
    });
  }
}

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

export function animateModalBackdrop(
  element: gsap.TweenTarget,
  isOpening: boolean,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.modal.backdrop;
  
  if (isOpening) {
    return gsap.fromTo(element, config.from, {
      ...config.to,
      duration: config.duration,
      ease: config.ease,
      onComplete,
    });
  }
  return gsap.to(element, {
    ...config.from,
    duration: config.duration,
    ease: config.ease,
    onComplete,
  });
}

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

export function animateGridSquareHover(
  element: gsap.TweenTarget,
  isHovering: boolean
) {
  const config = ANIMATION_CONFIG.gridSquare.hover;
  
  if (isHovering) {
    gsap.to(element, {
      scale: config.scale,
      boxShadow: `0 0 ${config.glow.intensity * 20}px ${config.glow.color}`,
      duration: config.duration,
      ease: config.ease,
    });
  } else {
    gsap.to(element, {
      scale: 1,
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: config.duration,
      ease: config.ease,
    });
  }
}

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

export function animateGridSquareWinner(
  element: gsap.TweenTarget,
  onComplete?: () => void
) {
  const config = ANIMATION_CONFIG.gridSquare.winner;
  
  const tl = gsap.timeline({ onComplete });
  
  tl.to(element, {
    scale: config.to.scale,
    boxShadow: `0 0 ${config.glow.intensity * 30}px ${config.glow.color}`,
    duration: config.duration,
    ease: config.ease,
  });
  
  tl.to(element, {
    y: config.bounce.y,
    duration: config.bounce.duration,
    ease: config.bounce.ease,
  }, '-=0.3');
  
  return tl;
}

export function animateStagger(
  elements: gsap.TweenTarget,
  animation: (element: gsap.TweenTarget) => gsap.core.Tween,
  delay: number = ANIMATION_CONFIG.stagger.delay
) {
  const config = ANIMATION_CONFIG.stagger;
  
  return gsap.utils.toArray(elements).forEach((element, index) => {
    const anim = animation(element as gsap.TweenTarget);
    if (anim) {
      anim.delay(index * delay);
    }
  });
}

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

export function animateLoadingSpinner(element: gsap.TweenTarget) {
  const config = ANIMATION_CONFIG.loading.spinner;
  
  return gsap.to(element, {
    rotation: config.rotation,
    duration: config.duration,
    ease: config.ease,
    repeat: -1,
  });
}

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

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getAnimationDuration(baseDuration: number): number {
  return prefersReducedMotion() ? 0 : baseDuration;
}


