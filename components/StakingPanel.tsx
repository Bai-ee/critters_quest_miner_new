'use client';

import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useRoundData } from '@/hooks/useRoundData';
import { useAudio } from '@/hooks/useAudio';
import { SOUND_VOLUMES } from '@/lib/audioVolumes';
import {
  computeStakeClaimableLamports,
  fetchStake,
  fetchTreasury,
  getStakePDA,
  getTreasuryPDA,
  gramsToOre,
  lamportsToSol,
  getWinningSquare,
} from '@/lib/accounts';
import {
  useStakeClaimYield,
  useStakeDeposit,
  useStakeWithdraw,
  useClaimSol,
  useClaimOre,
  useClaimAll,
} from '@/lib/instrucionsHooks';
import type { Stake, Treasury } from '@/lib/types';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { GlossyButton } from './GlossyButton';

const ORE_MINT = 'QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s';

type TabId = 'stake' | 'rewards' | 'round';

export function StakingPanel() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { miner, round, previousRound, board, currentSlot } = useRoundData();
  const { playSound } = useAudio();

  const { deposit } = useStakeDeposit();
  const { withdraw } = useStakeWithdraw();
  const { claimYield } = useStakeClaimYield();
  const { claimSol } = useClaimSol();
  const { claimOre } = useClaimOre();
  const { claimAll } = useClaimAll();

  const [stake, setStake] = useState<Stake | null>(null);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [roundResultsData, setRoundResultsData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<TabId>('stake');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [claimAmount, setClaimAmount] = useState<string>('');

  const [actionLoading, setActionLoading] = useState<
    'deposit' | 'withdraw' | 'claim' | 'claimSol' | 'claimOre' | 'claimAll' | null
  >(null);

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'stake', label: 'STAKE' },
    { id: 'rewards', label: 'CLAIM' },
    { id: 'round', label: 'ROUND' },
  ];

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabIndicatorRef = useRef<HTMLDivElement>(null);

  // Animate tab indicator sliding
  useEffect(() => {
    if (tabIndicatorRef.current && tabContainerRef.current) {
      const containerWidth = tabContainerRef.current.offsetWidth;
      const indicatorWidth = containerWidth / tabs.length;
      let targetX = 0;
      if (activeTab === 'rewards') targetX = indicatorWidth;
      else if (activeTab === 'round') targetX = indicatorWidth * 2;

      gsap.to(tabIndicatorRef.current, {
        x: targetX,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [activeTab, tabs.length]);

  const { balance: walletOreBalance } = useTokenBalance({
    tokenMint: ORE_MINT,
    walletAddress: publicKey ?? null,
    decimals: 9,
  });

  const stakedOre = useMemo(() => {
    if (!stake) return 0;
    return gramsToOre(stake.balance);
  }, [stake]);

  const claimableYield = useMemo(() => {
    if (!stake || !treasury) return 0;
    return lamportsToSol(computeStakeClaimableLamports(stake, treasury));
  }, [stake, treasury]);

  const lifetimeYield = useMemo(() => {
    if (!stake) return 0;
    return lamportsToSol(stake.lifetimeRewards);
  }, [stake]);

  // Round rewards calculations
  const roundRewardsSol = useMemo(() => {
    if (!miner) return 0;
    return lamportsToSol(miner.rewardsSol);
  }, [miner]);

  const roundRewardsOre = useMemo(() => {
    if (!miner) return 0;
    return gramsToOre(miner.rewardsOre);
  }, [miner]);

  const refinedOre = useMemo(() => {
    if (!miner) return 0;
    return gramsToOre(miner.refinedOre || 0n);
  }, [miner]);

  const lifetimeRewardsSol = useMemo(() => {
    if (!miner) return 0;
    return lamportsToSol(miner.lifetimeRewardsSol);
  }, [miner]);

  const lifetimeRewardsOre = useMemo(() => {
    if (!miner) return 0;
    return gramsToOre(miner.lifetimeRewardsOre);
  }, [miner]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!publicKey) {
        setStake(null);
        return;
      }

      try {
        setStakeLoading(true);
        const [stakeData, treasuryData] = await Promise.all([
          fetchStake(connection, publicKey),
          fetchTreasury(connection),
        ]);
        if (!active) return;
        setStake(stakeData);
        setTreasury(treasuryData);
      } catch (e) {
        if (!active) return;
        setStake(null);
        setTreasury(null);
      } finally {
        if (!active) return;
        setStakeLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [connection, publicKey]);

  useEffect(() => {
    if (!publicKey) return;

    const stakePda = getStakePDA(publicKey);

    const subId = connection.onAccountChange(
      stakePda,
      async (accountInfo) => {
        try {
          if (accountInfo.data.length === 0) {
            setStake(null);
            return;
          }
          const stakeData = await fetchStake(connection, publicKey);
          setStake(stakeData);
        } catch {
          setStake(null);
        }
      },
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subId);
    };
  }, [connection, publicKey]);

  useEffect(() => {
    const treasuryPda = getTreasuryPDA();

    const subId = connection.onAccountChange(
      treasuryPda,
      async () => {
        try {
          const treasuryData = await fetchTreasury(connection);
          setTreasury(treasuryData);
        } catch {
          setTreasury(null);
        }
      },
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subId);
    };
  }, [connection]);

  useEffect(() => {
    setClaimAmount((current) => {
      if (current.length > 0) return current;
      if (claimableYield > 0) return claimableYield.toFixed(9);
      return '';
    });
  }, [claimableYield]);

  // Fetch round results data
  useEffect(() => {
    const fetchRoundResults = async () => {
      if (!board?.roundId) return;
      
      try {
        const roundId = Number(board.roundId);
        
        // Fetch latest round (current or previous)
        const latestResponse = await fetch('/api/rounds/latest', { cache: 'no-store' });
        
        if (latestResponse.status === 503) {
          setRoundResultsData(null);
          return;
        }

        const latestResult = await latestResponse.json();
        
        if (latestResult.success && latestResult.data) {
          const dataRoundId = latestResult.data.round_id;
          
          // If latest matches current round, set as current
          if (dataRoundId === roundId) {
            setRoundResultsData(latestResult.data);
          } 
          // If latest is previous round and current round hasn't ended yet, show previous
          else if (dataRoundId === roundId - 1) {
            // Check if current round has ended
            const roundEnded = board?.endSlot && currentSlot && currentSlot >= board.endSlot;
            if (!roundEnded) {
              setRoundResultsData(latestResult.data);
            } else {
              setRoundResultsData(null);
            }
          } else {
            setRoundResultsData(null);
          }
        } else {
          setRoundResultsData(null);
        }
      } catch (error) {
        console.error('Error fetching round results:', error);
        setRoundResultsData(null);
      }
    };

    fetchRoundResults();
    // Refetch every 5 seconds
    const interval = setInterval(fetchRoundResults, 5000);
    
    return () => clearInterval(interval);
  }, [board?.roundId, board?.endSlot, currentSlot]);

  const lastDepositAt = useMemo(() => {
    const raw = stake?.lastDepositAt;
    if (!raw || raw === 0n) return null;
    return new Date(Number(raw) * 1000);
  }, [stake?.lastDepositAt]);

  const lastWithdrawAt = useMemo(() => {
    const raw = stake?.lastWithdrawAt;
    if (!raw || raw === 0n) return null;
    return new Date(Number(raw) * 1000);
  }, [stake?.lastWithdrawAt]);

  const lastClaimAt = useMemo(() => {
    const raw = stake?.lastClaimAt;
    if (!raw || raw === 0n) return null;
    return new Date(Number(raw) * 1000);
  }, [stake?.lastClaimAt]);

  const handleDeposit = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      toast.error('Enter a deposit amount');
      return;
    }

    try {
      setActionLoading('deposit');
      const signature = await deposit(depositAmount);
      toast.success(`Deposit successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      setDepositAmount(0);
    } catch (e) {
      toast.error(`Deposit failed: ${e}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Enter a withdraw amount');
      return;
    }

    try {
      setActionLoading('withdraw');
      const signature = await withdraw(withdrawAmount);
      toast.success(`Withdraw successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      setWithdrawAmount(0);
    } catch (e) {
      toast.error(`Withdraw failed: ${e}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimYield = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const parsedClaimAmount = Number(claimAmount);
    if (!Number.isFinite(parsedClaimAmount) || parsedClaimAmount <= 0) {
      toast.error('Enter a claim amount');
      return;
    }

    try {
      setActionLoading('claim');
      const signature = await claimYield(parsedClaimAmount);
      toast.success(`Claim successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      setClaimAmount('');
    } catch (e) {
      toast.error(`Claim failed: ${e}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimSol = async () => {
    if (!publicKey || !miner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (miner.rewardsSol === 0n) {
      toast.error('No SOL rewards to claim');
      return;
    }

    try {
      setActionLoading('claimSol');
      await claimSol();
      toast.success('SOL rewards claimed successfully!');
    } catch (e) {
      toast.error(`Claim failed: ${e}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimOre = async () => {
    if (!publicKey || !miner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (miner.rewardsOre === 0n) {
      toast.error('No QUEST rewards to claim');
      return;
    }

    try {
      setActionLoading('claimOre');
      await claimOre();
      toast.success('QUEST rewards claimed successfully!');
    } catch (e) {
      toast.error(`Claim failed: ${e}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimAllRound = async () => {
    if (!publicKey || !miner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (miner.rewardsSol === 0n && miner.rewardsOre === 0n) {
      toast.error('No rewards to claim');
      return;
    }

    try {
      setActionLoading('claimAll');
      await claimAll();
      toast.success('All rewards claimed successfully!');
    } catch (e) {
      toast.error(`Claim failed: ${e}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Data Display Component - Consistent styling
  const DataRow = ({ label, value, valueColor = 'text-[#ffb84a]', showUnit = false, unit = '' }: {
    label: string;
    value: string | number;
    valueColor?: string;
    showUnit?: boolean;
    unit?: string;
  }) => {
    const formattedValue = typeof value === 'number' 
      ? (showUnit && unit === 'SOL' ? value.toFixed(4) : unit === 'QUEST' ? value.toFixed(2) : value.toFixed(9))
      : value;
    
    return (
      <div className="flex items-center justify-between py-0.5">
        <span className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none">
          {label}
        </span>
        <span className={`text-sm sm:text-base font-black ${valueColor} leading-none`}>
          {formattedValue}
          {showUnit && unit && <span className="ml-1 text-xs leading-none">{unit}</span>}
        </span>
      </div>
    );
  };

  const DataSection = ({ title, children, className = '' }: {
    title?: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`bg-black border-2 border-[rgb(120,63,4)]/30 p-2 rounded-lg ${className}`}>
      {title && (
        <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase mb-1.5 pb-1 border-b border-[rgb(120,63,4)]/30 leading-none">
          {title}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main Container with Yellow Background */}
      <div className="rounded-xl border-2 border-black overflow-hidden" style={{ backgroundColor: '#ffb84a' }}>
        {/* MANAGE REWARDS Label */}
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
            MANAGE REWARDS
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex w-full items-center justify-center px-4 py-3">
          <div 
            ref={tabContainerRef}
            className="relative flex items-center bg-black/20 rounded-full p-1"
            style={{
              minWidth: '200px',
              width: '100%',
              maxWidth: '300px',
              height: '36px',
            }}
          >
            {/* Sliding indicator */}
            <div
              ref={tabIndicatorRef}
              className="absolute top-1 left-1 rounded-full"
              style={{
                width: `calc(${100 / tabs.length}% - 4px)`,
                height: 'calc(100% - 8px)',
                background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
                border: '2px solid rgb(0,0,0)',
                boxShadow: '0 2px 0 rgb(0,0,0)',
                zIndex: 1,
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

            {/* Tab buttons */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  playSound('click', { volume: SOUND_VOLUMES.click });
                }}
                className="relative z-10 flex-1 h-full flex items-center justify-center text-xs sm:text-sm font-black uppercase transition-colors duration-300 rounded-full"
                style={{
                  color: activeTab === tab.id ? '#ffffff' : 'rgba(0,0,0,0.4)',
                  textShadow: activeTab === tab.id ? '0 2px 2px rgba(0,0,0,0.8)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area - Black Background */}
        <div className="flex-1 p-3 md:p-4">
          {/* STAKE TAB */}
          {activeTab === 'stake' && (
            <div className="space-y-2">
              {/* Balance Overview Section */}
              <DataSection title="Balance Overview">
                <div className="space-y-2">
                  <DataRow 
                    label="Wallet $QUEST" 
                    value={walletOreBalance} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="QUEST"
                  />
                  <DataRow 
                    label="Staked $QUEST" 
                    value={stakeLoading ? 0 : stakedOre} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="QUEST"
                  />
                  {publicKey && treasury && (
                    <div className="pt-2 border-t border-[rgb(120,63,4)]/30">
                      <DataRow 
                        label="Total Staked (All Users)" 
                        value={gramsToOre(treasury.totalStaked)} 
                        valueColor="text-[#ffb84a]" 
                        showUnit 
                        unit="QUEST"
                      />
                    </div>
                  )}
                </div>
              </DataSection>

              {/* Yield Information Section */}
              {stake && treasury && (
                <DataSection title="Yield Information">
                  <div className="space-y-2">
                    <DataRow 
                      label="Claimable Yield" 
                      value={claimableYield} 
                      valueColor="text-[#ffb84a]" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Lifetime Yield" 
                      value={lifetimeYield} 
                      valueColor="text-[#ffb84a]" 
                      showUnit 
                      unit="SOL"
                    />
                  </div>
                </DataSection>
              )}

              {/* Account Information Section */}
              {publicKey && stake && (
                <DataSection title="Account Information">
                  <div className="space-y-2">
                    <div className="py-1.5">
                      <div className="text-[10px] sm:text-xs font-black text-white/80 uppercase leading-none mb-1">
                        Stake PDA
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-[#ffb84a] break-all leading-tight">
                        {getStakePDA(publicKey).toBase58()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[rgb(120,63,4)]/30">
                      <div>
                        <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-1">
                          Last Deposit
                        </div>
                        <div className="text-xs font-black text-[#ffb84a] leading-none">
                          {lastDepositAt ? lastDepositAt.toLocaleString() : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-1">
                          Last Withdraw
                        </div>
                        <div className="text-xs font-black text-[#ffb84a] leading-none">
                          {lastWithdrawAt ? lastWithdrawAt.toLocaleString() : '—'}
                        </div>
                      </div>
                      {lastClaimAt && (
                        <div>
                          <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-1">
                            Last Claim
                          </div>
                          <div className="text-xs font-black text-[#ffb84a] leading-none">
                            {lastClaimAt.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </DataSection>
              )}

              {/* Empty States */}
              {!publicKey && (
                <div className="text-xs text-white/80 text-center py-4 leading-none">
                  Connect your wallet to stake.
                </div>
              )}
              {publicKey && stake === null && !stakeLoading && (
                <div className="text-xs text-white/80 text-center py-4 leading-none">
                  No stake account yet. Make a deposit to create one.
                </div>
              )}

              {/* Claim Yield Section */}
              {stake && treasury && claimableYield > 0 && (
                <DataSection title="Claim Yield">
                  <div className="space-y-0">
                    <input
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="0.0"
                      step="0.0001"
                      min="0"
                      className="w-full px-3 py-2 bg-cq-bg-0 text-[#ffb84a] border border-[rgb(120,63,4)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(120,63,4)]/50 focus:border-[rgb(120,63,4)] leading-none"
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        onClick={() => setClaimAmount((claimableYield * 0.25).toFixed(9))}
                        disabled={!publicKey || !stake || claimableYield <= 0}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => setClaimAmount((claimableYield * 0.5).toFixed(9))}
                        disabled={!publicKey || !stake || claimableYield <= 0}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setClaimAmount(claimableYield.toFixed(9))}
                        disabled={!publicKey || !stake || claimableYield <= 0}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        100%
                      </button>
                    </div>
                    <button
                      onClick={handleClaimYield}
                      disabled={!publicKey || !stake || claimableYield <= 0 || actionLoading !== null}
                      className="w-full px-4 py-2 bg-[#ffb84a] hover:bg-[#ffb84a]/90 text-black text-sm font-black uppercase rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 min-h-[40px] mt-2"
                    >
                      {actionLoading === 'claim' ? 'Claiming...' : 'Claim Rewards'}
                    </button>
                  </div>
                </DataSection>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Deposit */}
                <DataSection title="Deposit">
                  <div className="space-y-0">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      placeholder="0.0"
                      step="0.0001"
                      min="0"
                      className="w-full px-3 py-2 bg-cq-bg-0 text-[#ffb84a] border border-[rgb(120,63,4)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(120,63,4)]/50 focus:border-[rgb(120,63,4)] leading-none"
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        onClick={() => setDepositAmount(Number((walletOreBalance * 0.25).toFixed(9)))}
                        disabled={!publicKey}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => setDepositAmount(Number((walletOreBalance * 0.5).toFixed(9)))}
                        disabled={!publicKey}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setDepositAmount(Number(walletOreBalance.toFixed(9)))}
                        disabled={!publicKey}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        100%
                      </button>
                    </div>
                    <button
                      onClick={handleDeposit}
                      disabled={!publicKey || actionLoading !== null}
                      className="w-full px-4 py-2 bg-[#ffb84a] hover:bg-[#ffb84a]/90 text-black text-sm font-black uppercase rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 min-h-[40px] mt-2"
                    >
                      {actionLoading === 'deposit' ? 'Depositing...' : 'Deposit'}
                    </button>
                  </div>
                </DataSection>

                {/* Withdraw */}
                <DataSection title="Withdraw">
                  <div className="space-y-0">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      placeholder="0.0"
                      step="0.0001"
                      min="0"
                      className="w-full px-3 py-2 bg-cq-bg-0 text-[#ffb84a] border border-[rgb(120,63,4)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(120,63,4)]/50 focus:border-[rgb(120,63,4)] leading-none"
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        onClick={() => setWithdrawAmount(Number((stakedOre * 0.25).toFixed(9)))}
                        disabled={!publicKey || !stake || stakedOre <= 0}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => setWithdrawAmount(Number((stakedOre * 0.5).toFixed(9)))}
                        disabled={!publicKey || !stake || stakedOre <= 0}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setWithdrawAmount(Number(stakedOre.toFixed(9)))}
                        disabled={!publicKey || !stake || stakedOre <= 0}
                        className="px-2 py-1.5 bg-black/50 hover:bg-black/70 text-white/80 text-xs font-black uppercase rounded-lg transition-all duration-200 border border-[rgb(120,63,4)]/50 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        100%
                      </button>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={!publicKey || !stake || stakedOre <= 0 || actionLoading !== null}
                      className="w-full px-4 py-2 bg-[#ffb84a] hover:bg-[#ffb84a]/90 text-black text-sm font-black uppercase rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 min-h-[40px] mt-2"
                    >
                      {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  </div>
                </DataSection>
              </div>
            </div>
          )}

          {/* CLAIM TAB */}
          {activeTab === 'rewards' && (
            <div className="space-y-2">
              {/* Current Round Rewards Section */}
              <DataSection title="Current Round Rewards">
                <div className="space-y-2">
                  <DataRow 
                    label="SOL Rewards" 
                    value={roundRewardsSol} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="SOL"
                  />
                  <DataRow 
                    label="Unrefined $QUEST" 
                    value={roundRewardsOre} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="QUEST"
                  />
                  <DataRow 
                    label="Refined $QUEST" 
                    value={refinedOre} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="QUEST"
                  />
                </div>
              </DataSection>

              {/* Lifetime Rewards Section */}
              <DataSection title="Lifetime Rewards">
                <div className="space-y-2">
                  <DataRow 
                    label="Lifetime SOL Rewards" 
                    value={lifetimeRewardsSol} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="SOL"
                  />
                  <DataRow 
                    label="Lifetime $QUEST Rewards" 
                    value={lifetimeRewardsOre} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="QUEST"
                  />
                </div>
              </DataSection>

              {/* Empty States */}
              {!publicKey && (
                <div className="text-xs text-white/80 text-center py-4 leading-none">
                  Connect your wallet to view round rewards.
                </div>
              )}
              {publicKey && !miner && (
                <div className="text-xs text-white/80 text-center py-4 leading-none">
                  No miner account found. Deploy to squares to start earning rewards.
                </div>
              )}
              {publicKey && miner && roundRewardsSol === 0 && roundRewardsOre === 0 && refinedOre === 0 && (
                <div className="text-xs text-white/80 text-center py-4 leading-none">
                  No claimable rewards available at this time.
                </div>
              )}

              {/* Claim Actions */}
              {(roundRewardsSol > 0 || roundRewardsOre > 0 || refinedOre > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleClaimSol}
                    disabled={!publicKey || !miner || roundRewardsSol === 0 || actionLoading !== null}
                    className="w-full px-4 py-2 bg-[#ffb84a] hover:bg-[#ffb84a]/90 text-black text-sm font-black uppercase rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 min-h-[40px]"
                  >
                    {actionLoading === 'claimSol' ? 'Claiming...' : 'Claim SOL'}
                  </button>

                  <button
                    onClick={handleClaimOre}
                    disabled={!publicKey || !miner || roundRewardsOre === 0 || actionLoading !== null}
                    className="w-full px-4 py-2 bg-[#ffb84a] hover:bg-[#ffb84a]/90 text-black text-sm font-black uppercase rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 min-h-[40px]"
                  >
                    {actionLoading === 'claimOre' ? 'Claiming...' : 'Claim QUEST'}
                  </button>

                  <button
                    onClick={handleClaimAllRound}
                    disabled={!publicKey || !miner || (roundRewardsSol === 0 && roundRewardsOre === 0 && refinedOre === 0) || actionLoading !== null}
                    className="w-full px-4 py-2 bg-[#ffb84a] hover:bg-[#ffb84a]/90 text-black text-sm font-black uppercase rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 min-h-[40px]"
                  >
                    {actionLoading === 'claimAll' ? 'Claiming...' : 'Claim All'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ROUND TAB */}
          {activeTab === 'round' && (
            <div className="space-y-2">
              {/* Round Header */}
              {(round || roundResultsData) && (
                <DataSection>
                  <div className="text-center">
                    <div className="text-base font-black text-[#ffb84a] uppercase mb-0.5 leading-none">
                      ROUND #{(roundResultsData?.round_id || round?.id?.toString() || '0')}
                    </div>
                    {roundResultsData && (
                      <div className="text-[10px] font-black text-white/80 uppercase leading-none">
                        Finalized
                      </div>
                    )}
                  </div>
                </DataSection>
              )}

              {/* Winner and Lottery - Compact */}
              {roundResultsData && (
                <DataSection>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-0.5">
                        Winner
                      </div>
                      <div className="text-sm font-black text-[#ffb84a] leading-none">
                        #{roundResultsData.winning_square !== null && roundResultsData.winning_square !== undefined ? roundResultsData.winning_square + 1 : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/80 uppercase leading-none mb-0.5">
                        Lottery
                      </div>
                      <div className="text-sm font-black text-[#ffb84a] leading-none">
                        {roundResultsData.lottery_outcome === 'Split' ? '🎲 Split' : 
                         roundResultsData.lottery_outcome === 'Single Winner' ? '🎯 Single' : 
                         roundResultsData.lottery_outcome === 'Motherlode' ? '💎 Motherlode' : 
                         roundResultsData.lottery_outcome}
                      </div>
                    </div>
                  </div>
                </DataSection>
              )}

              {/* Total Deployed */}
              {(round || roundResultsData) && (
                <DataSection>
                  <DataRow 
                    label="Total Deployed" 
                    value={roundResultsData 
                      ? (roundResultsData.total_deployed / 1_000_000_000)
                      : lamportsToSol(round?.totalDeployed || 0n)} 
                    valueColor="text-[#ffb84a]" 
                    showUnit 
                    unit="SOL"
                  />
                </DataSection>
              )}

              {/* SOL Distribution - Compact Grid */}
              {roundResultsData && (
                <DataSection title="SOL Distribution">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Winners:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.total_winnings / 1_000_000_000).toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Buyback:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.buyback_amount / 1_000_000_000).toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Stakers:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.staker_amount / 1_000_000_000).toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Admin:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.admin_fee / 1_000_000_000).toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Editions:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.master_edition_amount / 1_000_000_000).toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Motherlode:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.sol_motherlode_amount / 1_000_000_000).toFixed(5)}</span>
                    </div>
                  </div>
                </DataSection>
              )}

              {/* ORE Distribution - Compact Grid */}
              {roundResultsData && (
                <DataSection title="ORE Distribution">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Total ORE:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.total_ore_reward / 1_000_000_000).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Guaranteed:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.ore_guaranteed_pool / 1_000_000_000).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Lottery:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{(roundResultsData.ore_lottery_pool / 1_000_000_000).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/80 leading-none">Winners:</span>
                      <span className="text-[10px] font-black text-[#ffb84a] leading-none">{roundResultsData.num_winners || 0}</span>
                    </div>
                  </div>
                </DataSection>
              )}

              {/* Motherlode Information */}
              {roundResultsData && roundResultsData.motherlode_tier && roundResultsData.motherlode_tier !== 'None' && (
                <DataSection title="Motherlode">
                  <div className="space-y-1">
                    <div className="text-sm font-black text-[#ffb84a] leading-none">
                      {roundResultsData.motherlode_tier === 'Minor' ? 'MINOR 🥉' : 
                       roundResultsData.motherlode_tier === 'Major' ? 'MAJOR 🥈' : 
                       roundResultsData.motherlode_tier === 'Grand' ? 'GRAND 🥇' : 
                       roundResultsData.motherlode_tier}
                    </div>
                    {roundResultsData.ore_motherlode_payout > 0 && (
                      <div className="text-[10px] text-white/80 leading-none">
                        ORE: {(roundResultsData.ore_motherlode_payout / 1_000_000_000).toFixed(2)}
                      </div>
                    )}
                    {roundResultsData.sol_motherlode_payout > 0 && (
                      <div className="text-[10px] text-white/80 leading-none">
                        SOL: {(roundResultsData.sol_motherlode_payout / 1_000_000_000).toFixed(4)}
                      </div>
                    )}
                  </div>
                </DataSection>
              )}

              {/* Miners Info - Compact */}
              {roundResultsData && (
                <DataSection title="Miners">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] text-white/80 leading-none">
                      Total: {roundResultsData.num_miners || (roundResultsData.miners?.length || roundResultsData.winners?.length || 0)}
                    </div>
                  </div>
                  {(() => {
                    const miners = roundResultsData.miners || roundResultsData.winners || [];
                    if (miners.length > 0 && publicKey) {
                      const userMiner = miners.find((m: any) => m.miner === publicKey.toBase58());
                      const minersToShow = userMiner ? [userMiner] : miners.slice(0, 1);
                      
                      return (
                        <div className="space-y-1">
                          {minersToShow.map((miner: any) => {
                            const isMe = miner.miner === publicKey.toBase58();
                            const sol = miner.total_sol_rewards / 1_000_000_000;
                            const ore = miner.total_ore_rewards / 1_000_000_000;
                            const short = `${miner.miner.slice(0, 4)}…${miner.miner.slice(-4)}`;
                            
                            return (
                              <div key={miner.miner} className="bg-black/30 rounded p-1 border border-[rgb(120,63,4)]/20">
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-black text-white/80 leading-none">#{miner.rank}</span>
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
                          })}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </DataSection>
              )}

              {/* Fallback: Show basic round info if no results data */}
              {!roundResultsData && round && (
                <DataSection title="Round Statistics">
                  <div className="space-y-2">
                    <DataRow 
                      label="Total Deployed" 
                      value={lamportsToSol(round.totalDeployed)} 
                      valueColor="text-[#ffb84a]" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Total Winnings" 
                      value={lamportsToSol(round.totalWinnings)} 
                      valueColor="text-[#ffb84a]" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Total Vaulted" 
                      value={lamportsToSol(round.totalVaulted)} 
                      valueColor="text-[#ffb84a]" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Total Miners" 
                      value={round.totalMiners.toString()} 
                      valueColor="text-[#ffb84a]"
                    />
                  </div>
                </DataSection>
              )}

              {/* Empty State */}
              {!round && !roundResultsData && (
                <div className="text-xs text-white/80 text-center py-4 leading-none">
                  No round data available.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}