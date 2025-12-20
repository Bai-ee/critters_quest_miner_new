'use client';

import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';

interface UseTokenBalanceProps {
  tokenMint: string | PublicKey | null;
  walletAddress: string | PublicKey | null;
  decimals?: number;
}

export function useTokenBalance({ tokenMint, walletAddress, decimals = 9 }: UseTokenBalanceProps) {
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenMint || !walletAddress) {
      setBalance(0);
      setError(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);

        const mintPubkey = typeof tokenMint === 'string' ? new PublicKey(tokenMint) : tokenMint;
        const walletPubkey = typeof walletAddress === 'string' ? new PublicKey(walletAddress) : walletAddress;

        const tokenAccountAddress = await getAssociatedTokenAddress(
          mintPubkey,
          walletPubkey,
          true
        );

        const tokenAccount = await getAccount(connection, tokenAccountAddress);
        setBalance(Number(tokenAccount.amount) / Math.pow(10, decimals));
      } catch (err: any) {
        // Handle 403 and other RPC errors gracefully
        if (err?.message?.includes('403') || err?.message?.includes('Access forbidden')) {
          console.warn('RPC endpoint access restricted for token balance. Consider using a paid RPC provider.');
          setError('RPC access restricted');
        } else {
          console.error('Error fetching token balance:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch token balance');
        }
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    const interval = setInterval(fetchBalance, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [tokenMint, walletAddress, connection, decimals]);

  return { balance, loading, error };
}
