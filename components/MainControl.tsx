import { useCheckpoint, useClaimAll, useClaimOre, useClaimSol, useDeployToSquares } from '@/lib/instrucionsHooks';
import { bigIntToNumber } from '@/lib/formatters';
import { Miner, Round } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface MainControlProps {
    round: Round;
    miner: Miner | null;
    selectedSquares: Set<number>;
    selectAll: () => void;
    clearSelection: () => void;
}

export function MainControl({ round, miner, selectedSquares, selectAll, clearSelection }: MainControlProps) {
    const { checkpoint } = useCheckpoint();
    const { deploy } = useDeployToSquares();
    const { claimSol } = useClaimSol();
    const { claimOre } = useClaimOre();
    const { claimAll } = useClaimAll();
    const { publicKey } = useWallet();

    const [deploying, setDeploying] = useState(false);
    const [amount, setAmount] = useState<number>(0.01);

    const handleDeploy = async () => {
        if (selectedSquares.size === 0) {
            toast.error('Please select at least one square');
            return;
        }

        let needCheckpoint = false;

        // Checkpoint is needed if miner's round is behind the current round
        if (miner && bigIntToNumber(miner.roundId) < bigIntToNumber(round.id)) {
            needCheckpoint = true;
        }

        try {
            setDeploying(true);
            const squaresArray = Array.from(selectedSquares);
            const signature = await deploy(
                amount,
                squaresArray,
                '9nmmN2Cj6Bj3ob8tteszatY87Jz2QYSpxstWiXg2v6iC',
                needCheckpoint
            );
            toast.success(`Deploy successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
            clearSelection(); // Clear selection after successful deploy
            setDeploying(false);
        } catch (error) {
            console.error('Deploy failed:', error);
            toast.error(`Deploy failed: ${error}`);
            setDeploying(false);
        }
    };

    const handleCheckpoint = async () => {
        try {
            const signature = await checkpoint();
            toast.success(`Checkpoint successful! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
        } catch (error) {
            console.error('Checkpoint failed:', error);
            toast.error(`Checkpoint failed: ${error}`);
        }
    };

    const handleClaimAll = async () => {
        try {
            // Claim both SOL and QUEST rewards
            const signature = await claimAll();
            console.log('Claimed SOL:', signature);

            toast.success('All rewards claimed successfully!');
        } catch (error) {
            console.error('Claim failed:', error);
            toast.error(`Claim failed: ${error}`);
        }
    };

    const handleClaimOre = async () => {
        try {
            // Claim QUEST rewards
            const signature = await claimOre();
            console.log('Claimed QUEST:', signature);

            toast.success('QUEST rewards claimed successfully!');
        } catch (error) {
            console.error('Claim failed:', error);
            toast.error(`Claim failed: ${error}`);
        }
    };

    const handleClaimSol = async () => {
        try {
            // Claim SOL rewards
            const signature = await claimSol();
            console.log('Claimed SOL:', signature);

            toast.success('SOL rewards claimed successfully!');
        } catch (error) {
            console.error('Claim failed:', error);
            toast.error(`Claim failed: ${error}`);
        }
    };

    return (
        <>
            {/* Main Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 ">
                {/* Left Column - Deploy Controls */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Deploy</h3>

                    {/* Amount Input */}
                    <div className="bg-gray-900/50 p-3 md:p-4 rounded-lg border border-gray-700/50 space-y-3">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Amount:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    placeholder="0.001"
                                    step="0.001"
                                    min="0.001"
                                    className="flex-1 px-3 md:px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={selectAll}
                                className="w-full px-3 md:px-4 py-1.5 md:py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-xs md:text-sm rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500"
                            >
                                Select All
                            </button>
                            <button
                                onClick={clearSelection}
                                className="w-full px-3 md:px-4 py-1.5 md:py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-xs md:text-sm rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-xs md:text-sm font-semibold text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-600/50">
                            <span className="text-gray-400">Total Cost:</span>
                            <span>{(amount * selectedSquares.size).toFixed(4)} SOL</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleDeploy}
                            disabled={!publicKey || deploying || selectedSquares.size === 0}
                            className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-sm md:text-base"
                        >
                            {deploying ? 'Deploying...' : `Deploy to ${selectedSquares.size} Square${selectedSquares.size !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>

                {/* Right Column - Rewards */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Rewards</h3>

                    {/* Rewards Display */}
                    <div className="space-y-3">
                        {/* Show checkpoint warning if miner needs to checkpoint */}
                        {miner && miner.checkpointId < miner.roundId && miner.roundId < round.id && (
                            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
                                    <span>⚠️</span>
                                    <span className="font-semibold">Checkpoint Required</span>
                                </div>
                                <p className="text-xs text-yellow-300/80 mb-3">
                                    You participated in Round #{miner.roundId.toString()}. Checkpoint to refresh your rewards!
                                </p>
                                <button
                                    onClick={handleCheckpoint}
                                    disabled={!publicKey}
                                    className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                                >
                                    Checkpoint Now
                                </button>
                            </div>
                        )}

                      <div className="bg-gray-900/50 p-3 md:p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm text-gray-300 font-medium">SOL Rewards</span>
                                <span className="text-base md:text-lg font-bold text-yellow-400">
                                    {miner?.rewardsSol ? (bigIntToNumber(miner.rewardsSol) / 1e9).toFixed(4) : '0.0000'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-3 md:p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm text-gray-300 font-medium">Unrefined $QUEST</span>
                                <span className="text-base md:text-lg font-bold text-orange-400">
                                    {miner?.rewardsOre ? (bigIntToNumber(miner.rewardsOre) / 1e9).toFixed(4) : '0.0000'}
                                </span>
                            </div>
                        </div>

                         <div className="bg-gray-900/50 p-3 md:p-4 rounded-lg border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm text-gray-300 font-medium">Refined $QUEST</span>
                                <span className="text-base md:text-lg font-bold text-orange-400">
                                    {miner?.refinedOre ? (bigIntToNumber(miner.refinedOre) / 1e9).toFixed(4) : '0.0000'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Claim Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        <button
                            onClick={handleClaimAll}
                            disabled={!publicKey || !miner || (bigIntToNumber(miner.rewardsSol) === 0 && bigIntToNumber(miner.rewardsOre) === 0)}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-xs md:text-sm"
                        >
                            Claim
                        </button>

                        <button
                            onClick={handleClaimSol}
                            disabled={!publicKey || !miner || bigIntToNumber(miner.rewardsSol) === 0}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-xs md:text-sm"
                        >
                            Claim SOL
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}