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

  // Countdown every second
  useEffect(() => {
    if (notStarted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setIsExpired(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [notStarted]);

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
    <div style={{ backgroundColor: '#FFB84A', width: '100px', minHeight: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px', border: '2px solid black', borderRadius: '8px' }}>
      {notStarted ? (
        <span className="text-xs sm:text-sm font-bold text-white">NOT STARTED</span>
      ) : (
        <>
          <span className="text-xs sm:text-sm font-bold text-white tabular-nums">
            {isExpired ? '00:00' : formatTime(timeLeft)}
          </span>
          {isExpired && (
            <span className="text-[10px] sm:text-xs font-bold text-white">ENDED</span>
          )}
        </>
      )}
    </div>
  );
}
