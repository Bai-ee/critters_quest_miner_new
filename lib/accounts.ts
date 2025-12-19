import { Connection, PublicKey } from '@solana/web3.js';
import { Board, Round, Miner, Stake, Treasury, Automation, CONSTANTS } from './types';

/**
 * PDA seeds matching api/src/consts.rs
 */
const SEEDS = {
  AUTOMATION: Buffer.from('automation'),
  BOARD: Buffer.from('board'),
  ROUND: Buffer.from('round'),
  MINER: Buffer.from('miner'),
  STAKE: Buffer.from('stake'),
} as const;

/**
 * Derive the Board PDA address
 * Matches: board_pda() in api/src/state/mod.rs:42
 */
export function getBoardPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.BOARD],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Derive the Round PDA address for a specific round ID
 * Matches: round_pda(id) in api/src/state/mod.rs:58
 *
 * @param roundId - The round number
 */
export function getRoundPDA(roundId: bigint): PublicKey {
  // Convert round ID to little-endian u64 bytes
  const roundIdBuffer = Buffer.alloc(8);

  // Manually convert bigint to little-endian bytes (browser-compatible)
  const roundIdNum = Number(roundId);
  roundIdBuffer.writeUInt32LE(roundIdNum & 0xffffffff, 0); // Low 32 bits
  roundIdBuffer.writeUInt32LE(Math.floor(roundIdNum / 0x100000000), 4); // High 32 bits

  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.ROUND, roundIdBuffer],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Derive the Miner PDA address for a specific authority
 * Matches: miner_pda(authority) in api/src/state/mod.rs
 *
 * @param authority - The wallet public key of the miner
 */
export function getMinerPDA(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.MINER, authority.toBuffer()],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Fetch and deserialize the Board account
 * Structure matches: api/src/state/board.rs:9
 *
 * @param connection - Solana connection
 * @returns Deserialized Board data
 */
export async function fetchBoard(connection: Connection): Promise<Board> {
  const boardPDA = getBoardPDA();
  const accountInfo = await connection.getAccountInfo(boardPDA);

  if (!accountInfo) {
    throw new Error('Board account not found');
  }

  // Account structure:
  // - First 8 bytes: discriminator (account type identifier)
  // - Remaining bytes: Board struct data
  const data = accountInfo.data;

  if (data.length < 8) {
    throw new Error('Invalid Board account data');
  }

  // Skip discriminator (first 8 bytes)
  let offset = 8;

  // Parse Board struct (3 u64 fields)
  const roundId = data.readBigUInt64LE(offset);
  offset += 8;

  const startSlot = data.readBigUInt64LE(offset);
  offset += 8;

  const endSlot = data.readBigUInt64LE(offset);
  offset += 8;

  return {
    roundId,
    startSlot,
    endSlot,
  };
}

/**
 * Fetch and deserialize the Round account
 * Structure matches: api/src/state/round.rs:9
 *
 * @param connection - Solana connection
 * @param roundId - The round number to fetch
 * @returns Deserialized Round data
 */
