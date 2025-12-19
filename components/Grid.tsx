import { useTokenBalance } from '@/hooks/useTokenBalance';
import { lamportsToSol, getWinningSquare } from '@/lib/accounts';
import { Round, Miner } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import gsap from 'gsap';

interface GridProps {
  round: Round;
  miner?: Miner | null;
  currentSlot: bigint;
  selectedSquares: Set<number>;
  toggleSquare: (index: number) => void;
}

// List of available mining item images for the back of the cards
const MINING_ITEMS = [
  'Ancient Cache.png', 'Ancient Formation.png', 'Ancient Grove.png', 'Ancient Oak.png',
  'Basic Rock.png', 'Birch.png', 'Bone Pile.png', 'Common Deposit.png',
  'Crystal Pine.png', 'Crystal Soil.png', 'Elderwood.png', 'Exceptional Cluster.png',
  'Gravel.png', 'Herb Patch.png', 'Ironwood.png', 'Legendary Remnant.png',
  'Loose Soil.png', 'Maple.png', 'Mineral Deposit.png', 'Mineral Outcrop.png',
  'Mushroom Circle.png', 'Oak.png', 'Pine.png', 'Precious Deposit.png',
  'Pristine Geode.png', 'Rare Formation.png', 'Rich Vein.png', 'Sapling.png',
  'Seep.png', 'Shimmerwood.png'
];

