import { lamportsToSol, gramsToOre } from '@/lib/accounts';
import type { Round } from '@/lib/types';

interface StatsProps {
  round: Round;
}

export function Stats({ round }: StatsProps) {
  const statCards = [
    {
      label: 'Total Deployed',
      value: `${lamportsToSol(round.totalDeployed).toFixed(4)} SOL`,
      icon: '📊',
      color: 'from-green-600 to-green-700',
    },
    {
      label: 'Your Deployed',
      value: `${lamportsToSol(round.totalDeployed).toFixed(4)} SOL`,
      icon: '🏆',
      color: 'from-purple-600 to-purple-700',
    },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📈</span>
        Round Stats
      </h2>
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
  );
}
