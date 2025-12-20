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
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const ORE_MINT = 'QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s';

export function StakingPanel() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { deposit } = useStakeDeposit();
  const { withdraw } = useStakeWithdraw();
  const { claimYield } = useStakeClaimYield();

  const [stake, setStake] = useState<Stake | null>(null);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [stakeLoading, setStakeLoading] = useState(false);

  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [claimAmount, setClaimAmount] = useState<string>('');

  const [actionLoading, setActionLoading] = useState<
    'deposit' | 'withdraw' | 'claim' | null
  >(null);

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

      <div className="bg-gray-900/50 p-3 md:p-4 rounded-lg border border-gray-700/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-300 font-medium">Wallet $QUEST</span>
          <span className="text-base md:text-lg font-bold text-orange-400">
            {walletOreBalance.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-300 font-medium">Staked $QUEST</span>
          <span className="text-base md:text-lg font-bold text-orange-400">
            {stakeLoading ? '...' : stakedOre.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-300 font-medium">Claimable Yield (SOL)</span>
          <span className="text-base md:text-lg font-bold text-purple-300">
            {stakeLoading ? '...' : claimableYield.toFixed(9)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-300 font-medium">Lifetime Yield (SOL)</span>
          <span className="text-base md:text-lg font-bold text-purple-300">
            {stakeLoading ? '...' : lifetimeYield.toFixed(9)}
          </span>
        </div>

        {publicKey && stakeAddress ? (
          <div className="text-xs text-gray-500 font-mono break-all">
            Stake PDA: {stakeAddress}
          </div>
        ) : null}

        {publicKey && treasury ? (
          <div className="text-xs text-gray-500 font-mono break-all">
            Total Staked: {gramsToOre(treasury.totalStaked)}
          </div>
        ) : null}

        {!publicKey ? (
          <div className="text-xs text-gray-500">Connect your wallet to stake.</div>
        ) : stake === null ? (
          <div className="text-xs text-gray-500">
            No stake account yet. Make a deposit to create one.
          </div>
        ) : null}

        {stake ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
            <div className="bg-gray-800/40 rounded p-2 border border-gray-700/30">
              <div className="text-gray-500">Last Deposit</div>
              <div className="text-gray-200">
                {lastDepositAt ? lastDepositAt.toLocaleString() : '—'}
              </div>
            </div>
            <div className="bg-gray-800/40 rounded p-2 border border-gray-700/30">
              <div className="text-gray-500">Last Withdraw</div>
              <div className="text-gray-200">
                {lastWithdrawAt ? lastWithdrawAt.toLocaleString() : '—'}
              </div>
            </div>
            <div className="bg-gray-800/40 rounded p-2 border border-gray-700/30">
              <div className="text-gray-500">Last Claim</div>
              <div className="text-gray-200">
                {lastClaimAt ? lastClaimAt.toLocaleString() : '—'}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 space-y-2">
          <div className="text-xs text-gray-400">Deposit</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              placeholder="0.0"
              step="0.0001"
              min="0"
              className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setDepositAmount(Number(walletOreBalance.toFixed(9)))}
              disabled={!publicKey}
              className="px-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-xs rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>
          <button
            onClick={handleDeposit}
            disabled={!publicKey || actionLoading !== null}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
          >
            {actionLoading === 'deposit' ? 'Depositing...' : 'Deposit'}
          </button>
        </div>

        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 space-y-2">
          <div className="text-xs text-gray-400">Withdraw</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              placeholder="0.0"
              step="0.0001"
              min="0"
              className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setWithdrawAmount(Number(stakedOre.toFixed(9)))}
              disabled={!publicKey || !stake || stakedOre <= 0}
              className="px-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-xs rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={!publicKey || !stake || stakedOre <= 0 || actionLoading !== null}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
          >
            {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>

        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 space-y-2">
          <div className="text-xs text-gray-400">Claim Yield</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="0.0"
              step="0.0001"
              min="0"
              className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setClaimAmount(claimableYield.toFixed(9))}
              disabled={!publicKey || !stake || claimableYield <= 0}
              className="px-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-xs rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>
          <button
            onClick={handleClaim}
            disabled={!publicKey || !stake || claimableYield <= 0 || actionLoading !== null}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
          >
            {actionLoading === 'claim' ? 'Claiming...' : 'Claim'}
          </button>
        </div>
      </div>
    </div>
  );
}
