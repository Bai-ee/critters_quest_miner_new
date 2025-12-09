/**
 * TypeScript types matching the on-chain Rust state structures
 * These mirror the structs defined in api/src/state/
 */

/**
 * Board account structure
 * Defined in: api/src/state/board.rs
 */
export interface Board {
  /** The current round number */
  roundId: bigint;
  /** The slot at which the current round starts mining */
  startSlot: bigint;
  /** The slot at which the current round ends mining */
  endSlot: bigint;
}

/**
 * Round account structure
 * Defined in: api/src/state/round.rs
 */
export interface Round {
  /** The round number */
  id: bigint;
  /** The amount of SOL deployed in each square (25 squares in 5x5 grid) - in lamports */
  deployed: bigint[];
  /** The hash of the end slot, used for random number generation */
  slotHash: Uint8Array;
  /** The count of miners on each square (25 squares) */
  count: bigint[];
  /** The slot at which claims for this round account end */
  expiresAt: bigint;
  /** The amount of QUEST in the motherlode (in "grams" - 1 QUEST = 10^11 grams) */
  motherlode: bigint;
  /** The account to which rent should be returned when this account is closed */
  rentPayer: string;
  /** The top miner of the round */
  topMiner: string;
  /** The amount of QUEST to distribute to the top miner */
  topMinerReward: bigint;
  /** The total amount of SOL deployed in the round */
  totalDeployed: bigint;
  /** The total amount of SOL put in the QUEST vault */
  totalVaulted: bigint;
  /** The total amount of SOL won by miners for the round */
  totalWinnings: bigint;
}

/**
 * Miner account structure
 * Tracks a miner's deployed SOL and reward balances
 */
export interface Miner {
  /** The authority (owner) of this miner account */
  authority: string;
  /** The amount of SOL deployed in each square (25 squares) - in lamports */
  deployed: bigint[];
  /** Cumulative deployment tracking for each square */
  cumulative: bigint[];
  /** Fee for checkpoint operations */
  checkpointFee: bigint;
  /** Last checkpoint round ID */
  checkpointId: bigint;
  /** Timestamp of last QUEST claim */
  lastClaimOreAt: bigint;
  /** Timestamp of last SOL claim */
  lastClaimSolAt: bigint;
  /** Rewards factor (fixed-point number, 16 bytes) */
  rewardsFactor: Uint8Array;
  /** Pending SOL rewards (in lamports) */
  rewardsSol: bigint;
  /** Pending QUEST rewards (in grams) */
  rewardsOre: bigint;
  /** Refined QUEST amount */
  refinedOre: bigint;
  /** Current round ID */
  roundId: bigint;
  /** Lifetime total SOL rewards earned */
  lifetimeRewardsSol: bigint;
  /** Lifetime total QUEST rewards earned */
  lifetimeRewardsOre: bigint;
  /** Lifetime total SOL deployed */
  lifetimeDeployed: bigint;
}

/**
 * Constants from api/src/consts.rs
 */
export const CONSTANTS = {
  /** Program ID */
  PROGRAM_ID: 'CQMzH6PeaLsNqJdMcT935SJAsfiD2mwdH33PE9PZ3fLr',

  /** Token decimals - 11 decimals (100 billion indivisible units per QUEST) */
  TOKEN_DECIMALS: 9,

  /** One QUEST in base units (grams) */
  ONE_ORE: BigInt(10 ** 9),

  /** Lamports per SOL */
  LAMPORTS_PER_SOL: BigInt(10 ** 9),

  /** Approximately 150 slots per minute on Solana */
  SLOTS_PER_MINUTE: 150,

  /** Approximate seconds per slot */
  SECONDS_PER_SLOT: 0.4,
} as const;
