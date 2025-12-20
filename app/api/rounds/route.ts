import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

async function getDbConnect() {
    const { default: dbConnect } = await import('@/lib/mongodb');
    return dbConnect;
}

async function getModels() {
    const Round = (await import('@/lib/models/Round')).default;
    const Winner = (await import('@/lib/models/Winner')).default;
    return { Round, Winner };
}

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const rounds = await Round.find()
            .sort({ round_id: -1 })
            .limit(limit)
            .lean();

        const roundIds = rounds.map((r: any) => r.round_id);
        const winners = await Winner.find({ round_id: { $in: roundIds } })
            .lean();

        const winnersByRound = winners.reduce((acc: any, winner: any) => {
            if (!acc[winner.round_id]) {
                acc[winner.round_id] = [];
            }
            acc[winner.round_id].push(winner);
            return acc;
        }, {} as Record<number, any[]>);

        Object.keys(winnersByRound).forEach((roundId) => {
            const roundWinners = winnersByRound[parseInt(roundId)];

            roundWinners.forEach((winner: any) => {
                winner.total_ore_rewards =
                    winner.ore_reward_guaranteed +
                    winner.ore_reward_lottery +
                    winner.motherlode_ore_reward;

                winner.total_sol_rewards =
                    winner.sol_reward +
                    winner.motherlode_sol_reward;
            });

            roundWinners.sort((a: any, b: any) => {
                if (a.total_ore_rewards > 0 || b.total_ore_rewards > 0) {
                    return b.total_ore_rewards - a.total_ore_rewards;
                }
                return b.total_sol_rewards - a.total_sol_rewards;
            });

            roundWinners.forEach((winner: any, index: number) => {
                winner.rank = index + 1;
            });
        });

        const roundsWithWinners = rounds.map((round: any) => ({
            ...round,
            winners: winnersByRound[round.round_id] || [],
        }));

        return NextResponse.json({
            success: true,
            data: roundsWithWinners,
        });
    } catch (error) {
        console.error('Error fetching rounds:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch rounds data' },
            { status: 500 }
        );
    }
}
