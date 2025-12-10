import { Miner, Round } from '@/lib/types';
import { bigIntToNumber } from '@/lib/formatters';
import { lamportsToSol, gramsToOre, getWinningSquare } from '@/lib/accounts';
import { useWallet } from '@solana/wallet-adapter-react';

interface RoundResultsProps {
  round: Round;
  miner: Miner | null;
}

/**
 * Calculate estimated rewards for the current round
 * This simulates what would happen if checkpoint was executed
 */
function calculateEstimatedRewards(round: Round, miner: Miner | null): {
  estimatedSolRewards: number;
  estimatedQuestRewards: number;
  totalDeployed: number;
  winningSquare: number | null;
  userDeployedOnWinner: number;
  userTotalDeployed: number;
} {
  if (!miner) {
    return {
      estimatedSolRewards: 0,
      estimatedQuestRewards: 0,
      totalDeployed: 0,
      winningSquare: null,
      userDeployedOnWinner: 0,
      userTotalDeployed: 0,
    };
  }

  // Get winning square
  const winningSquare = getWinningSquare(round.slotHash);

  // Calculate user's total deployed in this round
  let userTotalDeployed = 0;
  for (let i = 0; i < 25; i++) {
    userTotalDeployed += lamportsToSol(miner.deployed[i]);
  }

  // Calculate total deployed on the winning square
  let userDeployedOnWinner = 0;
  if (winningSquare !== null) {
    userDeployedOnWinner = lamportsToSol(miner.deployed[winningSquare]);
  }

  // Calculate total deployed in the round
  const totalDeployed = lamportsToSol(round.totalDeployed);

  // Estimate SOL rewards (proportional to deployment on winning square)
  let estimatedSolRewards = 0;
  if (winningSquare !== null && round.deployed[winningSquare] > 0n) {
    const winningSquareTotal = lamportsToSol(round.deployed[winningSquare]);
    const userShare = userDeployedOnWinner / winningSquareTotal;
    // Total winnings are distributed among winners
    estimatedSolRewards = lamportsToSol(round.totalWinnings) * userShare;
  }

  // Estimate QUEST rewards (proportional to total deployment)
  let estimatedQuestRewards = 0;
  if (totalDeployed > 0) {
    const userShare = userTotalDeployed / totalDeployed;
    // ORE motherlode payout is distributed proportionally to all deployers
    estimatedQuestRewards = gramsToOre(round.oreMotherlodePayout) * userShare;
  }

  return {
    estimatedSolRewards,
    estimatedQuestRewards,
    totalDeployed,
    winningSquare,
    userDeployedOnWinner,
    userTotalDeployed,
  };
}

export function RoundResults({ round, miner }: RoundResultsProps) {
  const { publicKey } = useWallet();

  if (!publicKey || !miner) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          Your Results
        </h2>
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>Connect wallet to see results</p>
        </div>
      </div>
    );
  }

  const {
    estimatedSolRewards,
    estimatedQuestRewards,
    winningSquare,
    userDeployedOnWinner,
    userTotalDeployed,
  } = calculateEstimatedRewards(round, miner);

  const hasDeployed = userTotalDeployed > 0;
  const roundFinalized = winningSquare !== null;
  const isWinner = roundFinalized && userDeployedOnWinner > 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📊</span>
          Your Results
        </h2>
        {roundFinalized && (
          <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/50">
            Finalized
          </span>
        )}
      </div>

      {!hasDeployed ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>Deploy to squares to participate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Winner Status */}
          {roundFinalized && (
            <div className={`p-3 rounded-lg border ${
              isWinner 
                ? 'bg-green-900/20 border-green-500/50' 
                : 'bg-gray-900/50 border-gray-600/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Winning Square</div>
                  <div className="text-lg font-bold text-white">
                    #{winningSquare + 1}
                  </div>
                </div>
                {isWinner ? (
                  <span className="text-green-400 font-semibold text-sm">🎉 Winner!</span>
                ) : (
                  <span className="text-gray-500 text-sm">Not a winner</span>
                )}
              </div>
            </div>
          )}

          {/* Rewards Summary */}
          <div className="grid grid-cols-2 gap-3">
            {/* SOL Rewards */}
            <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">SOL Rewards</div>
              <div className="text-lg font-bold text-yellow-400">
                {estimatedSolRewards.toFixed(3)}
              </div>
              {roundFinalized && !isWinner && (
                <div className="text-xs text-gray-500 mt-1">Not eligible</div>
              )}
            </div>

            {/* QUEST Rewards */}
            <div className="bg-orange-900/10 border border-orange-500/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">QUEST Rewards</div>
              <div className="text-lg font-bold text-orange-400">
                {estimatedQuestRewards.toFixed(3)}
              </div>
              {hasDeployed && (
                <div className="text-xs text-green-400 mt-1">Eligible</div>
              )}
            </div>
          </div>

          {/* Your Deployment */}
          <div className="bg-gray-900/50 border border-gray-600/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Your Deployment</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Total Deployed:</span>
              <span className="font-bold text-white">{userTotalDeployed.toFixed(4)} SOL</span>
            </div>
            {roundFinalized && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-300">On Winner:</span>
                <span className={`font-bold ${isWinner ? 'text-green-400' : 'text-gray-500'}`}>
                  {userDeployedOnWinner.toFixed(4)} SOL
                </span>
              </div>
            )}
          </div>

          {/* Action Note */}
          {roundFinalized && (isWinner || hasDeployed) && (
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-2">
              <p className="text-xs text-blue-300">
                💡 Execute checkpoint to claim your rewards
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
