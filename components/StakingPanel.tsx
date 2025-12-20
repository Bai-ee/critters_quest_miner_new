'use client';

import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useRoundData } from '@/hooks/useRoundData';
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

  return (
    <div className="space-y-4">
      {/* Main Container with Yellow Background */}
      <div className="rounded-xl border-2 border-black overflow-hidden" style={{ backgroundColor: '#ffb84a' }}>
        {/* Tab Navigation - Glossy style similar to MINE/AUTO MINE */}
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
            {/* Sliding indicator - Black glossy for active tab */}
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

            {/* Tab buttons */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === 'stake' && (
          <div className="space-y-4">
            {/* Stats Section */}
            <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 md:p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Wallet $QUEST</span>
                <span className="text-base md:text-lg font-bold text-[#FFD700]">
                  {walletOreBalance.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Staked $QUEST</span>
                <span className="text-base md:text-lg font-bold text-[#FFD700]">
                  {stakeLoading ? '...' : stakedOre.toFixed(4)}
                </span>
              </div>

              {publicKey && treasury ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-white font-medium">Total Staked (All Users)</span>
                  <span className="text-base md:text-lg font-bold text-[#FFD700]">
                    {gramsToOre(treasury.totalStaked).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {stake && treasury ? (
                <>
                  <div className="flex items-center justify-between pt-2 border-t border-[rgb(120,63,4)]/30">
                    <span className="text-xs md:text-sm text-white font-medium">Claimable Yield (SOL)</span>
                    <span className="text-base md:text-lg font-bold text-[#FFD700]">
                      {claimableYield.toFixed(9)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-white font-medium">Lifetime Yield (SOL)</span>
                    <span className="text-base md:text-lg font-bold text-[#FFD700]">
                      {lifetimeYield.toFixed(9)}
                    </span>
                  </div>
                </>
              ) : null}

              {publicKey && stake ? (
                <div className="flex items-center justify-between pt-2 border-t border-[rgb(120,63,4)]/30">
                  <span className="text-xs md:text-sm text-white font-medium">Stake PDA</span>
                  <span className="text-[10px] md:text-xs font-mono text-white/80 break-all text-right max-w-[60%]">
                    {getStakePDA(publicKey).toBase58()}
                  </span>
                </div>
              ) : null}

              {!publicKey ? (
                <div className="text-xs text-white/70 text-center py-2">Connect your wallet to stake.</div>
              ) : stake === null ? (
                <div className="text-xs text-white/70 text-center py-2">
                  No stake account yet. Make a deposit to create one.
                </div>
              ) : null}

              {stake && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70 pt-2 border-t border-[rgb(120,63,4)]/30">
                  <div className="bg-black/50 rounded p-2 border border-[rgb(120,63,4)]/30">
                    <div className="text-white/70 mb-1">Last Deposit</div>
                    <div className="text-white">
                      {lastDepositAt ? lastDepositAt.toLocaleString() : '—'}
                    </div>
                  </div>
                  <div className="bg-black/50 rounded p-2 border border-[rgb(120,63,4)]/30">
                    <div className="text-white/70 mb-1">Last Withdraw</div>
                    <div className="text-white">
                      {lastWithdrawAt ? lastWithdrawAt.toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Claim Yield Section */}
            {stake && treasury && (
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 rounded-lg space-y-2">
                <div className="text-xs text-white uppercase font-semibold">Claim Yield</div>
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
                    className="px-2 py-2 bg-cq-primary-yellow hover:opacity-90 text-black text-xs rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
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
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Deposit */}
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 rounded-lg space-y-2">
                <div className="text-xs text-white uppercase font-semibold">Deposit</div>
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
                    className="px-2 py-2 bg-cq-primary-yellow hover:opacity-90 text-black text-xs rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
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

              {/* Withdraw */}
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 rounded-lg space-y-2">
                <div className="text-xs text-white uppercase font-semibold">Withdraw</div>
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
                    className="px-2 py-2 bg-cq-primary-yellow hover:opacity-90 text-black text-xs rounded-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80"
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
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {/* Round Rewards Stats Section */}
            <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 md:p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">SOL Rewards</span>
                <span className="text-base md:text-lg font-bold text-[#FFD700]">
                  {roundRewardsSol.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Unrefined $QUEST</span>
                <span className="text-base md:text-lg font-bold text-[#FFD700]">
                  {roundRewardsOre.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Refined $QUEST</span>
                <span className="text-base md:text-lg font-bold text-[#FFD700]">
                  {refinedOre.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[rgb(120,63,4)]/30">
                <span className="text-xs md:text-sm text-white/70 font-medium">Lifetime SOL Rewards</span>
                <span className="text-sm font-bold text-white/80">
                  {lifetimeRewardsSol.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white/70 font-medium">Lifetime $QUEST Rewards</span>
                <span className="text-sm font-bold text-white/80">
                  {lifetimeRewardsOre.toFixed(2)}
                </span>
              </div>

              {!publicKey ? (
                <div className="text-xs text-white/70 text-center py-2">Connect your wallet to view round rewards.</div>
              ) : !miner ? (
                <div className="text-xs text-white/70 text-center py-2">
                  No miner account found. Deploy to squares to start earning rewards.
                </div>
              ) : roundRewardsSol === 0 && roundRewardsOre === 0 && refinedOre === 0 ? (
                <div className="text-xs text-white/70 text-center py-2">
                  No claimable rewards available at this time.
                </div>
              ) : null}
            </div>

            {/* Claim Actions */}
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
          </div>
        )}

        {activeTab === 'round' && (
          <div className="space-y-4">
            {/* Round Header */}
            {round && (
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 md:p-4 rounded-lg">
                <div className="text-lg md:text-xl font-black text-[#FFD700] uppercase mb-2">
                  ROUND #{round.id.toString()}
                </div>
                {previousRound && (
                  <div className="text-xs text-white/70">
                    Previous: Round #{previousRound.id.toString()}
                  </div>
                )}
              </div>
            )}

            {/* Round Information */}
            {round && (
              <div className="bg-black border-2 border-[rgb(120,63,4)]/30 p-3 md:p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-white/70 font-medium">Total Deployed</span>
                  <span className="text-sm font-bold text-white/80">
                    {lamportsToSol(round.totalDeployed).toFixed(4)} SOL
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-white/70 font-medium">Total Winnings</span>
                  <span className="text-sm font-bold text-white/80">
                    {lamportsToSol(round.totalWinnings).toFixed(4)} SOL
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-white/70 font-medium">Total Vaulted</span>
                  <span className="text-sm font-bold text-white/80">
                    {lamportsToSol(round.totalVaulted).toFixed(4)} SOL
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-white/70 font-medium">Total Miners</span>
                  <span className="text-sm font-bold text-white/80">
                    {round.totalMiners.toString()}
                  </span>
                </div>

                {round.slotHash && round.slotHash.some(b => b !== 0) && (
                  <>
                    <div className="flex items-center justify-between pt-2 border-t border-[rgb(120,63,4)]/30">
                      <span className="text-xs md:text-sm text-white/70 font-medium">Winning Square</span>
                      <span className="text-sm font-bold text-white/80">
                        #{getWinningSquare(round.slotHash) !== null ? (getWinningSquare(round.slotHash)! + 1) : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-white/70 font-medium">Top Miner Reward</span>
                      <span className="text-sm font-bold text-white/80">
                        {gramsToOre(round.topMinerReward).toFixed(2)} QUEST
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-white/70 font-medium">Lottery Outcome</span>
                      <span className="text-sm font-bold text-white/80 uppercase">
                        {round.lotteryOutcome === 0 ? 'Split' : round.lotteryOutcome === 1 ? 'Single Winner' : 'Motherlode'}
                      </span>
                    </div>

                    {round.motherlodeTier > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-white/70 font-medium">Motherlode Tier</span>
                        <span className="text-sm font-bold text-white/80 uppercase">
                          {round.motherlodeTier === 1 ? 'Minor' : round.motherlodeTier === 2 ? 'Major' : 'Grand'}
                        </span>
                      </div>
                    )}

                    {round.solMotherlodePayout > 0n && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-white/70 font-medium">Motherlode SOL Payout</span>
                        <span className="text-sm font-bold text-white/80">
                          {lamportsToSol(round.solMotherlodePayout).toFixed(4)} SOL
                        </span>
                      </div>
                    )}

                    {round.oreMotherlodePayout > 0n && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-white/70 font-medium">Motherlode QUEST Payout</span>
                        <span className="text-sm font-bold text-white/80">
                          {gramsToOre(round.oreMotherlodePayout).toFixed(2)} QUEST
                        </span>
                      </div>
                    )}
                  </>
                )}

                {!round && (
                  <div className="text-xs text-white/70 text-center py-2">No round data available.</div>
                )}
              </div>
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
