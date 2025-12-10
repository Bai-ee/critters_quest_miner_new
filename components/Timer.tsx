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
    <div className={`
      relative overflow-hidden rounded-xl p-6 shadow-xl
      ${notStarted
        ? 'bg-linear-to-br from-gray-700 to-gray-800'
        : isExpired
        ? 'bg-linear-to-br from-red-900 to-red-800'
        : 'bg-linear-to-br from-blue-900 to-blue-800'
      }
    `}>
      <div className="relative z-10">
        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{notStarted ? '⏳' : isExpired ? '⏸️' : '⏰'}</span>
          <h2 className="text-xl font-bold text-white">
            Round Countdown
          </h2>
        </div>

        {/* Time display */}
        <div className="mb-3">
          {notStarted ? (
            <div className="text-xl font-bold text-gray-200 py-2">
              Round Not Started
            </div>
          ) : (
            <>
              <div className={`
                text-6xl font-mono font-bold tabular-nums
                ${isExpired ? 'text-red-200' : 'text-blue-100'}
              `}>
                {isExpired ? '00:00' : formatTime(timeLeft)}
              </div>
              {isExpired && (
                <div className="text-sm text-red-200 mt-2 animate-pulse">
                  Round has ended
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
{/*         <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs text-blue-200/80">
            End Slot: <span className="font-mono">{endSlot.toString()}</span>
          </div>
          <div className="text-xs text-blue-200/80 mt-1">
            Current: <span className="font-mono">{currentSlot.toString()}</span>
          </div>
        </div> */}

        {/* Progress bar */}
        {!isExpired && !notStarted && (
          <div className="mt-4 h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-1000"
              style={{
                width: `${Math.max(0, Math.min(100, (timeLeft / 60) * 100))}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