export async function fetchRound(
  connection: Connection,
  roundId: bigint
): Promise<Round> {
  const roundPDA = getRoundPDA(roundId);
  const accountInfo = await connection.getAccountInfo(roundPDA);

  if (!accountInfo) {
    throw new Error(`Round account not found for round ${roundId}`);
  }

  const data = accountInfo.data;

  if (data.length < 8) {
    throw new Error('Invalid Round account data');
  }

  // Skip discriminator (first 8 bytes)
  let offset = 8;

  // Parse Round struct fields in order:

  // 1. id: u64
  const id = data.readBigUInt64LE(offset);
  offset += 8;

  // 2. deployed: [u64; 25]
  const deployed: bigint[] = [];
  for (let i = 0; i < 25; i++) {
    deployed.push(data.readBigUInt64LE(offset));
    offset += 8;
  }

  // 3. slot_hash: [u8; 32]
  const slotHash = data.subarray(offset, offset + 32);
  offset += 32;

  // 4. count: [u64; 25]
  const count: bigint[] = [];
  for (let i = 0; i < 25; i++) {
    count.push(data.readBigUInt64LE(offset));
    offset += 8;
  }

  // 5. expires_at: u64
  const expiresAt = data.readBigUInt64LE(offset);
  offset += 8;

  // 6. ore_motherlode_payout: u64
  const oreMotherlodePayout = data.readBigUInt64LE(offset);
  offset += 8;

  // 7. sol_motherlode_payout: u64
  const solMotherlodePayout = data.readBigUInt64LE(offset);
  offset += 8;

  // 8. rent_payer: Pubkey (32 bytes)
  const rentPayerBytes = data.subarray(offset, offset + 32);
  const rentPayer = new PublicKey(rentPayerBytes).toString();
  offset += 32;

  // 9. top_miner: Pubkey (32 bytes)
  const topMinerBytes = data.subarray(offset, offset + 32);
  const topMiner = new PublicKey(topMinerBytes).toString();
  offset += 32;

  // 10. top_miner_reward: u64
  const topMinerReward = data.readBigUInt64LE(offset);
  offset += 8;

  // 11. total_deployed: u64
  const totalDeployed = data.readBigUInt64LE(offset);
  offset += 8;

  // 12. total_miners: u64
  const totalMiners = data.readBigUInt64LE(offset);
  offset += 8;

  // 13. total_vaulted: u64
  const totalVaulted = data.readBigUInt64LE(offset);
  offset += 8;

  // 14. total_winnings: u64
  const totalWinnings = data.readBigUInt64LE(offset);
  offset += 8;

  // 15. lottery_outcome: u8
  const lotteryOutcome = data.readUInt8(offset);
  offset += 1;

  // 16. motherlode_tier: u8
  const motherlodeTier = data.readUInt8(offset);
  offset += 1;

  // 17. padding: [u8; 6]
  offset += 6;

  return {
    id,
    deployed,
    slotHash,
    count,
    expiresAt,
    oreMotherlodePayout,
    solMotherlodePayout,
    rentPayer,
    topMiner,
    topMinerReward,
    totalDeployed,
    totalMiners,
    totalVaulted,
    totalWinnings,
    lotteryOutcome,
    motherlodeTier,
  };
}

/**
 * Derive the Treasury PDA address
 * Seeds: ["treasury"]
 */
export function getTreasuryPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Fetch and deserialize the Treasury account
 * Structure matches: api/src/state/treasury.rs
 *
 * @param connection - Solana connection
 * @returns Deserialized Treasury data
 */
export async function fetchTreasury(connection: Connection): Promise<Treasury> {
  const treasuryPDA = getTreasuryPDA();
  const accountInfo = await connection.getAccountInfo(treasuryPDA);

  if (!accountInfo) {
    throw new Error('Treasury account not found');
  }

  const data = accountInfo.data;

  if (data.length < 8) {
    throw new Error('Invalid Treasury account data');
  }

  // Skip discriminator (first 8 bytes)
  let offset = 8;

  // Parse Treasury struct fields in order:

  // 1. balance: u64
  const balance = data.readBigUInt64LE(offset);
  offset += 8;

  // 2. buffer_a: u64
  offset += 8;

  // 3. motherlode_ore_minor: u64
  const motherlodeOreMinor = data.readBigUInt64LE(offset);
  offset += 8;

  // 4. motherlode_ore_major: u64
  const motherlodeOreMajor = data.readBigUInt64LE(offset);
  offset += 8;

  // 5. motherlode_ore_grand: u64
  const motherlodeOreGrand = data.readBigUInt64LE(offset);
  offset += 8;

  // 6. motherlode_sol_minor: u64
  const motherlodeSolMinor = data.readBigUInt64LE(offset);
  offset += 8;

  // 7. motherlode_sol_major: u64
  const motherlodeSolMajor = data.readBigUInt64LE(offset);
  offset += 8;

  // 8. motherlode_sol_grand: u64
  const motherlodeSolGrand = data.readBigUInt64LE(offset);
  offset += 8;

  // 9. miner_rewards_factor: Numeric (16 bytes)
  const minerRewardsFactor = data.subarray(offset, offset + 16);
  offset += 16;

  // 10. stake_rewards_factor: Numeric (16 bytes)
  const stakeRewardsFactor = data.subarray(offset, offset + 16);
  offset += 16;

  // 11. buffer_b: u64
  offset += 8;

  // 12. total_refined: u64
  const totalRefined = data.readBigUInt64LE(offset);
  offset += 8;

  // 13. total_staked: u64
  const totalStaked = data.readBigUInt64LE(offset);
  offset += 8;

  // 14. total_unclaimed: u64
  const totalUnclaimed = data.readBigUInt64LE(offset);
  offset += 8;

  return {
    balance,
    motherlodeOreMinor,
    motherlodeOreMajor,
    motherlodeOreGrand,
    motherlodeSolMinor,
    motherlodeSolMajor,
    motherlodeSolGrand,
    minerRewardsFactor,
    stakeRewardsFactor,
    totalRefined,
    totalStaked,
    totalUnclaimed,
  };
}

