import { Miner, Round } from '@/lib/types';
import { lamportsToSol, gramsToOre, getWinningSquare } from '@/lib/accounts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRoundData } from '@/hooks/useRoundData';

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
  motherloadeSolRewards: number;
  motherlodeOreRewards: number;
  totalDeployed: number;
  winningSquare: number | null;
  userDeployedOnWinner: number;
  userTotalDeployed: number;
  lotteryOutcome: number;
  motherlodeTier: number;
} {
  if (!miner) {
    return {
      estimatedSolRewards: 0,
      estimatedQuestRewards: 0,
      motherloadeSolRewards: 0,
      motherlodeOreRewards: 0,
      totalDeployed: 0,
      winningSquare: null,
      userDeployedOnWinner: 0,
      userTotalDeployed: 0,
      lotteryOutcome: 0,
      motherlodeTier: 0,
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
  let motherloadeSolRewards = 0;
  if (winningSquare !== null && round.deployed[winningSquare] > 0n) {
    const winningSquareTotal = lamportsToSol(round.deployed[winningSquare]);
    const userShare = userDeployedOnWinner / winningSquareTotal;
    // Total winnings are distributed among winners (88.5% of pool)
    estimatedSolRewards = lamportsToSol(round.totalWinnings) * userShare;

    // Motherlode SOL rewards (if any)
    if (round.solMotherlodePayout > 0n) {
      motherloadeSolRewards = lamportsToSol(round.solMotherlodePayout) * userShare;
    }
  }

  // Estimate QUEST rewards based on lottery outcome
  let estimatedQuestRewards = 0;
  let motherlodeOreRewards = 0;
  if (winningSquare !== null && round.deployed[winningSquare] > 0n) {
    const winningSquareTotal = lamportsToSol(round.deployed[winningSquare]);
    const userShare = userDeployedOnWinner / winningSquareTotal;

    // Top miner reward distribution based on lottery outcome
    const topMinerReward = gramsToOre(round.topMinerReward);

    switch (round.lotteryOutcome) {
      case 0: // Split proportionally
        estimatedQuestRewards = topMinerReward * userShare;
        break;
      case 1: // Single weighted winner
        // Everyone gets 50% split, one person gets additional 50%
        estimatedQuestRewards = (topMinerReward / 2) * userShare;
        break;
      case 2: // Motherlode
        // Only 50% split (other 50% went to motherlode)
        estimatedQuestRewards = (topMinerReward / 2) * userShare;
        break;
      default:
        estimatedQuestRewards = topMinerReward * userShare;
    }

    // Motherlode ORE rewards (if any)
    if (round.oreMotherlodePayout > 0n) {
      motherlodeOreRewards = gramsToOre(round.oreMotherlodePayout) * userShare;
    }
  }

  return {
    estimatedSolRewards,
    estimatedQuestRewards,
    motherloadeSolRewards,
    motherlodeOreRewards,
    totalDeployed,
    winningSquare,
    userDeployedOnWinner,
    userTotalDeployed,
    lotteryOutcome: round.lotteryOutcome,
    motherlodeTier: round.motherlodeTier,
  };
}

export function RoundResults({ round, miner }: RoundResultsProps) {
  const { publicKey } = useWallet();
  const { previousRound } = useRoundData();

  // Use previousRound if available (shows finalized results), otherwise use current round
  const displayRound = previousRound || round;
  const isPreviousRound = previousRound !== null;

  if (!publicKey || !miner) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          {isPreviousRound ? 'Previous Round Results' : 'Your Results'}
        </h2>
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>Connect wallet to see results</p>
        </div>
      </div>
    );
  }

  // Check if user's last played round is too far behind current round
  const currentRoundId = Number(round.id);
  const minerRoundId = Number(miner.roundId);
  const roundsBehind = currentRoundId - minerRoundId;

  // Hide results if user is more than 2 rounds behind (hasn't played recently)
  if (roundsBehind > 2) {
    return null;
  }

  const {
    estimatedSolRewards,
    estimatedQuestRewards,
    motherloadeSolRewards,
    motherlodeOreRewards,
    winningSquare,
    userDeployedOnWinner,
    userTotalDeployed,
    lotteryOutcome,
    motherlodeTier,
  } = calculateEstimatedRewards(displayRound, miner);

  const hasDeployed = userTotalDeployed > 0;
  const roundFinalized = winningSquare !== null;
  const isWinner = roundFinalized && userDeployedOnWinner > 0;
  const hasMotherlode = motherlodeTier > 0;

  const getLotteryOutcomeName = (outcome: number) => {
    switch (outcome) {
      case 0: return 'Split Proportionally';
      case 1: return 'Single Winner';
      case 2: return 'Motherlode';
      default: return 'Unknown';
    }
  };

  const getMotherlodeTierName = (tier: number) => {
    switch (tier) {
      case 1: return 'MINOR 🥉';
      case 2: return 'MAJOR 🥈';
      case 3: return 'GRAND 🥇';
      default: return 'None';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📊</span>
          {isPreviousRound ? `Round #${displayRound.id.toString()} Results` : 'Your Results'}
        </h2>
        <div className="flex items-center gap-2">
          {isPreviousRound && (
            <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-500/50">
              Previous
            </span>
          )}
          {roundFinalized && (
            <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/50">
              Finalized
            </span>
          )}
        </div>
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

          {/* Lottery Outcome */}
          {roundFinalized && isPreviousRound && (
            <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Lottery Outcome</div>
                  <div className="text-sm font-bold text-purple-300">
                    {getLotteryOutcomeName(lotteryOutcome)}
                  </div>
                </div>
                {hasMotherlode && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Motherlode Hit</div>
                    <div className="text-sm font-bold text-yellow-300">
                      {getMotherlodeTierName(motherlodeTier)}
                    </div>
                  </div>
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
                {estimatedSolRewards.toFixed(4)}
              </div>
              {motherloadeSolRewards > 0 && (
                <div className="text-xs text-yellow-300 mt-1">
                  +{motherloadeSolRewards.toFixed(4)} 💎 Motherlode
                </div>
              )}
              {roundFinalized && !isWinner && (
                <div className="text-xs text-gray-500 mt-1">Not eligible</div>
              )}
            </div>

            {/* QUEST Rewards */}
            <div className="bg-orange-900/10 border border-orange-500/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">QUEST Rewards</div>
              <div className="text-lg font-bold text-orange-400">
                {estimatedQuestRewards.toFixed(2)}
              </div>
              {motherlodeOreRewards > 0 && (
                <div className="text-xs text-orange-300 mt-1">
                  +{motherlodeOreRewards.toFixed(2)} 💎 Motherlode
                </div>
              )}
              {roundFinalized && isWinner && (
                <div className="text-xs text-green-400 mt-1">
                  {lotteryOutcome === 0 ? 'Split' : lotteryOutcome === 1 ? '50% Split' : '50% Split'}
                </div>
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
        </div>
      )}
    </div>
  );
}
