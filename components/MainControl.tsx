import { useAutomation, useCheckpoint, useClaimAll, useClaimOre, useClaimSol, useDeployToSquares } from '@/lib/instrucionsHooks';
import { bigIntToNumber } from '@/lib/formatters';
import { Automation, Miner, Round } from '@/lib/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlossyButton } from './GlossyButton';

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
            // Cost per round = (amount per square × number of squares) + executor fee
            const squareCount = selectedSquares.size;
            const costPerRound = (amount * squareCount) + executorFee;
            const depositAmount = costPerRound * rounds;

            // Enable automation - executor will handle deployments
            const signature = await setupAutomation(
                executorAddress,
                amount,
                depositAmount,
                executorFee,
                'preferred',
                Array.from(selectedSquares)
            );

            toast.success(`Automation enabled! ${signature.slice(0, 8)}...${signature.slice(-8)}`);
            clearSelection(); // Clear selection after successful setup
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
    // Cost per round = (amount per square × number of squares) + executor fee
    const squareCount = selectedSquares.size;
    const costPerRound = squareCount > 0 ? (amount * squareCount) + executorFee : 0;
    const totalCost = costPerRound * rounds;

    // For automation, calculate remaining rounds based on selected squares from mask
    const remainingRounds = automation ? (() => {
        // Count how many squares are in the automation mask
        let automationSquareCount = 0;
        for (let i = 0; i < 25; i++) {
            if ((automation.mask & (1n << BigInt(i))) !== 0n) {
                automationSquareCount++;
            }
        }
        const automationCostPerRound = (bigIntToNumber(automation.amount) / 1e9 * automationSquareCount) + (bigIntToNumber(automation.fee) / 1e9);
        return Math.floor(bigIntToNumber(automation.balance) / 1e9 / automationCostPerRound);
    })() : 0;

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
        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
            {/* Mode Tabs + Selection Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('manual')}
                        disabled={!!automation}
                        className={`cq-button-secondary px-3 py-2 text-xs sm:text-sm font-bold ${
                            mode === 'manual' ? 'bg-cq-neon/20 border-cq-neon/50 text-cq-neon' : 'text-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        MANUAL
                    </button>
                    <button
                        onClick={() => setMode('auto')}
                        disabled={!!automation}
                        className={`cq-button-secondary px-3 py-2 text-xs sm:text-sm font-bold ${
                            mode === 'auto' ? 'bg-cq-neon/20 border-cq-neon/50 text-cq-neon' : 'text-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        AUTO
                    </button>
                </div>
            </div>

            {mode === 'manual' && (
                <>
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                        <div className="cq-panel px-3 py-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">AMOUNT:</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="0.001"
                                step="0.001"
                                min="0.001"
                                className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none w-20"
                            />
                        </div>
                        <div className="cq-jackpot-strip px-3 py-2 flex items-center justify-between min-w-[120px]">
                            <span className="text-xs text-gray-400">COST:</span>
                            <span className="text-sm font-bold text-cq-gold">{(amount * selectedSquares.size).toFixed(4)}</span>
                        </div>
                        {/* MINE Button - Commented out from expanded controls (using bottom bar MINE button instead) */}
                        {/* <GlossyButton
                            onClick={handleDeploy}
                            disabled={!publicKey || deploying || selectedSquares.size === 0 || solBalance < (amount * selectedSquares.size + 0.01)}
                            size="lg"
                            variant="success"
                            className="w-full sm:w-auto min-w-[220px]"
                        >
                            {deploying ? 'DEPLOYING...' : 'MINE'}
                        </GlossyButton> */}
                    </div>
                </>
            )}

            {mode === 'auto' && (
                <>
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                        <div className="cq-panel px-3 py-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">AMOUNT:</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="0.001"
                                step="0.001"
                                min="0.001"
                                className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none w-20"
                            />
                        </div>
                        <div className="cq-panel px-3 py-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">ROUNDS:</span>
                            <input
                                type="number"
                                value={rounds}
                                onChange={(e) => setRounds(Math.max(1, Number(e.target.value)))}
                                min="1"
                                disabled={!!automation}
                                className="flex-1 bg-transparent text-white text-sm font-bold text-right focus:outline-none w-16 disabled:opacity-50"
                            />
                        </div>
                        <div className="cq-jackpot-strip px-3 py-2 flex items-center justify-between min-w-[140px]">
                            <span className="text-xs text-gray-400">TOTAL:</span>
                            <span className="text-sm font-bold text-cq-gold">
                                {automation ? `${remainingRounds} left` : `${totalCost.toFixed(3)} SOL`}
                            </span>
                        </div>
                        {automation ? (
                            <GlossyButton
                                onClick={handleDisableAutomation}
                                disabled={loading}
                                variant="danger"
                                size="md"
                                className="w-full sm:w-auto min-w-[180px]"
                            >
                                {loading ? 'CANCELING...' : 'CANCEL'}
                            </GlossyButton>
                        ) : (
                            <GlossyButton
                                onClick={handleSetupAutomation}
                                disabled={!publicKey || loading || selectedSquares.size === 0 || solBalance < totalCost}
                                size="lg"
                                className="w-full sm:w-auto min-w-[220px]"
                            >
                                {loading ? 'ENABLING...' : 'ENABLE AUTO'}
                            </GlossyButton>
                        )}
                    </div>
                </>
            )}

            {/* Rewards Section */}
            <div className="flex items-center gap-2 sm:gap-3">
                {miner && miner.checkpointId < miner.roundId && miner.roundId < round.id && (
                    <GlossyButton
                        onClick={handleCheckpoint}
                        disabled={!publicKey}
                        size="sm"
                        className="min-w-[120px]"
                    >
                        CHECKPOINT
                    </GlossyButton>
                )}
                <div className="cq-jackpot-strip px-3 py-2 flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400">SOL</div>
                        <div className="text-sm font-bold text-cq-gold">
                            {miner?.rewardsSol ? (bigIntToNumber(miner.rewardsSol) / 1e9).toFixed(2) : '0.00'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400">QUEST</div>
                        <div className="text-sm font-bold text-cq-neon">
                            {miner?.rewardsOre ? (bigIntToNumber(miner.rewardsOre) / 1e9).toFixed(2) : '0.00'}
                        </div>
                    </div>
                </div>
                <GlossyButton
                    onClick={handleClaimAll}
                    disabled={!publicKey || !miner || (bigIntToNumber(miner.rewardsSol) === 0 && bigIntToNumber(miner.rewardsOre) === 0)}
                    size="md"
                    className="w-full sm:w-auto min-w-[180px]"
                >
                    CLAIM ALL
                </GlossyButton>
            </div>
        </div>
    );
}