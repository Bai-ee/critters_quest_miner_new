import mongoose, { Schema, Model } from 'mongoose';

// Matches Rust WinnerRecord structure exactly
export interface IWinner {
  _id?: string; // MongoDB ObjectId
  round_id: number; // u64 in Rust
  winning_square: number; // u64 in Rust
  miner: string; // Pubkey serialized as string
  deployed_amount: number; // u64 in Rust
  sol_reward: number; // u64 in Rust (lamports)
  ore_reward_guaranteed: number; // u64 in Rust (lamports with 11 decimals)
  ore_reward_lottery: number; // u64 in Rust (lamports with 11 decimals)
  motherlode_ore_reward: number; // u64 in Rust (lamports with 11 decimals)
  motherlode_sol_reward: number; // u64 in Rust (lamports)
  is_lottery_winner: boolean; // bool in Rust
  lottery_outcome: string; // String in Rust
  timestamp: Date; // DateTime<Utc> in Rust
  created_at: Date; // DateTime<Utc> in Rust
}

const WinnerSchema = new Schema<IWinner>({
  round_id: { type: Number, required: true, index: true },
  winning_square: { type: Number, required: true },
  miner: { type: String, required: true, index: true },
  deployed_amount: { type: Number, required: true },
  sol_reward: { type: Number, required: true },
  ore_reward_guaranteed: { type: Number, required: true },
  ore_reward_lottery: { type: Number, required: true },
  motherlode_ore_reward: { type: Number, required: true },
  motherlode_sol_reward: { type: Number, required: true },
  is_lottery_winner: { type: Boolean, required: true },
  lottery_outcome: { type: String, required: true },
  timestamp: { type: Date, required: true },
  created_at: { type: Date, required: true },
});

// Compound index for efficient queries
WinnerSchema.index({ round_id: 1, miner: 1 });

const Winner: Model<IWinner> = mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema, 'winners');

export default Winner;
