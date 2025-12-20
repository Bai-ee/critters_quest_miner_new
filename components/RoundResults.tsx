'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRoundData } from '@/hooks/useRoundData';
import { WinLossHistory } from './WinLossHistory';

interface RoundResultsProps {
  onShownChange?: (shown: boolean) => void;
  onWinningSquareChange?: (winningSquare: number | null) => void;
}

interface RoundData {
  round_id: number;
  winning_square: number;
  top_miner: string;
  num_miners?: number;
  num_winners: number;
  total_deployed: number;
  total_winnings: number;
  lottery_outcome: string;
  motherlode_tier: string;
  ore_motherlode_payout: number;
  sol_motherlode_payout: number;
  admin_fee: number;
  buyback_amount: number;
  staker_amount: number;
  master_edition_amount: number;
  sol_motherlode_amount: number;
  total_ore_reward: number;
  ore_guaranteed_pool: number;
  ore_lottery_pool: number;
  miners?: Array<{
    miner: string;
    sol_reward: number;
    ore_reward_guaranteed: number;
    ore_reward_lottery: number;
    motherlode_ore_reward: number;
    motherlode_sol_reward: number;
    total_ore_rewards: number;
    total_sol_rewards: number;
    is_lottery_winner: boolean;
    rank: number;
  }>;
  winners?: Array<{
    miner: string;
    sol_reward: number;
    ore_reward_guaranteed: number;
    ore_reward_lottery: number;
    motherlode_ore_reward: number;
    motherlode_sol_reward: number;
    total_ore_rewards: number;
    total_sol_rewards: number;
    is_lottery_winner: boolean;
    rank: number;
  }>;
}

const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;
const gramsToOre = (grams: number) => grams / 1_000_000_000;

