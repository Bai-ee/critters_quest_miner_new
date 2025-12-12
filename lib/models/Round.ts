import mongoose, { Schema, Model } from 'mongoose';

// Matches Rust RoundRecord structure exactly
export interface IRound {
  _id?: string; // MongoDB ObjectId
  round_id: number; // u64 in Rust
  winning_square: number; // u64 in Rust
  top_miner: string; // Pubkey serialized as string
  num_winners: number; // u64 in Rust
  total_deployed: number; // u64 in Rust (lamports)
  total_vaulted: number; // u64 in Rust (lamports)
  total_winnings: number; // u64 in Rust (lamports)
  total_minted: number; // u64 in Rust (lamports)
  lottery_outcome: string; // "Split" | "Single Winner" | "Motherlode"
  motherlode_tier: string; // "None" | "Minor" | "Major" | "Grand"
  ore_motherlode_payout: number; // u64 in Rust
  sol_motherlode_payout: number; // u64 in Rust
  start_slot: number; // u64 in Rust
  end_slot: number; // u64 in Rust
  timestamp: Date; // DateTime<Utc> in Rust
  created_at: Date; // DateTime<Utc> in Rust
  round_winner?: string; // Option<Pubkey> serialized as string
}

const RoundSchema = new Schema<IRound>({
  round_id: { type: Number, required: true, unique: true, index: true },
  winning_square: { type: Number, required: true },
  top_miner: { type: String, required: true },
  num_winners: { type: Number, required: true },
  total_deployed: { type: Number, required: true },
  total_vaulted: { type: Number, required: true },
  total_winnings: { type: Number, required: true },
  total_minted: { type: Number, required: true },
  lottery_outcome: { type: String, required: true },
  motherlode_tier: { type: String, required: true },
  ore_motherlode_payout: { type: Number, required: true },
  sol_motherlode_payout: { type: Number, required: true },
  start_slot: { type: Number, required: true },
  end_slot: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  created_at: { type: Date, required: true },
  round_winner: { type: String, required: false },
});

const Round: Model<IRound> = mongoose.models.Round || mongoose.model<IRound>('Round', RoundSchema, 'rounds');

export default Round;
