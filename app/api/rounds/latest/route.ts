import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getDbConnect() {
    const { default: dbConnect } = await import('@/lib/mongodb');
    return dbConnect;
}

async function getModels() {
    const Round = (await import('@/lib/models/Round')).default;
    const Winner = (await import('@/lib/models/Winner')).default;
    return { Round, Winner };
}

export async function GET() {
    try {
        if (!process.env.MONGODB_URI) {
            return NextResponse.json(
                { success: false, error: 'MongoDB not configured' },
                { status: 503 }
            );
        }

        const dbConnect = await getDbConnect();
        await dbConnect();
        const { Round, Winner } = await getModels();

        const latestRound = await Round.findOne()
            .sort({ round_id: -1 })
            .lean();

        if (!latestRound) {
            return NextResponse.json({
                success: true,
                data: null,
            });
        }

        const expectedMiners = Number((latestRound as any).num_miners);
        const hasExpectedMiners = Number.isFinite(expectedMiners) && expectedMiners > 0;

        let minerDeploymentResults: any[] = [];
        for (let attempt = 0; attempt < 5; attempt += 1) {
            minerDeploymentResults = await mongoose.connection
                .collection('miner_deployment_results')
                .find({ round_id: latestRound.round_id })
                .toArray();

            const countComplete = hasExpectedMiners
                ? minerDeploymentResults.length >= expectedMiners
                : minerDeploymentResults.length > 0;

            const squaresComplete = minerDeploymentResults.length > 0
                ? minerDeploymentResults.every((r: any) => r.winning_square !== null && r.winning_square !== undefined)
                : false;

            const complete = countComplete && squaresComplete;

            if (complete) break;
            await sleep(200 * (attempt + 1));
        }

        const missingWinningSquare = minerDeploymentResults.some((r: any) => r.winning_square === null || r.winning_square === undefined);
        if (minerDeploymentResults.length === 0 || missingWinningSquare) {
            return NextResponse.json(
                { success: false, error: 'Miner deployment results not ready yet' },
                { status: 503 }
            );
        }

        const winners = await Winner.find({ round_id: latestRound.round_id })
            .lean();

        const winnersWithStats = winners.map((winner: any) => {
            const solReward = Number(winner.sol_reward ?? 0);
            const motherlodeSolReward = Number(winner.motherlode_sol_reward ?? 0);
            const oreGuaranteed = Number(winner.ore_reward_guaranteed ?? 0);
            const oreLottery = Number(winner.ore_reward_lottery ?? 0);
            const motherlodeOreReward = Number(winner.motherlode_ore_reward ?? 0);

            return {
                ...winner,
                miner: String(winner.miner ?? ''),
                deployed_amount: Number(winner.deployed_amount ?? 0),
                sol_reward: solReward,
                motherlode_sol_reward: motherlodeSolReward,
                ore_reward_guaranteed: oreGuaranteed,
                ore_reward_lottery: oreLottery,
                motherlode_ore_reward: motherlodeOreReward,
                total_sol_rewards: Number(winner.total_sol_rewards ?? (solReward + motherlodeSolReward)),
                total_ore_rewards: Number(winner.total_ore_rewards ?? (oreGuaranteed + oreLottery + motherlodeOreReward)),
                is_lottery_winner: Boolean(winner.is_lottery_winner ?? false),
            };
        });

        const winnersByMiner = new Map<string, any>();
        winnersWithStats.forEach((w: any) => {
            winnersByMiner.set(String(w.miner ?? ''), w);
        });

        const minersWithStats = minerDeploymentResults.map((row: any) => {
            const miner = String(row.miner_authority ?? '');
            const winner = winnersByMiner.get(miner);

            const solReward = Number(winner?.sol_reward ?? row.sol_reward ?? 0);
            const motherlodeSolReward = Number(winner?.motherlode_sol_reward ?? row.motherlode_sol_reward ?? 0);
            const oreGuaranteed = Number(winner?.ore_reward_guaranteed ?? row.ore_reward_guaranteed ?? 0);
            const oreLottery = Number(winner?.ore_reward_lottery ?? row.ore_reward_lottery ?? 0);
            const motherlodeOreReward = Number(winner?.motherlode_ore_reward ?? row.motherlode_ore_reward ?? 0);

            const totalSol = Number(winner?.total_sol_rewards ?? row.total_sol_reward ?? (solReward + motherlodeSolReward));
            const totalOre = Number(winner?.total_ore_rewards ?? row.total_ore_reward ?? (oreGuaranteed + oreLottery + motherlodeOreReward));

            return {
                ...row,
                ...winner,
                miner,
                deployed_amount: Number(row.total_deployed ?? winner?.deployed_amount ?? 0),
                sol_reward: solReward,
                motherlode_sol_reward: motherlodeSolReward,
                ore_reward_guaranteed: oreGuaranteed,
                ore_reward_lottery: oreLottery,
                motherlode_ore_reward: motherlodeOreReward,
                total_sol_rewards: totalSol,
                total_ore_rewards: totalOre,
                is_lottery_winner: Boolean(winner?.is_lottery_winner ?? row.is_lottery_winner ?? false),
            };
        });

        const minersByMiner = new Map<string, any>();
        minersWithStats.forEach((m: any) => {
            minersByMiner.set(String(m.miner ?? ''), m);
        });

        winnersWithStats.forEach((winner: any) => {
            const miner = String(winner.miner ?? '');
            if (!minersByMiner.has(miner)) {
                minersWithStats.push({
                    ...winner,
                    deployed_amount: Number(winner.deployed_amount ?? 0),
                });
            }
        });

        const normalizedMiners = minersWithStats.map((m: any) => {
            const solReward = Number(m.sol_reward ?? 0);
            const motherlodeSolReward = Number(m.motherlode_sol_reward ?? 0);
            const oreGuaranteed = Number(m.ore_reward_guaranteed ?? 0);
            const oreLottery = Number(m.ore_reward_lottery ?? 0);
            const motherlodeOreReward = Number(m.motherlode_ore_reward ?? 0);
            const winningSquare = Number(m.winning_square);

            return {
                ...m,
                miner: String(m.miner ?? m.miner_authority ?? ''),
                deployed_amount: Number(m.deployed_amount ?? m.total_deployed ?? 0),
                winning_square: winningSquare,
                sol_reward: solReward,
                motherlode_sol_reward: motherlodeSolReward,
                ore_reward_guaranteed: oreGuaranteed,
                ore_reward_lottery: oreLottery,
                motherlode_ore_reward: motherlodeOreReward,
                total_sol_rewards: Number(m.total_sol_rewards ?? m.total_sol_reward ?? (solReward + motherlodeSolReward)),
                total_ore_rewards: Number(m.total_ore_rewards ?? m.total_ore_reward ?? (oreGuaranteed + oreLottery + motherlodeOreReward)),
                is_lottery_winner: Boolean(m.is_lottery_winner ?? false),
            };
        });

        normalizedMiners.sort((a: any, b: any) => {
            if (a.total_ore_rewards > 0 || b.total_ore_rewards > 0) {
                return b.total_ore_rewards - a.total_ore_rewards;
            }
            return b.total_sol_rewards - a.total_sol_rewards;
        });

        normalizedMiners.forEach((miner: any, index: number) => {
            miner.rank = index + 1;
        });

        return NextResponse.json({
            success: true,
            data: {
                ...latestRound,
                miners: normalizedMiners,
            },
        });
    } catch (error) {
        console.error('Error fetching latest round:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch latest round data' },
            { status: 500 }
        );
    }
}
