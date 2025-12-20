'use client';

import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export function useSolBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        // Use retry logic for balance fetching
        const { getBalanceWithRetry } = await import('@/lib/rpcHelpers');
        const lamports = await getBalanceWithRetry(connection, publicKey);
        setBalance(lamports / 1e9); // Convert lamports to SOL
      } catch (err: any) {
        // Handle 403 and other RPC errors gracefully
        if (err?.message?.includes('403') || err?.message?.includes('Access forbidden')) {
          console.warn('RPC endpoint access restricted. Consider setting NEXT_PUBLIC_RPC_URL with a paid RPC provider (Helius, QuickNode, or Alchemy).');
          // Keep showing the last known balance instead of resetting to 0
        } else {
          console.error('Error fetching SOL balance:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchBalance();

    // Subscribe to account changes for real-time balance updates
    let subscriptionId: number | null = null;
    try {
      subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          setBalance(accountInfo.lamports / 1e9);
        },
        'confirmed'
      );
    } catch (err: any) {
      // If subscription fails (e.g., 403), just use polling
      console.warn('Account subscription failed, using polling only:', err);
    }

    // Poll every 10 seconds as backup
    const interval = setInterval(fetchBalance, 10000);

    return () => {
      if (subscriptionId !== null) {
        try {
          connection.removeAccountChangeListener(subscriptionId);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  return { balance, loading };
}
