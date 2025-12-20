/**
 * Example usage of Steel framework instructions with Solana wallet adapter
 *
 * This file demonstrates how to call the deploy, checkpoint, and claim instructions
 * in a React component using the @solana/wallet-adapter-react library.
 */

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  createDeployInstruction,
  createCheckpointInstruction,
  createClaimSolInstruction,
  createClaimOreInstruction,
  createStakeDepositInstruction,
  createStakeWithdrawInstruction,
  createStakeClaimYieldInstruction,
} from './instructions';
import { fetchBoard, fetchMiner } from './accounts';
import { bigIntToNumber } from './formatters';

/**
 * Example: Deploy SOL to squares
 */
export function useDeployToSquares() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const deploy = async (
    amount: number, // Amount in SOL (will be converted to lamports)
    squareIndices: number[], // Array of square indices (0-24)
    entropyVarAddress: string, // Entropy var account address
    needCheckpoint: boolean
  ) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount: must be a positive number');
    }

    // Convert SOL to lamports
    const amountLamports = BigInt(Math.floor(amount * 1e9));
    
    // Validate lamports is positive
    if (amountLamports <= 0n) {
      throw new Error('Invalid amount: must be greater than 0');
    }

    // Convert square indices to bitmask
    // Example: [0, 5, 12] -> bitmask with bits 0, 5, and 12 set
    let squaresBitmask = 0;
    for (const index of squareIndices) {
      if (index < 0 || index >= 25) {
        throw new Error(`Invalid square index: ${index}. Must be 0-24.`);
      }
      squaresBitmask |= (1 << index);
    }

    // Fetch current round ID from board
    const board = await fetchBoard(connection);
    const miner = await fetchMiner(connection, publicKey);
    const roundId = board.roundId;

    const transaction = new Transaction();

    if (needCheckpoint) {
      // If checkpoint is needed, checkpoint the miner's current roundId
      // This brings the miner up to date with the current round
      const targetRoundId = miner?.roundId ?? (roundId - 1n);
      const instruction0 = createCheckpointInstruction(publicKey, targetRoundId);
      transaction.add(instruction0);
    }

    // Create the instruction
    const instruction1 = createDeployInstruction(
      publicKey, // signer (executor)
      publicKey, // authority (same as signer in most cases)
      amountLamports,
      squaresBitmask,
      new PublicKey(entropyVarAddress),
      roundId
    );

    // Create and send transaction
    transaction.add(instruction1);
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Deploy transaction confirmed:', signature);
    return signature;
  };

  return { deploy };
}

/**
 * Example: Checkpoint a completed round
 */
export function useCheckpoint() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const checkpoint = async (roundId?: bigint) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // If no roundId provided, use the previous round
    let targetRoundId = roundId;
    if (!targetRoundId) {
      const board = await fetchBoard(connection);
      targetRoundId = board.roundId - 1n; // Checkpoint the previous round
    }

    // Create the instruction
    const instruction = createCheckpointInstruction(publicKey, targetRoundId);

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Checkpoint transaction confirmed:', signature);
    return signature;
  };

  return { checkpoint };
}

/**
 * Example: Claim SOL rewards
 */
export function useClaimSol() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const claimSol = async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create the instruction
    const instruction = createClaimSolInstruction(publicKey);

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Claim SOL transaction confirmed:', signature);
    return signature;
  };

  return { claimSol };
}

/**
 * Example: Claim QUEST token rewards
 */
export function useClaimOre() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const claimOre = async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create the instruction
    const instruction = createClaimOreInstruction(publicKey);

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Claim QUEST transaction confirmed:', signature);
    return signature;
  };

  return { claimOre };
}

/**
 * Example: Claim All rewards
 */
export function useClaimAll() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const claimAll = async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const transaction = new Transaction()

    // Create the instruction
    const instruction0 = createClaimSolInstruction(publicKey);
    transaction.add(instruction0);

    // Create the instruction
    const instruction1 = createClaimOreInstruction(publicKey);
    transaction.add(instruction1);

    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Claim QUEST transaction confirmed:', signature);
    return signature;
  };

  return { claimAll };
}

