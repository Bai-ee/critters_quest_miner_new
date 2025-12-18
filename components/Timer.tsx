'use client';

import { useEffect, useState } from 'react';
import { calculateTimeRemaining } from '@/lib/accounts';

interface TimerProps {
  endSlot: bigint;
  currentSlot: bigint;
  startSlot?: bigint;
}

export function Timer({ endSlot, currentSlot, startSlot }: TimerProps) {
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

  const [progress, setProgress] = useState(100);

  // Calculate initial time and progress
  useEffect(() => {
    if (startSlot && currentSlot < startSlot) {
      setNotStarted(true);
      setTimeLeft(0);
      setIsExpired(false);
      setProgress(100);
      return;
    }

    const seconds = calculateTimeRemaining(currentSlot, endSlot);

    if (seconds > 31536000) {
      setNotStarted(true);
      setTimeLeft(0);
      setIsExpired(false);
      setProgress(100);
      return;
    }

    setNotStarted(false);
    setTimeLeft(seconds);
    setIsExpired(seconds <= 0);

    // Calculate progress percentage based on slots
    if (startSlot && endSlot) {
      const totalSlots = Number(endSlot - startSlot);
      const slotsRemaining = Number(endSlot - currentSlot);
      if (totalSlots > 0) {
        setProgress(Math.min(100, Math.max(0, (slotsRemaining / totalSlots) * 100)));
      }
    }
  }, [currentSlot, endSlot, startSlot]);

  // Countdown every second and update progress
  useEffect(() => {
    if (notStarted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setIsExpired(true);
          setProgress(0);
        } else if (startSlot && endSlot) {
          // Approximate progress update every second
          const totalSeconds = Number(endSlot - startSlot) * 0.4;
          if (totalSeconds > 0) {
            setProgress((newTime / totalSeconds) * 100);
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

  return (
    <div className="relative flex items-center" style={{ width: '220px', height: '60px' }}>
      {/* Background Bar (Black rounded capsule) */}
      <div 
        className="absolute right-0 bg-black rounded-full overflow-hidden flex items-center" 
        style={{ 
          width: '180px', 
          height: '35px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Progress Fill (Green) */}
        <div 
          className="h-full bg-[#52D43B] transition-all duration-1000 ease-linear"
          style={{ 
            width: `${progress}%`,
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)'
          }}
        />
        
        {/* Time Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-bold text-sm tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {notStarted ? 'WAITING' : isExpired ? '00:00' : formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Stopwatch Image (Overlapping on the left) */}
      <div className="absolute left-0 z-10">
        <img 
          src="/img/timer.png" 
          alt="Timer" 
          style={{ 
            height: '65px', 
            width: 'auto',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
          }} 
        />
      </div>
    </div>
  );
}
