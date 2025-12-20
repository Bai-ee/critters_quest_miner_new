import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ANIMATION_CONFIG } from '@/lib/animations/config';

interface SlotMachineConfig {
  totalDuration?: number;
  delay?: number;
  startChar?: string;
  spinCount?: number;
  spinCountIncrement?: number;
  ease?: string;
}

export function useSlotMachineAnimation(
  value: string | number,
  config: SlotMachineConfig = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);
  
  // Read config dynamically each time to pick up changes
  const finalConfig: Required<SlotMachineConfig> = {
    totalDuration: config.totalDuration ?? ANIMATION_CONFIG.slotMachine.totalDuration,
    delay: config.delay ?? ANIMATION_CONFIG.slotMachine.delay,
    startChar: config.startChar ?? ANIMATION_CONFIG.slotMachine.startChar,
    spinCount: config.spinCount ?? ANIMATION_CONFIG.slotMachine.spinCount,
    spinCountIncrement: config.spinCountIncrement ?? ANIMATION_CONFIG.slotMachine.spinCountIncrement,
    ease: config.ease ?? (ANIMATION_CONFIG.slotMachine as any).ease ?? 'power4.out',
  };
  const valueString = typeof value === 'number' ? value.toFixed(2) : value;
  const characters = valueString.split('');

  useEffect(() => {
    // Reset animation flag if value changes significantly
    const numericValue = typeof value === 'number' ? value : parseFloat(valueString);
    if (hasAnimated.current && (isNaN(numericValue) || numericValue === 0)) {
      hasAnimated.current = false;
    }

    if (hasAnimated.current) return;
    
    // Wait for a valid value
    if (isNaN(numericValue) || numericValue === 0) {
      return;
    }
    
    // Small delay to ensure DOM is ready and refs are populated
    const timeoutId = setTimeout(() => {
      if (!containerRef.current || hasAnimated.current) return;

      const digitElements = digitRefs.current.filter(Boolean);
      if (digitElements.length === 0) {
        hasAnimated.current = false;
        return;
      }

      // Double-check value is still valid before starting animation
      if (isNaN(numericValue) || numericValue === 0) {
        hasAnimated.current = false;
        return;
      }

      // Mark as animated to prevent repeats
      hasAnimated.current = true;

      // Filter out non-digit characters to count only animatable digits
      const digitIndices = characters
        .map((char, index) => ({ char, index }))
        .filter(({ char }) => char !== '.' && char !== ' ' && char !== ',')
        .map(({ index }) => index);

      const totalDigits = digitIndices.length;
      if (totalDigits === 0) return;

      const durationPerDigit = finalConfig.totalDuration / totalDigits;

      // Set all digits to start character initially
      digitIndices.forEach((charIndex) => {
        const digitEl = digitRefs.current[charIndex];
        if (digitEl) {
          digitEl.textContent = finalConfig.startChar;
        }
      });

      // Create timeline for sequential landing
      const tl = gsap.timeline({ delay: finalConfig.delay });

      digitIndices.forEach((charIndex, digitIndex) => {
        const digitEl = digitRefs.current[charIndex];
        if (!digitEl) return;
        
        const targetChar = characters[charIndex];
        const targetNum = parseInt(targetChar, 10);
        
        if (isNaN(targetNum)) return;
        
        // Create spinning effect
        const spinCount = finalConfig.spinCount + (digitIndex * finalConfig.spinCountIncrement);
        
        // Calculate start time - each digit starts when the previous one finishes
        const startTime = digitIndex * durationPerDigit;
        
        // Quick transition from start char to 0 at the start of each digit's animation
        tl.set(digitEl, { textContent: '0' }, startTime);

        // Create counter object for GSAP to animate
        const counter = { value: 0 };
        
        // Animate spinning through numbers
        const spinAnimation = gsap.to(counter, {
          value: targetNum + (spinCount * 10),
          duration: durationPerDigit,
          ease: finalConfig.ease,
          onUpdate: function() {
            const currentNum = Math.floor(counter.value % 10);
            if (digitEl) {
              digitEl.textContent = currentNum.toString();
            }
          },
          onComplete: function() {
            if (digitEl) {
              digitEl.textContent = targetChar;
            }
          }
        });

        // Add to timeline at the calculated start time
        tl.add(spinAnimation, startTime);
      });

      // Ensure final values are set after animation completes
      tl.call(() => {
        digitIndices.forEach((charIndex) => {
          const digitEl = digitRefs.current[charIndex];
          if (digitEl) {
            digitEl.textContent = characters[charIndex];
          }
        });
      }, [], finalConfig.totalDuration + 0.1);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, valueString, characters, finalConfig]);

  return {
    containerRef,
    digitRefs,
    characters,
  };
}


