'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface WalletButtonProps {
  className?: string;
  width?: string;
}

export const WalletButton = ({ className = "mr-[-7px] mt-[13px] sm:mr-0 sm:mt-0", width = "70%" }: WalletButtonProps) => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    setVisible(true);
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-transparent border-none p-0 cursor-pointer flex justify-end ${className}`}
      style={{ background: 'transparent', border: 'none', padding: 0, width: 'fit-content' }}
    >
      <img
        src={connected ? '/img/Attached_wallet.png' : '/img/wallet.png'}
        alt={connected ? 'Connected Wallet' : 'Connect Wallet'}
        style={{ height: 'auto', width: width, display: 'block', marginRight: '0px' }}
      />
    </button>
  );
};
