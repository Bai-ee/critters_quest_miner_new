/**
 * Automated Reset Service
 *
 * This script monitors the blockchain and automatically calls the reset instruction
 * when a round ends (current slot >= end slot + intermission slots).
 *
 * Usage:
 * 1. Set up environment variables in .env:
 *    - SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
 *    - AUTOMATION_KEYPAIR_PATH=/path/to/keypair.json
 *
 * 2. Run: ts-node scripts/reset-automation.ts
 */

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { fetchBoard, fetchRound } from '../lib/accounts';
import { createResetInstruction, fetchConfigData } from '../lib/resetInstruction';
import * as fs from 'fs';

// Constants
const INTERMISSION_SLOTS = 10; // From the Rust program (10 slots = ~10 seconds at 1 slot/second)
const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds (should be less than intermission to catch timing)

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=5e0ea070-6bb9-4302-a77b-5a7881f54c6a';
const KEYPAIR_PATH = process.env.AUTOMATION_KEYPAIR_PATH || './automation-keypair.json';

class ResetAutomation {
    private connection: Connection;
    private payer: Keypair;
    private isRunning: boolean = false;
    private lastCheckedSlot: number = 0;

    constructor() {
        this.connection = new Connection(RPC_URL, 'confirmed');

        // Load keypair
        if (!fs.existsSync(KEYPAIR_PATH)) {
            console.error('❌ Keypair file not found:', KEYPAIR_PATH);
            console.error('💡 Create one with: solana-keygen new --outfile automation-keypair.json');
            process.exit(1);
        }

        try {
            const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
            this.payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
        } catch (error) {
            console.error('❌ Failed to load keypair:', error);
            process.exit(1);
        }

        console.log('🤖 Reset Automation Service Initialized');
        console.log('📍 RPC:', RPC_URL);
        console.log('🔑 Payer:', this.payer.publicKey.toString());
    }

    /**
     * Build the reset instruction
     */
    private async buildResetInstruction(roundId: bigint): Promise<Transaction> {
        // Fetch config to get fee collector and entropy var
        const { feeCollector, entropyVar } = await fetchConfigData(this.connection);

        console.log('🔧 Building reset instruction for round:', roundId.toString());
        console.log('   Fee collector:', feeCollector.toString());
        console.log('   Entropy var:', entropyVar.toString());

        // Verify entropy is ready (has non-zero slot_hash)
        const entropyAccount = await this.connection.getAccountInfo(entropyVar);
        if (!entropyAccount) {
            throw new Error('Entropy var account not found');
        }

        // Check if slot_hash is non-zero (offset 8 for discriminator, then slot_hash is at offset 8)
        const slotHashOffset = 8;
        const slotHash = entropyAccount.data.subarray(slotHashOffset, slotHashOffset + 32);
        const isZeroHash = slotHash.every(byte => byte === 0);
        
        if (isZeroHash) {
            throw new Error('Entropy not ready: slot_hash is zero. Wait for entropy to be generated.');
        }

        console.log('✅ Entropy is ready');

        // Fetch round data to get top miner
        const round = await fetchRound(this.connection, roundId);
        const topMiner = new PublicKey(round.topMiner);
        console.log('   Top miner:', topMiner.toString());

        // Create reset instruction
        const resetIx = await createResetInstruction(
            this.payer.publicKey,
            roundId,
            feeCollector,
            entropyVar,
            topMiner
        );

        const transaction = new Transaction();
        transaction.add(resetIx);

        return transaction;
    }

    /**
     * Check if reset is needed and execute it
     */
    private async checkAndReset(): Promise<void> {
        try {
            // Get current slot
            const currentSlot = await this.connection.getSlot('confirmed');

            // Avoid checking the same slot multiple times
            if (currentSlot === this.lastCheckedSlot) {
                return;
            }
            this.lastCheckedSlot = currentSlot;

            // Fetch board data
            const board = await fetchBoard(this.connection);

            console.log(`📊 Slot: ${currentSlot} | Round: ${board.roundId} | End: ${board.endSlot}`);

            // Check if round has ended and intermission period is over
            const resetSlot = Number(board.endSlot) + INTERMISSION_SLOTS;

            if (currentSlot >= resetSlot && board.endSlot !== BigInt(2 ** 64 - 1)) {
                console.log('🎯 Round ended! Executing reset...');
                await this.executeReset(board.roundId);
            } else if (currentSlot >= Number(board.endSlot)) {
                const slotsUntilReset = resetSlot - currentSlot;
                console.log(`⏳ Intermission period: ${slotsUntilReset} slots until reset`);
            } else {
                const slotsUntilEnd = Number(board.endSlot) - currentSlot;
                console.log(`⛏️ Round in progress: ${slotsUntilEnd} slots remaining`);
            }
        } catch (error) {
            console.error('❌ Error checking reset condition:', error);
        }
    }

    /**
     * Execute the reset transaction
     */
    private async executeReset(roundId: bigint): Promise<void> {
        try {
            console.log(`🔄 Building reset transaction for round ${roundId}...`);

            const transaction = await this.buildResetInstruction(roundId);

            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.payer.publicKey;

            // Sign transaction
            transaction.sign(this.payer);

            // Send transaction
            console.log('📤 Sending reset transaction...');
            const signature = await this.connection.sendRawTransaction(
                transaction.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed',
                }
            );

            console.log('⏳ Confirming transaction...');
            const confirmation = await this.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            });

            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            console.log('✅ Reset successful!');
            console.log('📝 Signature:', signature);
            console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}`);

        } catch (error) {
            console.error('❌ Reset execution failed:', error);

            // Log detailed error for debugging
            if (error instanceof Error) {
                console.error('Error details:', error.message);
                
                // Check if it's an entropy-related error
                if (error.message.includes('Entropy not ready')) {
                    console.log('⏳ Waiting for entropy to be generated. Will retry on next check.');
                } else {
                    console.error('Stack:', error.stack);
                }
            }
        }
    }

    /**
     * Start the automation service
     */
    public async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️ Service is already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting Reset Automation Service...');
        console.log(`⏱️ Check interval: ${CHECK_INTERVAL_MS}ms`);
        console.log('');

        // Initial check
        await this.checkAndReset();

        // Set up interval
        const interval = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(interval);
                return;
            }
            await this.checkAndReset();
        }, CHECK_INTERVAL_MS);

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down gracefully...');
            this.stop();
            clearInterval(interval);
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down gracefully...');
            this.stop();
            clearInterval(interval);
            process.exit(0);
        });
    }

    /**
     * Stop the automation service
     */
    public stop(): void {
        this.isRunning = false;
        console.log('⏹️ Reset Automation Service stopped');
    }
}

// Run the service
if (require.main === module) {
    const service = new ResetAutomation();
    service.start().catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

export default ResetAutomation;
