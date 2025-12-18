import { useTokenBalance } from '@/hooks/useTokenBalance';
import { lamportsToSol, getWinningSquare } from '@/lib/accounts';
import { Round } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface GridProps {
  round: Round;
  selectedSquares: Set<number>;
  toggleSquare: (index: number) => void;
}

export function Grid({ round, selectedSquares, toggleSquare }: GridProps) {
  const { publicKey } = useWallet();
  const [showWinner, setShowWinner] = useState(false);
  const [winnerSquareIndex, setWinnerSquareIndex] = useState<number | null>(null);
  const [persistedWinner, setPersistedWinner] = useState<number | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'animating' | 'completed'>('initial');

  // Animate grid cards on load
  useEffect(() => {
    if (gridRef.current && !hasAnimatedRef.current) {
      const cards = gridRef.current.children;
      const cardsArray = Array.from(cards).filter(el => !el.classList.contains('col-span-5'));
      
      if (cardsArray.length > 0) {
        setAnimationPhase('animating');
        
        // Set container perspective for 3D effect
        gsap.set(gridRef.current, { perspective: 1000 });
        
        // Animate cards in from off-screen
        gsap.fromTo(cardsArray, 
          { 
            opacity: 0, 
            y: 100, 
            rotationX: 0,
            transformOrigin: "center bottom",
            scale: 1
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 0,
            delay: 3, // Start immediately to ensure overlap
            stagger: 0.05,
            ease: "power2.out",
            onComplete: () => {
              setAnimationPhase('completed');
            },
            clearProps: "transform,rotationX,transformOrigin,scale"
          }
        );
        
        hasAnimatedRef.current = true;
      }
    }
  }, [round.deployed]); // Re-run if deployed data changes, hasAnimatedRef ensures it only plays once

  // Calculate winning square if round is finalized
  const winningSquare = getWinningSquare(round.slotHash);

  // Debug logging
  useEffect(() => {
    console.log('🎲 Round ID:', round.id.toString(), 'slotHash:', round.slotHash);
    console.log('🏆 Winning square:', winningSquare);
    console.log('👁️ State:', { showWinner, winnerSquareIndex, persistedWinner });
  }, [round.id, round.slotHash, winningSquare, showWinner, winnerSquareIndex, persistedWinner]);

  // Persist the winner when it's first detected, and keep showing it even if round changes
  useEffect(() => {
    if (winningSquare !== null && persistedWinner === null) {
      console.log('✨ Winner detected! Square:', winningSquare);
      setPersistedWinner(winningSquare);
      setShowWinner(true);
      setWinnerSquareIndex(winningSquare);
      console.log('👑 Winner animation displayed!');

      // Clear any existing timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      // Hide the winner animation after 15 seconds
      hideTimerRef.current = setTimeout(() => {
        console.log('⏰ Hiding winner animation - timeout fired!');
        setShowWinner(false);
        setWinnerSquareIndex(null);
        setPersistedWinner(null);
        hideTimerRef.current = null;
        console.log('🧹 Winner state cleared');
      }, 15000); // 15 seconds

      console.log('⏱️ Timer set with ID:', hideTimerRef.current);
    }
  }, [winningSquare, persistedWinner]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, clearing timer');
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  // Find max deployed to scale colors
  const maxDeployed = Math.max(...round.deployed.map(d => Number(d)));

  return (
    <div ref={gridRef} className="grid grid-cols-5 gap-1 sm:gap-2">
      {round.deployed.map((lamports, index) => {
        const sol = lamportsToSol(lamports);
        const miners = round.count[index];
        const isEmpty = sol === 0;
        const isSelected = selectedSquares.has(index);
        const isWinner = index === winnerSquareIndex && showWinner;

        const intensity = maxDeployed > 0
          ? Math.min(100, Math.floor((Number(lamports) / maxDeployed) * 100))
          : 0;

        return (
          <div
            key={index}
            onClick={() => toggleSquare(index)}
            className={`
              relative aspect-square cursor-pointer transition-all duration-200
              ${isWinner 
                ? 'scale-110 z-20' 
                : isSelected 
                  ? 'scale-105 z-10'
                  : ''
              }
            `}
            style={{
              backgroundImage: "url('/img/card_bg.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              boxShadow: 'none',
              backgroundColor: 'transparent',
              // Initially hidden, visible during animation (GSAP handles it), and kept visible after
              opacity: animationPhase === 'initial' ? 0 : 1,
            }}
          >
            <div className="relative h-full flex flex-col p-1 sm:p-3">
              {/* Square number badge */}
              <div className={`absolute top-1 right-1 text-[10px] font-mono font-bold text-black`}>
                #{index + 1}
              </div>

              {/* Winner indicator */}
              {isWinner && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-3xl sm:text-4xl animate-bounce">
                    👑
                  </div>
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && !isWinner && (
                <div className="absolute top-1 left-1 text-black text-lg font-bold z-10">
                  ✓
                </div>
              )}

              {/* SOL amount */}
              <div className={`text-[10px] sm:text-sm font-bold mb-0.5 text-black`}>
                {sol.toFixed(4)}
              </div>
              <div className={`text-[8px] sm:text-[10px] mb-1 ${
                isWinner ? 'font-semibold' : 'font-normal'
              } text-black`}>
                {isWinner ? 'WINNER!' : 'SOL'}
              </div>

              {/* Miner count */}
              <div className="flex items-center gap-1 text-[8px] sm:text-[10px] mt-auto">
                <span className="text-black font-bold">
                  👤 {miners.toString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {!publicKey && (
        <div className="col-span-5 text-xs text-black text-center py-2 mt-2">
          ⚠️ Connect your wallet to deploy
        </div>
      )}
    </div>
  );
}
