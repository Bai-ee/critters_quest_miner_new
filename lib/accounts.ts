import { Connection, PublicKey } from '@solana/web3.js';
import { Board, Round, Miner, CONSTANTS } from './types';

/**
 * PDA seeds matching api/src/consts.rs
 */
const SEEDS = {
  BOARD: Buffer.from('board'),
  ROUND: Buffer.from('round'),
  MINER: Buffer.from('miner'),
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

  // 6. motherlode: u64
  const motherlode = data.readBigUInt64LE(offset);
  offset += 8;

  // 7. rent_payer: Pubkey (32 bytes)
  const rentPayerBytes = data.subarray(offset, offset + 32);
  const rentPayer = new PublicKey(rentPayerBytes).toString();
  offset += 32;

  // 8. top_miner: Pubkey (32 bytes)
  const topMinerBytes = data.subarray(offset, offset + 32);
  const topMiner = new PublicKey(topMinerBytes).toString();
  offset += 32;

  // 9. top_miner_reward: u64
  const topMinerReward = data.readBigUInt64LE(offset);
  offset += 8;

  // 10. total_deployed: u64
  const totalDeployed = data.readBigUInt64LE(offset);
  offset += 8;

  // 11. total_vaulted: u64
  const totalVaulted = data.readBigUInt64LE(offset);
  offset += 8;

  // 12. total_winnings: u64
  const totalWinnings = data.readBigUInt64LE(offset);
  offset += 8;

  return {
    id,
    deployed,
    slotHash,
    count,
    expiresAt,
    motherlode,
    rentPayer,
    topMiner,
    topMinerReward,
    totalDeployed,
    totalVaulted,
    totalWinnings,
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
 * The Treasury account stores the motherlode value
 * Structure from IDL:
 * - discriminator: [u8; 8]
 * - balance: u64
 * - buffer_a: u64
 * - motherlode: u64
 * - miner_rewards_factor: Numeric (16 bytes)
 * - stake_rewards_factor: Numeric (16 bytes)
 * - buffer_b: u64
 * - total_refined: u64
 *
 * @param connection - Solana connection
 * @returns The motherlode value in grams (base units)
 */
export async function fetchTreasury(connection: Connection): Promise<bigint> {
  const treasuryPDA = getTreasuryPDA();
  const accountInfo = await connection.getAccountInfo(treasuryPDA);

  if (!accountInfo) {
    throw new Error('Treasury account not found');
  }

  const data = accountInfo.data;

  if (data.length < 32) {
    throw new Error('Invalid Treasury account data');
  }

  // Skip discriminator (8 bytes)
  let offset = 8;

  // Skip balance: u64
  offset += 8;

  // Skip buffer_a: u64
  offset += 8;

  // Read motherlode: u64 (at offset 24)
  const motherlode = data.readBigUInt64LE(offset);
  
  return motherlode;
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

