import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_SLOT_HASHES_PUBKEY,
} from '@solana/web3.js';
import { CONSTANTS } from './types';
import { getBoardPDA, getRoundPDA } from './accounts';

/**
 * Program addresses from the IDL
 */
const PROGRAM_ADDRESSES = {
  ORE_PROGRAM: new PublicKey('CQMzH6PeaLsNqJdMcT935SJAsfiD2mwdH33PE9PZ3fLr'),
  TOKEN_PROGRAM: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  ASSOCIATED_TOKEN_PROGRAM: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
  ENTROPY_PROGRAM: new PublicKey('CQrnd9EcS7jSUTs2HCHL31kFhGWGuAqzdcQfAo1tn6Ft'),
  ORE_MINT: new PublicKey('QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s'),
} as const;

/**
 * PDA seed constants
 */
const SEEDS = {
  AUTOMATION: Buffer.from('automation'),
  MINER: Buffer.from('miner'),
  TREASURY: Buffer.from('treasury'),
  ROUND: Buffer.from('round'),
  BOARD: Buffer.from('board'),
} as const;

/**
 * Instruction discriminators from the IDL
 */
const DISCRIMINATORS = {
  AUTOMATE: 0,
  DEPLOY: 6,
  CHECKPOINT: 2,
  CLAIM_SOL: 3,
  CLAIM_ORE: 4,
} as const;

/**
 * Get the Automation PDA for a given authority
 * Seeds: ["automation", authority]
 */
export function getAutomationPDA(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.AUTOMATION, authority.toBuffer()],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Get the Miner PDA for a given authority
 * Seeds: ["miner", authority]
 */
export function getMinerPDA(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.MINER, authority.toBuffer()],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Get the Treasury PDA
 * Seeds: ["treasury"]
 */
export function getTreasuryPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEEDS.TREASURY],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Get the Config PDA
 * Seeds: ["config"]
 */
export function getConfigPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    new PublicKey(CONSTANTS.PROGRAM_ID)
  );
  return pda;
}

/**
 * Get the associated token account address for a given owner and mint
 */
export function getAssociatedTokenAddress(
  owner: PublicKey,
  mint: PublicKey
): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      PROGRAM_ADDRESSES.TOKEN_PROGRAM.toBuffer(),
      mint.toBuffer(),
    ],
    PROGRAM_ADDRESSES.ASSOCIATED_TOKEN_PROGRAM
  );
  return address;
}

/**
 * Automation strategy enum
 */
export enum AutomationStrategy {
  Random = 0,
  Preferred = 1,
}

/**
 * Create an Automate instruction
 *
 * Sets up or updates automation for a user's account.
 *
 * @param signer - The transaction signer (user/authority)
 * @param executor - The executor who will run automated deployments
 * @param amount - Amount of SOL to deploy per square (in lamports)
 * @param deposit - Initial SOL deposit to fund automation (in lamports)
 * @param fee - Fee to pay executor per deployment (in lamports)
 * @param strategy - Automation strategy (Random or Preferred)
 * @param mask - Square selection mask (bitmask for Preferred, count for Random)
 * @param reload - Whether to auto-reload winnings into automation balance
 * @returns TransactionInstruction
 */
