import { gramsToOre, lamportsToSol, fetchTreasury } from '@/lib/accounts';
import { connection } from '@/lib/solana';
import { useEffect, useState } from 'react';

interface MotherlodeProps {
  amount?: bigint;
}

export function Motherlode({ amount }: MotherlodeProps) {
  const [tiers, setTiers] = useState([
    {
      name: 'MINOR',
      emoji: '🥉',
      odds: '1/125',
      ore: 0,
      sol: 0,
      gradient: 'from-amber-600 to-yellow-600',
      borderColor: 'border-amber-400/30',
    },
    {
      name: 'MAJOR',
      emoji: '🥈',
      odds: '1/625',
      ore: 0,
      sol: 0,
      gradient: 'from-gray-400 to-gray-500',
      borderColor: 'border-gray-300/30',
    },
    {
      name: 'GRAND',
      emoji: '🥇',
      odds: '1/2500',
      ore: 0,
      sol: 0,
      gradient: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-300/40',
    },
  ]);

  useEffect(() => {
    const loadTreasury = async () => {
      try {
        const treasury = await fetchTreasury(connection);
        setTiers([
          {
            name: 'MINOR',
            emoji: '🥉',
            odds: '1/125',
            ore: gramsToOre(treasury.motherlodeOreMinor),
            sol: lamportsToSol(treasury.motherlodeSolMinor),
            gradient: 'from-amber-600 to-yellow-600',
            borderColor: 'border-amber-400/30',
          },
          {
            name: 'MAJOR',
            emoji: '🥈',
            odds: '1/625',
            ore: gramsToOre(treasury.motherlodeOreMajor),
            sol: lamportsToSol(treasury.motherlodeSolMajor),
            gradient: 'from-gray-400 to-gray-500',
            borderColor: 'border-gray-300/30',
          },
          {
            name: 'GRAND',
            emoji: '🥇',
            odds: '1/2500',
            ore: gramsToOre(treasury.motherlodeOreGrand),
            sol: lamportsToSol(treasury.motherlodeSolGrand),
            gradient: 'from-yellow-400 to-orange-500',
            borderColor: 'border-yellow-300/40',
          },
        ]);
      } catch (err) {
        console.error('Error loading treasury:', err);
      }
    };

    loadTreasury();
  }, []);

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-purple-900/40 via-indigo-900/40 to-purple-800/40 rounded-xl p-4 shadow-xl border border-purple-500/20 my-4">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-transparent via-white to-transparent animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💎</span>
          <h2 className="text-lg font-bold text-purple-100">
            Motherlode Jackpots
          </h2>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-linear-to-r ${tier.gradient} rounded-lg p-2.5 border ${tier.borderColor} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{tier.emoji}</span>
                  <span className="text-xs font-bold text-white">
                    {tier.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-white/80 bg-black/20 px-1.5 py-0.5 rounded">
                  {tier.odds}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="bg-black/20 rounded px-2 py-1">
                  <div className="text-white/70 text-[9px] uppercase">QUEST</div>
                  <div className="font-bold text-white truncate">
                    {tier.ore.toFixed(2)}
                  </div>
                </div>
                <div className="bg-black/20 rounded px-2 py-1">
                  <div className="text-white/70 text-[9px] uppercase">SOL</div>
                  <div className="font-bold text-white truncate">
                    {tier.sol.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-3 bg-black/20 rounded-lg p-2 backdrop-blur-sm">
          <div className="text-xs text-purple-100 font-medium text-center">
            ⚡ Win by mining the lucky square!
          </div>
        </div>
      </div>
    </div>
  );
}
