import { lamportsToSol, gramsToOre } from '@/lib/accounts';
import type { Miner, Round } from '@/lib/types';

interface StatsProps {
  round: Round;
  miner: Miner | null;
}

export function Stats({ round, miner }: StatsProps) {
  const yourDeployed = miner && miner.roundId === round.id
    ? lamportsToSol(miner.deployed.reduce((a, b) => a + b, 0n)).toFixed(4)
    : '0.0000';

  const statCards = [
    {
      label: 'Total Deployed',
      value: `${lamportsToSol(round.totalDeployed).toFixed(4)} SOL`,
      icon: '📊',
      color: 'from-green-600 to-green-700',
    },
    {
      label: 'Your Deployed',
      value: `${yourDeployed} SOL`,
      icon: '🏆',
      color: 'from-purple-600 to-purple-700',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl p-6 shadow-xl bg-linear-to-br from-gray-700 to-gray-800">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-bold text-white">
            Round Stats
          </h2>
        </div>
        <div className="space-y-3">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`
                bg-linear-to-br ${stat.color}
                rounded-lg p-3 shadow-lg
                transform transition-all duration-200
                hover:scale-[1.02] hover:shadow-xl
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stat.icon}</span>
                  <div className="text-xs text-white/80 font-medium">
                    {stat.label}
                  </div>
                </div>
                <div className="text-lg font-bold text-white">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
