import { Connection, clusterApiUrl } from '@solana/web3.js';

/**
 * Solana RPC connection
 * Uses environment variable or defaults to mainnet-beta
 *
 * For production, use a paid RPC provider for better reliability:
 * - Helius: https://helius.dev
 * - QuickNode: https://quicknode.com
 * - Alchemy: https://alchemy.com
 */
export const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('mainnet-beta'),
  'confirmed'
);

/**
 * Get the current Solana slot
 */
export async function getCurrentSlot(): Promise<number> {
  return await connection.getSlot('confirmed');
}

/**
 * Helper to check if connection is working
 */
export async function testConnection(): Promise<boolean> {
  try {
    await connection.getVersion();
    return true;
  } catch (error) {
    console.error('Solana connection failed:', error);
    return false;
  }
}