export function Grid({ round, miner, currentSlot, selectedSquares, toggleSquare }: GridProps) {
  const { publicKey } = useWallet();
  const [showWinner, setShowWinner] = useState(false);
  const [winnerSquareIndex, setWinnerSquareIndex] = useState<number | null>(null);
  const [persistedWinner, setPersistedWinner] = useState<number | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'animating' | 'completed'>('initial');

  // Determine if the round is currently in the "mining" phase (timer running)
  const isMining = useMemo(() => {
    if (!round.id || !currentSlot) return false;
    // Round is active if current slot is between start and end slots
    return currentSlot >= round.id && currentSlot < (round.id + BigInt(150 * 5)); // Approximate end slot if not available
    // Actually, we should use round.startSlot and round.endSlot from the Board if available, 
    // but Grid only gets Round. Let's use the current round active status.
  }, [round.id, currentSlot]);

  // Better way to check if timer is running: use board data from parent or just check if round is not expired
  const isTimerRunning = useMemo(() => {
    // If we have a slot hash, the round is finalized/expired
    const isExpired = round.slotHash && round.slotHash.some(b => b !== 0);
    return !isExpired;
  }, [round.slotHash]);

  // Generate a stable set of random images for the back of each card
  const backImages = useMemo(() => {
    return Array.from({ length: 25 }, () => 
      MINING_ITEMS[Math.floor(Math.random() * MINING_ITEMS.length)]
    );
  }, []);

  // Rebuilt staggered 3D flip animation timeline
  useEffect(() => {
    if (gridRef.current && !hasAnimatedRef.current) {
      const cardInners = gridRef.current.querySelectorAll('.cq-card-inner');
      
      if (cardInners.length > 0) {
        hasAnimatedRef.current = true;
        setAnimationPhase('animating');
        
        // Initial state: Flipped to show the back (-180 deg) and visible
        gsap.set(cardInners, { 
          opacity: 1, 
          rotationY: -180,
          transformOrigin: "center center"
        });

        const tl = gsap.timeline({
          onComplete: () => {
            setAnimationPhase('completed');
          }
        });

        // Flip to reveal the front
        tl.to(cardInners, {
        
          opacity: 1,
          rotationY: 0,
          duration: .5,
          stagger: {
            each: 0.1,
            from: "start",
            grid: [5, 5]
          },
          ease: "power2.out",
          delay: 1
        });
      }
    }
  }, [round.deployed]);

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
    <div ref={gridRef} className="grid grid-cols-5 gap-1 sm:gap-2" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes subtle-shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-1deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-shake {
          animation: subtle-shake 0.3s ease-in-out infinite;
        }
      `}</style>
      {round.deployed.map((lamports, index) => {
        // Total SOL deployed on this square (from all users)
        const sol = lamportsToSol(lamports);
        const miners = round.count[index];
        const isSelected = selectedSquares.has(index);
        
        // Check if user has already deployed to this square in the current round
        const hasMined = miner && 
                        miner.roundId.toString() === round.id.toString() && 
                        miner.deployed && 
                        miner.deployed[index] > BigInt(0);
        
        // User's SOL deployed on this square
        const userSol = miner && 
                       miner.roundId.toString() === round.id.toString() && 
                       miner.deployed ? 
                       lamportsToSol(miner.deployed[index]) : 0;
        
        // Final chosen state is either selected in UI or already mined on-chain
        const isChosen = isSelected || hasMined;
        const isWinner = index === winnerSquareIndex && showWinner;

        return (
          <div
            key={index}
            className="relative aspect-square cursor-pointer"
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              containerType: 'inline-size' // Enable container queries for scaling
            }}
            onClick={() => toggleSquare(index)}
          >
            {/* Inner Wrapper for GSAP Flip Animation */}
            <div 
              className="cq-card-inner w-full h-full relative"
              style={{ 
                transformStyle: 'preserve-3d',
                width: '100%',
                height: '100%',
                // Cards are visible on load, showing their back face
                opacity: 1,
                transform: animationPhase === 'completed' ? 'rotateY(0deg)' : 'rotateY(-180deg)'
              }}
            >
              {/* FRONT FACE (Data) */}
              <div 
                className={`
                  absolute inset-0 w-full h-full flex flex-col
                  ${isWinner ? 'scale-110 z-20' : isChosen ? 'scale-105 z-10' : ''}
                  ${isChosen && isTimerRunning ? 'animate-shake' : ''}
                `}
                style={{
                  backgroundImage: "url('/img/card_bg.png')",
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: 'transparent',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  zIndex: 2,
                  transition: animationPhase === 'completed' ? 'transform 0.2s ease, box-shadow 0.2s ease' : 'none',
                  boxShadow: isWinner ? '0 0 25px rgba(255,215,0,0.6)' : isChosen ? '0 0 15px rgba(255,255,255,0.5)' : 'none',
                  borderRadius: '8px',
                  color: 'black',
                  padding: '13cqw' // Use container-relative padding
                }}
              >
                {/* Card number badge (Top Left - tucked inside bezel) */}
                <div className="absolute top-[14cqw] left-[15cqw] text-[10cqw] font-mono font-bold text-black z-30 opacity-70">
                  #{index + 1}
                </div>

                {/* Winner indicator */}
                {isWinner && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <div className="text-[30cqw] animate-bounce text-black">👑</div>
                  </div>
                )}

                {/* Center Item Image */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={`/img/MINING_ITEMS_INDIVIDUAL/${backImages[index]}`}
                    alt="Mining Item Small"
                    className="w-[64%] h-[64%] object-contain opacity-80"
                  />
                </div>

                {/* Miner count circle (Top Right - aligned with card number) */}
                <div 
                  className={`absolute top-[14cqw] right-[15cqw] rounded-full border flex items-center justify-center z-30 shadow-sm px-1 overflow-hidden transition-all duration-200`}
                  style={{
                    width: '22cqw',
                    height: '22cqw',
                    aspectRatio: '1',
                    background: isChosen 
                      ? 'linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)' 
                      : 'linear-gradient(180deg, #FFEFBA 0%, #f97316 20%, #ea580c 60%, #9a3412 100%)',
                    borderColor: isChosen ? 'rgb(35,116,13)' : 'rgb(154,52,18)',
                    minWidth: '22cqw',
                    minHeight: '22cqw',
                    maxWidth: '22cqw',
                    maxHeight: '22cqw',
                  }}
                >
                  {isChosen && (
                    <>
                      {/* Glossy Overlay - Top Highlight */}
                      <div 
                        className="absolute top-[5%] left-[10%] right-[10%] h-[40%] bg-white/40 rounded-full pointer-events-none"
                        style={{ filter: 'blur(0.5cqw)' }}
                      />
                      {/* Glossy Overlay - Bottom Subtle Highlight */}
                      <div 
                        className="absolute bottom-[5%] left-[20%] right-[20%] h-[15%] bg-white/20 rounded-full pointer-events-none"
                        style={{ filter: 'blur(1cqw)' }}
                      />
                    </>
                  )}
                  {!isChosen && (
                    <>
                      {/* Glossy Overlay - Top Highlight (for yellow/orange) */}
                      <div 
                        className="absolute top-[5%] left-[10%] right-[10%] h-[40%] bg-white/40 rounded-full pointer-events-none"
                        style={{ filter: 'blur(0.5cqw)' }}
                      />
                      {/* Glossy Overlay - Bottom Subtle Highlight (for yellow/orange) */}
                      <div 
                        className="absolute bottom-[5%] left-[20%] right-[20%] h-[15%] bg-white/20 rounded-full pointer-events-none"
                        style={{ filter: 'blur(1cqw)' }}
                      />
                    </>
                  )}
                  <span className={`text-[11cqw] font-bold leading-none z-10 ${isChosen ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'}`}>
                    {miners.toString()}
                  </span>
                </div>

                {/* Bottom Info Row (SOL values - moved up inside bezel) */}
                <div className="absolute bottom-[13cqw] left-0 right-0 w-full flex flex-col justify-center items-center px-1 gap-[1cqw]">
                  {/* User's SOL value (on top) */}
                  <div className="text-[9cqw] font-bold text-black whitespace-nowrap bg-white/50 px-[2cqw] rounded">
                    {userSol.toFixed(4)} SOL
                  </div>
                  {/* Total SOL value (below) */}
                  <div className="text-[15cqw] font-bold text-black whitespace-nowrap bg-white/40 px-[2cqw] rounded">
                    {sol.toFixed(4)} SOL
                  </div>
                </div>
              </div>

              {/* BACK FACE (Mining Item) */}
              <div 
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{
                  backgroundImage: "url('/img/card_bg.png')",
                  backgroundSize: '100% 100%',
                  backgroundColor: 'transparent',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: '8px',
                  zIndex: 1,
                  padding: '3px'
                }}
              >
                <img 
                  src={`/img/MINING_ITEMS_INDIVIDUAL/${backImages[index]}`}
                  alt="Mining Item"
                  className="w-[64%] h-[64%] object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                />
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