export function RoundResults({ onShownChange, onWinningSquareChange }: RoundResultsProps) {
  const { publicKey } = useWallet();
  const { board } = useRoundData();
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const refetchAttemptsRef = useRef(0);

  const boardRoundId = useMemo(() => {
    if (!board) return null;
    const asNumber = Number(board.roundId);
    if (!Number.isFinite(asNumber)) return null;
    return asNumber;
  }, [board]);

  const shown = useMemo(() => {
    return Boolean(roundData) && visible;
  }, [roundData, visible]);

  useEffect(() => {
    // Used by parent to stop grid animations once RoundResults auto-hides.
    // This is independent of viewport visibility.
    onShownChange?.(shown);

    // Pass winning square to parent when results are shown
    if (shown && roundData) {
      const winningSquare = roundData.winning_square;
      onWinningSquareChange?.(winningSquare);
    } else {
      onWinningSquareChange?.(null);
    }
  }, [onShownChange, onWinningSquareChange, shown, visible, roundData]);

  useEffect(() => {
    // Initial fetch happens in the subscription effect below.
  }, []);

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        const response = await fetch('/api/rounds/latest', { cache: 'no-store' });

        if (response.status === 503) {
          if (refetchAttemptsRef.current < 8) {
            refetchAttemptsRef.current += 1;
            setTimeout(fetchRoundData, 250 * refetchAttemptsRef.current);
          }
          return;
        }

        const result = await response.json();

        if (result.success && result.data) {
          const newRoundId = result.data.round_id;
          const numMiners = Number(result.data.num_miners);
          const minersLength = Number(result.data.miners.length);

          const missingWinningSquare = Array.isArray(result.data.miners)
            ? result.data.miners.some((m: any) => m?.winning_square === null || m?.winning_square === undefined)
            : true;

          // If we don't yet know the current round from chain, avoid fetching.
          if (boardRoundId == null) {
            setLoading(true);
            return;
          }


          const minersComplete = Number.isFinite(numMiners) ? numMiners === minersLength : minersLength > 0;
          const dataComplete = minersComplete && !missingWinningSquare;

          if (!dataComplete && refetchAttemptsRef.current < 8) {
            refetchAttemptsRef.current += 1;
            setTimeout(fetchRoundData, 250 * refetchAttemptsRef.current);
            return;
          }

          refetchAttemptsRef.current = 0;

          // Check if this is a new round (round ID changed)
          if ((newRoundId === boardRoundId - 1 || newRoundId === boardRoundId) && dataComplete) {
            // New round started, show results and start timer
            setRoundData(result.data);
            setVisible(true);
          } else {
            setRoundData(null);
            setVisible(false);
            fetchRoundData();
          }
        } else {
          setRoundData(null);
        }
      } catch (error) {
        console.error('Error fetching round data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Round changed on-chain: reset local display and fetch current round results.
    setRoundData(null);
    setVisible(false);
    setLoading(true);

    refetchAttemptsRef.current = 0;

    fetchRoundData();

  }, [boardRoundId]);

  // Auto-hide after 20 seconds from when round results were first received
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [visible]);


  // Show WinLossHistory when no round data is available
  if (!roundData || !visible) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4 text-black/60 text-sm font-black uppercase">
          <p>Deploy to squares to participate</p>
        </div>
        <WinLossHistory />
      </div>
    );
  }

  // Convert lamports to SOL
  const totalDeployed = lamportsToSol(roundData.total_deployed);
  const totalWinnings = lamportsToSol(roundData.total_winnings);
  const adminFee = lamportsToSol(roundData.admin_fee);
  const buyback = lamportsToSol(roundData.buyback_amount);
  const stakers = lamportsToSol(roundData.staker_amount);
  const masterEditions = lamportsToSol(roundData.master_edition_amount);
  const solMotherlode = lamportsToSol(roundData.sol_motherlode_amount);
  const solMotherlodePayout = lamportsToSol(roundData.sol_motherlode_payout);
  const oreMotherlodePayout = gramsToOre(roundData.ore_motherlode_payout);

  const miners = (roundData.miners ?? roundData.winners) ?? [];

  const userMiner = publicKey
    ? miners.find((m) => m.miner === publicKey.toBase58())
    : null;

  const getLotteryOutcomeName = (outcome: string) => {
    switch (outcome) {
      case 'Split': return '🎲 Split';
      case 'Single Winner': return '🎯 Single Winner';
      case 'Motherlode': return '💎 Motherlode';
      default: return outcome;
    }
  };

  const getMotherlodeTierName = (tier: string) => {
    switch (tier) {
      case 'Minor': return 'MINOR 🥉';
      case 'Major': return 'MAJOR 🥈';
      case 'Grand': return 'GRAND 🥇';
      default: return null;
    }
  };

  const motherlodeTierName = getMotherlodeTierName(roundData.motherlode_tier);
  const isUserTopWinner = publicKey && roundData.top_miner === publicKey.toBase58();

  return (
    <div className="bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>🏆</span>
          Round #{roundData.round_id} Results
        </h2>
        <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/50">
          Finalized
        </span>
      </div>

      {/* Compact Grid Layout */}
      <div className="space-y-3">
        {/* Round Summary - First Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-600/50">
            <div className="text-xs text-gray-400">Winner</div>
            <div className="text-sm font-bold text-white truncate">#{roundData.winning_square + 1}</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-500/30">
            <div className="text-xs text-gray-400">Lottery</div>
            <div className="text-sm font-bold text-purple-300">{getLotteryOutcomeName(roundData.lottery_outcome)}</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/30">
            <div className="text-xs text-gray-400">Total Deployed</div>
            <div className="text-sm font-bold text-blue-300">{totalDeployed.toFixed(2)} SOL</div>
          </div>
        </div>

        {/* SOL Distribution - Second Row */}
        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-600/40">
          <div className="text-xs text-gray-400 mb-2 font-semibold">SOL Distribution</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Winners:</span><span className="text-green-400 font-bold">{totalWinnings.toFixed(5)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Buyback:</span><span className="text-blue-400 font-bold">{buyback.toFixed(5)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Stakers:</span><span className="text-purple-400 font-bold">{stakers.toFixed(5)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Admin:</span><span className="text-gray-400 font-bold">{adminFee.toFixed(5)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Editions:</span><span className="text-yellow-400 font-bold">{masterEditions.toFixed(5)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Motherlode:</span><span className="text-orange-400 font-bold">{solMotherlode.toFixed(5)}</span></div>
          </div>
        </div>

        {/* ORE Distribution - Third Row */}
        <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
          <div className="text-xs text-gray-400 mb-2 font-semibold">ORE Distribution</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Total ORE:</span><span className="text-orange-400 font-bold">{gramsToOre(roundData.total_ore_reward).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Guaranteed:</span><span className="text-green-400 font-bold">{gramsToOre(roundData.ore_guaranteed_pool).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Lottery:</span><span className="text-purple-400 font-bold">{gramsToOre(roundData.ore_lottery_pool).toFixed(2)}</span></div>
          </div>
          <div className="mt-2 text-[10px] text-gray-500">
            {roundData.lottery_outcome === 'Split' && '50% guaranteed + 50% lottery (both split proportionally to all winners)'}
            {roundData.lottery_outcome === 'Single Winner' && '50% guaranteed split + 50% lottery to one weighted winner'}
            {roundData.lottery_outcome === 'Motherlode' && '50% guaranteed split + 50% lottery went to motherlode'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Winners:</span><span className="text-white font-bold">{roundData.num_winners}</span></div>
          </div>
        </div>

        {/* Motherlode Hit */}
        {motherlodeTierName && (
          <div className="bg-linear-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-3 border border-yellow-500/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Motherlode Hit!</div>
                <div className="text-lg font-bold text-yellow-300">{motherlodeTierName}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Payout</div>
                <div className="text-sm font-bold text-orange-400">{oreMotherlodePayout.toFixed(2)} ORE</div>
                <div className="text-sm font-bold text-yellow-400">{solMotherlodePayout.toFixed(4)} SOL</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-600/40">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400 font-semibold">Miners</div>
            <div className="text-[10px] text-gray-500">
              {roundData.num_miners ?? miners.length} total
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              const rest = userMiner
                ? miners.filter((m) => m.miner !== userMiner.miner)
                : miners;

              const ordered = userMiner ? [userMiner, ...rest] : rest;

              return ordered.map((miner) => {
                const isMe = Boolean(publicKey && miner.miner === publicKey.toBase58());
                const short = miner.miner ? `${miner.miner.slice(0, 4)}…${miner.miner.slice(-4)}` : 'Unknown';
                const sol = lamportsToSol(miner.total_sol_rewards);
                const ore = gramsToOre(miner.total_ore_rewards);
                const solDisplay = sol > 0 && sol < 0.000001 ? '<0.000001' : sol.toFixed(6);
                const oreDisplay = ore > 0 && ore < 0.0001 ? '<0.0001' : ore.toFixed(4);
                return (
                  <div
                    key={`${miner.miner}-${miner.rank}`}
                    className={`rounded-md border px-2 py-2 ${isMe ? 'bg-linear-to-r from-green-900/30 to-emerald-900/20 border-green-500/40' : 'bg-gray-950/20 border-gray-700/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`text-xs font-bold ${isMe ? 'text-green-300' : 'text-gray-300'}`}>#{miner.rank}</div>
                        <div className={`text-xs truncate ${isMe ? 'text-white' : 'text-gray-200'}`}>{isMe ? `You (${short})` : short}</div>
                        {miner.is_lottery_winner && (
                          <div className="text-[10px] text-purple-300">Lottery</div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-right">
                        <div>
                          <div className="text-[10px] text-gray-500">SOL</div>
                          <div className="text-xs font-bold text-yellow-300">{solDisplay}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500">ORE</div>
                          <div className="text-xs font-bold text-orange-300">{oreDisplay}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
