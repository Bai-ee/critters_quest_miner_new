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
import { RoundRewardsHistory } from '@/components/RoundRewardsHistory';
import { useRoundData } from '@/hooks/useRoundData';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useDeployToSquares, useAutomation } from '@/lib/instrucionsHooks';
import { lamportsToSol, gramsToOre } from '@/lib/accounts';
import { bigIntToNumber } from '@/lib/formatters';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useRef } from 'react';
import { CALCULATIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { springBounceAnimation } from '@/lib/animations/springBounce';

// Monster Animation Component
function SlimeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // Available monster gifs in the monsters folder
  const availableMonsters = [
    '/img/monsters/slime_IDLE_LEFT_WS.gif',
    '/img/monsters/rock_monter.gif',
    '/img/monsters/Shroom.gif',
    '/img/monsters/goblin_1.gif',
    '/img/monsters/goblin_2.gif',
    '/img/monsters/goblin_3.gif',
  ];

  // Get monster width based on filename
  const getMonsterWidth = (monsterPath: string) => {
    if (monsterPath.includes('slime_IDLE_LEFT_WS.gif')) {
      return 250 * 0.75 * 1.25; // slime: 250px -> 187.5px -> 234.375px
    }
    return 200 * 0.75 * 1.25; // others: 200px -> 150px -> 187.5px
  };

  useEffect(() => {
    if (!containerRef.current || availableMonsters.length === 0) return;

    const container = containerRef.current;
    let isAnimating = false;
    let timeoutId: NodeJS.Timeout | null = null;
    let currentDirection: 'right-to-left' | 'left-to-right' = 'right-to-left';

    const animateNextMonster = () => {
      if (isAnimating) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableMonsters.length);
      const randomMonster = availableMonsters[randomIndex];
      const monsterWidth = getMonsterWidth(randomMonster);
      
      const direction = currentDirection;
      currentDirection = currentDirection === 'right-to-left' ? 'left-to-right' : 'right-to-left';
      
      isAnimating = true;

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
      img.style.cssText = `
        height: 100%;
        width: 100%;
        display: block;
        object-fit: contain;
        transform: ${direction === 'left-to-right' ? 'scaleX(-1)' : 'none'};
      `;

      monsterDiv.appendChild(img);
      container.appendChild(monsterDiv);

      if (direction === 'right-to-left') {
        gsap.set(monsterDiv, {
          x: '100vw',
        });
        animationRef.current = gsap.to(monsterDiv, {
          x: `-${monsterWidth}px`,
          duration: 12,
          ease: 'none',
          onComplete: () => {
            if (container.contains(monsterDiv)) {
              container.removeChild(monsterDiv);
            }
            isAnimating = false;
            timeoutId = setTimeout(() => {
              animateNextMonster();
            }, 2000);
          },
        });
      } else {
        gsap.set(monsterDiv, {
          x: `-${monsterWidth}px`,
        });
        animationRef.current = gsap.to(monsterDiv, {
          x: '100vw',
          duration: 12,
          ease: 'none',
          onComplete: () => {
            if (container.contains(monsterDiv)) {
              container.removeChild(monsterDiv);
            }
            isAnimating = false;
            timeoutId = setTimeout(() => {
              animateNextMonster();
            }, 2000);
          },
        });
      }
    };

    timeoutId = setTimeout(() => {
      animateNextMonster();
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }
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
        zIndex: 0,
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

  // Check if user participated in the round
  const userParticipated = miner && (
    (previousRound && miner.roundId.toString() === previousRound.id.toString()) ||
    (round && miner.roundId.toString() === round.id.toString())
  ) && miner.deployed.some(deploy => deploy > 0n);

  // Check if timer has expired (round ended)
  const timerExpired = !!(board && currentSlot && board.endSlot && currentSlot >= board.endSlot);

  // Reset auto-scroll flag when a new round starts
  useEffect(() => {
    if (round && round.id.toString() !== lastShownRoundId && !timerExpired) {
      hasAutoScrolledRef.current = false;
    }
  }, [round, lastShownRoundId, timerExpired]);

  useEffect(() => {
    const roundJustCompleted = previousRound && previousRound.id.toString() !== lastShownRoundId;
    const shouldScroll = (roundJustCompleted || timerExpired) && userParticipated && !hasAutoScrolledRef.current;
    
    if (roundJustCompleted) {
      setLastShownRoundId(previousRound.id.toString());
    }
    
    if (shouldScroll && roundResultsRef.current) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                      (typeof window !== 'undefined' && window.innerWidth < 768);
      
      if (isMobile) {
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
  const [deploying, setDeploying] = useState(false);
  const switchContainerRef = useRef<HTMLDivElement>(null);
  const switchIndicatorRef = useRef<HTMLDivElement>(null);
  const previousModeRef = useRef<'manual' | 'auto' | null>(null);
  const mainButtonRef = useRef<HTMLDivElement>(null);
  
  // Automation settings
  const executorFee = 0.001;
  const executorAddress = '3ukWjMXrQnNmuiJqCszcnftBhZuuYfmsxgYMmjeysn4x';

  // State for RoundResults integration
  const [resultsShown, setResultsShown] = useState(false);
  const [displayedWinningSquare, setDisplayedWinningSquare] = useState<number | null>(null);

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
    const numSquares = Math.floor(Math.random() * 25) + 1;
    const maxSquares = Math.min(numSquares, 25);
    const allSquares = Array.from({ length: 25 }, (_, i) => i);
    for (let i = allSquares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSquares[i], allSquares[j]] = [allSquares[j], allSquares[i]];
    }
    const randomSquares = allSquares.slice(0, maxSquares);
    setSelectedSquares(new Set(randomSquares));
  }

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

  // Animate button on automation state changes
  const previousAutomationRef = useRef<boolean>(false);
  useEffect(() => {
    if (previousAutomationRef.current !== !!automation && mainButtonRef.current) {
      const button = mainButtonRef.current.querySelector('button') as HTMLElement;
      if (button) {
        springBounceAnimation(button);
      }
    }
    previousAutomationRef.current = !!automation;
  }, [automation]);

  // Animate switch indicator sliding
  useEffect(() => {
    if (switchIndicatorRef.current && switchContainerRef.current) {
      const isManual = mode === 'manual';
      const containerWidth = switchContainerRef.current.offsetWidth;
      const indicatorWidth = containerWidth / 2;
      const targetX = isManual ? 0 : indicatorWidth;

      gsap.to(switchIndicatorRef.current, {
        x: targetX,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }

    if (previousModeRef.current !== null && previousModeRef.current !== mode && mainButtonRef.current) {
      const button = mainButtonRef.current.querySelector('button') as HTMLElement;
      if (button) {
        springBounceAnimation(button);
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

      const squareCount = selectedSquares.size;
      const costPerRound = (amount * squareCount) + executorFee;
      const depositAmount = costPerRound * rounds;

      const signature = await setupAutomation(
        executorAddress,
        amount,
        depositAmount,
        executorFee,
        'preferred',
        Array.from(selectedSquares)
      );

      toast.success(`Automation enabled! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      clearSelection();
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

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount: please enter a valid amount greater than 0');
      return;
    }

    // Check if user has enough SOL balance
    const totalCost = amount * selectedSquares.size;
    const estimatedFees = 0.01;
    const requiredBalance = totalCost + estimatedFees;

    if (solBalance < requiredBalance) {
      toast.error(`Insufficient balance! Need ${requiredBalance.toFixed(4)} SOL (including fees), but you have ${solBalance.toFixed(4)} SOL`);
      return;
    }

    let needCheckpoint = false;

    // Checkpoint is needed if miner's round is behind the current round
    // Use bigIntToNumber for proper comparison (preserving working logic from MainControl)
    if (miner && round && bigIntToNumber(miner.roundId) < bigIntToNumber(round.id)) {
      needCheckpoint = true;
    }

    try {
      setDeploying(true);
      const squaresArray = Array.from(selectedSquares);
      const signature = await deploy(
        amount,
        squaresArray,
        '9nmmN2Cj6Bj3ob8tteszatY87Jz2QYSpxstWiXg2v6iC',
        needCheckpoint
      );
      toast.success(`Deploy successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      // Don't clear selection - let user see which squares they've mined
    } catch (error) {
      console.error('Deploy failed:', error);
      toast.error(`Deploy failed: ${error}`);
    } finally {
      setDeploying(false);
    }
  };

  const winnerKnown = displayedWinningSquare !== null;

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

  const squareCount = selectedSquares.size;

  return (
    <main className="min-h-screen bg-cq-bg-0 text-white flex flex-col" style={{ overflowX: 'hidden' }}>

      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cq-bg-1 via-cq-bg-0 to-cq-bg-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(116,253,231,0.1)_0%,transparent_70%)]"></div>
      </div>

      {/* Slime walking animation */}
      <SlimeAnimation />

      {/* Mining items gradient image at top */}
      <div className="relative flex justify-center items-center mx-auto" style={{ zIndex: 1, marginTop: '0px', width: '4000px', overflow: 'visible', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="absolute flex items-start justify-between gap-1 sm:gap-2" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: '100%', maxWidth: '100vw', paddingLeft: '8px', paddingRight: '8px' }}>
          {/* Left: Wallet Button or Connected Wallet UI */}
          <div className="flex-1 flex items-center justify-start" style={{ marginTop: '2px', width: '100%' }}>
            {connected ? (
              <div className="relative w-full overflow-visible" style={{
                background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                padding: '2px',
                borderRadius: '13px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                minHeight: '36px',
              }}>
                <div className="relative w-full h-full overflow-visible flex items-center justify-center" style={{
                  background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)',
                  borderRadius: '11px',
                  boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                  minHeight: '32px',
                  padding: '6px 12px',
                }}>
                  <div 
                    className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                    style={{ 
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px'
                    }}
                  />
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
                        let amountText = '';
                        if (solBalance >= 1) {
                          const wholePart = Math.floor(solBalance).toString();
                          const decimalPart = formatted.split('.')[1];
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
          {/* Right: SOL Balance */}
          <div className="flex-1 flex flex-col gap-2 items-end" style={{ marginTop: '2px', width: '100%' }}>
            <div className="relative w-full overflow-visible" style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
              padding: '2px',
              borderRadius: '13px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              minHeight: '36px',
            }}>
              <div className="relative w-full h-full overflow-visible flex items-center justify-center" style={{
                background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)',
                borderRadius: '11px',
                boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                minHeight: '32px',
                padding: '6px 12px',
              }}>
                <div 
                  className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                  style={{ 
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px'
                  }}
                />
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
          </div>
        </div>
        {board?.endSlot && currentSlot && (
          <div className="absolute top-[90px]" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img 
              src="/img/open_treasure_hirez.gif" 
              alt="Treasure Chest Open" 
              className="h-[181px] sm:h-[181px] md:h-[181px]"
              style={{
                width: 'auto',
                marginTop: '-65px'
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
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <h1 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-cq-primary-blue to-cq-primary-yellow bg-clip-text text-transparent">
                QUEST MINER
              </h1>
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
            <Motherlode />
          </div>
        </div>

        <div className="w-full max-w-[min(92vw,520px)] mx-auto relative z-30" style={{ overflow: 'visible' }}>
          {/* Timer and Selection Controls */}
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
          <div className="px-4 py-2 flex items-center justify-start w-full text-center">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-black text-black/60 uppercase leading-none mb-0.5">This Round</span>
              <span className="text-sm font-black leading-none" style={{ 
                color: '#00ff00',
                textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00'
              }}>
                {round?.totalDeployed ? lamportsToSol(round.totalDeployed).toFixed(4) : '0.0000'} SOL
              </span>
            </div>
            <div className="flex flex-col items-center justify-start flex-1">
              <span className="text-[10px] font-black text-black/60 uppercase leading-none mb-0.5">Next Round</span>
              <span className="text-sm font-black leading-none" style={{ 
                color: 'rgba(79, 52, 33, 1)'
              }}>
                {round?.totalWinnings ? Math.floor(lamportsToSol(round.totalWinnings)).toString().padStart(5, '0') : '00000'} QUEST
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[min(92vw,520px)] relative z-30" style={{ overflow: 'visible' }}>
          <div className="mt-0" style={{ overflow: 'visible' }}>
              <Grid
                round={round}
                miner={miner}
                currentSlot={currentSlot || 0n}
                selectedSquares={selectedSquares}
                toggleSquare={toggleSquare}
                deployAmount={amount}
                timerExpired={timerExpired}
              />
          </div>
          
          {/* Round Results Section */}
          <div ref={roundResultsRef} className="mt-6">
            <RoundResults
              onShownChange={setResultsShown}
              onWinningSquareChange={setDisplayedWinningSquare}
            />
          </div>

          {/* Round Rewards History */}
          <div className="mt-6">
            <RoundRewardsHistory />
          </div>

          {/* Staking Panel */}
          {connected && (
            <div className="mt-6">
              <StakingPanel />
            </div>
          )}

          <HowTo />
        </div>
      </div>

      {/* BOTTOM CONTROL BAR - Sticky */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-[rgb(120,63,4)] transition-all duration-500 ease-in-out"
        style={{ 
          backgroundColor: '#FFB84A',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
          height: selectedSquares.size > 0 ? '128px' : '68px',
          paddingBottom: '20px',
          bottom: 0,
        }}
      >
        {/* Info Bar - Always visible at top */}
        <div 
          className="w-full h-[48px] grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-6 border-b border-black/10 flex-none"
          style={{ paddingInline: 'calc(var(--spacing) * 4)' }}
        >
          {/* Left: Selected Info */}
          <div className="flex flex-col items-start justify-center min-w-0">
            <span className="text-sm font-black text-black leading-none">
              <span className="text-[8px]">x</span>
              {selectedSquares.size} {selectedSquares.size === 1 ? 'TILE' : 'TILES'} SELECTED
            </span>
          </div>

          {/* Center: Manual/Auto Switch */}
          <div 
            ref={switchContainerRef}
            className="relative flex items-center bg-black/20 rounded-full p-1"
            style={{
              minWidth: '140px',
              height: '32px',
            }}
          >
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
              <div 
                className="absolute top-1 left-[10%] right-[10%] h-[40%] bg-white/40 rounded-full pointer-events-none"
                style={{ filter: 'blur(1px)' }}
              />
              <div 
                className="absolute bottom-1.5 left-[20%] right-[20%] h-[15%] bg-white/20 rounded-full pointer-events-none"
                style={{ filter: 'blur(2px)' }}
              />
            </div>

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

          {/* Right: Round Info */}
          <div className="flex flex-col items-end justify-center min-w-0">
            <span className="text-sm font-black text-black/60 leading-none">#{board?.roundId?.toString() || '0'}</span>
            <span className="text-sm font-black text-black uppercase leading-none">Round</span>
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

            {/* Center: MINE/AUTO MINE/CANCEL Button */}
            <div className="flex justify-center" ref={mainButtonRef}>
              {mode === 'manual' ? (
                <GlossyButton
                  onClick={handleDeploy}
                  size="md"
                  variant="success"
                  className="!w-[73px] !py-1 !text-lg !min-h-[40px]"
                  disabled={selectedSquares.size === 0 || deploying || automationLoading}
                >
                  {deploying ? 'MINING...' : 'MINE'}
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
              <div className="flex flex-col items-end justify-center mr-1">
                <span className="text-[8px] font-black text-[rgb(120,63,4)]/60 uppercase whitespace-nowrap leading-none mb-0.5">RND#</span>
                <span className={`text-[8px] font-black leading-none ${mode === 'auto' ? 'text-[rgb(120,63,4)]' : 'text-[rgb(120,63,4)]/30'}`}>
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
