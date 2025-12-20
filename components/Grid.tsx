import { useTokenBalance } from '@/hooks/useTokenBalance';
import { lamportsToSol, getWinningSquare } from '@/lib/accounts';
import { Round } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useRef } from 'react';

interface GridProps {
  round: Round;
  selectedSquares: Set<number>;
  toggleSquare: (index: number) => void;
  enableWinnerEffects?: boolean;
  randomAnimationEnabled?: boolean;
  winnerSquareOverride?: number | null;
}

export function Grid({ round, selectedSquares, toggleSquare, enableWinnerEffects = false, randomAnimationEnabled = false, winnerSquareOverride = null }: GridProps) {
  const { publicKey } = useWallet();
  const [showWinner, setShowWinner] = useState(false);
  const [winnerSquareIndex, setWinnerSquareIndex] = useState<number | null>(null);
  const [persistedWinner, setPersistedWinner] = useState<number | null>(null);
  const [randomHighlightIndex, setRandomHighlightIndex] = useState<number | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const randomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayedWinnerRef = useRef<number | null>(null);

  // Calculate winning square if round is finalized, or use override from RoundResults
  const winningSquare = winnerSquareOverride ?? getWinningSquare(round.slotHash);

  // Debug logging

  // Show winner animation when enableWinnerEffects becomes true
  useEffect(() => {
    if (!enableWinnerEffects) {
      return;
    }

    // When enableWinnerEffects becomes true, use the current winning square
    // (which could be from a previous round if RoundResults is showing old data)
    const squareToDisplay = winningSquare;

    if (squareToDisplay === null) {
      return;
    }

    // Only set if we haven't already displayed this winner or if it's a different winner
    if (persistedWinner === null || displayedWinnerRef.current !== squareToDisplay) {
      displayedWinnerRef.current = squareToDisplay;
      setPersistedWinner(squareToDisplay);
      setShowWinner(true);
      setWinnerSquareIndex(squareToDisplay);

      // Clear any existing timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      // Hide the winner animation after 15 seconds
      hideTimerRef.current = setTimeout(() => {
        setShowWinner(false);
        setWinnerSquareIndex(null);
        setPersistedWinner(null);
        displayedWinnerRef.current = null;
        hideTimerRef.current = null;
      }, 15000); // 15 seconds
    }
  }, [enableWinnerEffects, winningSquare, persistedWinner]);

  // Random block selection animation while results are not ready/visible.
  useEffect(() => {
    if (enableWinnerEffects || !randomAnimationEnabled) {
      if (randomTimerRef.current) {
        clearInterval(randomTimerRef.current);
        randomTimerRef.current = null;
      }
      setRandomHighlightIndex(null);
      return;
    }

    setRandomHighlightIndex(Math.floor(Math.random() * 25));
    if (randomTimerRef.current) {
      clearInterval(randomTimerRef.current);
    }

    randomTimerRef.current = setInterval(() => {
      setRandomHighlightIndex(Math.floor(Math.random() * 25));
    }, 250);

    return () => {
      if (randomTimerRef.current) {
        clearInterval(randomTimerRef.current);
        randomTimerRef.current = null;
      }
    };
  }, [enableWinnerEffects, randomAnimationEnabled]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  // Find max deployed to scale colors
  const maxDeployed = Math.max(...round.deployed.map(d => Number(d)));

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
      {round.deployed.map((lamports, index) => {
        const sol = lamportsToSol(lamports);
        const miners = round.count[index];
        const isEmpty = sol === 0;
        const isSelected = selectedSquares.has(index);
        const isWinner = enableWinnerEffects && index === winnerSquareIndex && showWinner;
        const isRandomHighlight = !enableWinnerEffects && index === randomHighlightIndex;

        // Calculate color intensity based on SOL amount
        const intensity = maxDeployed > 0
          ? Math.min(100, Math.floor((Number(lamports) / maxDeployed) * 100))
          : 0;

        return (
          <div
            key={index}
            onClick={() => toggleSquare(index)}
            className={`
              relative rounded-md md:rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-500
              hover:scale-105 hover:shadow-lg cursor-pointer
              ${isWinner
                ? 'animate-pulse bg-linear-to-br from-yellow-400 via-amber-500 to-yellow-600 border-4 border-yellow-300 ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-500/50 scale-110 z-10'
                : isRandomHighlight
                  ? 'bg-linear-to-br from-indigo-500/40 via-blue-500/30 to-purple-500/40 border-2 border-blue-300/50 ring-2 ring-blue-400/30 shadow-xl shadow-blue-500/20'
                  : isSelected
                    ? 'bg-green-600/50 border border-green-400 sm:border-2 ring-1 sm:ring-2 ring-green-300'
                    : isEmpty
                      ? 'bg-gray-800/50 border border-gray-700 sm:border-2'
                      : `bg-blue-900/30 border border-blue-500 sm:border-2`
              }
            `}
            style={{
              backgroundColor: isWinner
                ? undefined // Let the gradient handle it
                : isRandomHighlight
                  ? undefined
                  : isSelected
                    ? 'rgba(34, 197, 94, 0.3)'
                    : !isEmpty
                      ? `rgba(59, 130, 246, ${0.1 + (intensity / 100) * 0.4})`
                      : undefined
            }}
          >
            {/* Square number badge */}
            <div className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[10px] sm:text-xs font-mono ${isWinner ? 'text-yellow-900 font-bold' : 'text-gray-500'
              }`}>
              #{index + 1}
            </div>

            {/* Winner indicator */}
            {isWinner && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl sm:text-5xl md:text-6xl animate-bounce">
                  👑
                </div>
              </div>
            )}

            {/* Random selection indicator */}
            {isRandomHighlight && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl animate-pulse">

                </div>
              </div>
            )}

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 text-green-400 text-sm sm:text-base md:text-lg">
                ✓
              </div>
            )}

            {/* SOL amount */}
            <div className={`text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-0.5 sm:mb-1 ${isWinner ? 'text-yellow-900' : isEmpty ? 'text-gray-500' : 'text-white'
              }`}>
              {sol.toFixed(4)}
            </div>
            <div className={`text-[10px] sm:text-xs mb-1 sm:mb-2 ${isWinner ? 'text-yellow-800 font-semibold' : 'text-gray-400'
              }`}>
              {isWinner ? 'WINNER!' : 'SOL'}
            </div>

            {/* Miner count */}
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
              <span className={isWinner ? 'text-yellow-900 font-bold' : isEmpty ? 'text-gray-600' : 'text-blue-300'}>
                👤 {miners.toString()}
              </span>
            </div>

            {/* Intensity indicator */}
            {!isEmpty && intensity > 0 && (
              <div className="absolute bottom-0.5 left-0.5 right-0.5 sm:bottom-1 sm:left-1 sm:right-1">
                <div className="h-0.5 sm:h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${intensity}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}


      {!publicKey && (
        <div className="col-span-5 text-xs sm:text-sm text-yellow-400 text-center py-2">
          ⚠️ Connect your wallet to deploy
        </div>
      )}

    </div>
  );
}