/**
 * Example: Setup or update automation
 */
export function useAutomation() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const setupAutomation = async (
    executorAddress: string, // Executor's public key
    amountPerSquare: number, // SOL per square (e.g., 0.01)
    depositAmount: number, // Initial deposit (e.g., 1 SOL)
    executorFee: number, // Fee per deployment (e.g., 0.001 SOL)
    strategy: 'random' | 'preferred',
    squareSelection: number[] | number // Array of squares for preferred, or count for random
  ) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Import the instruction and enum
    const { createAutomateInstruction, AutomationStrategy } = await import('./instructions');

    // Convert to lamports
    const amountLamports = BigInt(Math.floor(amountPerSquare * 1e9));
    const depositLamports = BigInt(Math.floor(depositAmount * 1e9));
    const feeLamports = BigInt(Math.floor(executorFee * 1e9));

    // Determine strategy and mask
    let strategyEnum: typeof AutomationStrategy.Random | typeof AutomationStrategy.Preferred;
    let mask: bigint;
    let squaresBitmask = 0;

    if (strategy === 'preferred') {
      strategyEnum = AutomationStrategy.Preferred;
      // Convert square indices to bitmask
      if (!Array.isArray(squareSelection)) {
        throw new Error('For preferred strategy, provide an array of square indices');
      }
      let bitmask = 0;
      for (const index of squareSelection) {
        if (index < 0 || index >= 25) {
          throw new Error(`Invalid square index: ${index}. Must be 0-24.`);
        }
        bitmask |= (1 << index);
      }
      mask = BigInt(bitmask);
      squaresBitmask = bitmask;
    } else {
      strategyEnum = AutomationStrategy.Random;
      // For random, mask is the number of squares to deploy to
      if (typeof squareSelection !== 'number') {
        throw new Error('For random strategy, provide a number (count of squares)');
      }
      if (squareSelection < 1 || squareSelection > 25) {
        throw new Error('Square count must be between 1 and 25');
      }
      mask = BigInt(squareSelection);
    }

    // Create the automation instruction
    const instruction = createAutomateInstruction(
      publicKey,
      new PublicKey(executorAddress),
      amountLamports,
      depositLamports,
      feeLamports,
      strategyEnum,
      mask,
      false // reload - set to false by default, can be made configurable
    );

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Automation setup successful:', signature);
    return signature;
  };

  const disableAutomation = async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Import the instruction
    const { createAutomateInstruction, AutomationStrategy } = await import('./instructions');

    // To disable automation, set executor to default pubkey (all zeros)
    const defaultExecutor = PublicKey.default;

    // Create the instruction with minimal values (they won't be used)
    const instruction = createAutomateInstruction(
      publicKey,
      defaultExecutor,
      BigInt(0),
      BigInt(0),
      BigInt(0),
      AutomationStrategy.Random,
      BigInt(0),
      false
    );

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendTransaction(transaction, connection);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // console.log('Automation disabled:', signature);
    return signature;
  };

  return { setupAutomation, disableAutomation };
}

export function useStakeDeposit() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const deposit = async (amount: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const amountGrams = BigInt(Math.floor(amount * 1e9));
    const instruction = createStakeDepositInstruction(publicKey, amountGrams, publicKey);
    const transaction = new Transaction().add(instruction);

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  };

  return { deposit };
}

export function useStakeWithdraw() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const withdraw = async (amount: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const amountGrams = BigInt(Math.floor(amount * 1e9));
    const instruction = createStakeWithdrawInstruction(publicKey, amountGrams);
    const transaction = new Transaction().add(instruction);

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  };

  return { withdraw };
}

export function useStakeClaimYield() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const claimYield = async (amount: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const amountLamports = BigInt(Math.floor(amount * 1e9));
    const instruction = createStakeClaimYieldInstruction(publicKey, amountLamports);
    const transaction = new Transaction().add(instruction);

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  };

  return { claimYield };
}
