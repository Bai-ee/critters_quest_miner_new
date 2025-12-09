/**
 * Reset Instruction Builder
 *
 * Creates the reset instruction to finalize a round and start a new one.
 * This matches the reset instruction from the Solana program.
 */

import {
    Connection,
    PublicKey,
    TransactionInstruction,
    SystemProgram,
    SYSVAR_SLOT_HASHES_PUBKEY,
} from '@solana/web3.js';
import { CONSTANTS } from './types';
import { getBoardPDA, getRoundPDA } from './accounts';

// SPL Token Program IDs (constants to avoid dependency)
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Program addresses
const PROGRAM_ID = new PublicKey(CONSTANTS.PROGRAM_ID);
const ORE_PROGRAM_ID = new PublicKey(CONSTANTS.PROGRAM_ID);
const MINT_ADDRESS = new PublicKey('QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s');
const ENTROPY_PROGRAM_ID = new PublicKey('CQrnd9EcS7jSUTs2HCHL31kFhGWGuAqzdcQfAo1tn6Ft');

// PDA seeds
const CONFIG_SEED = Buffer.from('config');
const TREASURY_SEED = Buffer.from('treasury');
const VAULT_SEED = Buffer.from('vault');

/**
 * Get Config PDA
 */
export function getConfigPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [CONFIG_SEED],
        PROGRAM_ID
    );
    return pda;
}

/**
 * Get Treasury PDA
 */
export function getTreasuryPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [TREASURY_SEED],
        PROGRAM_ID
    );
    return pda;
}

/**
 * Get Treasury Tokens ATA
 */
export function getTreasuryTokensPDA(): PublicKey {
    const treasury = getTreasuryPDA();
    const [pda] = PublicKey.findProgramAddressSync(
        [
            treasury.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            MINT_ADDRESS.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return pda;
}

/**
 * Get Vault PDA
 */
export function getVaultPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [VAULT_SEED],
        PROGRAM_ID
    );
    return pda;
}

/**
 * Get Vault Tokens ATA
 */
export function getVaultTokensPDA(): PublicKey {
    const vault = getVaultPDA();
    const [pda] = PublicKey.findProgramAddressSync(
        [
            vault.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            MINT_ADDRESS.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return pda;
}


/**
 * Create Reset Instruction
 *
 * Finalizes the current round, mints rewards, and opens the next round.
 *
 * @param signer - The transaction signer
 * @param boardData - Current board data with roundId
 * @param feeCollector - Fee collector address (from config)
 * @param entropyVarAddress - Entropy var address (from config)
 * @returns TransactionInstruction
 */
export async function createResetInstruction(
    signer: PublicKey,
    roundId: bigint,
    feeCollector: PublicKey,
    entropyVarAddress: PublicKey,
    topMiner?: PublicKey
): Promise<TransactionInstruction> {

    const boardPDA = getBoardPDA();
    const configPDA = getConfigPDA();
    const roundPDA = getRoundPDA(roundId);
    const roundNextPDA = getRoundPDA(roundId + 1n);
    const treasuryPDA = getTreasuryPDA();
    const treasuryTokensPDA = getTreasuryTokensPDA();
    const vaultPDA = getVaultPDA();
    const vaultTokensPDA = getVaultTokensPDA();

    // Use default pubkey if no top miner provided
    const topMinerPubkey = topMiner || PublicKey.default;

    // Instruction discriminator for reset (value: 9)
    const discriminator = Buffer.from([9]);

    // Account order MUST match the Rust SDK exactly (api/src/sdk.rs reset function)
    const keys = [
        { pubkey: signer, isSigner: true, isWritable: true },
        { pubkey: boardPDA, isSigner: false, isWritable: true },
        { pubkey: configPDA, isSigner: false, isWritable: true },
        { pubkey: feeCollector, isSigner: false, isWritable: true },
        { pubkey: MINT_ADDRESS, isSigner: false, isWritable: true },
        { pubkey: roundPDA, isSigner: false, isWritable: true },
        { pubkey: roundNextPDA, isSigner: false, isWritable: true },
        { pubkey: topMinerPubkey, isSigner: false, isWritable: true },
        { pubkey: treasuryPDA, isSigner: false, isWritable: true },
        { pubkey: treasuryTokensPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ORE_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_SLOT_HASHES_PUBKEY, isSigner: false, isWritable: false },
        // Entropy accounts
        { pubkey: entropyVarAddress, isSigner: false, isWritable: true },
        { pubkey: ENTROPY_PROGRAM_ID, isSigner: false, isWritable: false },
        // Vault accounts
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: vaultTokensPDA, isSigner: false, isWritable: true },
    ];

    return new TransactionInstruction({
        keys,
        programId: PROGRAM_ID,
        data: discriminator,
    });
}

/**
 * Fetch config data to get fee collector and entropy var
 */
export async function fetchConfigData(connection: Connection): Promise<{
    feeCollector: PublicKey;
    entropyVar: PublicKey;
}> {
    const configPDA = getConfigPDA();
    const accountInfo = await connection.getAccountInfo(configPDA);

    if (!accountInfo) {
        throw new Error('Config account not found');
    }

    const data = accountInfo.data;
    let offset = 8; // Skip discriminator

    // Parse config fields (from api/src/state/config.rs)
    // 1. admin: Pubkey (32 bytes)
    offset += 32;

    // 2. bury_authority: Pubkey (32 bytes)
    offset += 32;

    // 3. fee_collector: Pubkey (32 bytes)
    const feeCollectorBytes = data.subarray(offset, offset + 32);
    const feeCollector = new PublicKey(feeCollectorBytes);
    offset += 32;

    // 4. swap_program: Pubkey (32 bytes)
    offset += 32;

    // 5. var_address: Pubkey (32 bytes)
    const entropyVarBytes = data.subarray(offset, offset + 32);
    const entropyVar = new PublicKey(entropyVarBytes);

    return { feeCollector, entropyVar };
}
