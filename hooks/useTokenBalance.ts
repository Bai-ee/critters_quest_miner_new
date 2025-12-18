'use client';

import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { connection } from '@/lib/solana';

interface UseTokenBalanceProps {
  tokenMint: string | PublicKey | null;
  walletAddress: string | PublicKey | null;
  decimals?: number;
}

export function useTokenBalance({ tokenMint, walletAddress, decimals = 9 }: UseTokenBalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenMint || !walletAddress || walletAddress === '') {
      setBalance(0);
      setError(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);

        let mintPubkey: PublicKey;
        let walletPubkey: PublicKey;

        try {
          mintPubkey = typeof tokenMint === 'string' ? new PublicKey(tokenMint) : tokenMint;
          walletPubkey = typeof walletAddress === 'string' ? new PublicKey(walletAddress) : walletAddress;
        } catch (e) {
          setBalance(0);
          return;
        }

        const tokenAccountAddress = await getAssociatedTokenAddress(
          mintPubkey,
          walletPubkey,
          true
        );

        const tokenAccount = await getAccount(connection, tokenAccountAddress);
        setBalance(Number(tokenAccount.amount) / Math.pow(10, decimals));
      } catch (err) {
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
  }, [tokenMint, walletAddress]);

  return { balance, loading, error };
}
