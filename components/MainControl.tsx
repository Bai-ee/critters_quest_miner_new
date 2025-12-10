import { useAutomation, useCheckpoint, useClaimAll, useClaimOre, useClaimSol, useDeployToSquares } from '@/lib/instrucionsHooks';
import { bigIntToNumber } from '@/lib/formatters';
import { Automation, Miner, Round } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface MainControlProps {
    round: Round;
    miner: Miner | null;
    selectedSquares: Set<number>;
    selectAll: () => void;
    clearSelection: () => void;
    randomSelection: () => void;
    solBalance: number;
    automation: Automation | null;
}

export function MainControl({ round, miner, selectedSquares, selectAll, clearSelection, randomSelection, solBalance, automation }: MainControlProps) {
    const { checkpoint } = useCheckpoint();
    const { deploy } = useDeployToSquares();
    const { claimSol } = useClaimSol();
    const { claimOre } = useClaimOre();
    const { claimAll } = useClaimAll();
    const { publicKey } = useWallet();

    const [loading, setLoading] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [amount, setAmount] = useState<number>(0.01);

    const { setupAutomation, disableAutomation } = useAutomation();

    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [rounds, setRounds] = useState(10);
    const [executorFee, setExecutorFee] = useState(0.001);
    const [executorAddress, setExecutorAddress] = useState('3ukWjMXrQnNmuiJqCszcnftBhZuuYfmsxgYMmjeysn4x');

    // Set mode to auto if automation exists
    useEffect(() => {
        if (automation) {
            setMode('auto');
            setAmount(bigIntToNumber(automation.amount) / 1e9);
        }
    }, [automation]);

    const handleSetupAutomation = async () => {
        if (!publicKey) {
            toast.error('Please connect your wallet');
            return;
        }

        if (selectedSquares.size === 0) {
            toast.error('Please select at least one square');
            return;
        }

        try {
            setLoading(true);

            // Calculate deposit based on rounds
            const squareCount = selectedSquares.size;
            const costPerRound = (amount * squareCount) + executorFee;
            const depositAmount = costPerRound * rounds;

            const signature = await setupAutomation(
                executorAddress,
                amount,
                depositAmount,
                executorFee,
                'preferred',
                Array.from(selectedSquares)
            );

            toast.success(`Automation enabled! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
        } catch (error) {
            console.error('Setup automation failed:', error);
            toast.error(`Setup failed: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDisableAutomation = async () => {
        if (!publicKey) {
            toast.error('Please connect your wallet');
            return;
        }

        try {
            setLoading(true);
            const signature = await disableAutomation();
            toast.success(`Automation disabled! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
        } catch (error) {
            console.error('Disable automation failed:', error);
            toast.error(`Disable failed: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total cost and remaining rounds
    const squareCount = selectedSquares.size;
    const costPerRound = (amount * squareCount) + executorFee;
    const totalCost = costPerRound * rounds;
    const remainingRounds = automation
        ? Math.floor(bigIntToNumber(automation.balance) / 1e9 / costPerRound)
        : 0;

    const handleDeploy = async () => {
        if (selectedSquares.size === 0) {
            toast.error('Please select at least one square');
            return;
        }

        // Check if user has enough SOL balance
        const totalCost = amount * selectedSquares.size;
        const estimatedFees = 0.01; // Estimate for transaction fees
        const requiredBalance = totalCost + estimatedFees;

        if (solBalance < requiredBalance) {
            toast.error(`Insufficient balance! Need ${requiredBalance.toFixed(4)} SOL (including fees), but you have ${solBalance.toFixed(4)} SOL`);
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
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 p-4 ">
                {/* Left Column - Deploy Controls */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Deploy</h3>

                    {/* Manual/Auto Tabs */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-800/50 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('manual')}
                            disabled={!!automation}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'manual'
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:text-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Manual
                        </button>
                        <button
                            onClick={() => setMode('auto')}
                            disabled={!!automation}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'auto'
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:text-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Auto
                        </button>
                    </div>

                    {mode === 'manual' && (
                        <>
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

                            {/* Insufficient Balance Warning */}
                            {publicKey && solBalance < (amount * selectedSquares.size + 0.01) && selectedSquares.size > 0 && (
                                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-red-400 text-xs md:text-sm">
                                        <span>⚠️</span>
                                        <span className="font-semibold">Insufficient Balance</span>
                                    </div>
                                    <p className="text-xs text-red-300/80 mt-1">
                                        Need {(amount * selectedSquares.size + 0.01).toFixed(4)} SOL (including fees), but you have {solBalance.toFixed(4)} SOL
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeploy}
                                    disabled={!publicKey || deploying || selectedSquares.size === 0 || solBalance < (amount * selectedSquares.size + 0.01)}
                                    className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-sm md:text-base"
                                >
                                    {deploying ? 'Deploying...' : `Deploy to ${selectedSquares.size} Square${selectedSquares.size !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </>
                    )}

                    {mode === 'auto' && (
                        <>
                            {/* Amount Input with Quick Buttons */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-blue-400 text-lg">≈</span>
                                        <span className="text-sm text-gray-300">SOL</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.max(0.001, Number(e.target.value)))}
                                        step="0.001"
                                        min="0.001"
                                        disabled={!!automation}
                                        className="w-32 px-4 py-2 bg-gray-800 text-white text-right text-2xl font-bold border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Square Selection */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Squares</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => selectAll()}
                                            disabled={!!automation}
                                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => randomSelection()}
                                            disabled={!!automation}
                                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Random
                                        </button>
                                        <button
                                            onClick={() => clearSelection()}
                                            disabled={!!automation}
                                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            None
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rounds Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Rounds</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={rounds}
                                        onChange={(e) => setRounds(Math.max(1, Number(e.target.value)))}
                                        min="1"
                                        disabled={!!automation}
                                        className="flex-1 px-4 py-2 bg-gray-800 text-white text-right font-semibold border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-sm text-gray-400">× {squareCount}</span>
                                </div>
                            </div>

                            {/* Total Cost Display */}
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Total</span>
                                    <span className="text-xl font-bold text-white">
                                        {automation
                                            ? `${remainingRounds} rounds left`
                                            : `${totalCost.toFixed(3)} SOL`
                                        }
                                    </span>
                                </div>
                                {automation && (
                                    <div className="text-xs text-gray-500 text-right mt-1">
                                        Balance: {(bigIntToNumber(automation.balance) / 1e9).toFixed(4)} SOL
                                    </div>
                                )}
                            </div>

                            {/* Deploy/Cancel Button */}
                            {automation ? (
                                <button
                                    onClick={handleDisableAutomation}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                                >
                                    {loading ? 'Canceling...' : 'Cancel Automation'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSetupAutomation}
                                    disabled={!publicKey || loading || selectedSquares.size === 0 || solBalance < totalCost}
                                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                                >
                                    {loading ? 'Enabling...' : 'Enable Automation'}
                                </button>
                            )}

                            {!automation && solBalance < totalCost && selectedSquares.size > 0 && (
                                <div className="text-xs text-red-400 text-center">
                                    Insufficient balance. Need {totalCost.toFixed(3)} SOL
                                </div>
                            )}
                        </>
                    )}
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