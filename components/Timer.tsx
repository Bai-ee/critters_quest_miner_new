'use client';

import { useEffect, useState } from 'react';
import { calculateTimeRemaining } from '@/lib/accounts';

interface TimerProps {
  endSlot: bigint;
  currentSlot: bigint;
  startSlot?: bigint;
  roundId?: string;
  selectedCount?: number;
  onExpiredChange?: (expired: boolean) => void;
}

export function Timer({ endSlot, currentSlot, startSlot, roundId, selectedCount = 0, onExpiredChange }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [notStarted, setNotStarted] = useState(false);

  // Calculate initial time
  useEffect(() => {
    // Check if round hasn't started yet
    if (startSlot && currentSlot < startSlot) {
      setNotStarted(true);
      setTimeLeft(0);
      setIsExpired(false);
      return;
    }

    const seconds = calculateTimeRemaining(currentSlot, endSlot);

    // Check if the time is unreasonably large (> 1 year = 31536000 seconds)
    // This indicates the round hasn't started or there's invalid data
    if (seconds > 31536000) {
      setNotStarted(true);
      setTimeLeft(0);
      setIsExpired(false);
      return;
    }

    setNotStarted(false);
    setTimeLeft(seconds);
    setIsExpired(seconds <= 0);
  }, [currentSlot, endSlot, startSlot]);

  useEffect(() => {
    onExpiredChange?.(isExpired);
  }, [onExpiredChange, isExpired]);

  const [progress, setProgress] = useState(0); // Start at 0 for intro animation
  const [targetProgress, setTargetProgress] = useState(100);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Calculate initial time and target progress
  useEffect(() => {
    if (startSlot && currentSlot < startSlot) {
      setNotStarted(true);
      setTimeLeft(0);
      setIsExpired(false);
      setTargetProgress(100);
      return;
    }

    const seconds = calculateTimeRemaining(currentSlot, endSlot);

    if (seconds > 31536000) {
      setNotStarted(true);
      setTimeLeft(0);
      setIsExpired(false);
      setTargetProgress(100);
      return;
    }

    setNotStarted(false);
    setTimeLeft(seconds);
    setIsExpired(seconds <= 0);

    // Calculate target progress percentage based on slots
    // Progress bar visible portion starts at 17%, so 0% time = 17% width, 100% time = 100% width
    if (startSlot && endSlot) {
      const totalSlots = Number(endSlot - startSlot);
      const slotsRemaining = Number(endSlot - currentSlot);
      if (totalSlots > 0) {
        const timeRemainingPercent = Math.min(100, Math.max(0, (slotsRemaining / totalSlots) * 100));
        // Map: 100% time → 100% width, 0% time → 17% width
        const visualProgress = 17 + (timeRemainingPercent / 100) * (100 - 17);
        setTargetProgress(Math.min(100, Math.max(17, visualProgress)));
      }
    }
  }, [currentSlot, endSlot, startSlot]);

  // Intro animation on load
  useEffect(() => {
    if (!hasAnimated && targetProgress > 0) {
      // Start intro animation immediately on mount
      setProgress(targetProgress);
      setHasAnimated(true);
    } else if (hasAnimated) {
      setProgress(targetProgress);
    }
  }, [targetProgress, hasAnimated]);

  // Countdown every second and update progress
  useEffect(() => {
    if (notStarted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setIsExpired(true);
          setTargetProgress(17); // 0% time = 17% width (left edge of visible portion)
        } else if (startSlot && endSlot) {
          // Approximate progress update every second
          const totalSeconds = Number(endSlot - startSlot) * 0.4;
          if (totalSeconds > 0) {
            const timeRemainingPercent = (newTime / totalSeconds) * 100;
            // Map: 100% time → 100% width, 0% time → 17% width
            const visualProgress = 17 + (timeRemainingPercent / 100) * (100 - 17);
            setTargetProgress(Math.min(100, Math.max(17, visualProgress)));
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [notStarted, startSlot, endSlot]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate actual time remaining percentage (0-100%) for color thresholds
  // Progress width is mapped to 17-100%, but we need actual time % for colors
  const getActualTimePercent = () => {
    if (notStarted || isExpired) return 0;
    if (startSlot && endSlot) {
      const totalSlots = Number(endSlot - startSlot);
      const slotsRemaining = Number(endSlot - currentSlot);
      if (totalSlots > 0) {
        return Math.min(100, Math.max(0, (slotsRemaining / totalSlots) * 100));
      }
    }
    // Fallback: calculate from progress width (reverse mapping)
    // progress = 17 + (timePercent / 100) * 83
    // timePercent = ((progress - 17) / 83) * 100
    return Math.min(100, Math.max(0, ((progress - 17) / 83) * 100));
  };

  const actualTimePercent = getActualTimePercent();

  // Dynamic styles based on actual time remaining percentage
  const getProgressBackground = () => {
    if (notStarted || isExpired) {
      // Darker green gradient matching button success state
      return 'linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)';
    }
    if (actualTimePercent > 50) return 'linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)';
    if (actualTimePercent > 20) return 'linear-gradient(180deg, #FFEFBA 0%, #f97316 20%, #ea580c 60%, #9a3412 100%)'; // Orange theme
    return 'linear-gradient(180deg, #FF9999 0%, #ef4444 20%, #b91c1c 60%, #7f1d1d 100%)'; // Red theme
  };

  const getGlowIntensity = () => {
    if (isExpired || notStarted) return '0 0 15px rgba(82, 212, 59, 0.6)'; // Green glow when inactive
    if (actualTimePercent > 50) return 'none';
    if (actualTimePercent > 20) return '0 0 10px #f97316';
    return '0 0 20px #ef4444, 0 0 30px #ef4444';
  };

  const getAnimationSpeed = () => {
    if (isExpired || notStarted) return '2s'; // Slow rocking when not active
    if (actualTimePercent > 50) return '1s';
    if (actualTimePercent > 20) return '0.5s';
    return '0.2s';
  };

  const getRotationIntensity = () => {
    if (isExpired || notStarted) return '3deg'; // Subtle rock when inactive
    if (actualTimePercent > 50) return '5deg';
    if (actualTimePercent > 20) return '8deg';
    return '12deg';
  };

  return (
    <div className="relative flex items-center w-full" style={{ height: '60px' }}>
      {/* Background Bar (Black rounded capsule) */}
      <div 
        className="absolute right-0 bg-black rounded-full overflow-hidden flex items-center" 
        style={{ 
          left:'5px',
          width: 'calc(100% - 4px)', 
          height: '37px', // Adjusted height to better match button scale
          border: '2px solid rgb(35,116,13)', // Normalized border width
          boxShadow: '0 2px 0 rgb(35,116,13)', // Normalized shadow depth (matching sm buttons)
          transition: 'all 0.5s ease'
        }}
      >
        {/* Progress Fill (Dynamic Color) */}
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${progress}%`,
            background: getProgressBackground(),
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)'
          }}
        />
        
        {/* Glossy Overlays exactly matching GlossyButton settings */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Highlight */}
          <div 
            className="absolute top-1 left-[10%] right-[10%] h-[40%] bg-white/40 rounded-full"
            style={{ filter: 'blur(1px)' }}
          />
          {/* Bottom Highlight */}
          <div 
            className="absolute bottom-1.5 left-[20%] right-[20%] h-[15%] bg-white/20 rounded-full"
            style={{ filter: 'blur(2px)' }}
          />
        </div>

        {/* Time Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <span className="text-white font-bold text-[11px] sm:text-[13px] tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap overflow-hidden">
            {notStarted ? 'WAITING' : isExpired ? '00:00' : formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Stopwatch Image (Overlapping on the left) */}
      <div className="absolute left-0 z-10">
        <img 
          src="/img/timer.png" 
          alt="Timer" 
          className="animate-ticking"
          style={{ 
            height: '48px', 
            width: 'auto',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))', // Flat shadow consistent with normalized theme
            animationDuration: getAnimationSpeed(),
            // @ts-ignore - custom property for keyframes
            '--tick-rotate': getRotationIntensity()
          } as React.CSSProperties} 
        />
      </div>
    </div>
  );
}
