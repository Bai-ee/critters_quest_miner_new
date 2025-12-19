'use client';

import { Grid } from '@/components/Grid';
import { Motherlode } from '@/components/Motherlode';
import { Timer } from '@/components/Timer';
import { WalletButton } from '@/components/WalletButton';
import { GlossyButton } from '@/components/GlossyButton';
import { RoundResults } from '@/components/RoundResults';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { HowTo } from '@/components/HowTo';
import { StakingPanel } from '@/components/StakingPanel';
import { useRoundData } from '@/hooks/useRoundData';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useDeployToSquares, useAutomation } from '@/lib/instrucionsHooks';
import { lamportsToSol } from '@/lib/accounts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useRef } from 'react';
import { CALCULATIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import gsap from 'gsap';

// Monster Animation Component
function SlimeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // Available monster gifs in the monsters folder
  // slime_IDLE_LEFT_WS.gif is 250x200, all others are 200px wide
  const availableMonsters = [
    '/img/monsters/slime_IDLE_LEFT_WS.gif',
    '/img/monsters/rock_monter.gif',
    '/img/monsters/Shroom.gif',
    '/img/monsters/goblin_1.gif',
    '/img/monsters/goblin_2.gif',
    '/img/monsters/goblin_3.gif',
  ];

  // Get monster width based on filename (75% of original, then increased by 25% = 93.75% of original)
  const getMonsterWidth = (monsterPath: string) => {
    if (monsterPath.includes('slime_IDLE_LEFT_WS.gif')) {
      return 250 * 0.75 * 1.25; // slime: 250px -> 187.5px -> 234.375px
    }
    return 200 * 0.75 * 1.25; // others: 200px -> 150px -> 187.5px
  };

  useEffect(() => {
    if (!containerRef.current || availableMonsters.length === 0) return;

    const container = containerRef.current;
    let isAnimating = false; // Track if a monster is currently animating
    let timeoutId: NodeJS.Timeout | null = null;
    let currentDirection: 'right-to-left' | 'left-to-right' = 'right-to-left'; // Track current direction

    const animateNextMonster = () => {
      // Don't start a new monster if one is already animating
      if (isAnimating) {
        console.log('Monster already animating, skipping...');
        return;
      }

      // Select a random monster
      const randomIndex = Math.floor(Math.random() * availableMonsters.length);
      const randomMonster = availableMonsters[randomIndex];
      const monsterWidth = getMonsterWidth(randomMonster);
      
      // Alternate direction
      const direction = currentDirection;
      currentDirection = currentDirection === 'right-to-left' ? 'left-to-right' : 'right-to-left';
      
      console.log('Selected monster:', randomMonster, 'width:', monsterWidth, 'direction:', direction, 'from', availableMonsters.length, 'available');

      // Mark that we're now animating
      isAnimating = true;

      // Create a new monster element (increased by 25% from previous size)
      const monsterDiv = document.createElement('div');
      monsterDiv.className = 'absolute';
      monsterDiv.style.cssText = `
        top: calc(50% + 15px);
        transform: translateY(-50%);
        height: 112.5px;
        width: ${monsterWidth}px;
      `;

      const img = document.createElement('img');
      img.src = randomMonster;
      img.alt = 'Walking Monster';
      // Flip horizontally if going left to right
      img.style.cssText = `
        height: 100%;
        width: 100%;
        display: block;
        object-fit: contain;
        transform: ${direction === 'left-to-right' ? 'scaleX(-1)' : 'none'};
      `;

      monsterDiv.appendChild(img);
      container.appendChild(monsterDiv);

      // Set initial position based on direction
      if (direction === 'right-to-left') {
        // Start off-screen to the right
        gsap.set(monsterDiv, {
          x: '100vw',
        });
        // Animate across the page from right to left
        animationRef.current = gsap.to(monsterDiv, {
          x: `-${monsterWidth}px`, // Move completely off-screen to the left
          duration: 12,
          ease: 'none',
          onComplete: () => {
            // Remove the element after animation completes
            if (container.contains(monsterDiv)) {
              container.removeChild(monsterDiv);
            }
            // Mark animation as complete
            isAnimating = false;
            // Wait 2 seconds, then animate next random monster
            timeoutId = setTimeout(() => {
              animateNextMonster();
            }, 2000);
          },
        });
      } else {
        // Start off-screen to the left
        gsap.set(monsterDiv, {
          x: `-${monsterWidth}px`,
        });
        // Animate across the page from left to right
        animationRef.current = gsap.to(monsterDiv, {
          x: '100vw', // Move completely off-screen to the right
          duration: 12,
          ease: 'none',
          onComplete: () => {
            // Remove the element after animation completes
            if (container.contains(monsterDiv)) {
              container.removeChild(monsterDiv);
            }
            // Mark animation as complete
            isAnimating = false;
            // Wait 2 seconds, then animate next random monster
            timeoutId = setTimeout(() => {
              animateNextMonster();
            }, 2000);
          },
        });
      }
    };

    // Start the first monster after a small delay
    timeoutId = setTimeout(() => {
      animateNextMonster();
    }, 500);

    return () => {
      // Clear any pending timeouts
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Cleanup: remove all monster elements
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      // Kill any running animations
      if (animationRef.current) {
        animationRef.current.kill();
      }
      // Reset animation flag
      isAnimating = false;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{
        width: '100%',
        height: '120px',
        zIndex: 0, // Behind mining items (zIndex: 1)
        overflow: 'hidden',
      }}
    />
  );
}

export default function Home() {
  const { board, round, previousRound, currentSlot, loading, error, lastUpdate, miner, automation } = useRoundData();
  const { connected, publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();
  const { deploy } = useDeployToSquares();
  const { setupAutomation, disableAutomation } = useAutomation();

  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [lastShownRoundId, setLastShownRoundId] = useState<string | null>(null);
  const roundResultsRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);

  // Check if user participated in the round (either current or previous)
  const userParticipated = miner && (
    (previousRound && miner.roundId.toString() === previousRound.id.toString()) ||
    (round && miner.roundId.toString() === round.id.toString())
  ) && miner.deployed.some(deploy => deploy > 0n);

  // Check if timer has expired (round ended)
  const timerExpired = board && currentSlot && board.endSlot && currentSlot >= board.endSlot;

  // Reset auto-scroll flag when a new round starts
  useEffect(() => {
    if (round && round.id.toString() !== lastShownRoundId && !timerExpired) {
      hasAutoScrolledRef.current = false;
    }
  }, [round, lastShownRoundId, timerExpired]);

  useEffect(() => {
    // When previousRound is updated (round just completed) or timer expires
    const roundJustCompleted = previousRound && previousRound.id.toString() !== lastShownRoundId;
    const shouldScroll = (roundJustCompleted || timerExpired) && userParticipated && !hasAutoScrolledRef.current;
    
    if (roundJustCompleted) {
      setLastShownRoundId(previousRound.id.toString());
    }
    
    // Auto-scroll to results on mobile if user participated and round ended
    if (shouldScroll && roundResultsRef.current) {
      // Check if mobile (iOS or Chrome mobile)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                      (typeof window !== 'undefined' && window.innerWidth < 768);
      
      if (isMobile) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          roundResultsRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          hasAutoScrolledRef.current = true;
        }, 500);
      }
    }
  }, [previousRound, lastShownRoundId, userParticipated, timerExpired]);

  // Get token balance
  const { balance: tokenBalance } = useTokenBalance({
    tokenMint: 'QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s',
    walletAddress: publicKey?.toBase58() || '',
    decimals: 9
  });

  // Shared state for square selection
  const [selectedSquares, setSelectedSquares] = useState<Set<number>>(new Set());
  const [amount, setAmount] = useState<number>(0.01);
  const [rounds, setRounds] = useState<number>(10);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [automationLoading, setAutomationLoading] = useState(false);
  const switchContainerRef = useRef<HTMLDivElement>(null);
  const switchIndicatorRef = useRef<HTMLDivElement>(null);
  const previousModeRef = useRef<'manual' | 'auto' | null>(null);
  const mainButtonRef = useRef<HTMLDivElement>(null);
  
  // Automation settings
  const executorFee = 0.001;
  const executorAddress = '3ukWjMXrQnNmuiJqCszcnftBhZuuYfmsxgYMmjeysn4x';

  const toggleSquare = (index: number) => {
    const newSelected = new Set(selectedSquares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSquares(newSelected);
  };

  const selectAll = () => {
    setSelectedSquares(new Set(Array.from({ length: 25 }, (_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedSquares(new Set());
  };

  const randomSelection = () => {
    // Default to 5 random squares if no count specified
    const numSquares = Math.floor(Math.random() * 25) + 1;
    const maxSquares = Math.min(numSquares, 25);

    // Create array of all square indices [0-24]
    const allSquares = Array.from({ length: 25 }, (_, i) => i);

    // Shuffle array using Fisher-Yates algorithm
    for (let i = allSquares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSquares[i], allSquares[j]] = [allSquares[j], allSquares[i]];
    }

    // Take first N squares from shuffled array
    const randomSquares = allSquares.slice(0, maxSquares);
    setSelectedSquares(new Set(randomSquares));
  }

  // Commented out for now - may return to this later
  // const incrementAmount = () => {
  //   setAmount(prev => +(prev + 0.001).toFixed(3));
  // };

  // const decrementAmount = () => {
  //   setAmount(prev => Math.max(0.001, +(prev - 0.001).toFixed(3)));
  // };

  // Increment/decrement rounds for auto play
  const incrementRounds = () => {
    setRounds(prev => prev + 1);
  };

  const decrementRounds = () => {
    setRounds(prev => Math.max(1, prev - 1));
  };

  // Set rounds to 2 when auto is selected
  useEffect(() => {
    if (mode === 'auto') {
      setRounds(2);
    }
  }, [mode]);

  // Set mode to auto if automation exists
  useEffect(() => {
    if (automation) {
      setMode('auto');
    }
  }, [automation]);

  // Animate switch indicator sliding left to right (smooth ease, no bounce)
  useEffect(() => {
    if (switchIndicatorRef.current && switchContainerRef.current) {
      const isManual = mode === 'manual';
      const containerWidth = switchContainerRef.current.offsetWidth;
      const indicatorWidth = containerWidth / 2;
      const targetX = isManual ? 0 : indicatorWidth;

      // Animate the indicator sliding with smooth ease
      gsap.to(switchIndicatorRef.current, {
        x: targetX,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }

    // Animate main button bounce when mode changes
    if (previousModeRef.current !== null && previousModeRef.current !== mode && mainButtonRef.current) {
      const button = mainButtonRef.current.querySelector('button');
      if (button) {
        // Bounce effect: scale down then up with bounce
        gsap.to(button, {
          scale: 0.9,
          duration: 0.15,
          ease: 'power2.in',
          onComplete: () => {
            gsap.to(button, {
              scale: 1,
              duration: 0.3,
              ease: 'back.out(1.7)',
            });
          }
        });
      }
    }

    previousModeRef.current = mode;
  }, [mode]);

  const handleSetupAutomation = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (selectedSquares.size === 0) {
      toast.error('Please select at least one square');
      return;
    }

    try {
      setAutomationLoading(true);

      // Calculate deposit based on rounds
      // Cost per round = (amount per square × number of squares) + executor fee
      const squareCount = selectedSquares.size;
      const costPerRound = (amount * squareCount) + executorFee;
      const depositAmount = costPerRound * rounds;

      // Enable automation - executor will handle deployments
      const signature = await setupAutomation(
        executorAddress,
        amount,
        depositAmount,
        executorFee,
        'preferred',
        Array.from(selectedSquares)
      );

      toast.success(`Automation enabled! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      clearSelection(); // Clear selection after successful setup
    } catch (error) {
      console.error('Setup automation failed:', error);
      toast.error(`Setup failed: ${error}`);
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleDisableAutomation = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setAutomationLoading(true);
      const signature = await disableAutomation();
      toast.success(`Automation disabled! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
    } catch (error) {
      console.error('Disable automation failed:', error);
      toast.error(`Disable failed: ${error}`);
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (selectedSquares.size === 0) {
        toast.error('Please select at least one square');
        return;
    }

    // Check if user has enough SOL balance
    const totalCost = amount * selectedSquares.size;
    const estimatedFees = 0.01; // Estimate for transaction fees
    const requiredBalance = totalCost + estimatedFees;

    if (solBalance < requiredBalance) {
        toast.error(`Insufficient balance! Need ${requiredBalance.toFixed(4)} SOL (including fees), but you have ${solBalance.toFixed(4)} SOL`);
        return;
    }

    let needCheckpoint = false;

    // Checkpoint is needed if miner's round is behind the current round
    if (miner && round && BigInt(miner.roundId) < BigInt(round.id)) {
        needCheckpoint = true;
    }

    try {
        const squaresArray = Array.from(selectedSquares);
        const signature = await deploy(
            amount,
            squaresArray,
            '9nmmN2Cj6Bj3ob8tteszatY87Jz2QYSpxstWiXg2v6iC',
            needCheckpoint
        );
        toast.success(`Deploy successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
        // We no longer clear selection here so user can see which squares they've mined
    } catch (error) {
        console.error('Deploy failed:', error);
        toast.error(`Deploy failed: ${error}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center">
        <div className="text-center cq-panel p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cq-neon mx-auto mb-4"></div>
          <p className="text-lg font-bold text-cq-neon">Loading QUEST data...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to Solana...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center p-4">
        <div className="cq-panel p-6 max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-400">
            Error
          </h1>
          <div className="cq-panel p-4 border-red-500/50">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="cq-button-primary mt-4 w-full py-2 text-sm font-bold text-black"
            >
              RETRY
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!board || !round) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center">
        <div className="cq-panel p-8">
          <h1 className="text-2xl font-bold text-center text-cq-neon">
            No data available
          </h1>
        </div>
      </main>
    );
  }

  // Format last update time
  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <main className="min-h-screen bg-cq-bg-0 text-white flex flex-col" style={{ overflowX: 'hidden' }}>

      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cq-bg-1 via-cq-bg-0 to-cq-bg-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(116,253,231,0.1)_0%,transparent_70%)]"></div>
      </div>

      {/* Slime walking animation */}
      <SlimeAnimation />

      {/* Mining items gradient image at top - scrolls with page */}
      <div className="relative flex justify-center items-center mx-auto" style={{ zIndex: 1, marginTop: '0px', width: '4000px', overflow: 'visible', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="absolute flex items-start justify-between gap-1 sm:gap-2" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: '100%', maxWidth: '100vw', paddingLeft: '8px', paddingRight: '8px' }}>
          {/* Left: Wallet Button or Connected Wallet UI (same SOL pill as right but with big wallet image) */}
          <div className="flex-1 flex items-center justify-start" style={{ marginTop: '2px', width: '100%' }}>
            {connected ? (
              <div className="relative w-full overflow-visible" style={{
                background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                padding: '2px',
                borderRadius: '13px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                minHeight: '36px',
              }}>
                {/* Inner Content Area with Neutral Gradient */}
                <div className="relative w-full h-full overflow-visible flex items-center justify-center" style={{
                  background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)',
                  borderRadius: '11px',
                  boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                  minHeight: '32px',
                  padding: '6px 12px',
                }}>
                  {/* Glossy Overlay */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                    style={{ 
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px'
                    }}
                  />
                  {/* Wallet image (using unconnected wallet image) */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ width: '34px', height: '40px', marginLeft: '1px' }}>
                    <img 
                      src="/img/wallet.png" 
                      alt="Wallet" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  {/* Content area - accounting for wallet logo width (34px + 1px margin + 4px left padding = ~39px) */}
                  <div className="absolute inset-0 flex items-center pointer-events-none z-10" style={{ 
                    left: '39px', 
                    right: '8px', 
                    paddingBottom: '2px',
                    top: 'calc(50% + 2px)',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignContent: 'center',
                  }}>
                    <div className="text-[10px] sm:text-[12px] font-bold text-white leading-none whitespace-nowrap" style={{ 
                      flex: '1 1 auto', 
                      minWidth: '0px',
                      display: 'flex',
                      alignContent: 'center',
                      justifyContent: 'center',
                    }}>
                      {(() => {
                        const formatted = solBalance.toFixed(2);
                        // For values >= 1, show up to 4 digits before decimal (e.g., 9999.99)
                        // For values < 1, show "SOL 0.XX"
                        let amountText = '';
                        if (solBalance >= 1) {
                          const wholePart = Math.floor(solBalance).toString();
                          const decimalPart = formatted.split('.')[1];
                          // Limit to 4 digits for whole part
                          const displayWhole = wholePart.length > 4 ? wholePart.slice(0, 4) : wholePart;
                          amountText = `${displayWhole}.${decimalPart}`;
                        } else {
                          amountText = formatted;
                        }
                        return (
                          <>
                            <span style={{ opacity: 0.3 }}>SOL </span>
                            <span>{amountText}</span>
                          </>
                        );
                      })()}
                    </div>
                    {/* Red bubble with black X */}
                    <div className="flex items-center justify-center" style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'rgb(239, 68, 68)',
                      flexShrink: 0,
                      marginTop: '0',
                      paddingTop: '0',
                    }}>
                      <span className="text-black" style={{ 
                        paddingBottom: '1.75px',
                        fontSize: '13px',
                        lineHeight: '1',
                        display: 'block',
                        fontFamily: '"Comic Sans MS", cursive',
                        fontWeight: 'normal',
                      }}>×</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <WalletButton 
                className="mr-0 mt-0" 
                width="75%"
              />
            )}
          </div>
          <img 
            src="/img/miner_logo.png" 
            alt="Miner Logo" 
            style={{
              width: '140px',
              height: 'auto',
              display: 'block',
              maxWidth: '35%',
              marginTop:'-20px',
              flexShrink: 0
            }}
          />
          {/* Right: SOL and QUEST Balances */}
          <div className="flex-1 flex flex-col gap-2 items-end" style={{ marginTop: '2px', width: '100%' }}>
            <div className="relative w-full overflow-visible" style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
              padding: '2px',
              borderRadius: '13px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              minHeight: '36px',
            }}>
              {/* Inner Content Area with Neutral Gradient */}
              <div className="relative w-full h-full overflow-visible flex items-center justify-center" style={{
                background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)',
                borderRadius: '11px',
                boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                minHeight: '32px',
                padding: '6px 12px',
              }}>
                {/* Glossy Overlay */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                  style={{ 
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px'
                  }}
                />
                {/* SOL icon image */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ width: '25px', height: '40px', marginLeft: '1px' }}>
                  <img 
                    src="/img/sol.png" 
                    alt="SOL" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-1 z-10" style={{ paddingLeft: '21px', top: 'calc(50% + 2px)', transform: 'translateY(-50%)' }}>
                  <div className="text-[10px] sm:text-[12px] font-bold text-white leading-none">
                    <AnimatedNumber value={solBalance.toFixed(2).padStart(7, '0')} />
                  </div>
                </div>
              </div>
            </div>
            {/* Next Round and Amount to Win - Placeholder */}
            <div className="flex flex-col gap-1">
              <div className="text-[8px] sm:text-[9px] font-black text-black uppercase leading-none">
                Next Round: #{board?.roundId ? (BigInt(board.roundId) + 1n).toString() : '0'}
              </div>
              <div className="text-[8px] sm:text-[9px] font-black text-black uppercase leading-none">
                To Win: {round?.totalWinnings ? lamportsToSol(round.totalWinnings).toFixed(4) : '0.0000'} SOL
              </div>
            </div>
            
            {/* QUEST Balance */}
            <div className="relative">
              <img 
                src="/img/quest_amount.png" 
                alt="QUEST Balance Background" 
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-1" style={{ paddingLeft: '21px' }}>
                <div className="text-[10px] sm:text-[12px] font-bold text-white leading-none mt-[3px]">
                  <AnimatedNumber value={(tokenBalance || 1.34).toFixed(2).padStart(7, '0')} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {board?.endSlot && currentSlot && (
          <div className="absolute top-[90px]" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/img/pickaxe_front.gif" 
              alt="Pickaxe" 
              className="h-[133px] sm:h-[133px] sm:mt-[50px] md:h-[133px]"
              style={{
                width: 'auto',
                marginTop:'-50px'
              }}
            />
          </div>
        )}
        <img 
          src="/img/mining_items_gradient.png" 
          alt="" 
          className="sm:mt-[20px]"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxWidth: '1674.97px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            marginTop: '10px',
          }}
        />
      </div>

      {/* TOP HUD - Fixed height */}
      <div
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Title */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <h1 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-cq-primary-blue to-cq-primary-yellow bg-clip-text text-transparent">
                QUEST MINER
              </h1>
            </div>

            {/* Right: Balances + Wallet - REMOVED small redundant wallet */}
            <div className="flex-1 flex items-center justify-end gap-2" style={{ background: 'transparent' }}>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER STAGE - Grid always centered */}
      <div 
        className="flex-1 flex flex-col items-center justify-start px-3 sm:px-4 relative"
        style={{ minHeight: 'calc(100svh - 80px - 120px)', overflow: 'visible', marginTop: '0px' }}
      >
        <div 
          className="absolute inset-0 w-full"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            top: '0',
            left: '0',
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              backgroundImage: 'url(/img/bg_mining.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        <div className="w-full max-w-[min(92vw,520px)] md:max-w-[1200px] mx-auto relative z-30 mb-0" style={{ overflow: 'visible', marginTop: '-2px' }}>
          <div className="mt-0" style={{ overflow: 'visible' }}>
            <Motherlode
              endSlot={board.endSlot}
              currentSlot={currentSlot}
              startSlot={board.startSlot}
            />
          </div>
        </div>

        <div className="w-full max-w-[min(92vw,520px)] mx-auto relative z-30" style={{ overflow: 'visible' }}>
          {/* Timer and Selection Controls placed below Motherlode and on top of the Mining Grid */}
          {board?.endSlot && currentSlot && (
            <div className="w-full flex items-center justify-center gap-2 mb-2">
              <div className="flex-1 min-w-0" style={{ marginLeft: '-5px' }}>
                <Timer 
                  endSlot={board.endSlot} 
                  currentSlot={currentSlot} 
                  startSlot={board.startSlot} 
                  roundId={board.roundId?.toString()}
                  selectedCount={selectedSquares.size}
                />
              </div>
              
              <div className="flex-1 flex gap-1 justify-between items-center min-w-0">
                <GlossyButton
                  onClick={selectAll}
                  size="sm"
                  variant="success"
                  className="flex-1 min-w-0 !px-0 !py-2 !text-[11px] sm:!text-[13px]"
                >
                  ALL
                </GlossyButton>
                <GlossyButton
                  onClick={randomSelection}
                  size="sm"
                  variant="success"
                  className="flex-1 min-w-0 !px-0 !py-2 !text-[11px] sm:!text-[13px]"
                >
                  RANDOM
                </GlossyButton>
                <GlossyButton
                  onClick={clearSelection}
                  size="icon"
                  variant="danger"
                  className="flex-none !w-8 !h-8 sm:!w-9 sm:!h-9"
                >
                  ✕
                </GlossyButton>
              </div>
            </div>
          )}
        </div>

        {/* Total Deployed Placeholder - Above miner tiles */}
        <div className="w-full max-w-[min(92vw,520px)] mx-auto relative z-30 mb-2" style={{ overflow: 'visible', marginTop: '-13px' }}>
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-black/60 uppercase leading-none mb-0.5">Total Deployed</span>
              <span className="text-sm font-black text-[rgb(120,63,4)] leading-none">
                {round?.totalDeployed ? lamportsToSol(round.totalDeployed).toFixed(4) : '0.0000'} SOL
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-black/60 uppercase leading-none mb-0.5">Total You Deployed</span>
              <span className="text-sm font-black leading-none" style={{ 
                color: '#00ff00',
                textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00'
              }}>
                {miner ? (() => {
                  let total = 0;
                  for (let i = 0; i < 25; i++) {
                    total += lamportsToSol(miner.deployed[i]);
                  }
                  return total.toFixed(4);
                })() : '0.0000'} SOL
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[min(92vw,520px)] relative z-30" style={{ overflow: 'visible' }}>
          <div className="mt-0" style={{ overflow: 'visible' }}>
              <Grid
                round={round}
                miner={miner}
                currentSlot={currentSlot}
                selectedSquares={selectedSquares}
                toggleSquare={toggleSquare}
                deployAmount={amount}
              />
          </div>
          
          {/* Round Results Section - Below Mining Section */}
          <div ref={roundResultsRef} className="mt-6">
            <RoundResults
              round={previousRound || round}
              miner={miner}
            />
          </div>

          {/* Staking Panel - Below Round Results */}
          {connected && (
            <div className="mt-6">
              <StakingPanel />
            </div>
          )}

          <HowTo />
        </div>
      </div>

      {/* BOTTOM CONTROL BAR - Sticky */}
      {/* MINE/Increment UI - Always at bottom when squares selected */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-[rgb(120,63,4)] transition-all duration-500 ease-in-out"
        style={{ 
          backgroundColor: '#FFB84A',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
          height: selectedSquares.size > 0 ? '128px' : '68px', // 48px handle + 60px MINE bar + 20px padding
          paddingBottom: '20px',
          bottom: 0,
        }}
      >
        {/* Info Bar - Always visible at top */}
        <div 
          className="w-full h-[48px] grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-6 border-b border-black/10 flex-none"
        >
          {/* Left: Selected Info - Value on top, label on bottom */}
          <div className="flex flex-col items-start justify-center min-w-0">
            <span className="text-xs font-black text-black/60 leading-none">
              <span className="text-[8px]">x</span>
              {selectedSquares.size} TILES SELECTED
            </span>
          </div>

          {/* Center: Manual/Auto Switch - Inset tab style with sliding indicator */}
          <div 
            ref={switchContainerRef}
            className="relative flex items-center bg-black/20 rounded-full p-1"
            style={{
              minWidth: '140px',
              height: '32px',
            }}
          >
            {/* Sliding indicator - Black for both manual and auto */}
            <div
              ref={switchIndicatorRef}
              className="absolute top-1 left-1 rounded-full"
              style={{
                width: 'calc(50% - 4px)',
                height: 'calc(100% - 8px)',
                background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
                border: '2px solid rgb(0,0,0)',
                boxShadow: '0 2px 0 rgb(0,0,0)',
                zIndex: 1,
                transform: mode === 'manual' ? 'translateX(0)' : 'translateX(100%)',
              }}
            >
              {/* Glossy overlay */}
              <div 
                className="absolute top-1 left-[10%] right-[10%] h-[40%] bg-white/40 rounded-full pointer-events-none"
                style={{ filter: 'blur(1px)' }}
              />
              <div 
                className="absolute bottom-1.5 left-[20%] right-[20%] h-[15%] bg-white/20 rounded-full pointer-events-none"
                style={{ filter: 'blur(2px)' }}
              />
            </div>

            {/* Text labels */}
            <button
              onClick={() => {
                if (!automation) {
                  setMode('manual');
                }
              }}
              className="relative z-10 flex-1 h-full flex items-center justify-center text-[11px] sm:text-[13px] font-black uppercase transition-colors duration-300 rounded-full"
              style={{
                color: mode === 'manual' ? '#ffffff' : 'rgba(0,0,0,0.4)',
                textShadow: mode === 'manual' ? '0 2px 2px rgba(0,0,0,0.8)' : 'none',
              }}
              disabled={!!automation}
            >
              MANUAL
            </button>
            <button
              onClick={() => setMode('auto')}
              className="relative z-10 flex-1 h-full flex items-center justify-center text-[11px] sm:text-[13px] font-black uppercase transition-colors duration-300 rounded-full"
              style={{
                color: mode === 'auto' ? '#ffffff' : 'rgba(0,0,0,0.4)',
                textShadow: mode === 'auto' ? '0 2px 2px rgba(0,0,0,0.8)' : 'none',
              }}
            >
              {mode === 'auto' ? 'AUTO' : 'AUTO MINE'}
            </button>
          </div>

          {/* Right: Round Info - Value on top, label on bottom */}
          <div className="flex flex-col items-end justify-center min-w-0">
            <span className="text-xs font-black text-black/60 leading-none">#{board?.roundId?.toString() || '0'}</span>
            <span className="text-[10px] font-black text-black/40 uppercase leading-none">Round</span>
          </div>
        </div>

        {/* MINE Action Bar - Fixed at bottom when squares selected */}
        <div 
          className={`w-full border-b border-black/5 flex-none transition-all duration-500 ease-in-out ${
            selectedSquares.size > 0 ? 'h-[60px] opacity-100' : 'h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-xl mx-auto relative flex items-center justify-center px-4 h-full">
            {/* Left Side: Deploy Amount Input and Total */}
            <div className="absolute left-4 flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase whitespace-nowrap leading-none">
                  Deploy Amt:
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow empty string for editing
                    if (inputValue === '') {
                      setAmount(0);
                      return;
                    }
                    const value = parseFloat(inputValue);
                    if (!isNaN(value) && value >= 0) {
                      setAmount(value);
                    }
                  }}
                  onBlur={(e) => {
                    // Validate and set minimum on blur
                    const value = parseFloat(e.target.value);
                    if (isNaN(value) || value < 0.001) {
                      setAmount(0.001);
                    }
                  }}
                  className="text-sm font-black text-[rgb(120,63,4)] bg-white/20 border border-[rgb(120,63,4)]/30 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[rgb(120,63,4)]/50"
                  style={{ width: '50px', borderRadius: '11px' }}
                />
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase whitespace-nowrap leading-none mb-0.5">Total</span>
                <span className="text-sm font-black text-[rgb(120,63,4)] leading-none">
                  {mode === 'manual' 
                    ? (amount * selectedSquares.size).toFixed(3)
                    : (((amount * selectedSquares.size) + executorFee) * rounds).toFixed(3)
                  }
                </span>
              </div>
            </div>

            {/* Center: MINE/AUTO MINE/CANCEL Button - Dynamic based on mode */}
            <div className="flex justify-center" ref={mainButtonRef}>
              {mode === 'manual' ? (
                <GlossyButton
                  onClick={handleDeploy}
                  size="md"
                  variant="success"
                  className="!w-[73px] !py-1 !text-lg !min-h-[40px]"
                  disabled={selectedSquares.size === 0 || automationLoading}
                >
                  MINE
                </GlossyButton>
              ) : automation ? (
                <GlossyButton
                  onClick={handleDisableAutomation}
                  size="md"
                  variant="danger"
                  className="!w-[73px] !py-1 !text-base !min-h-[40px]"
                  disabled={automationLoading}
                >
                  {automationLoading ? 'CANCELING...' : 'CANCEL'}
                </GlossyButton>
              ) : (
                <GlossyButton
                  onClick={handleSetupAutomation}
                  size="md"
                  variant="success"
                  className="!w-[73px] !py-1 !text-xs whitespace-nowrap !min-h-[40px]"
                  disabled={selectedSquares.size === 0 || automationLoading || solBalance < ((amount * selectedSquares.size) + executorFee) * rounds}
                >
                  {automationLoading ? 'ENABLING...' : 'AUTO MINE'}
                </GlossyButton>
              )}
            </div>

            {/* Right Side: ROUNDS Display and Increment Controls */}
            <div className={`absolute right-4 flex items-center justify-end gap-2 ${mode === 'manual' ? 'pointer-events-none' : ''}`}>
              {/* ROUNDS Display - Closer to increment buttons */}
              <div className="flex flex-col items-end justify-center mr-1">
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase whitespace-nowrap leading-none mb-0.5">RND#</span>
                <span className={`text-sm font-black leading-none ${mode === 'auto' ? 'text-[rgb(120,63,4)]' : 'text-[rgb(120,63,4)]/30'}`}>
                  {mode === 'auto' ? rounds.toString().padStart(2, '0') : '--'}
                </span>
              </div>
              <div className={mode === 'manual' ? 'opacity-30' : 'opacity-100'}>
                <GlossyButton 
                  onClick={incrementRounds} 
                  size="icon" 
                  variant="success" 
                  className="!w-6 !h-6 !text-xl"
                  disabled={mode === 'manual'}
                >
                  +
                </GlossyButton>
              </div>
              <div className={mode === 'manual' ? 'opacity-30' : 'opacity-100'}>
                <GlossyButton 
                  onClick={decrementRounds} 
                  size="icon" 
                  variant="danger" 
                  className="!w-6 !h-6 !text-xl"
                  disabled={mode === 'manual'}
                >
                  -
                </GlossyButton>
              </div>
            </div>
          </div>
        </div>
      </div>


    </main>
  );
}
