'use client';

import { useTokenBalance } from '@/hooks/useTokenBalance';
import {
  computeStakeClaimableLamports,
  fetchStake,
  fetchTreasury,
  getStakePDA,
  getTreasuryPDA,
  gramsToOre,
  lamportsToSol,
} from '@/lib/accounts';
import {
  useStakeClaimYield,
  useStakeDeposit,
  useStakeWithdraw,
} from '@/lib/instrucionsHooks';
import type { Stake, Treasury } from '@/lib/types';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const ORE_MINT = 'QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s';

type TabId = 'stake' | 'rewards';

export function StakingPanel() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { deposit } = useStakeDeposit();
  const { withdraw } = useStakeWithdraw();
  const { claimYield } = useStakeClaimYield();

  const [stake, setStake] = useState<Stake | null>(null);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [stakeLoading, setStakeLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('stake');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [claimAmount, setClaimAmount] = useState<string>('');

  const [actionLoading, setActionLoading] = useState<
    'deposit' | 'withdraw' | 'claim' | null
  >(null);

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'stake', label: 'STAKE' },
    { id: 'rewards', label: 'REWARDS' },
  ];

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

  const handleClaim = async () => {
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

  const stakeAddress = useMemo(() => {
    if (!publicKey) return null;
    return getStakePDA(publicKey).toBase58();
  }, [publicKey]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
        Staking
      </h3>

      {/* Main Container with Yellow Background */}
      <div className="bg-cq-primary-yellow rounded-xl border-2 border-black overflow-hidden">
        {/* Tab Navigation - Following CQ-UI-STYLE-GUIDE.md - Connected to content */}
        <div className="flex w-full overflow-visible items-center min-h-[48px] h-12 text-black rounded-tl-full rounded-tr-full px-2.5 sm:px-5 flex-shrink-0 mt-2.5 sm:mt-3">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex h-full justify-center items-center w-full transition-colors duration-200 ${
                  index === 0 ? 'rounded-tl-[20px]' : ''
                } ${
                  index === tabs.length - 1 ? 'rounded-tr-[20px]' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-cq-primary-yellow text-black !opacity-100'
                    : 'bg-white text-black !opacity-100 border border-black'
                }`}
              >
                <p className="text-center w-full text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base uppercase">
                  {tab.label}
                </p>
              </button>
              {index < tabs.length - 1 && (
                <div className="w-[1px] h-full bg-black"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === 'stake' && (
          <div className="space-y-4">
            {/* Stats Section */}
            <div className="bg-black p-3 md:p-4 rounded-lg border-2 border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Wallet $QUEST</span>
                <span className="text-base md:text-lg font-bold text-cq-primary-yellow">
                  {walletOreBalance.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Staked $QUEST</span>
                <span className="text-base md:text-lg font-bold text-cq-primary-yellow">
                  {stakeLoading ? '...' : stakedOre.toFixed(4)}
                </span>
              </div>

              {publicKey && treasury ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-white font-medium">Total Staked (All Users)</span>
                  <span className="text-base md:text-lg font-bold text-cq-primary-yellow">
                    {gramsToOre(treasury.totalStaked).toFixed(2)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70 pt-2 border-t border-cq-primary-yellow/30">
                  <div className="bg-cq-bg-0 rounded p-2 border border-cq-primary-yellow/30">
                    <div className="text-white/70 mb-1">Last Deposit</div>
                    <div className="text-white">
                      {lastDepositAt ? lastDepositAt.toLocaleString() : '—'}
                    </div>
                  </div>
                  <div className="bg-cq-bg-0 rounded p-2 border border-cq-primary-yellow/30">
                    <div className="text-white/70 mb-1">Last Withdraw</div>
                    <div className="text-white">
                      {lastWithdrawAt ? lastWithdrawAt.toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Deposit */}
              <div className="bg-black p-3 rounded-lg border-2 border-black space-y-2">
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
                <button
                  onClick={handleDeposit}
                  disabled={!publicKey || actionLoading !== null}
                  className="w-full px-4 py-2 bg-cq-primary-yellow hover:opacity-90 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm uppercase active:opacity-80 border-2 border-black"
                >
                  {actionLoading === 'deposit' ? 'Depositing...' : 'Deposit'}
                </button>
              </div>

              {/* Withdraw */}
              <div className="bg-black p-3 rounded-lg border-2 border-black space-y-2">
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
                <button
                  onClick={handleWithdraw}
                  disabled={!publicKey || !stake || stakedOre <= 0 || actionLoading !== null}
                  className="w-full px-4 py-2 bg-cq-primary-yellow hover:opacity-90 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm uppercase active:opacity-80 border-2 border-black"
                >
                  {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {/* Rewards Stats Section */}
            <div className="bg-black p-3 md:p-4 rounded-lg border-2 border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Claimable Yield (SOL)</span>
                <span className="text-base md:text-lg font-bold text-cq-primary-yellow">
                  {stakeLoading ? '...' : claimableYield.toFixed(9)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-white font-medium">Lifetime Yield (SOL)</span>
                <span className="text-base md:text-lg font-bold text-cq-primary-yellow">
                  {stakeLoading ? '...' : lifetimeYield.toFixed(9)}
                </span>
              </div>

              {!publicKey ? (
                <div className="text-xs text-white/70 text-center py-2">Connect your wallet to view rewards.</div>
              ) : stake === null ? (
                <div className="text-xs text-white/70 text-center py-2">
                  No stake account yet. Make a deposit to start earning rewards.
                </div>
              ) : claimableYield <= 0 ? (
                <div className="text-xs text-white/70 text-center py-2">
                  No claimable yield available at this time.
                </div>
              ) : null}

              {stake && (
                <div className="bg-cq-bg-0 rounded p-2 border border-cq-primary-yellow/30 pt-2 mt-2">
                  <div className="text-xs text-white/70 mb-1">Last Claim</div>
                  <div className="text-white">
                    {lastClaimAt ? lastClaimAt.toLocaleString() : '—'}
                  </div>
                </div>
              )}
            </div>

            {/* Claim Action */}
            <div className="bg-black p-3 rounded-lg border-2 border-black space-y-2">
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
              <button
                onClick={handleClaim}
                disabled={!publicKey || !stake || claimableYield <= 0 || actionLoading !== null}
                className="w-full px-4 py-2 bg-cq-primary-yellow hover:opacity-90 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm uppercase active:opacity-80 border-2 border-black"
              >
                {actionLoading === 'claim' ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
