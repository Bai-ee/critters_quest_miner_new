'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Winner {
  round_id: number;
  winning_square: number;
  miner: string;
  deployed_amount: number;
  sol_reward: number;
  ore_reward_guaranteed: number;
  ore_reward_lottery: number;
  motherlode_ore_reward: number;
  motherlode_sol_reward: number;
  is_lottery_winner: boolean;
  lottery_outcome: string;
  timestamp: string;
  rank?: number;
  total_rewards?: number;
}

interface Round {
  _id: string;
  round_id: number;
  winning_square: number;
  lottery_outcome: string;
  motherlode_tier: string;
  timestamp: string;
  winners: Winner[];
}

const formatNumber = (num: number, decimals: number = 4) => {
  return (num / Math.pow(10, decimals)).toFixed(decimals);
};

// Remove "1" and "0" digits from SOL values
const formatSolValue = (num: number, decimals: number = 9) => {
  const formatted = formatNumber(num, decimals);
  return formatted.replace(/[10]/g, '');
};

const formatAddress = (address: string) => {
  if (!address || address === 'Split' || address === 'Motherlode') return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export function WinLossHistory() {
  const { publicKey } = useWallet();
  const [userHistory, setUserHistory] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    fetchUserHistory();
    const interval = setInterval(fetchUserHistory, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [publicKey]);

  const fetchUserHistory = async () => {
    if (!publicKey) return;

    try {
      const response = await fetch('/api/rounds?limit=50');
      const data = await response.json();

      if (data.success) {
        const rounds: Round[] = data.data;
        const walletAddress = publicKey.toBase58();
        
        // Filter winners to only include this wallet
        const userWins = rounds.flatMap((round) =>
          round.winners
            .filter((winner) => winner.miner === walletAddress)
            .map((winner) => ({
              ...winner,
              round_id: round.round_id,
              winning_square: round.winning_square,
              lottery_outcome: round.lottery_outcome,
              motherlode_tier: round.motherlode_tier,
              timestamp: round.timestamp,
            }))
        );

        // Sort by round_id descending (most recent first)
        userWins.sort((a, b) => b.round_id - a.round_id);
        
        setUserHistory(userWins);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch history');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching user history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          Win/Loss History
        </h2>
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>Connect wallet to see your history</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          Win/Loss History
        </h2>
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          Win/Loss History
        </h2>
        <div className="text-center py-6 text-red-400 text-sm">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (userHistory.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          Win/Loss History
        </h2>
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>No participation history found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span>📊</span>
        Win/Loss History
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-3 font-medium">Round</th>
              <th className="pb-3 font-medium">Square</th>
              <th className="pb-3 font-medium">Result</th>
              <th className="pb-3 font-medium">$QUEST</th>
              <th className="pb-3 font-medium">SOL</th>
              <th className="pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {userHistory.map((entry, index) => {
              const isWin = entry.sol_reward > 0 || entry.ore_reward_guaranteed > 0 || entry.ore_reward_lottery > 0;
              const totalQuest = entry.ore_reward_guaranteed + entry.ore_reward_lottery + entry.motherlode_ore_reward;
              const totalSol = entry.sol_reward + entry.motherlode_sol_reward;
              
              return (
                <tr
                  key={`${entry.round_id}-${index}`}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 text-white font-mono">#{entry.round_id}</td>
                  <td className="py-3 text-white font-mono">#{entry.winning_square + 1}</td>
                  <td className="py-3">
                    {isWin ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        🎉 Win
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-400">
                        Loss
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {totalQuest > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400">⛏</span>
                        <span className="text-white">{formatNumber(totalQuest, 9)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">–</span>
                    )}
                  </td>
                  <td className="py-3">
                    {totalSol > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">≡</span>
                        <span className="text-white">{formatSolValue(totalSol, 9)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">–</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-400 text-sm">
                    {getTimeAgo(entry.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

