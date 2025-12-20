import { useTokenBalance } from '@/hooks/useTokenBalance';
import { lamportsToSol, getWinningSquare } from '@/lib/accounts';
import { Round, Miner } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { springBounceAnimation } from '@/lib/animations/springBounce';

interface GridProps {
  round: Round;
  miner?: Miner | null;
  currentSlot: bigint;
  selectedSquares: Set<number>;
  toggleSquare: (index: number) => void;
  deployAmount?: number;
  timerExpired?: boolean;
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

export function Grid({ round, miner, currentSlot, selectedSquares, toggleSquare, deployAmount = 0, timerExpired = false }: GridProps) {
  const { publicKey } = useWallet();
  const [showWinner, setShowWinner] = useState(false);
  const [winnerSquareIndex, setWinnerSquareIndex] = useState<number | null>(null);
  const [persistedWinner, setPersistedWinner] = useState<number | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'animating' | 'completed'>('initial');
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isTimerRunning = useMemo(() => {
    const isExpired = round.slotHash && round.slotHash.some(b => b !== 0);
    return !isExpired;
  }, [round.slotHash]);

  const fluorescentColors = useMemo(() => {
    const fluorescentPalette = [
      '#00cc33', '#2dcc14', '#00cc66', '#00cccc', '#00b3cc',
      '#0066cc', '#6600cc', '#9900cc', '#cc00cc', '#cc0066',
      '#cc0033', '#cc3300', '#cc8800', '#cccc00', '#88cc00',
      '#66cc00', '#00cc88', '#0088cc', '#6600cc', '#cc0066',
      '#cc3300', '#cc6600', '#00cc99', '#0066cc', '#8800cc',
    ];
    
    return Array.from({ length: 25 }, (_, index) => {
      const seed = index * 7919;
      return fluorescentPalette[seed % fluorescentPalette.length];
    });
  }, []);
  useEffect(() => {
    if (gridRef.current && !hasAnimatedRef.current) {
      const cardInners = gridRef.current.querySelectorAll('.cq-card-inner');
      
      if (cardInners.length > 0) {
        hasAnimatedRef.current = true;
        setAnimationPhase('animating');
        
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

  const winningSquare = getWinningSquare(round.slotHash);

  useEffect(() => {
    if (winningSquare !== null && persistedWinner === null) {
      setPersistedWinner(winningSquare);
      setShowWinner(true);
      setWinnerSquareIndex(winningSquare);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = setTimeout(() => {
        setShowWinner(false);
        setWinnerSquareIndex(null);
        setPersistedWinner(null);
        hideTimerRef.current = null;
      }, 15000);
    }
  }, [winningSquare, persistedWinner]);

  useEffect(() => {
    if (timerExpired && winnerSquareIndex !== null && cardRefs.current[winnerSquareIndex]) {
      setTimeout(() => {
        cardRefs.current[winnerSquareIndex]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }, 300);
    }
  }, [timerExpired, winnerSquareIndex]);
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={gridRef} className="grid grid-cols-5 gap-1 sm:gap-2" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes subtle-shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(2.5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-2.5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-shake {
          animation: subtle-shake 0.3s ease-in-out infinite;
        }
      `}</style>
      {round.deployed.map((lamports, index) => {
        const sol = lamportsToSol(lamports);
        const miners = round.count[index];
        const isSelected = selectedSquares.has(index);
        
        const hasMined = miner && 
                        miner.roundId.toString() === round.id.toString() && 
                        miner.deployed && 
                        miner.deployed[index] > BigInt(0);
        
        const userSol = miner && 
                       miner.roundId.toString() === round.id.toString() && 
                       miner.deployed ? 
                       lamportsToSol(miner.deployed[index]) : 0;
        
        const isChosen = isSelected || hasMined;
        const isWinner = index === winnerSquareIndex && showWinner;

        const handleCardClick = () => {
          toggleSquare(index);
          const cardElement = cardRefs.current[index];
          springBounceAnimation(cardElement);
        };

        return (
          <div
            key={index}
            ref={(el) => { cardRefs.current[index] = el; }}
            className="relative aspect-square cursor-pointer"
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              containerType: 'inline-size',
              overflow: 'visible',
              zIndex: isWinner ? 50 : 'auto'
            }}
            onClick={handleCardClick}
          >
            <div 
              className="cq-card-inner w-full h-full relative"
              style={{ 
                transformStyle: 'preserve-3d',
                width: '100%',
                height: '100%',
                opacity: 1,
                transform: animationPhase === 'completed' ? 'rotateY(0deg)' : 'rotateY(-180deg)'
              }}
            >
              <div 
                className={`
                  absolute inset-0 w-full h-full flex flex-col
                  ${isWinner ? 'z-20' : isChosen ? 'scale-105 z-10' : ''}
                  ${isChosen && isTimerRunning ? 'animate-shake' : ''}
                `}
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  padding: '2px',
                  borderRadius: '13px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  zIndex: 2,
                  transform: isWinner ? 'scale(2)' : undefined,
                  transition: animationPhase === 'completed' ? 'transform 0.2s ease, box-shadow 0.2s ease' : 'none',
                  color: 'black',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <div 
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: isChosen ? fluorescentColors[index] : '#000000',
                    borderRadius: '11px'
                  }}
                >
                  <div className="absolute text-[10cqw] font-mono font-bold text-white z-30 opacity-70" style={{ top: '3px', left: '7px' }}>
                    #{index + 1}
                  </div>

                  <div className="relative w-full h-full flex items-center justify-center overflow-visible" style={{ transform: 'translateY(-5px)' }}>
                    {(!isChosen || isWinner) && (
                      <img 
                        src={(winningSquare !== null && index === winningSquare) || isWinner ? "/img/open_treasure_hirez.gif" : "/img/treasure_chest_closed.gif"}
                        alt="Treasure Chest"
                        className={`object-contain opacity-80 relative ${(winningSquare !== null && index === winningSquare) || isWinner ? 'w-[192%] h-[192%]' : 'w-[64%] h-[64%]'}`}
                      />
                    )}
                    
                    <div 
                      className={`absolute rounded-full border flex items-center justify-center z-30 shadow-sm px-1 overflow-hidden transition-all duration-200`}
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
                        top: 'calc(50% - 25cqw)',
                        left: 'calc(50% + 34cqw)',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className={`text-[11cqw] font-bold leading-none z-10 ${isChosen ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'}`}>
                        {miners.toString()}
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 w-full flex flex-col justify-center items-center px-1 gap-[1cqw]" style={{ left: 0 }}>
                    {isChosen && (
                      <div 
                        className="text-[22cqw] font-bold text-white whitespace-nowrap px-[2cqw] rounded-full border flex items-center justify-center shadow-sm overflow-hidden relative"
                        style={{ 
                          textAlign: 'center',
                          background: 'linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)',
                          borderColor: 'rgb(35,116,13)',
                          minWidth: 'fit-content',
                          width: 'auto',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                        }}
                      >
                        <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          {(userSol + (isSelected ? deployAmount : 0)).toString()}
                        </span>
                      </div>
                    )}
                    <div 
                      className="text-[15cqw] font-bold text-white whitespace-nowrap px-[2cqw] rounded-full border flex items-center justify-center shadow-sm overflow-hidden relative"
                      style={{
                        background: 'linear-gradient(180deg, #FFEFBA 0%, #f97316 20%, #ea580c 60%, #9a3412 100%)',
                        borderColor: 'rgb(154,52,18)',
                        minHeight: 'fit-content',
                        marginTop: '5px',
                        marginBottom: '2px',
                      }}
                    >
                      <div className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] flex items-center gap-1">
                        <img 
                          src="/img/solana_logo.png" 
                          alt="SOL" 
                          className="h-[1em] w-auto opacity-90"
                        />
                        <span>{sol.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  padding: '2px',
                  borderRadius: '13px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  zIndex: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div 
                  className="w-full h-full relative flex items-center justify-center"
                  style={{
                    backgroundColor: '#000000',
                    borderRadius: '11px'
                  }}
                >
                  <img 
                    src={(winningSquare !== null && index === winningSquare) || isWinner ? "/img/open_treasure_hirez.gif" : "/img/treasure_chest_closed.gif"}
                    alt="Treasure Chest"
                    className="w-[64%] h-[64%] object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-10 relative"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