export function createAutomateInstruction(
  signer: PublicKey,
  executor: PublicKey,
  amount: bigint,
  deposit: bigint,
  fee: bigint,
  strategy: AutomationStrategy,
  mask: bigint,
  reload: boolean
): TransactionInstruction {
  const automationPDA = getAutomationPDA(signer);
  const boardPDA = getBoardPDA();
  const minerPDA = getMinerPDA(signer);

  // Serialize instruction data
  // Format: [discriminator: u8, amount: u64, deposit: u64, fee: u64, mask: u64, strategy: u8, reload: u64]
  const data = Buffer.alloc(1 + 8 + 8 + 8 + 8 + 1 + 8);
  let offset = 0;

  // Discriminator
  data.writeUInt8(DISCRIMINATORS.AUTOMATE, offset);
  offset += 1;

  // Amount (u64, little-endian)
  const amountNum = Number(amount);
  data.writeUInt32LE(amountNum & 0xffffffff, offset);
  data.writeUInt32LE(Math.floor(amountNum / 0x100000000), offset + 4);
  offset += 8;

  // Deposit (u64, little-endian)
  const depositNum = Number(deposit);
  data.writeUInt32LE(depositNum & 0xffffffff, offset);
  data.writeUInt32LE(Math.floor(depositNum / 0x100000000), offset + 4);
  offset += 8;

  // Fee (u64, little-endian)
  const feeNum = Number(fee);
  data.writeUInt32LE(feeNum & 0xffffffff, offset);
  data.writeUInt32LE(Math.floor(feeNum / 0x100000000), offset + 4);
  offset += 8;

  // Mask (u64, little-endian)
  const maskNum = Number(mask);
  data.writeUInt32LE(maskNum & 0xffffffff, offset);
  data.writeUInt32LE(Math.floor(maskNum / 0x100000000), offset + 4);
  offset += 8;

  // Strategy (u8)
  data.writeUInt8(strategy, offset);
  offset += 1;

  // Reload (u64, little-endian)
  const reloadNum = reload ? 1 : 0;
  data.writeUInt32LE(reloadNum, offset);
  data.writeUInt32LE(0, offset + 4);

  return new TransactionInstruction({
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: automationPDA, isSigner: false, isWritable: true },
      { pubkey: boardPDA, isSigner: false, isWritable: true },
      { pubkey: executor, isSigner: false, isWritable: false },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new PublicKey(CONSTANTS.PROGRAM_ID), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(CONSTANTS.PROGRAM_ID),
    data,
  });
}

/**
 * Create a Deploy instruction
 *
 * Deploys SOL to selected squares for the current round.
 *
 * @param signer - The transaction signer (executor)
 * @param authority - The miner authority (owner of automation/miner accounts)
 * @param amount - Amount of SOL to deploy (in lamports)
 * @param squares - Bitmask of squares to deploy to (u32)
 * @param entropyVar - The entropy var account for randomness
 * @param roundId - The current round ID
 * @returns TransactionInstruction
 */
export function createDeployInstruction(
  signer: PublicKey,
  authority: PublicKey,
  amount: bigint,
  squares: number,
  entropyVar: PublicKey,
  roundId: bigint
): TransactionInstruction {
  const automationPDA = getAutomationPDA(authority);
  const minerPDA = getMinerPDA(authority);
  const boardPDA = getBoardPDA();
  const configPDA = getConfigPDA();
  const roundPDA = getRoundPDA(roundId);

  // Serialize instruction data
  // Format: [discriminator: u8, amount: u64, squares: u32]
  const data = Buffer.alloc(1 + 8 + 4);
  let offset = 0;

  // Discriminator
  data.writeUInt8(DISCRIMINATORS.DEPLOY, offset);
  offset += 1;

  // Amount (u64, little-endian) - manually write as two 32-bit values
  const amountNum = Number(amount);
  data.writeUInt32LE(amountNum & 0xffffffff, offset); // Low 32 bits
  data.writeUInt32LE(Math.floor(amountNum / 0x100000000), offset + 4); // High 32 bits
  offset += 8;

  // Squares (u32, little-endian)
  data.writeUInt32LE(squares, offset);

  return new TransactionInstruction({
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: authority, isSigner: false, isWritable: true },
      { pubkey: automationPDA, isSigner: false, isWritable: true },
      { pubkey: boardPDA, isSigner: false, isWritable: true },
      { pubkey: configPDA, isSigner: false, isWritable: true },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: roundPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: PROGRAM_ADDRESSES.ORE_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: entropyVar, isSigner: false, isWritable: true },
      { pubkey: PROGRAM_ADDRESSES.ENTROPY_PROGRAM, isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(CONSTANTS.PROGRAM_ID),
    data,
  });
}

/**
 * Create a Checkpoint instruction
 *
 * Settles miner rewards for a completed round.
 *
 * @param signer - The transaction signer
 * @param roundId - The round ID to checkpoint
 * @returns TransactionInstruction
 */
export function createCheckpointInstruction(
  signer: PublicKey,
  roundId: bigint
): TransactionInstruction {
  const boardPDA = getBoardPDA();
  const minerPDA = getMinerPDA(signer);
  const roundPDA = getRoundPDA(roundId);
  const treasuryPDA = getTreasuryPDA();

  // Serialize instruction data
  // Format: [discriminator: u8] (no args for checkpoint)
  const data = Buffer.alloc(1);
  data.writeUInt8(DISCRIMINATORS.CHECKPOINT, 0);

  return new TransactionInstruction({
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: boardPDA, isSigner: false, isWritable: false },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: roundPDA, isSigner: false, isWritable: true },
      { pubkey: treasuryPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(CONSTANTS.PROGRAM_ID),
    data,
  });
}

