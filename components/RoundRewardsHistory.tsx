'use client';

import { useEffect, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { lamportsToSol, gramsToOre } from '@/lib/accounts';
import { GlossyButton } from './GlossyButton';
import gsap from 'gsap';

interface RoundData {
  round_id: number;
  winning_square: number;
  total_deployed: number;
  total_winnings: number;
  total_vaulted: number;
  lottery_outcome: string;
  motherlode_tier: string;
  ore_motherlode_payout: number;
  sol_motherlode_payout: number;
  timestamp: string;
  winners: Array<{
    miner: string;
    sol_reward: number;
    ore_reward_guaranteed: number;
    ore_reward_lottery: number;
    motherlode_ore_reward: number;
    motherlode_sol_reward: number;
    is_lottery_winner: boolean;
    rank: number;
  }>;
}

export function RoundRewardsHistory() {
  const { publicKey } = useWallet();
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rounds?limit=50');
        const data = await response.json();
        if (data.success) {
          setRounds(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching rounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRounds, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animate cards on mount
  useEffect(() => {
    if (cardRefs.current.length > 0 && rounds.length > 0) {
      cardRefs.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.8, x: -50 },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              duration: 0.5,
              delay: index * 0.1,
              ease: 'back.out(1.7)',
            }
          );
        }
      });
    }
  }, [rounds]);

  const getUserRewards = (round: RoundData) => {
    if (!publicKey) return null;
    const userWinner = round.winners?.find((w) => w.miner === publicKey.toBase58());
    if (!userWinner) return null;

    const totalSol = lamportsToSol(
      BigInt(userWinner.sol_reward) + BigInt(userWinner.motherlode_sol_reward)
    );
    const totalOre = gramsToOre(
      BigInt(userWinner.ore_reward_guaranteed) +
      BigInt(userWinner.ore_reward_lottery) +
      BigInt(userWinner.motherlode_ore_reward)
    );

    return {
      sol: totalSol,
      ore: totalOre,
      rank: userWinner.rank,
      isLotteryWinner: userWinner.is_lottery_winner,
    };
  };

  const getMotherlodeGradient = (tier: string) => {
    switch (tier) {
      case 'Grand':
        return 'linear-gradient(180deg, #4A002E 0%, #FF00A0 50%, #4A002E 100%)';
      case 'Major':
        return 'linear-gradient(180deg, #0A004A 0%, #0077FF 50%, #0A004A 100%)';
      case 'Minor':
        return 'linear-gradient(180deg, #002E1A 0%, #00A364 50%, #002E1A 100%)';
      default:
        return 'linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[min(92vw,520px)] mx-auto mt-6">
        <div className="bg-black border-2 border-[rgb(120,63,4)]/30 rounded-xl p-4">
          <div className="text-white/70 text-center">Loading round history...</div>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-[min(92vw,520px)] mx-auto mt-6">
      <div className="mb-3">
        <h3 className="text-lg font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Round History
        </h3>
      </div>
      
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
        
        {rounds.map((round, index) => {
          const userRewards = getUserRewards(round);
          const hasMotherlode = round.motherlode_tier !== 'None';
          const isUserWinner = userRewards !== null;

          return (
            <div
              key={round.round_id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="flex-shrink-0 w-[280px] sm:w-[320px]"
              style={{ minWidth: '280px' }}
            >
              <div
                className="relative rounded-xl border-2 overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                  borderColor: 'rgb(120,63,4)',
                  boxShadow: isUserWinner
                    ? '0 10px 30px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)'
                    : '0 10px 25px rgba(0,0,0,0.6)',
                  transform: isUserWinner ? 'scale(1.02)' : 'scale(1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: 'power2.out',
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: isUserWinner ? 1.02 : 1,
                    duration: 0.2,
                    ease: 'power2.out',
                  });
                }}
              >
                {/* Inner Content */}
                <div
                  className="w-full h-full relative p-4"
                  style={{
                    background: hasMotherlode
                      ? getMotherlodeGradient(round.motherlode_tier)
                      : 'linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                    borderRadius: '11px',
                    boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
                  }}
                >
                  {/* Glossy Overlay */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                    style={{
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px',
                    }}
                  />

                  {/* Round Header */}
                  <div className="relative z-10 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-black text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        ROUND #{round.round_id}
                      </div>
                      {hasMotherlode && (
                        <div
                          className="px-2 py-1 rounded-full text-xs font-black uppercase text-white animate-pulse"
                          style={{
                            background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                            border: '2px solid rgb(120,63,4)',
                            boxShadow: '0 2px 0 rgb(120,63,4), 0 0 20px rgba(255, 215, 0, 0.5)',
                          }}
                        >
                          {round.motherlode_tier}
                        </div>
                      )}
                    </div>
                    {round.timestamp && (
                      <div className="text-[10px] text-white/60 font-bold">
                        {new Date(round.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Winning Square */}
                  <div className="relative z-10 mb-3 p-2 bg-black/30 rounded-lg border border-[rgb(120,63,4)]/30">
                    <div className="text-xs text-white/70 font-bold uppercase mb-1">
                      Winning Square
                    </div>
                    <div className="text-xl font-black text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                      #{round.winning_square + 1}
                    </div>
                  </div>

                  {/* Round Stats */}
                  <div className="relative z-10 space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70 font-bold">Total Deployed</span>
                      <span className="text-white font-black">
                        {lamportsToSol(BigInt(round.total_deployed)).toFixed(2)} SOL
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70 font-bold">Total Winnings</span>
                      <span className="text-white font-black">
                        {lamportsToSol(BigInt(round.total_winnings)).toFixed(2)} SOL
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70 font-bold">Lottery</span>
                      <span className="text-white font-black uppercase">
                        {round.lottery_outcome}
                      </span>
                    </div>
                  </div>

                  {/* User Rewards Section */}
                  {isUserWinner && userRewards && (
                    <div
                      className="relative z-10 mt-3 p-3 rounded-lg border-2 animate-pulse"
                      style={{
                        background: 'linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)',
                        borderColor: 'rgb(35,116,13)',
                        boxShadow: '0 4px 15px rgba(52, 212, 59, 0.4), 0 0 30px rgba(52, 212, 59, 0.3)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    >
                      {/* Sparkle effect overlay */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                        <div
                          className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"
                          style={{
                            boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
                            animation: 'twinkle 1.5s ease-in-out infinite',
                          }}
                        />
                        <div
                          className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full"
                          style={{
                            boxShadow: '0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.5)',
                            animation: 'twinkle 2s ease-in-out infinite 0.5s',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <div className="text-xs font-black text-white uppercase">
                          🏆 Your Rewards
                        </div>
                        <div className="text-xs font-black text-white">
                          Rank #{userRewards.rank}
                        </div>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/90 font-bold">SOL</span>
                          <span className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                            {userRewards.sol.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/90 font-bold">QUEST</span>
                          <span className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                            {userRewards.ore.toFixed(2)}
                          </span>
                        </div>
                        {userRewards.isLotteryWinner && (
                          <div className="text-[10px] text-white/80 font-bold uppercase mt-1 animate-bounce">
                            🎰 Lottery Winner!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Win Message */}
                  {!isUserWinner && (
                    <div className="relative z-10 mt-3 p-2 bg-black/20 rounded-lg border border-white/10">
                      <div className="text-[10px] text-white/50 text-center font-bold uppercase">
                        {publicKey ? 'Not a winner' : 'Connect wallet'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

