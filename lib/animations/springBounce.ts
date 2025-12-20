import gsap from 'gsap';

/**
 * Reusable spring bounce animation
 * Creates a quick scale up/down with a springy bounce effect
 * 
 * @param element - The DOM element to animate
 * @param options - Optional animation configuration
 */
export function springBounceAnimation(
  element: HTMLElement | null,
  options?: {
    scale?: number;
    duration?: number;
    springDuration?: number;
    springEase?: string;
  }
) {
  if (!element) return;

  const scale = options?.scale ?? 1.15;
  const duration = options?.duration ?? 0.15;
  const springDuration = options?.springDuration ?? 0.25;
  const springEase = options?.springEase ?? 'elastic.out(1, 0.4)';

  gsap.to(element, {
    scale: scale,
    duration: duration,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      gsap.to(element, {
        scale: 1,
        duration: springDuration,
        ease: springEase
      });
    }
  });
}


