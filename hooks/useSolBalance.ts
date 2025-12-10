'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { connection } from '@/lib/solana';

export function useSolBalance() {
  const { publicKey } = useWallet();
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
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1e9); // Convert lamports to SOL
      } catch (err) {
        console.error('Error fetching SOL balance:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchBalance();

    // Subscribe to account changes for real-time balance updates
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        setBalance(accountInfo.lamports / 1e9);
      },
      'confirmed'
    );

    // Poll every 10 seconds as backup
    const interval = setInterval(fetchBalance, 10000);

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
      clearInterval(interval);
    };
  }, [publicKey]);

  return { balance, loading };
}