/**
 * Utility: Convert lamports to SOL
 */
export function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / Number(CONSTANTS.LAMPORTS_PER_SOL);
}

/**
 * Calculate the winning square from a round's slot hash
 * Matches: winning_square() in api/src/state/round.rs
 *
 * @param slotHash - The 32-byte slot hash from the round
 * @returns The winning square index (0-24), or null if no hash available
 */
export function getWinningSquare(slotHash: Uint8Array): number | null {
  // Check if slot hash is all zeros (round not finalized)
  const isZeroHash = slotHash.every(byte => byte === 0);
  if (isZeroHash) {
    return null;
  }

  // Convert first 8 bytes of slot hash to u64 (little-endian)
  // This mimics how the Rust code generates the RNG value
  let rng = 0n;
  for (let i = 0; i < 8; i++) {
    rng |= BigInt(slotHash[i]) << BigInt(i * 8);
  }

  // Calculate winning square: (rng % 25)
  return Number(rng % 25n);
}

/**
 * Utility: Convert QUEST base units (grams) to QUEST tokens
 */
export function gramsToOre(grams: bigint): number {
  return Number(grams) / Number(CONSTANTS.ONE_ORE);
}

/**
 * Utility: Calculate time remaining from current slot to end slot
 * @returns Seconds remaining (approximate)
 */
export function calculateTimeRemaining(
  currentSlot: bigint,
  endSlot: bigint
): number {
  const slotsRemaining = Number(endSlot - currentSlot);
  return Math.max(0, Math.floor(slotsRemaining * CONSTANTS.SECONDS_PER_SLOT));
}

/**
 * Fetch and deserialize the Miner account for a given authority
 * Structure matches: api/src/state/miner.rs
 *
 * @param connection - Solana connection
 * @param authority - The wallet public key of the miner
 * @returns Deserialized Miner data, or null if account doesn't exist
 */