/**
 * Create a ClaimSol instruction
 *
 * Claims SOL rewards from the miner account.
 *
 * @param signer - The transaction signer (miner authority)
 * @returns TransactionInstruction
 */
export function createClaimSolInstruction(
  signer: PublicKey
): TransactionInstruction {
  const minerPDA = getMinerPDA(signer);

  // Serialize instruction data
  // Format: [discriminator: u8] (no args for claimSol)
  const data = Buffer.alloc(1);
  data.writeUInt8(DISCRIMINATORS.CLAIM_SOL, 0);

  return new TransactionInstruction({
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(CONSTANTS.PROGRAM_ID),
    data,
  });
}

/**
 * Create a ClaimOre instruction
 *
 * Claims QUEST token rewards from the treasury vault.
 *
 * @param signer - The transaction signer (miner authority)
 * @returns TransactionInstruction
 */
export function createClaimOreInstruction(
  signer: PublicKey
): TransactionInstruction {
  const minerPDA = getMinerPDA(signer);
  const treasuryPDA = getTreasuryPDA();

  // Get the recipient's associated token account for QUEST
  const recipientTokenAccount = getAssociatedTokenAddress(
    signer,
    PROGRAM_ADDRESSES.ORE_MINT
  );

  // Get the treasury's token account for QUEST
  const treasuryTokenAccount = getAssociatedTokenAddress(
    treasuryPDA,
    PROGRAM_ADDRESSES.ORE_MINT
  );

  // Serialize instruction data
  // Format: [discriminator: u8] (no args for claimOre)
  const data = Buffer.alloc(1);
  data.writeUInt8(DISCRIMINATORS.CLAIM_ORE, 0);

  return new TransactionInstruction({
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: PROGRAM_ADDRESSES.ORE_MINT, isSigner: false, isWritable: false },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: treasuryPDA, isSigner: false, isWritable: true },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: PROGRAM_ADDRESSES.TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: PROGRAM_ADDRESSES.ASSOCIATED_TOKEN_PROGRAM, isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(CONSTANTS.PROGRAM_ID),
    data,
  });
}

/**
 * Helper: Create and send a Deploy transaction
 *
 * @param connection - Solana connection
 * @param signer - The wallet/signer
 * @param authority - The miner authority
 * @param amount - Amount of SOL to deploy (in lamports)
 * @param squares - Bitmask of squares to deploy to
 * @param entropyVar - The entropy var account
 * @param roundId - The current round ID
 * @returns Transaction signature
 */
export async function sendDeployTransaction(
  connection: Connection,
  signer: PublicKey,
  authority: PublicKey,
  amount: bigint,
  squares: number,
  entropyVar: PublicKey,
  roundId: bigint
): Promise<string> {
  const instruction = createDeployInstruction(
    signer,
    authority,
    amount,
    squares,
    entropyVar,
    roundId
  );

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signer;

  // Note: You'll need to sign this transaction with your wallet
  // This is typically done through wallet adapter in a React component
  return 'Transaction created - needs wallet signature';
}

/**
 * Helper: Create and send a Checkpoint transaction
 *
 * @param connection - Solana connection
 * @param signer - The wallet/signer
 * @param roundId - The round ID to checkpoint
 * @returns Transaction signature
 */
export async function sendCheckpointTransaction(
  connection: Connection,
  signer: PublicKey,
  roundId: bigint
): Promise<string> {
  const instruction = createCheckpointInstruction(signer, roundId);

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signer;

  return 'Transaction created - needs wallet signature';
}

/**
 * Helper: Create and send a ClaimSol transaction
 *
 * @param connection - Solana connection
 * @param signer - The wallet/signer
 * @returns Transaction signature
 */
export async function sendClaimSolTransaction(
  connection: Connection,
  signer: PublicKey
): Promise<string> {
  const instruction = createClaimSolInstruction(signer);

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signer;

  return 'Transaction created - needs wallet signature';
}

/**
 * Helper: Create and send a ClaimOre transaction
 *
 * @param connection - Solana connection
 * @param signer - The wallet/signer
 * @returns Transaction signature
 */
export async function sendClaimOreTransaction(
  connection: Connection,
  signer: PublicKey
): Promise<string> {
  const instruction = createClaimOreInstruction(signer);

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signer;

  return 'Transaction created - needs wallet signature';
}
