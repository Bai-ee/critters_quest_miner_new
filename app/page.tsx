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
import { Modal } from '@/components/Modal';
import { useRoundData } from '@/hooks/useRoundData';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAudio } from '@/hooks/useAudio';
import { useDeployToSquares, useAutomation } from '@/lib/instrucionsHooks';
import { SOUND_VOLUMES } from '@/lib/audioVolumes';
import { lamportsToSol, gramsToOre } from '@/lib/accounts';
import { bigIntToNumber } from '@/lib/formatters';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useRef } from 'react';
import { CALCULATIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { springBounceAnimation } from '@/lib/animations/springBounce';

gsap.registerPlugin(ScrollTrigger);

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
  const { isMuted, toggleMute, playSound } = useAudio();
  const { deploy } = useDeployToSquares();
  const { setupAutomation, disableAutomation } = useAutomation();

  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [lastShownRoundId, setLastShownRoundId] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const roundResultsRef = useRef<HTMLDivElement>(null);

  // Debug: Log when help modal state changes
  useEffect(() => {
    console.log('[Help Modal] State changed:', isHelpModalOpen);
    if (isHelpModalOpen) {
      console.log('[Help Modal] Modal should be visible now');
    }
  }, [isHelpModalOpen]);
  
  // ScrollTrigger refs
  const archRef = useRef<HTMLDivElement>(null);
  const rocksRef = useRef<HTMLDivElement>(null);
  const yellowSectionRef = useRef<HTMLDivElement>(null);
  const centerStageRef = useRef<HTMLDivElement>(null);
  const stakingPanelRef = useRef<HTMLDivElement>(null);
  const winLossHistoryRef = useRef<HTMLDivElement>(null);
  const howToMineRef = useRef<HTMLDivElement>(null);
  
  // Mining audio ref for scroll-triggered playback
  const miningAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Claim success audio ref for scroll-based fade
  const claimSuccessAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastScrollYRef = useRef<number>(0);

  // Check if user participated in the round
  const userParticipated = miner && (
    (previousRound && miner.roundId.toString() === previousRound.id.toString()) ||
    (round && miner.roundId.toString() === round.id.toString())
  ) && miner.deployed.some(deploy => deploy > 0n);

  // Check if timer has expired (round ended)
  const timerExpired = !!(board && currentSlot && board.endSlot && currentSlot >= board.endSlot);

  // Update last shown round ID when round completes
  useEffect(() => {
    if (previousRound && previousRound.id.toString() !== lastShownRoundId) {
      setLastShownRoundId(previousRound.id.toString());
    }
  }, [previousRound, lastShownRoundId]);

  // Fetch round results data - Always show latest finalized round
  useEffect(() => {
    const fetchRoundResults = async () => {
      try {
        setRoundResultsLoading(true);
        
        // Try latest endpoint first
        let roundData = null;
        try {
          const latestResponse = await fetch('/api/rounds/latest', { cache: 'no-store' });
          if (latestResponse.ok && latestResponse.status !== 503) {
            const latestResult = await latestResponse.json();
            if (latestResult.success && latestResult.data) {
              roundData = latestResult.data;
            }
          }
        } catch (e) {
          // Continue to fallback
        }
        
        // If latest didn't work, try rounds list
        if (!roundData) {
          try {
            const roundsResponse = await fetch('/api/rounds?limit=10', { cache: 'no-store' });
            if (roundsResponse.ok) {
              const roundsResult = await roundsResponse.json();
              if (roundsResult.success && roundsResult.data && roundsResult.data.length > 0) {
                // Find the first round with complete data (has winning_square)
                for (const round of roundsResult.data) {
                  if (round.round_id && round.winning_square !== null && round.winning_square !== undefined) {
                    roundData = round;
                    break;
                  }
                }
                // If no complete round, use first one anyway
                if (!roundData && roundsResult.data.length > 0) {
                  roundData = roundsResult.data[0];
                }
              }
            }
          } catch (e) {
            console.error('Error fetching rounds:', e);
          }
        }
        
        if (roundData) {
          setRoundResultsData(roundData);
        } else {
          setRoundResultsData(null);
        }
      } catch (error) {
        console.error('Error fetching round results:', error);
        setRoundResultsData(null);
      } finally {
        setRoundResultsLoading(false);
      }
    };

    fetchRoundResults();
    // Refetch every 5 seconds
    const interval = setInterval(fetchRoundResults, 5000);
    
    return () => clearInterval(interval);
  }, []);

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
  
  // State for round results data
  const [roundResultsData, setRoundResultsData] = useState<any>(null);
  const [previousRoundResultsData, setPreviousRoundResultsData] = useState<any>(null);
  const [roundResultsLoading, setRoundResultsLoading] = useState(false);

  const toggleSquare = (index: number) => {
    const newSelected = new Set(selectedSquares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
      playSound('deselectTile', { volume: SOUND_VOLUMES.deselectTile });
    } else {
      newSelected.add(index);
      playSound('selectTile', { volume: SOUND_VOLUMES.selectTile });
    }
    setSelectedSquares(newSelected);
  };

  const selectAll = () => {
    setSelectedSquares(new Set(Array.from({ length: 25 }, (_, i) => i)));
    playSound('selectTile', { volume: SOUND_VOLUMES.selectTile });
  };

  const clearSelection = () => {
    setSelectedSquares(new Set());
    playSound('deselectTile', { volume: SOUND_VOLUMES.deselectTile });
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
    playSound('selectTile', { volume: SOUND_VOLUMES.selectTile });
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

  // ScrollTrigger parallax effect - yellow section scrolls faster than section above
  useEffect(() => {
    let yellowTween: gsap.core.Tween | null = null;
    let archTween: gsap.core.Tween | null = null;
    let rocksTween: gsap.core.Tween | null = null;
    let stakingPanelTween: gsap.core.Tween | null = null;
    let winLossHistoryTween: gsap.core.Tween | null = null;
    let howToMineTween: gsap.core.Tween | null = null;
    let isInitialized = false;
    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;

    const initScrollTrigger = () => {
      // Check if refs are ready
      if (!yellowSectionRef.current || !archRef.current) {
        return false; // Not ready yet
      }
      
      // Win/Loss section is optional, so we don't require it

      if (isInitialized) return true;
      isInitialized = true;

      // Clean up any existing ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => {
        try {
          const triggerElement = trigger.vars?.trigger;
          if (triggerElement === yellowSectionRef.current || 
              triggerElement === archRef.current ||
              (rocksRef.current && triggerElement === rocksRef.current) ||
              (stakingPanelRef.current && triggerElement === stakingPanelRef.current) ||
              (howToMineRef.current && triggerElement === howToMineRef.current)) {
            trigger.kill();
          }
        } catch (err) {
          // Ignore errors during cleanup
        }
      });

      // Yellow section scrolls up faster than the section above it
      if (yellowSectionRef.current) {
        yellowTween = gsap.to(yellowSectionRef.current, {
          y: -400,
          ease: 'none',
          scrollTrigger: {
            trigger: yellowSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
          },
        });
      }

      // Arch scrolls up faster than other elements
      if (archRef.current) {
        archTween = gsap.to(archRef.current, {
          y: -200,
          ease: 'none',
          scrollTrigger: {
            trigger: yellowSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
          },
        });
      }

      // Rocks scroll faster than arch (if exists)
      if (rocksRef.current) {
        rocksTween = gsap.to(rocksRef.current, {
          y: -300,
          ease: 'none',
          scrollTrigger: {
            trigger: yellowSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
          },
        });
      }

      // Staking panel scrolls faster than arch
      if (stakingPanelRef.current) {
        stakingPanelTween = gsap.to(stakingPanelRef.current, {
          y: -900,
          ease: 'none',
          scrollTrigger: {
            trigger: yellowSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
          },
        });
      }

      // Round Information Card scrolls at different speed than staking panel
      if (winLossHistoryRef.current) {
        winLossHistoryTween = gsap.to(winLossHistoryRef.current, {
          y: -700,
          ease: 'none',
          scrollTrigger: {
            trigger: yellowSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
          },
        });
      }

      // How to Mine section scrolls at same speed as staking panel
      if (howToMineRef.current) {
        howToMineTween = gsap.to(howToMineRef.current, {
          y: -900,
          ease: 'none',
          scrollTrigger: {
            trigger: yellowSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
          },
        });
      }

      ScrollTrigger.refresh();
      return true;
    };

    // Try to initialize immediately
    if (!initScrollTrigger()) {
      // If not ready, wait a bit and try again
      timer1 = setTimeout(() => {
        if (!initScrollTrigger()) {
          // If still not ready, wait longer
          timer2 = setTimeout(() => {
            initScrollTrigger();
          }, 1000);
        }
      }, 100);
    }

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      yellowTween?.kill();
      archTween?.kill();
      rocksTween?.kill();
      stakingPanelTween?.kill();
      winLossHistoryTween?.kill();
      howToMineTween?.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        try {
          const triggerElement = trigger.vars?.trigger;
          if (triggerElement === yellowSectionRef.current || 
              triggerElement === archRef.current ||
              (rocksRef.current && triggerElement === rocksRef.current) ||
              (stakingPanelRef.current && triggerElement === stakingPanelRef.current) ||
              (winLossHistoryRef.current && triggerElement === winLossHistoryRef.current) ||
              (howToMineRef.current && triggerElement === howToMineRef.current)) {
            trigger.kill();
          }
        } catch (err) {
          // Ignore cleanup errors
        }
      });
    };
  }, []);

  // Intersection Observer for mining audio - play when round info card is in view
  useEffect(() => {
    if (!winLossHistoryRef.current) return;

    // Initialize mining audio
    if (!miningAudioRef.current) {
      miningAudioRef.current = new Audio('/audio/mining.wav');
      miningAudioRef.current.loop = true;
      miningAudioRef.current.volume = SOUND_VOLUMES.mining;
      miningAudioRef.current.preload = 'auto';
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Round info card is in view - play mining audio (if not muted)
            if (!isMuted && miningAudioRef.current) {
              console.log('[Mining Audio] Round info in view - starting mining audio');
              miningAudioRef.current.play().catch(err => {
                console.error('[Mining Audio] Play failed:', err);
              });
            }
          } else {
            // Round info card is out of view - stop mining audio
            if (miningAudioRef.current && !miningAudioRef.current.paused) {
              console.log('[Mining Audio] Round info out of view - stopping mining audio');
              miningAudioRef.current.pause();
              miningAudioRef.current.currentTime = 0;
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px',
      }
    );

    observer.observe(winLossHistoryRef.current);

    // Handle mute state changes - if section is in view, play/pause accordingly
    const checkVisibility = () => {
      if (!winLossHistoryRef.current || !miningAudioRef.current) return;
      
      const rect = winLossHistoryRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView && !isMuted) {
        // Section is in view and not muted - play
        if (miningAudioRef.current.paused) {
          console.log('[Mining Audio] Section in view and unmuted - resuming mining audio');
          miningAudioRef.current.play().catch(err => {
            console.error('[Mining Audio] Resume failed:', err);
          });
        }
      } else {
        // Section not in view OR muted - stop
        if (!miningAudioRef.current.paused) {
          console.log('[Mining Audio] Stopping - muted or out of view');
          miningAudioRef.current.pause();
          miningAudioRef.current.currentTime = 0;
        }
      }
    };

    // Check immediately and on mute state changes
    checkVisibility();

    return () => {
      observer.disconnect();
      // Stop audio on cleanup
      if (miningAudioRef.current) {
        miningAudioRef.current.pause();
        miningAudioRef.current.currentTime = 0;
      }
    };
  }, [isMuted]);

  // Claim success audio - play on load at 1/2 volume, fade based on scroll
  useEffect(() => {
    if (!claimSuccessAudioRef.current && !isMuted) {
      claimSuccessAudioRef.current = new Audio('/audio/CLAIM_onSuccess.wav');
      claimSuccessAudioRef.current.loop = true;
      // Play at 1/2 volume (0.5 * SOUND_VOLUMES.claimSuccess)
      claimSuccessAudioRef.current.volume = SOUND_VOLUMES.claimSuccess * 0.5;
      claimSuccessAudioRef.current.preload = 'auto';
      
      claimSuccessAudioRef.current.addEventListener('canplaythrough', () => {
        if (claimSuccessAudioRef.current && !isMuted) {
          claimSuccessAudioRef.current.play().catch(err => {
            console.warn('[Claim Audio] Failed to play on load:', err);
          });
        }
      }, { once: true });
      
      claimSuccessAudioRef.current.load();
    }

    // Handle mute state changes
    if (claimSuccessAudioRef.current) {
      if (isMuted) {
        claimSuccessAudioRef.current.pause();
      } else if (claimSuccessAudioRef.current.paused) {
        claimSuccessAudioRef.current.play().catch(err => {
          console.warn('[Claim Audio] Failed to resume:', err);
        });
      }
    }

    return () => {
      if (claimSuccessAudioRef.current) {
        claimSuccessAudioRef.current.pause();
        claimSuccessAudioRef.current.currentTime = 0;
      }
    };
  }, [isMuted]);

  // Scroll-based fade for claim success audio
  useEffect(() => {
    if (!claimSuccessAudioRef.current) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (!claimSuccessAudioRef.current || isMuted) return;

      const baseVolume = SOUND_VOLUMES.claimSuccess * 0.5; // 1/2 volume
      const maxScroll = 500; // Max scroll distance for full fade
      const scrollProgress = Math.min(currentScrollY / maxScroll, 1); // 0 to 1
      
      // Fade out as user scrolls down, fade in as they scroll up
      const targetVolume = baseVolume * (1 - scrollProgress);
      
      // Smoothly animate volume change
      if (claimSuccessAudioRef.current.volume !== targetVolume) {
        gsap.to(claimSuccessAudioRef.current, {
          volume: targetVolume,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize volume based on initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMuted]);

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

    if (miner && round && bigIntToNumber(miner.roundId) < bigIntToNumber(round.id)) {
      needCheckpoint = true;
    }

    try {
      setDeploying(true);
      // Play sound when wallet opens for signing
      playSound('mineSignWallet', { volume: SOUND_VOLUMES.mineSignWallet });
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
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-8">
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

      {/* Help Modal - Simple Direct Implementation */}
      {isHelpModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => {
            setIsHelpModalOpen(false);
            playSound('click', { volume: SOUND_VOLUMES.click });
          }}
        >
          <div
            className="rounded-xl border-2 border-black overflow-hidden"
            style={{
              backgroundColor: '#ffb84a',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-6 rounded-lg m-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white uppercase" style={{
                  fontFamily: 'Comic Sans MS, Comic Neue, cursive',
                }}>
                  How to Play
                </h2>
                <button
                  onClick={() => {
                    setIsHelpModalOpen(false);
                    playSound('click', { volume: SOUND_VOLUMES.click });
                  }}
                  className="text-white hover:text-gray-300 transition-colors"
                  style={{
                    fontFamily: 'Comic Sans MS, Comic Neue, cursive',
                    fontSize: '24px',
                    lineHeight: '1',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
              <div className="space-y-4 text-white" style={{
                fontFamily: 'Comic Sans MS, Comic Neue, cursive',
              }}>
                <div>
                  <h3 className="font-bold text-lg mb-2">Select Squares</h3>
                  <p className="text-sm opacity-90">
                    Click on squares to select them. You can select multiple squares to mine.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Deploy SOL</h3>
                  <p className="text-sm opacity-90">
                    Enter the amount of SOL you want to deploy per square and click MINE.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Win Prizes</h3>
                  <p className="text-sm opacity-90">
                    When the round ends, the winning square is revealed. If you selected it, you win!
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Auto Mine</h3>
                  <p className="text-sm opacity-90">
                    Enable AUTO MINE to automatically mine selected squares for multiple rounds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
                    top: 'calc(50% + 2px)',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignContent: 'center',
                  }}>
                    <div className="flex flex-col items-center justify-center" style={{ 
                      flex: '1 1 auto', 
                      minWidth: '0px',
                      lineHeight: '1',
                      gap: '0px',
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
                            <span className="text-[10px] sm:text-[12px] font-bold text-white" style={{ opacity: 0.3, lineHeight: '1' }}>SOL</span>
                            <span className="text-[10px] sm:text-[12px] font-bold text-white" style={{ lineHeight: '1' }}>{amountText}</span>
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
          {/* Right: Action Buttons */}
          <div className="flex-1 flex flex-col gap-2 items-end" style={{ marginTop: '2px', width: '100%' }}>
            <div className="flex items-center gap-2" style={{ gap: '8px' }}>
              {/* Circle Button 1 - Help/Info */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (howToMineRef.current) {
                    const elementTop = howToMineRef.current.getBoundingClientRect().top + window.pageYOffset;
                    const offset = 50; // Compensate for StakingPanel marginTop: '170px' + HOW TO MINE marginTop: '50px'
                    window.scrollTo({
                      top: elementTop - offset,
                      behavior: 'smooth'
                    });
                    playSound('click', { volume: SOUND_VOLUMES.click });
                  }
                }}
                className="relative overflow-visible cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  padding: '2px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  width: '36px',
                  height: '36px',
                }}
              >
                <div className="relative w-full h-full overflow-visible flex items-center justify-center" style={{
                  background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                  width: '100%',
                  height: '100%',
                }}>
                  <div 
                    className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-full"
                  />
                  <span 
                    className="font-bold z-10"
                    style={{
                      fontFamily: 'Comic Sans MS, Comic Neue, cursive',
                      fontSize: '20px',
                      lineHeight: '1',
                      color: '#FFD700',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      transform: 'rotate(-13deg)',
                    }}
                  >
                    ?
                  </span>
                </div>
              </button>

              {/* Circle Button 2 - Sound */}
              <button
                onClick={() => {
                  toggleMute();
                  if (!isMuted) {
                    playSound('click', { volume: SOUND_VOLUMES.click });
                  }
                }}
                className="relative overflow-visible cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: isMuted 
                    ? 'linear-gradient(180deg, #666666 0%, #333333 100%)' 
                    : 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  padding: '2px',
                  borderRadius: '50%',
                  boxShadow: isMuted 
                    ? '0 2px 5px rgba(0,0,0,0.2)' 
                    : '0 4px 10px rgba(0,0,0,0.4)',
                  width: '36px',
                  height: '36px',
                  opacity: isMuted ? 0.6 : 1,
                  transition: 'opacity 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
              >
                <div className="relative w-full h-full overflow-visible flex items-center justify-center" style={{
                  background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 50%, #2A2A2A 100%)',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                  width: '100%',
                  height: '100%',
                }}>
                  <div 
                    className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-full"
                  />
                  {isMuted ? (
                    <svg 
                      className="w-[20px] h-[20px] z-10"
                      fill="#FFD700"
                      viewBox="0 0 24 24"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                      }}
                    >
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38.31 2.63.95 3.69 1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg 
                      className="w-[20px] h-[20px] z-10"
                      fill="#FFD700"
                      viewBox="0 0 24 24"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                      }}
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </div>
              </button>
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
        ref={centerStageRef}
        className="flex-1 flex flex-col items-center justify-start px-3 sm:px-4 relative"
        style={{ overflow: 'visible', marginTop: '0px', paddingBottom: '120px' }}
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

              <div className="flex-1 flex gap-1 justify-between items-center min-w-0" style={{ pointerEvents: (deploying || !!automation) ? 'none' : 'auto' }}>
                <div className="flex-1 min-w-0" style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  padding: '2px',
                  borderRadius: '13px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                }}>
                  <GlossyButton
                    onClick={selectAll}
                    size="sm"
                    variant="primary"
                    className="!w-full !px-0 !py-2 !text-[11px] sm:!text-[13px] !rounded-[11px]"
                    style={{
                      background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
                      borderColor: 'transparent',
                      color: '#FFD700',
                      boxShadow: 'none',
                      border: 'none',
                    }}
                    disabled={deploying || !!automation}
                  >
                    ALL
                  </GlossyButton>
                </div>
                <div className="flex-1 min-w-0" style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  padding: '2px',
                  borderRadius: '13px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                }}>
                  <GlossyButton
                    onClick={randomSelection}
                    size="sm"
                    variant="primary"
                    className="!w-full !px-0 !py-2 !text-[11px] sm:!text-[13px] !rounded-[11px]"
                    style={{
                      background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
                      borderColor: 'transparent',
                      color: '#FFD700',
                      boxShadow: 'none',
                      border: 'none',
                    }}
                    disabled={deploying || !!automation}
                  >
                    RANDOM
                  </GlossyButton>
                </div>
                <GlossyButton
                  onClick={clearSelection}
                  size="icon"
                  variant="danger"
                  className="flex-none !w-8 !h-8 sm:!w-9 sm:!h-9"
                  disabled={deploying || !!automation}
                >
                  ✕
                </GlossyButton>
              </div>
            </div>
          )}
        </div>


        <div className="w-full max-w-[min(92vw,520px)] relative z-30" style={{ overflow: 'visible', pointerEvents: (deploying || !!automation) ? 'none' : 'auto' }}>
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
        </div>
      </div>

      {/* Yellow Background Section - Everything below tiles */}
      <div ref={yellowSectionRef} className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{ backgroundColor: '#C68152', zIndex: 39 }}>
        {/* Arch Image - Full Width */}
        <div ref={archRef} className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{ zIndex: 50, marginTop: '-30px' }}>
          <img 
            src="/img/arch.png" 
            alt="Arch" 
            className="w-full h-auto"
          />
        </div>

        {/* Miner Tiger GIF - Under Arch */}
        <div className="w-full flex justify-center" style={{ marginTop: '20px' }}>
          <img 
            src="/img/pickaxe_front.gif" 
            alt="Miner Tiger" 
            style={{ 
              width: '130px', 
              height: 'auto', 
              zIndex: 60, 
              marginTop: '-220px',
              objectFit: 'contain',
              maxWidth: '130px',
              aspectRatio: 'auto'
            }}
          />
        </div>
        <div className="w-full max-w-[min(92vw,520px)] md:max-w-[1200px] mt-[0px] mx-auto relative z-30 px-3 sm:px-4 z-70">
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

          {/* Round Information Card - Replaces Win/Loss History */}
          <div ref={winLossHistoryRef} style={{ marginTop: '60px', width: '100%', position: 'relative', zIndex: 10 }}>
            <div 
              className="rounded-xl border-2 border-black overflow-hidden"
              style={{ 
                backgroundColor: '#ffb84a',
                width: '100%',
                aspectRatio: '1 / 1',
              }}
            >
              {/* CURRENT ROUND Label */}
              <div className="text-center py-2 px-3 relative">
                {/* Decorative circle bolts in corners */}
                <div 
                  className="absolute left-1"
                  style={{
                    top: '7px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div 
                  className="absolute right-1"
                  style={{
                    top: '7px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div 
                  className="absolute left-1"
                  style={{
                    bottom: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div 
                  className="absolute right-1"
                  style={{
                    bottom: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div className="text-lg sm:text-xl font-black text-black uppercase" style={{ marginTop: '0px', verticalAlign: 'bottom' }}>
                  {roundResultsData ? 'CURRENT ROUND' : previousRoundResultsData ? 'LAST ROUND' : 'CURRENT ROUND'}
                </div>
              </div>
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg m-2" style={{ height: 'calc(100% - 60px)' }}>
                {(() => {
                  const data = roundResultsData || previousRoundResultsData;
                  
                  // Debug: Log what we have
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[CURRENT ROUND CARD] Data check:', {
                      hasRoundResultsData: !!roundResultsData,
                      hasPreviousRoundResultsData: !!previousRoundResultsData,
                      data: data,
                      round_id: data?.round_id,
                      winning_square: data?.winning_square
                    });
                  }
                  
                  // ALWAYS show data if we have any round data - don't be too strict
                  const hasAnyRoundData = data && (
                    data.round_id || 
                    data.roundId ||
                    data.winning_square !== undefined || 
                    data.total_deployed !== undefined ||
                    data.total_winnings !== undefined ||
                    data.lottery_outcome
                  );
                  
                  if (!hasAnyRoundData) {
                    if (roundResultsLoading) {
                      return (
                        <div className="text-center text-white/80 text-xs leading-none py-4">
                          Loading round results...
                        </div>
                      );
                    }
                    // Show fallback round statistics if round exists
                    if (!round) {
                      return (
                        <div className="text-xs text-white/80 text-center py-4 leading-none">
                          No round data available.
                        </div>
                      );
                    }
                    // Show Round Statistics fallback
                    return (
                      <div className="space-y-2 h-full flex flex-col overflow-hidden">
                        {/* Round Header */}
                        <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                          <div className="text-center">
                            <div className="text-base font-black text-[#ffb84a] uppercase mb-0.5 leading-none">
                              ROUND #{board?.roundId?.toString() || round?.id?.toString() || '0'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Round Statistics */}
                        <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                          <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase mb-1.5 pb-1 border-b border-[rgb(120,63,4)]/30 leading-none">
                            Round Statistics
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between py-0.5">
                              <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none">
                                Total Deployed
                              </span>
                              <span className="text-sm sm:text-base font-black text-[#ffb84a] leading-none">
                                {lamportsToSol(round.totalDeployed).toFixed(4)} <span className="ml-1 text-xs leading-none">SOL</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                              <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none">
                                Total Winnings
                              </span>
                              <span className="text-sm sm:text-base font-black text-[#ffb84a] leading-none">
                                {lamportsToSol(round.totalWinnings).toFixed(4)} <span className="ml-1 text-xs leading-none">SOL</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                              <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none">
                                Total Vaulted
                              </span>
                              <span className="text-sm sm:text-base font-black text-[#ffb84a] leading-none">
                                {lamportsToSol(round.totalVaulted).toFixed(4)} <span className="ml-1 text-xs leading-none">SOL</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                              <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none">
                                Total Miners
                              </span>
                              <span className="text-sm sm:text-base font-black text-[#ffb84a] leading-none">
                                {round.totalMiners.toString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Show comprehensive round results - show data even if incomplete
                  const miners = data.miners || data.winners || [];
                  const roundId = data.round_id || data.roundId || '—';
                  const winningSquare = data.winning_square !== null && data.winning_square !== undefined ? data.winning_square : null;
                  const lotteryOutcome = data.lottery_outcome || data.lotteryOutcome || '—';

                  return (
                    <div className="space-y-2 h-full flex flex-col overflow-hidden">
                      {/* Round Header */}
                      <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                        <div className="text-center">
                          <div className="text-base font-black text-[#ffb84a] uppercase mb-0.5 leading-none">
                            ROUND #{roundId}
                          </div>
                          <div className="text-[10px] font-black text-white/80 uppercase leading-none">
                            Finalized
                          </div>
                        </div>
                      </div>

                      {/* Winner and Lottery - Compact */}
                      <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-0.5">
                              Winner
                            </div>
                            <div className="text-sm font-black text-[#ffb84a] leading-none">
                              #{winningSquare !== null ? winningSquare + 1 : '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-0.5">
                              Lottery
                            </div>
                            <div className="text-sm font-black text-[#ffb84a] leading-none">
                              {lotteryOutcome === 'Split' ? '🎲 Split' : 
                               lotteryOutcome === 'Single Winner' ? '🎯 Single' : 
                               lotteryOutcome === 'Motherlode' ? '💎 Motherlode' : 
                               lotteryOutcome || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Deployed */}
                      <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none">
                            Total Deployed
                          </span>
                          <span className="text-sm sm:text-base font-black text-[#ffb84a] leading-none">
                            {(data.total_deployed / 1_000_000_000).toFixed(4)} <span className="ml-1 text-xs leading-none">SOL</span>
                          </span>
                        </div>
                      </div>

                      {/* SOL Distribution - Compact Grid */}
                      <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                        <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase mb-1.5 pb-1 border-b border-[rgb(120,63,4)]/30 leading-none">
                          SOL Distribution
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Winners:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.total_winnings / 1_000_000_000).toFixed(5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Buyback:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.buyback_amount / 1_000_000_000).toFixed(5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Stakers:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.staker_amount / 1_000_000_000).toFixed(5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Admin:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.admin_fee / 1_000_000_000).toFixed(5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Editions:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.master_edition_amount / 1_000_000_000).toFixed(5)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Motherlode:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.sol_motherlode_amount / 1_000_000_000).toFixed(5)}</span>
                          </div>
                        </div>
                      </div>

                      {/* ORE Distribution - Compact Grid */}
                      <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                        <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase mb-1.5 pb-1 border-b border-[rgb(120,63,4)]/30 leading-none">
                          ORE Distribution
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Total ORE:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.total_ore_reward / 1_000_000_000).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Guaranteed:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.ore_guaranteed_pool / 1_000_000_000).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Lottery:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(data.ore_lottery_pool / 1_000_000_000).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/80 leading-none">Winners:</span>
                            <span className="text-[10px] font-black text-[#ffb84a] leading-none">{data.num_winners || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Motherlode Information */}
                      {data.motherlode_tier && data.motherlode_tier !== 'None' && (
                        <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg">
                          <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase mb-1.5 pb-1 border-b border-[rgb(120,63,4)]/30 leading-none">
                            Motherlode
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-black text-[#ffb84a] leading-none">
                              {data.motherlode_tier === 'Minor' ? 'MINOR 🥉' : 
                               data.motherlode_tier === 'Major' ? 'MAJOR 🥈' : 
                               data.motherlode_tier === 'Grand' ? 'GRAND 🥇' : 
                               data.motherlode_tier}
                            </div>
                            {data.ore_motherlode_payout > 0 && (
                              <div className="text-[10px] text-white/80 leading-none">
                                ORE: {(data.ore_motherlode_payout / 1_000_000_000).toFixed(2)}
                              </div>
                            )}
                            {data.sol_motherlode_payout > 0 && (
                              <div className="text-[10px] text-white/80 leading-none">
                                SOL: {(data.sol_motherlode_payout / 1_000_000_000).toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Miners - Compact */}
                      <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg flex-1 min-h-0 flex flex-col">
                        <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase mb-1.5 pb-1 border-b border-[rgb(120,63,4)]/30 leading-none">
                          Miners
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[10px] text-white/80 leading-none">
                            Total: {data.num_miners || miners.length || 0}
                          </div>
                        </div>
                        {miners.length > 0 ? (
                          <div className="space-y-1 overflow-y-auto flex-1">
                            {(() => {
                              // Always show at least the first miner, or user's miner if they participated
                              const userMiner = publicKey ? miners.find((m: any) => m.miner === publicKey.toBase58()) : null;
                              const minersToShow = userMiner ? [userMiner] : miners.slice(0, Math.min(1, miners.length));
                              
                              if (minersToShow.length === 0) {
                                return <div className="text-[10px] text-white/80 leading-none">No miner data</div>;
                              }
                              
                              return minersToShow.map((miner: any) => {
                                const isMe = publicKey && miner.miner === publicKey.toBase58();
                                const sol = (miner.total_sol_rewards || miner.total_sol_reward || 0) / 1_000_000_000;
                                const ore = (miner.total_ore_rewards || miner.total_ore_reward || 0) / 1_000_000_000;
                                const short = `${miner.miner.slice(0, 4)}…${miner.miner.slice(-4)}`;
                                
                                return (
                                  <div key={miner.miner} className="bg-black/30 rounded p-1 border border-[rgb(120,63,4)]/20">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-white/80 leading-none">#{miner.rank || '—'}</span>
                                        <span className="text-[10px] text-[#ffb84a] leading-none">{isMe ? `You (${short})` : short}</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      <div>
                                        <span className="text-white/80 leading-none">SOL: </span>
                                        <span className="text-[#ffb84a] font-black leading-none">{sol > 0 && sol < 0.000001 ? '<0.000001' : sol.toFixed(6)}</span>
                                      </div>
                                      <div>
                                        <span className="text-white/80 leading-none">ORE: </span>
                                        <span className="text-[#ffb84a] font-black leading-none">{ore > 0 && ore < 0.0001 ? '<0.0001' : ore.toFixed(4)}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        ) : (
                          <div className="text-[10px] text-white/80 leading-none">
                            No miners
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Rocks Image - After Current Round Card */}
          <div ref={rocksRef} className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{ marginTop: '-130px', zIndex: 90 }}>
            <img 
              src="/img/rocks.png" 
              alt="Rocks" 
              className="w-full h-auto"
              style={{ height: '113.95px', width: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Treasure Chest - On top of rocks */}
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex justify-center items-center" style={{ marginTop: '-180px', zIndex: 100 }}>
            <div className="relative" style={{ width: '33.33%', maxWidth: '400px', marginTop: '23px' }}>
              <img 
                src="/img/treasure_chest_closed.gif" 
                alt="Treasure Chest" 
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          {/* Staking Panel */}
          <div ref={stakingPanelRef} style={{ marginTop: '170px', position: 'relative', zIndex: 110 }}>
            <StakingPanel />
          </div>

          {/* HOW TO MINE Section */}
          <div ref={howToMineRef} style={{ marginTop: '50px', width: '100%', position: 'relative', zIndex: 10, paddingBottom: '400px' }}>
            <div 
              className="rounded-xl border-2 border-black overflow-hidden"
              style={{ 
                backgroundColor: '#ffb84a',
                width: '100%',
              }}
            >
              {/* HOW TO MINE Label */}
              <div className="text-center py-2 px-3 relative">
                {/* Decorative circle bolts in corners */}
                <div 
                  className="absolute left-1"
                  style={{
                    top: '7px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div 
                  className="absolute right-1"
                  style={{
                    top: '7px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div 
                  className="absolute left-1"
                  style={{
                    bottom: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div 
                  className="absolute right-1"
                  style={{
                    bottom: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                  }}
                />
                <div className="text-lg sm:text-xl font-black text-black uppercase" style={{ marginTop: '0px', verticalAlign: 'bottom' }}>
                  HOW TO MINE
                </div>
              </div>
              
              {/* HowTo Content */}
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-4 rounded-lg m-2">
                <HowTo />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROL BAR - Sticky */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-[rgb(120,63,4)] transition-all duration-500 ease-in-out"
        style={{ 
          backgroundColor: '#FFB84A',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
          paddingBottom: '0',
          bottom: 0,
        }}
      >
        {/* Connect to Play / Pick a Lucky Square Message with Round Info - Compact */}
        {!connected ? (
          <div className="w-full text-center py-1 border-b border-black/10">
            <span className="text-xs font-black text-black uppercase leading-none">
              CONNECT TO PLAY
            </span>
          </div>
        ) : (
          <div className="w-full border-b border-black/10" style={{ paddingTop: '6px', paddingBottom: '6px' }}>
            <div className="w-full grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-4">
              {/* Left: WIN THIS ROUND - SOL */}
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase leading-none mb-0.5">Win This Round</span>
                <span className="text-sm font-black text-[rgb(120,63,4)] leading-none">
                  {round?.totalWinnings ? lamportsToSol(round.totalWinnings).toFixed(4) : '0.0000'} SOL
                </span>
              </div>
              
              {/* Center: Round Number + MINE A SQUARE */}
              <div className="text-center flex flex-col">
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase leading-none">
                  ROUND #{board?.roundId?.toString() || '0'}
                </span>
                <span className="text-sm font-black text-[rgb(120,63,4)] leading-none">
                  MINE A SQUARE
                </span>
              </div>
              
              {/* Right: WIN THIS ROUND - QUEST */}
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase leading-none mb-0.5">Win This Round</span>
                <span className="text-sm font-black text-[rgb(120,63,4)] leading-none text-right">
                  {previousRound?.totalVaulted ? Math.floor(lamportsToSol(previousRound.totalVaulted)).toString().padStart(3, '0') : '000'} QUEST
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Bar - Always visible at top */}
        <div 
          className="w-full grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-6 border-b border-black/10 flex-none"
          style={{ 
            paddingInline: 'calc(var(--spacing) * 4)',
            minHeight: '48px',
            paddingTop: '0',
            paddingBottom: '0',
          }}
        >
          {/* Left: Selected Info */}
          <div className="flex flex-col items-start justify-center min-w-0">
            <div className="flex flex-col">
              <div className="text-center leading-none">
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase">x</span>
                <span className="text-sm font-black text-[rgb(120,63,4)]">{selectedSquares.size}</span>
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase"> {selectedSquares.size === 1 ? 'TILE' : 'TILES'}</span>
              </div>
              <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase leading-none text-center">
                SELECTED
              </span>
            </div>
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
                  playSound('click', { volume: SOUND_VOLUMES.click });
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
              onClick={() => {
                setMode('auto');
                playSound('click', { volume: SOUND_VOLUMES.click });
              }}
              className="relative z-10 flex-1 h-full flex items-center justify-center text-[11px] sm:text-[13px] font-black uppercase transition-colors duration-300 rounded-full"
              style={{
                color: mode === 'auto' ? '#ffffff' : 'rgba(0,0,0,0.4)',
                textShadow: mode === 'auto' ? '0 2px 2px rgba(0,0,0,0.8)' : 'none',
              }}
            >
              {mode === 'auto' ? 'AUTO' : 'AUTO MINE'}
            </button>
          </div>

          {/* Right: Next Round QUEST */}
          <div className="flex flex-col items-end justify-center" style={{ minWidth: '0' }}>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase leading-none text-center">
                NEXT ROUND
              </span>
              <div className="text-right leading-none">
                <span className="text-sm font-black text-[rgb(120,63,4)]">
                  {round?.totalVaulted ? Math.floor(lamportsToSol(round.totalVaulted)).toString().padStart(3, '0') : '000'}
                </span>
                <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase"> QUEST</span>
              </div>
            </div>
          </div>
        </div>

        {/* MINE Action Bar - Fixed at bottom when squares selected or auto mining */}
        <div 
          className={`w-full border-b border-black/5 flex-none transition-all duration-500 ease-in-out ${
            (selectedSquares.size > 0 || !!automation) ? 'h-[60px] opacity-100' : 'h-0 opacity-0 pointer-events-none'
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
