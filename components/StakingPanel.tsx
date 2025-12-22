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
  const { miner, round, previousRound } = useRoundData();
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
  const DataRow = ({ label, value, valueColor = 'text-white', showUnit = false, unit = '' }: {
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
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase leading-none">
          {label}
        </span>
        <span className={`text-sm sm:text-base font-black ${valueColor} leading-none`}>
          {formattedValue}
          {showUnit && unit && <span className="ml-1 text-xs">{unit}</span>}
        </span>
      </div>
    );
  };

  const DataSection = ({ title, children, className = '' }: {
    title?: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`bg-black border-2 border-[rgb(120,63,4)]/30 p-3 md:p-4 rounded-lg ${className}`}>
      {title && (
        <div className="text-xs sm:text-sm font-black text-white uppercase mb-3 pb-2 border-b border-[rgb(120,63,4)]/30">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* STAKE TAB */}
          {activeTab === 'stake' && (
            <div className="space-y-4">
              {/* Balance Overview Section */}
              <DataSection title="Balance Overview">
                <div className="space-y-2">
                  <DataRow 
                    label="Wallet $QUEST" 
                    value={walletOreBalance} 
                    valueColor="text-[#FFD700]" 
                    showUnit 
                    unit="QUEST"
                  />
                  <DataRow 
                    label="Staked $QUEST" 
                    value={stakeLoading ? 0 : stakedOre} 
                    valueColor="text-[#FFD700]" 
                    showUnit 
                    unit="QUEST"
                  />
                  {publicKey && treasury && (
                    <div className="pt-2 border-t border-[rgb(120,63,4)]/30">
                      <DataRow 
                        label="Total Staked (All Users)" 
                        value={gramsToOre(treasury.totalStaked)} 
                        valueColor="text-white/80" 
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
                      valueColor="text-[#FFD700]" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Lifetime Yield" 
                      value={lifetimeYield} 
                      valueColor="text-white/80" 
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
                      <div className="text-[10px] sm:text-xs font-black text-white/70 uppercase leading-none mb-1">
                        Stake PDA
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-white/80 break-all leading-tight">
                        {getStakePDA(publicKey).toBase58()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[rgb(120,63,4)]/30">
                      <div>
                        <div className="text-[10px] font-black text-white/70 uppercase leading-none mb-1">
                          Last Deposit
                        </div>
                        <div className="text-xs font-black text-white leading-none">
                          {lastDepositAt ? lastDepositAt.toLocaleString() : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white/70 uppercase leading-none mb-1">
                          Last Withdraw
                        </div>
                        <div className="text-xs font-black text-white leading-none">
                          {lastWithdrawAt ? lastWithdrawAt.toLocaleString() : '—'}
                        </div>
                      </div>
                      {lastClaimAt && (
                        <div>
                          <div className="text-[10px] font-black text-white/70 uppercase leading-none mb-1">
                            Last Claim
                          </div>
                          <div className="text-xs font-black text-white leading-none">
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
                <div className="text-xs text-white/70 text-center py-4">
                  Connect your wallet to stake.
                </div>
              )}
              {publicKey && stake === null && !stakeLoading && (
                <div className="text-xs text-white/70 text-center py-4">
                  No stake account yet. Make a deposit to create one.
                </div>
              )}

              {/* Claim Yield Section */}
              {stake && treasury && claimableYield > 0 && (
                <DataSection title="Claim Yield">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        placeholder="0.0"
                        step="0.0001"
                        min="0"
                        className="flex-1 px-3 py-2 bg-cq-bg-0 text-white border-2 border-cq-primary-yellow rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cq-primary-yellow/50 focus:border-cq-primary-yellow"
                      />
                      <button
                        onClick={() => setClaimAmount(claimableYield.toFixed(9))}
                        disabled={!publicKey || !stake || claimableYield <= 0}
                        className="px-3 py-2 bg-cq-primary-yellow hover:opacity-90 text-black text-xs font-black uppercase rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        Max
                      </button>
                    </div>
                    <GlossyButton
                      onClick={handleClaimYield}
                      disabled={!publicKey || !stake || claimableYield <= 0 || actionLoading !== null}
                      size="sm"
                      variant="success"
                      className="w-full !min-h-[40px]"
                    >
                      {actionLoading === 'claim' ? 'Claiming...' : 'Claim Rewards'}
                    </GlossyButton>
                  </div>
                </DataSection>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Deposit */}
                <DataSection title="Deposit">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        placeholder="0.0"
                        step="0.0001"
                        min="0"
                        className="flex-1 px-3 py-2 bg-cq-bg-0 text-white border-2 border-cq-primary-yellow rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cq-primary-yellow/50 focus:border-cq-primary-yellow"
                      />
                      <button
                        onClick={() => setDepositAmount(Number(walletOreBalance.toFixed(9)))}
                        disabled={!publicKey}
                        className="px-3 py-2 bg-cq-primary-yellow hover:opacity-90 text-black text-xs font-black uppercase rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        Max
                      </button>
                    </div>
                    <GlossyButton
                      onClick={handleDeposit}
                      disabled={!publicKey || actionLoading !== null}
                      size="sm"
                      className="w-full !min-h-[40px]"
                    >
                      {actionLoading === 'deposit' ? 'Depositing...' : 'Deposit'}
                    </GlossyButton>
                  </div>
                </DataSection>

                {/* Withdraw */}
                <DataSection title="Withdraw">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        placeholder="0.0"
                        step="0.0001"
                        min="0"
                        className="flex-1 px-3 py-2 bg-cq-bg-0 text-white border-2 border-cq-primary-yellow rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cq-primary-yellow/50 focus:border-cq-primary-yellow"
                      />
                      <button
                        onClick={() => setWithdrawAmount(Number(stakedOre.toFixed(9)))}
                        disabled={!publicKey || !stake || stakedOre <= 0}
                        className="px-3 py-2 bg-cq-primary-yellow hover:opacity-90 text-black text-xs font-black uppercase rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
                      >
                        Max
                      </button>
                    </div>
                    <GlossyButton
                      onClick={handleWithdraw}
                      disabled={!publicKey || !stake || stakedOre <= 0 || actionLoading !== null}
                      size="sm"
                      className="w-full !min-h-[40px]"
                    >
                      {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw'}
                    </GlossyButton>
                  </div>
                </DataSection>
              </div>
            </div>
          )}

          {/* CLAIM TAB */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              {/* Current Round Rewards Section */}
              <DataSection title="Current Round Rewards">
                <div className="space-y-2">
                  <DataRow 
                    label="SOL Rewards" 
                    value={roundRewardsSol} 
                    valueColor="text-[#FFD700]" 
                    showUnit 
                    unit="SOL"
                  />
                  <DataRow 
                    label="Unrefined $QUEST" 
                    value={roundRewardsOre} 
                    valueColor="text-[#FFD700]" 
                    showUnit 
                    unit="QUEST"
                  />
                  <DataRow 
                    label="Refined $QUEST" 
                    value={refinedOre} 
                    valueColor="text-[#FFD700]" 
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
                    valueColor="text-white/80" 
                    showUnit 
                    unit="SOL"
                  />
                  <DataRow 
                    label="Lifetime $QUEST Rewards" 
                    value={lifetimeRewardsOre} 
                    valueColor="text-white/80" 
                    showUnit 
                    unit="QUEST"
                  />
                </div>
              </DataSection>

              {/* Empty States */}
              {!publicKey && (
                <div className="text-xs text-white/70 text-center py-4">
                  Connect your wallet to view round rewards.
                </div>
              )}
              {publicKey && !miner && (
                <div className="text-xs text-white/70 text-center py-4">
                  No miner account found. Deploy to squares to start earning rewards.
                </div>
              )}
              {publicKey && miner && roundRewardsSol === 0 && roundRewardsOre === 0 && refinedOre === 0 && (
                <div className="text-xs text-white/70 text-center py-4">
                  No claimable rewards available at this time.
                </div>
              )}

              {/* Claim Actions */}
              {(roundRewardsSol > 0 || roundRewardsOre > 0 || refinedOre > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <GlossyButton
                    onClick={handleClaimSol}
                    disabled={!publicKey || !miner || roundRewardsSol === 0 || actionLoading !== null}
                    size="sm"
                    variant="primary"
                    className="w-full !min-h-[40px]"
                  >
                    {actionLoading === 'claimSol' ? 'Claiming...' : 'Claim SOL'}
                  </GlossyButton>

                  <GlossyButton
                    onClick={handleClaimOre}
                    disabled={!publicKey || !miner || roundRewardsOre === 0 || actionLoading !== null}
                    size="sm"
                    variant="primary"
                    className="w-full !min-h-[40px]"
                  >
                    {actionLoading === 'claimOre' ? 'Claiming...' : 'Claim QUEST'}
                  </GlossyButton>

                  <GlossyButton
                    onClick={handleClaimAllRound}
                    disabled={!publicKey || !miner || (roundRewardsSol === 0 && roundRewardsOre === 0 && refinedOre === 0) || actionLoading !== null}
                    size="sm"
                    variant="success"
                    className="w-full !min-h-[40px]"
                  >
                    {actionLoading === 'claimAll' ? 'Claiming...' : 'Claim All'}
                  </GlossyButton>
                </div>
              )}
            </div>
          )}

          {/* ROUND TAB */}
          {activeTab === 'round' && (
            <div className="space-y-4">
              {/* Round Header */}
              {round && (
                <DataSection>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-black text-[#FFD700] uppercase mb-1">
                      ROUND #{round.id.toString()}
                    </div>
                    {previousRound && (
                      <div className="text-xs text-white/70">
                        Previous: Round #{previousRound.id.toString()}
                      </div>
                    )}
                  </div>
                </DataSection>
              )}

              {/* Round Statistics Section */}
              {round && (
                <DataSection title="Round Statistics">
                  <div className="space-y-2">
                    <DataRow 
                      label="Total Deployed" 
                      value={lamportsToSol(round.totalDeployed)} 
                      valueColor="text-white" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Total Winnings" 
                      value={lamportsToSol(round.totalWinnings)} 
                      valueColor="text-white" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Total Vaulted" 
                      value={lamportsToSol(round.totalVaulted)} 
                      valueColor="text-white" 
                      showUnit 
                      unit="SOL"
                    />
                    <DataRow 
                      label="Total Miners" 
                      value={round.totalMiners.toString()} 
                      valueColor="text-white"
                    />
                  </div>
                </DataSection>
              )}

              {/* Round Outcome Section */}
              {round && round.slotHash && round.slotHash.some(b => b !== 0) && (
                <DataSection title="Round Outcome">
                  <div className="space-y-2">
                    <DataRow 
                      label="Winning Square" 
                      value={`#${getWinningSquare(round.slotHash) !== null ? (getWinningSquare(round.slotHash)! + 1) : '—'}`} 
                      valueColor="text-[#FFD700]"
                    />
                    <DataRow 
                      label="Top Miner Reward" 
                      value={gramsToOre(round.topMinerReward)} 
                      valueColor="text-white" 
                      showUnit 
                      unit="QUEST"
                    />
                    <DataRow 
                      label="Lottery Outcome" 
                      value={round.lotteryOutcome === 0 ? 'Split' : round.lotteryOutcome === 1 ? 'Single Winner' : 'Motherlode'} 
                      valueColor="text-white"
                    />
                  </div>
                </DataSection>
              )}

              {/* Motherlode Information Section */}
              {round && round.motherlodeTier > 0 && (
                <DataSection title="Motherlode Information">
                  <div className="space-y-2">
                    <DataRow 
                      label="Motherlode Tier" 
                      value={round.motherlodeTier === 1 ? 'Minor' : round.motherlodeTier === 2 ? 'Major' : 'Grand'} 
                      valueColor="text-[#FFD700]"
                    />
                    {round.solMotherlodePayout > 0n && (
                      <DataRow 
                        label="Motherlode SOL Payout" 
                        value={lamportsToSol(round.solMotherlodePayout)} 
                        valueColor="text-white" 
                        showUnit 
                        unit="SOL"
                      />
                    )}
                    {round.oreMotherlodePayout > 0n && (
                      <DataRow 
                        label="Motherlode QUEST Payout" 
                        value={gramsToOre(round.oreMotherlodePayout)} 
                        valueColor="text-white" 
                        showUnit 
                        unit="QUEST"
                      />
                    )}
                  </div>
                </DataSection>
              )}

              {/* Empty State */}
              {!round && (
                <div className="text-xs text-white/70 text-center py-4">
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