export async function fetchMiner(
  connection: Connection,
  authority: PublicKey
): Promise<Miner | null> {
  const minerPDA = getMinerPDA(authority);
  const accountInfo = await connection.getAccountInfo(minerPDA);

  if (!accountInfo) {
    // Miner account doesn't exist yet (user hasn't deployed)
    return null;
  }

  const data = accountInfo.data;

  if (data.length < 8) {
    throw new Error('Invalid Miner account data');
  }

  // Skip discriminator (first 8 bytes)
  let offset = 8;

  // Parse Miner struct fields in order:

  // 1. authority: Pubkey (32 bytes)
  const authorityBytes = data.subarray(offset, offset + 32);
  const authorityPubkey = new PublicKey(authorityBytes).toString();
  offset += 32;

  // 2. deployed: [u64; 25]
  const deployed: bigint[] = [];
  for (let i = 0; i < 25; i++) {
    deployed.push(data.readBigUInt64LE(offset));
    offset += 8;
  }

  // 3. cumulative: [u64; 25]
  const cumulative: bigint[] = [];
  for (let i = 0; i < 25; i++) {
    cumulative.push(data.readBigUInt64LE(offset));
    offset += 8;
  }

  // 4. checkpoint_fee: u64
  const checkpointFee = data.readBigUInt64LE(offset);
  offset += 8;

  // 5. checkpoint_id: u64
  const checkpointId = data.readBigUInt64LE(offset);
  offset += 8;

  // 6. last_claim_ore_at: i64 (read as u64 then convert)
  const lastClaimOreAt = data.readBigUInt64LE(offset);
  offset += 8;

  // 7. last_claim_sol_at: i64 (read as u64 then convert)
  const lastClaimSolAt = data.readBigUInt64LE(offset);
  offset += 8;

  // 8. rewards_factor: Numeric (16 bytes)
  const rewardsFactor = data.subarray(offset, offset + 16);
  offset += 16;

  // 9. rewards_sol: u64
  const rewardsSol = data.readBigUInt64LE(offset);
  offset += 8;

  // 10. rewards_ore: u64
  const rewardsOre = data.readBigUInt64LE(offset);
  offset += 8;

  // 11. refined_ore: u64
  const refinedOre = data.readBigUInt64LE(offset);
  offset += 8;

  // 12. round_id: u64
  const roundId = data.readBigUInt64LE(offset);
  offset += 8;

  // 13. lifetime_rewards_sol: u64
  const lifetimeRewardsSol = data.readBigUInt64LE(offset);
  offset += 8;

  // 14. lifetime_rewards_ore: u64
  const lifetimeRewardsOre = data.readBigUInt64LE(offset);
  offset += 8;

  // 15. lifetime_deployed: u64
  const lifetimeDeployed = data.readBigUInt64LE(offset);
  offset += 8;

  return {
    authority: authorityPubkey,
    deployed,
    cumulative,
    checkpointFee,
    checkpointId,
    lastClaimOreAt,
    lastClaimSolAt,
    rewardsFactor,
    rewardsSol,
    rewardsOre,
    refinedOre,
    roundId,
    lifetimeRewardsSol,
    lifetimeRewardsOre,
    lifetimeDeployed,
  };
}

/**
 * Derive the Stake PDA address for a specific authority
 * Matches: stake_pda(authority) in api/src/state/mod.rs
 *
 * @param authority - The wallet public key of the staker
 */
export function getStakePDA(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.STAKE, authority.toBuffer()],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Helper: Decode a Q64.64 fixed-point number from 16 bytes
 */
function decodeNumericQ64_64LE(bytes: Uint8Array): bigint {
  if (bytes.length !== 16) {
    throw new Error(`Invalid Numeric length: ${bytes.length}`);
  }
  let v = 0n;
  for (let i = 0; i < 16; i++) {
    v |= BigInt(bytes[i] ?? 0) << (8n * BigInt(i));
  }
  return v;
}

const Q64 = 1n << 64n;

/**
 * Compute claimable lamports from staking rewards
 * @param stake - The user's Stake account
 * @param treasury - The Treasury account
 * @returns Total claimable lamports (including pending rewards)
 */
export function computeStakeClaimableLamports(stake: Stake, treasury: Treasury): bigint {
  const stakeFactor = decodeNumericQ64_64LE(stake.rewardsFactor);
  const treasuryFactor = decodeNumericQ64_64LE(treasury.stakeRewardsFactor);

  const diff = treasuryFactor - stakeFactor;
  if (diff <= 0n) {
    return stake.rewards;
  }

  const pending = (diff * stake.balance) / Q64;
  return stake.rewards + pending;
}

/**
 * Fetch and deserialize the Stake account for a given authority
 * Structure matches: api/src/state/stake.rs
 *
 * @param connection - Solana connection
 * @param authority - The wallet public key of the staker
 * @returns Deserialized Stake data, or null if account doesn't exist
 */
