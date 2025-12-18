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
    <div className="flex flex-col sm:flex-row gap-2">
          {statCards.map((stat, index) => (
            <div
              key={index}
          className="cq-jackpot-strip flex-1 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-xs text-gray-400 font-medium uppercase">
                    {stat.label}
              </span>
                  </div>
            <span className="text-sm font-bold text-cq-gold">
                  {stat.value}
            </span>
              </div>
            </div>
          ))}
    </div>
  );
}
