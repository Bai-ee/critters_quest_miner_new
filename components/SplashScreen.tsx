'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function SplashScreen() {
  const splashRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const pulseAnimationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Wait for DOM and resources to be ready
    const initSplash = () => {
      if (!splashRef.current || !logoRef.current) return;

      // Initial logo animation - subtle scale and fade in
      gsap.fromTo(
        logoRef.current,
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Add a subtle pulse animation to logo
      pulseAnimationRef.current = gsap.to(logoRef.current, {
        scale: 1.05,
        duration: 1.5,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Wait a minimum time to ensure smooth experience (prevents flash)
      const minDisplayTime = 1000; // 1 second minimum for better UX
      const startTime = Date.now();

      // Check if page is fully loaded
      const checkReady = () => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
          // Kill pulse animation before fading out
          if (pulseAnimationRef.current) {
            pulseAnimationRef.current.kill();
          }

          // Add class to body to allow background transition
          document.body.classList.add('splash-ready');

          // Fade out splash screen
          const tl = gsap.timeline({
            onComplete: () => {
              setIsVisible(false);
              // Remove splash screen from DOM after animation
              if (splashRef.current) {
                splashRef.current.style.display = 'none';
              }
            },
          });

          // Fade out logo first
          tl.to(logoRef.current, {
            opacity: 0,
            scale: 0.9,
            duration: 0.4,
            ease: 'power2.in',
          });

          // Then fade out the entire splash screen
          tl.to(
            splashRef.current,
            {
              opacity: 0,
              duration: 0.5,
              ease: 'power2.inOut',
            },
            '-=0.2'
          );
        }, remainingTime);
      };

      // Check if document is already loaded
      if (document.readyState === 'complete') {
        checkReady();
      } else {
        // Wait for window load event (all resources loaded)
        window.addEventListener('load', checkReady, { once: true });
        
        // Fallback: if load event doesn't fire within 3 seconds, proceed anyway
        setTimeout(() => {
          if (isVisible) {
            checkReady();
          }
        }, 3000);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initSplash, 50);

    return () => {
      clearTimeout(timer);
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.kill();
      }
      window.removeEventListener('load', initSplash);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={splashRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{
        background: 'linear-gradient(to bottom, var(--cq-bg-1), var(--cq-bg-0), var(--cq-bg-1))',
        pointerEvents: 'auto', // Block interactions during splash
        touchAction: 'none', // Prevent touch scrolling during splash (CSS-only, no JS needed)
        WebkitTouchCallout: 'none', // Prevent iOS callout menu
        userSelect: 'none', // Prevent text selection
      }}
    >
      {/* Logo Container */}
      <div
        ref={logoRef}
        className="flex flex-col items-center justify-center"
        style={{
          opacity: 0, // Start hidden, GSAP will animate it
        }}
      >
        <img
          src="/img/miner_logo.png"
          alt="QUEST Mining"
          className="w-48 h-auto sm:w-64 md:w-80"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(255, 207, 132, 0.3))',
          }}
        />
      </div>
    </div>
  );
}
