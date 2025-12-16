import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import {
  animateCardHover,
  animateButtonHover,
  animateButtonActive,
  animateGridSquareHover,
  animateGridSquareSelected,
  playHoverSound,
  playClickSound,
} from '@/lib/animations';

export interface UseAnimationOptions {
  enableSound?: boolean;
  soundDelay?: number;
}

export function useCardAnimation(options: UseAnimationOptions = {}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { enableSound = true } = options;

  const handleMouseEnter = useCallback(() => {
    if (cardRef.current) {
      animateCardHover(cardRef.current, true);
      if (enableSound) {
        playHoverSound();
      }
    }
  }, [enableSound]);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      animateCardHover(cardRef.current, false);
    }
  }, []);

  return {
    cardRef,
    handleMouseEnter,
    handleMouseLeave,
  };
}

export function useButtonAnimation(options: UseAnimationOptions = {}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { enableSound = true } = options;

  const handleMouseEnter = useCallback(() => {
    if (buttonRef.current) {
      animateButtonHover(buttonRef.current, true);
      if (enableSound) {
        playHoverSound();
      }
    }
  }, [enableSound]);

  const handleMouseLeave = useCallback(() => {
    if (buttonRef.current) {
      animateButtonHover(buttonRef.current, false);
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    if (buttonRef.current) {
      animateButtonActive(buttonRef.current, true);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (buttonRef.current) {
      animateButtonActive(buttonRef.current, false);
      if (enableSound) {
        playClickSound();
      }
    }
  }, [enableSound]);

  return {
    buttonRef,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  };
}

export function useGridSquareAnimation(
  isSelected: boolean,
  options: UseAnimationOptions = {}
) {
  const squareRef = useRef<HTMLDivElement>(null);
  const { enableSound = true } = options;

  useEffect(() => {
    if (squareRef.current) {
      animateGridSquareSelected(squareRef.current, isSelected);
    }
  }, [isSelected]);

  const handleMouseEnter = useCallback(() => {
    if (squareRef.current && !isSelected) {
      animateGridSquareHover(squareRef.current, true);
      if (enableSound) {
        playHoverSound();
      }
    }
  }, [isSelected, enableSound]);

  const handleMouseLeave = useCallback(() => {
    if (squareRef.current && !isSelected) {
      animateGridSquareHover(squareRef.current, false);
    }
  }, [isSelected]);

  const handleClick = useCallback(() => {
    if (enableSound) {
      playClickSound();
    }
  }, [enableSound]);

  return {
    squareRef,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  };
}

export function useGSAPTimeline() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const createTimeline = useCallback((options?: gsap.TimelineVars) => {
    const tl = gsap.timeline(options);
    timelineRef.current = tl;
    return tl;
  }, []);

  const clearTimeline = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeline();
    };
  }, [clearTimeline]);

  return {
    timelineRef,
    createTimeline,
    clearTimeline,
  };
}