export async function fetchStake(
  connection: Connection,
  authority: PublicKey
): Promise<Stake | null> {
  const stakePDA = getStakePDA(authority);
  const accountInfo = await connection.getAccountInfo(stakePDA);

  if (!accountInfo) {
    // Stake account doesn't exist yet (user hasn't staked)
    return null;
  }

  const data = accountInfo.data;

  if (data.length < 8) {
    throw new Error('Invalid Stake account data');
  }

  // Skip discriminator (first 8 bytes)
  let offset = 8;

  // Parse Stake struct fields in order:

  // 1. authority: Pubkey (32 bytes)
  const authorityBytes = data.subarray(offset, offset + 32);
  const authorityPubkey = new PublicKey(authorityBytes).toString();
  offset += 32;

  // 2. balance: u64
  const balance = data.readBigUInt64LE(offset);
  offset += 8;

  // 3-7. buffer_a through buffer_e: u64 (5 * 8 = 40 bytes)
  offset += 40;

  // 8. last_claim_at: i64 (read as u64 then convert)
  const lastClaimAt = data.readBigUInt64LE(offset);
  offset += 8;

  // 9. last_deposit_at: i64 (read as u64 then convert)
  const lastDepositAt = data.readBigUInt64LE(offset);
  offset += 8;

  // 10. last_withdraw_at: i64 (read as u64 then convert)
  const lastWithdrawAt = data.readBigUInt64LE(offset);
  offset += 8;

  // 11. rewards_factor: Numeric (16 bytes)
  const rewardsFactor = data.subarray(offset, offset + 16);
  offset += 16;

  // 12. rewards: u64
  const rewards = data.readBigUInt64LE(offset);
  offset += 8;

  // 13. lifetime_rewards: u64
  const lifetimeRewards = data.readBigUInt64LE(offset);
  offset += 8;

  // 14. buffer_f: u64
  offset += 8;

  return {
    authority: authorityPubkey,
    balance,
    lastClaimAt,
    lastDepositAt,
    lastWithdrawAt,
    rewardsFactor,
    rewards,
    lifetimeRewards,
  };
}

/**
 * Derive the Automation PDA address for a specific authority
 * Matches: automation_pda(authority) in api/src/state/mod.rs
 *
 * @param authority - The wallet public key of the user
 */
export function getAutomationPDA(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.AUTOMATION, authority.toBuffer()],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Fetch and deserialize the Automation account for a given authority
 * Structure matches: api/src/state/automation.rs
 *
 * @param connection - Solana connection
 * @param authority - The wallet public key of the user
 * @returns Deserialized Automation data, or null if account doesn't exist
 */
export async function fetchAutomation(
  connection: Connection,
  authority: PublicKey
): Promise<Automation | null> {
  const automationPDA = getAutomationPDA(authority);
  const accountInfo = await connection.getAccountInfo(automationPDA);

  if (!accountInfo) {
    // Automation account doesn't exist yet
    return null;
  }

  const data = accountInfo.data;

  if (data.length < 8) {
    throw new Error('Invalid Automation account data');
  }

  // Skip discriminator (first 8 bytes)
  let offset = 8;

  // Parse Automation struct fields in order:

  // 1. amount: u64
  const amount = data.readBigUInt64LE(offset);
  offset += 8;

  // 2. authority: Pubkey (32 bytes)
  const authorityBytes = data.subarray(offset, offset + 32);
  const authorityPubkey = new PublicKey(authorityBytes).toString();
  offset += 32;

  // 3. balance: u64
  const balance = data.readBigUInt64LE(offset);
  offset += 8;

  // 4. executor: Pubkey (32 bytes)
  const executorBytes = data.subarray(offset, offset + 32);
  const executor = new PublicKey(executorBytes).toString();
  offset += 32;

  // 5. fee: u64
  const fee = data.readBigUInt64LE(offset);
  offset += 8;

  // 6. strategy: u64
  const strategy = data.readBigUInt64LE(offset);
  offset += 8;

  // 7. mask: u64
  const mask = data.readBigUInt64LE(offset);
  offset += 8;

  // 8. reload: u64
  const reload = data.readBigUInt64LE(offset);
  offset += 8;

  return {
    amount,
    authority: authorityPubkey,
    balance,
    executor,
    fee,
    strategy,
    mask,
    reload,
  };
}
