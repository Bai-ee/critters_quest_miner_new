import { Connection, PublicKey } from '@solana/web3.js';

/**
 * Retry an RPC call with exponential backoff
 * Handles 403 errors and rate limiting gracefully
 */
export async function retryRpcCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 403 or rate limit error
      const isRateLimit = error?.message?.includes('403') || 
                         error?.message?.includes('Access forbidden') ||
                         error?.message?.includes('429') ||
                         error?.code === 403 ||
                         error?.code === 429;

      // If it's not a rate limit error, throw immediately
      if (!isRateLimit) {
        throw error;
      }

      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        console.warn(`RPC call failed after ${maxRetries} attempts. Consider using a paid RPC provider.`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`RPC rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('RPC call failed');
}

/**
 * Get account info with retry logic
 */
export async function getAccountInfoWithRetry(
  connection: Connection,
  publicKey: PublicKey,
  maxRetries: number = 3
) {
  return retryRpcCall(
    () => connection.getAccountInfo(publicKey),
    maxRetries
  );
}

/**
 * Get balance with retry logic
 */
export async function getBalanceWithRetry(
  connection: Connection,
  publicKey: PublicKey,
  maxRetries: number = 3
) {
  return retryRpcCall(
    () => connection.getBalance(publicKey),
    maxRetries
  );
}

/**
 * Get slot with retry logic
 */
export async function getSlotWithRetry(
  connection: Connection,
  commitment: 'confirmed' | 'finalized' = 'confirmed',
  maxRetries: number = 3
) {
  return retryRpcCall(
    () => connection.getSlot(commitment),
    maxRetries
  );
}

