/**
 * Application Constants
 * 
 * Centralized constants for the application.
 * Use these instead of magic numbers throughout the codebase.
 */

/**
 * Mining Grid Constants
 */
export const GRID = {
  /** Total number of squares in the mining grid (5x5) */
  TOTAL_SQUARES: 25,
  /** Grid dimensions */
  ROWS: 5,
  COLUMNS: 5,
} as const;

/**
 * Solana Constants
 */
export const SOLANA = {
  /** Lamports per SOL */
  LAMPORTS_PER_SOL: 1_000_000_000,
  /** Decimals for SOL */
  SOL_DECIMALS: 9,
  /** Estimated transaction fee in SOL */
  ESTIMATED_TX_FEE: 0.01,
} as const;

/**
 * Token Constants
 */
export const TOKEN = {
  /** QUEST token decimals */
  QUEST_DECIMALS: 9,
  /** One QUEST in base units (grams) */
  ONE_QUEST: BigInt(10 ** 9),
} as const;

/**
 * Time Constants
 */
export const TIME = {
  /** Seconds per Solana slot (approximate) */
  SECONDS_PER_SLOT: 0.4,
  /** Slots per minute (approximate) */
  SLOTS_PER_MINUTE: 150,
  /** Seconds in a minute */
  SECONDS_PER_MINUTE: 60,
  /** Seconds in an hour */
  SECONDS_PER_HOUR: 3600,
  /** Seconds in a day */
  SECONDS_PER_DAY: 86400,
  /** Seconds in a year (for validation) */
  SECONDS_PER_YEAR: 31536000,
} as const;

/**
 * Round Constants
 */
export const ROUND = {
  /** Default round duration in seconds (if not calculated from slots) */
  DEFAULT_DURATION_SECONDS: 60,
  /** Maximum rounds behind to show results */
  MAX_ROUNDS_BEHIND: 2,
} as const;

/**
 * UI Constants
 */
export const UI = {
  /** Minimum button size for touch targets (in pixels) */
  MIN_TOUCH_TARGET: 44,
  /** Animation duration in milliseconds */
  ANIMATION_DURATION: 200,
  /** Long animation duration in milliseconds */
  LONG_ANIMATION_DURATION: 500,
  /** Winner animation duration in milliseconds */
  WINNER_ANIMATION_DURATION: 15000,
} as const;

/**
 * Polling Intervals (in milliseconds)
 */
export const POLLING = {
  /** Balance polling interval */
  BALANCE_INTERVAL: 10000,
  /** Token balance polling interval */
  TOKEN_BALANCE_INTERVAL: 10000,
  /** Rounds table refresh interval */
  ROUNDS_TABLE_INTERVAL: 30000,
} as const;

/**
 * Formatting Constants
 */
export const FORMATTING = {
  /** Decimal places for SOL display */
  SOL_DECIMALS: 4,
  /** Decimal places for QUEST display */
  QUEST_DECIMALS: 2,
  /** Address truncation length (show first N chars) */
  ADDRESS_PREFIX_LENGTH: 4,
  /** Address truncation length (show last N chars) */
  ADDRESS_SUFFIX_LENGTH: 4,
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  /** Minimum deploy amount in SOL */
  MIN_DEPLOY_AMOUNT: 0.001,
  /** Minimum automation rounds */
  MIN_AUTOMATION_ROUNDS: 1,
  /** Maximum automation rounds */
  MAX_AUTOMATION_ROUNDS: 1000,
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  /** Default deploy amount in SOL */
  DEPLOY_AMOUNT: 0.01,
  /** Default automation rounds */
  AUTOMATION_ROUNDS: 10,
  /** Default executor fee in SOL */
  EXECUTOR_FEE: 0.001,
  /** Default executor address */
  EXECUTOR_ADDRESS: '3ukWjMXrQnNmuiJqCszcnftBhZuuYfmsxgYMmjeysn4x',
  /** Default entropy var address */
  ENTROPY_VAR_ADDRESS: '9nmmN2Cj6Bj3ob8tteszatY87Jz2QYSpxstWiXg2v6iC',
} as const;

/**
 * Calculation Constants
 * 
 * NOTE: These values are used in calculations and should match on-chain logic.
 * Do not modify without understanding the on-chain program.
 */
export const CALCULATIONS = {
  /**
   * Annual reward calculation divisor
   * Used for: Next Round Reward = tokenBalance / 525600
   * 525600 = minutes per year (365 * 24 * 60)
   */
  MINUTES_PER_YEAR: 525600,
} as const;

