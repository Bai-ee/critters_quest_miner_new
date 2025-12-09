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
} from './instructions';
import { fetchBoard } from './accounts';

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

    // Convert SOL to lamports
    const amountLamports = BigInt(Math.floor(amount * 1e9));

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
    const roundId = board.roundId;

    const transaction = new Transaction();

    if (needCheckpoint) {
      const targetRoundId = board.roundId - 1n;
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

    console.log('Deploy transaction confirmed:', signature);
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

    console.log('Checkpoint transaction confirmed:', signature);
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

    console.log('Claim SOL transaction confirmed:', signature);
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

    console.log('Claim QUEST transaction confirmed:', signature);
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

    console.log('Claim QUEST transaction confirmed:', signature);
    return signature;
  };

  return { claimAll };
}
