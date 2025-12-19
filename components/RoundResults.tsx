import { Miner, Round } from '@/lib/types';
import { lamportsToSol, gramsToOre, getWinningSquare } from '@/lib/accounts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRoundData } from '@/hooks/useRoundData';
import { WinLossHistory } from './WinLossHistory';
import { useCheckpoint, useClaimSol, useClaimOre, useClaimAll } from '@/lib/instrucionsHooks';
import { GlossyButton } from './GlossyButton';
import { bigIntToNumber } from '@/lib/formatters';

// Remove "1" and "0" digits from SOL values
const formatSolValue = (num: number, decimals: number = 4) => {
  return num.toFixed(decimals).replace(/[10]/g, '');
};

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
  const { previousRound, round: currentRound } = useRoundData();
  const { checkpoint } = useCheckpoint();
  const { claimSol } = useClaimSol();
  const { claimOre } = useClaimOre();
  const { claimAll } = useClaimAll();

  const handleCheckpoint = async () => {
    if (!publicKey || !miner || !currentRound) return;
    try {
      await checkpoint();
    } catch (error) {
      console.error('Checkpoint failed:', error);
    }
  };

  const handleClaimAll = async () => {
    if (!publicKey || !miner) return;
    try {
      await claimAll();
    } catch (error) {
      console.error('Claim all failed:', error);
    }
  };

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
      case 1: return 'MINOR';
      case 2: return 'MAJOR';
      case 3: return 'GRAND';
      default: return 'None';
    }
  };

  return (
    <div className="bg-[#FFB84A]/20 backdrop-blur-sm rounded-xl p-4 border-2 border-[rgb(120,63,4)]/30" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black uppercase text-[rgb(120,63,4)]">
          {isPreviousRound ? `Round #${displayRound.id.toString()} Results` : 'Your Results'}
        </h2>
        <div className="flex items-center gap-2">
          {isPreviousRound && (
            <span className="text-[10px] px-2 py-1 rounded bg-black/20 text-black/60 border border-black/30 font-black uppercase">
              Previous
            </span>
          )}
          {roundFinalized && (
            <span className="text-[10px] px-2 py-1 rounded bg-black/20 text-black/60 border border-black/30 font-black uppercase">
              Finalized
            </span>
          )}
        </div>
      </div>

      {!hasDeployed ? (
        <div className="space-y-4">
          <div className="text-center py-4 text-black/60 text-sm font-black uppercase">
            <p>Deploy to squares to participate</p>
          </div>
          <WinLossHistory />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Winner Status */}
          {roundFinalized && (
            <div className={`p-3 rounded-lg border-2 ${
              isWinner
                ? 'bg-white/20 border-[rgb(35,116,13)]/50'
                : 'bg-black/10 border-black/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-black/60 font-black uppercase">Winning Square</div>
                  <div className="text-lg font-black text-[rgb(120,63,4)]">
                    #{winningSquare + 1}
                  </div>
                </div>
                {isWinner ? (
                  <span className="text-[rgb(35,116,13)] font-black text-sm uppercase">Winner</span>
                ) : (
                  <span className="text-black/40 text-sm font-black uppercase">Not a winner</span>
                )}
              </div>
            </div>
          )}

          {/* Lottery Outcome */}
          {roundFinalized && isPreviousRound && (
            <div className="bg-black/10 border-2 border-black/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-black/60 font-black uppercase">Lottery Outcome</div>
                  <div className="text-sm font-black text-[rgb(120,63,4)] uppercase">
                    {getLotteryOutcomeName(lotteryOutcome)}
                  </div>
                </div>
                {hasMotherlode && (
                  <div className="text-right">
                    <div className="text-[10px] text-black/60 font-black uppercase">Motherlode Hit</div>
                    <div className="text-sm font-black text-[rgb(120,63,4)] uppercase">
                      {getMotherlodeTierName(motherlodeTier)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REWARDS Section */}
          <div className="bg-white/20 border-2 border-[rgb(120,63,4)]/30 rounded-lg p-3">
            <div className="text-[10px] font-black text-[rgb(120,63,4)]/60 uppercase mb-2">REWARDS</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-black/60 uppercase">SOL:</span>
                <span className="text-sm font-black text-[rgb(120,63,4)]">
                  {miner?.rewardsSol ? lamportsToSol(miner.rewardsSol).toFixed(4) : '0.0000'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-black/60 uppercase">Unrefined $QUEST:</span>
                <span className="text-sm font-black text-[rgb(120,63,4)]">
                  {miner?.rewardsOre ? gramsToOre(miner.rewardsOre).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-black/60 uppercase">Refined $QUEST:</span>
                <span className="text-sm font-black text-[rgb(120,63,4)]">
                  {miner?.refinedOre ? gramsToOre(miner.refinedOre).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
            {miner && (miner.rewardsSol > 0n || miner.rewardsOre > 0n) && (
              <div className="mt-3 pt-3 border-t border-black/20">
                <GlossyButton
                  onClick={handleClaimAll}
                  size="sm"
                  variant="success"
                  className="w-full !py-2 !text-xs"
                  disabled={!publicKey}
                >
                  CLAIM ALL
                </GlossyButton>
              </div>
            )}
          </div>

          {/* Estimated Round Rewards Summary */}
          <div className="grid grid-cols-2 gap-3">
            {/* SOL Rewards */}
            <div className="bg-white/20 border-2 border-[rgb(120,63,4)]/30 rounded-lg p-3">
              <div className="text-[10px] font-black text-black/60 uppercase mb-1">SOL Rewards</div>
              <div className="text-lg font-black text-[rgb(120,63,4)]">
                {formatSolValue(estimatedSolRewards, 4)}
              </div>
              {motherloadeSolRewards > 0 && (
                <div className="text-[10px] text-black/60 mt-1 font-black uppercase">
                  +{formatSolValue(motherloadeSolRewards, 4)} Motherlode
                </div>
              )}
              {roundFinalized && !isWinner && (
                <div className="text-[10px] text-black/40 mt-1 font-black uppercase">Not eligible</div>
              )}
            </div>

            {/* QUEST Rewards */}
            <div className="bg-white/20 border-2 border-[rgb(120,63,4)]/30 rounded-lg p-3">
              <div className="text-[10px] font-black text-black/60 uppercase mb-1">QUEST Rewards</div>
              <div className="text-lg font-black text-[rgb(120,63,4)]">
                {estimatedQuestRewards.toFixed(2)}
              </div>
              {motherlodeOreRewards > 0 && (
                <div className="text-[10px] text-black/60 mt-1 font-black uppercase">
                  +{motherlodeOreRewards.toFixed(2)} Motherlode
                </div>
              )}
              {roundFinalized && isWinner && (
                <div className="text-[10px] text-[rgb(35,116,13)] mt-1 font-black uppercase">
                  {lotteryOutcome === 0 ? 'Split' : lotteryOutcome === 1 ? '50% Split' : '50% Split'}
                </div>
              )}
            </div>
          </div>

          {/* Your Deployment */}
          <div className="bg-black/10 border-2 border-black/20 rounded-lg p-3">
            <div className="text-[10px] font-black text-black/60 uppercase mb-2">Your Deployment</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-black/60 font-black uppercase">Total Deployed:</span>
              <span className="font-black text-[rgb(120,63,4)]">{userTotalDeployed.toFixed(4)} SOL</span>
            </div>
            {roundFinalized && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-black/60 font-black uppercase">On Winner:</span>
                <span className={`font-black ${isWinner ? 'text-[rgb(35,116,13)]' : 'text-black/40'}`}>
                  {userDeployedOnWinner.toFixed(4)} SOL
                </span>
              </div>
            )}
          </div>

          {/* Checkpoint Button */}
          {miner && currentRound && miner.checkpointId < miner.roundId && miner.roundId < currentRound.id && (
            <div className="pt-2">
              <GlossyButton
                onClick={handleCheckpoint}
                size="sm"
                variant="primary"
                className="w-full !py-2 !text-xs"
                disabled={!publicKey}
              >
                CHECKPOINT
              </GlossyButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
