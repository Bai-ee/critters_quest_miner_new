'use client';

import { useEffect, useState } from 'react';

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
  top_miner: string;
  num_winners: number;
  total_deployed: number;
  total_vaulted: number;
  total_winnings: number;
  total_minted: number;
  lottery_outcome: string;
  motherlode_tier: string;
  ore_motherlode_payout: number;
  sol_motherlode_payout: number;
  start_slot: number;
  end_slot: number;
  timestamp: string;
  round_winner?: string;
  winners: Winner[];
}

const formatNumber = (num: number, decimals: number = 4) => {
  return (num / Math.pow(10, decimals)).toFixed(decimals);
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

export default function RoundsTable() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rounds' | 'winners'>('rounds');

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRounds = async () => {
    try {
      const response = await fetch('/api/rounds?limit=20');
      const data = await response.json();

      if (data.success) {
        setRounds(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch rounds');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching rounds:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-gray-400">Loading rounds data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Mining</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab('rounds')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'rounds'
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
            }`}
          >
            ⚡ Rounds
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'winners'
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
            }`}
          >
            🏆 Winners
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          {activeTab === 'rounds' ? 'Recent mining rounds and rewards.' : 'Recent round winners and their rewards.'}
        </p>
      </div>

      {/* Rounds Table */}
      {activeTab === 'rounds' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                <th className="pb-3 font-medium">Round</th>
                <th className="pb-3 font-medium">Block</th>
                <th className="pb-3 font-medium">Lottery Winner</th>
                <th className="pb-3 font-medium">Winners</th>
                <th className="pb-3 font-medium">Deployed</th>
                <th className="pb-3 font-medium">$QUEST Rewards</th>
                <th className="pb-3 font-medium">Winnings</th>
                <th className="pb-3 font-medium">Motherlode</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round) => {
                const oreWinner = round.lottery_outcome === 'Single Winner' ? (round.round_winner || 'Single Winner') : round.lottery_outcome === 'Motherlode' ? 'Motherlode' : 'Split';

                const hasMotherlode = round.lottery_outcome === 'Motherlode';

                const hasMotherLodeRewards = round.motherlode_tier !== 'None' && (round.ore_motherlode_payout > 0 || round.sol_motherlode_payout > 0);

                return (
                  <tr
                    key={round._id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 text-white font-mono">#{round.round_id}</td>
                    <td className="py-4 text-white font-mono">#{round.winning_square}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        oreWinner === 'Split'
                          ? 'bg-gray-700/50 text-gray-300'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {formatAddress(oreWinner)}
                      </span>
                    </td>
                    <td className="py-4 text-white">{round.num_winners}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">≡</span>
                        <span className="text-white">{formatNumber(round.total_deployed, 9)}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400">⛏</span>
                        <span className="text-white">{formatNumber(round.total_minted, 9)} {hasMotherLodeRewards ? `+ ${formatNumber(round.ore_motherlode_payout, 9)}` : ''}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">≡</span>
                        <span className="text-white">{formatNumber(round.total_winnings, 9)} {hasMotherLodeRewards ? `+ ${formatNumber(round.sol_motherlode_payout, 9)}` : ''}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">
                      {hasMotherlode ? (
                        <span className="text-yellow-400">
                          +{formatNumber(round.total_minted/2, 9)}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="py-4 text-gray-400 text-sm">
                      {getTimeAgo(round.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Winners Table */}
      {activeTab === 'winners' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Round</th>
                <th className="pb-3 font-medium">Miner</th>
                <th className="pb-3 font-medium">Lottery</th>
                <th className="pb-3 font-medium">$QUEST Reward</th>
                <th className="pb-3 font-medium">SOL Reward</th>
                <th className="pb-3 font-medium">Motherlode $QUEST</th>
                <th className="pb-3 font-medium">Motherlode SOL</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {rounds.flatMap((round) =>
                round.winners.map((winner) => (
                  <tr
                    key={`${round.round_id}-${winner.miner}`}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                        winner.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : winner.rank === 2
                          ? 'bg-gray-400/20 text-gray-300'
                          : winner.rank === 3
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'text-gray-400'
                      }`}>
                        #{winner.rank}
                      </span>
                    </td>
                    <td className="py-4 text-white font-mono">#{round.round_id}</td>
                    <td className="py-4">
                      <span className="text-gray-300 font-mono text-sm">
                        {formatAddress(winner.miner)}
                      </span>
                    </td>
                    <td className="py-4">
                      {winner.is_lottery_winner ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          🎉 Winner
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">–</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400">⛏</span>
                        <span className="text-white">{formatNumber(winner.ore_reward_guaranteed, 9)}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">≡</span>
                        <span className="text-white">{formatNumber(winner.sol_reward, 9)}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {winner.motherlode_ore_reward > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-400">⛏</span>
                          <span className="text-yellow-400">{formatNumber(winner.motherlode_ore_reward, 9)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">–</span>
                      )}
                    </td>
                    <td className="py-4">
                      {winner.motherlode_sol_reward > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-purple-400">≡</span>
                          <span className="text-yellow-400">{formatNumber(winner.motherlode_sol_reward, 9)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">–</span>
                      )}
                    </td>
                    <td className="py-4 text-gray-400 text-sm">
                      {getTimeAgo(winner.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rounds' && rounds.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No rounds data available
        </div>
      )}

      {activeTab === 'winners' && rounds.flatMap(r => r.winners).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No winners data available
        </div>
      )}
    </div>
  );
}
