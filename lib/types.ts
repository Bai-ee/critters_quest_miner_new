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
  /** The amount of ORE payout for the motherlode (from lottery) */
  oreMotherlodePayout: bigint;
  /** The amount of SOL payout for the motherlode */
  solMotherlodePayout: bigint;
  /** The account to which rent should be returned when this account is closed */
  rentPayer: string;
  /** The top miner of the round */
  topMiner: string;
  /** The amount of QUEST to distribute to the top miner */
  topMinerReward: bigint;
  /** The total amount of SOL deployed in the round */
  totalDeployed: bigint;
  /** The total number of unique miners that played in the round */
  totalMiners: bigint;
  /** The total amount of SOL put in the QUEST vault */
  totalVaulted: bigint;
  /** The total amount of SOL won by miners for the round */
  totalWinnings: bigint;
  /** The lottery outcome for the 50% ORE pool (0=split, 1=single winner, 2=motherlode) */
  lotteryOutcome: number;
  /** The motherlode tier hit (0=none, 1=minor, 2=major, 3=grand) */
  motherlodeTier: number;
}

/**
 * Stake account structure
 * Tracks a staker's ORE balance and rewards
 * Defined in: api/src/state/stake.rs
 */
export interface Stake {
  /** The authority (owner) of this stake account */
  authority: string;
  /** The balance of staked ORE (in grams) */
  balance: bigint;
  /** Timestamp of last claim */
  lastClaimAt: bigint;
  /** Timestamp of last deposit */
  lastDepositAt: bigint;
  /** Timestamp of last withdrawal */
  lastWithdrawAt: bigint;
  /** Rewards factor (fixed-point number, 16 bytes) */
  rewardsFactor: Uint8Array;
  /** Pending ORE rewards (in grams) */
  rewards: bigint;
  /** Lifetime total ORE rewards earned */
  lifetimeRewards: bigint;
}

/**
 * Treasury account structure
 * Singleton account tracking protocol balances
 * Defined in: api/src/state/treasury.rs
 */
export interface Treasury {
  /** The amount of SOL collected for buy-bury operations */
  balance: bigint;
  /** The amount of ORE in the MINOR motherlode (20% of lottery motherlode, 1/125 odds) */
  motherlodeOreMinor: bigint;
  /** The amount of ORE in the MAJOR motherlode (50% of lottery motherlode, 1/625 odds) */
  motherlodeOreMajor: bigint;
  /** The amount of ORE in the GRAND motherlode (30% of lottery motherlode, 1/2500 odds) */
  motherlodeOreGrand: bigint;
  /** The amount of SOL in the MINOR motherlode (20% of SOL motherlode, 1/125 odds) */
  motherlodeSolMinor: bigint;
  /** The amount of SOL in the MAJOR motherlode (50% of SOL motherlode, 1/625 odds) */
  motherlodeSolMajor: bigint;
  /** The amount of SOL in the GRAND motherlode (30% of SOL motherlode, 1/2500 odds) */
  motherlodeSolGrand: bigint;
  /** The cumulative ORE distributed to miners */
  minerRewardsFactor: Uint8Array;
  /** The cumulative ORE distributed to stakers */
  stakeRewardsFactor: Uint8Array;
  /** The current total amount of refined ORE mining rewards */
  totalRefined: bigint;
  /** The current total amount of ORE staking deposits */
  totalStaked: bigint;
  /** The current total amount of unclaimed ORE mining rewards */
  totalUnclaimed: bigint;
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
 * Automation account structure
 * Tracks automation settings for a user
 * Defined in: api/src/state/automation.rs
 */
export interface Automation {
  /** The amount of SOL to deploy on each square per round (in lamports) */
  amount: bigint;
  /** The authority (owner) of this automation account */
  authority: string;
  /** The amount of SOL this automation has left (in lamports) */
  balance: bigint;
  /** The executor of this automation account */
  executor: string;
  /** The amount of SOL the executor should receive in fees (in lamports) */
  fee: bigint;
  /** The strategy this automation uses (0=Random, 1=Preferred) */
  strategy: bigint;
  /** The mask of squares (bitmask for Preferred, count for Random) */
  mask: bigint;
  /** Whether or not to auto-reload SOL winnings into the automation balance */
  reload: bigint;
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
