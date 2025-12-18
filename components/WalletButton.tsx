'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface WalletButtonProps {
  className?: string;
  width?: string;
}

export const WalletButton = ({ className = "sm:mr-0 sm:mt-0", width = "100%" }: WalletButtonProps) => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(true);
  };

  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: '100%', height: '100%' }}>
      <button
        onClick={handleClick}
        className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center active:scale-95 transition-transform"
        style={{ 
          background: 'transparent', 
          border: 'none', 
          padding: 0, 
          width: '100%', 
          height: '100%',
          minHeight: '44px' // Recommended touch target size
        }}
      >
        <img
          src={connected ? '/img/Attached_wallet.png' : '/img/wallet.png'}
          alt={connected ? 'Connected Wallet' : 'Connect Wallet'}
          style={{ height: 'auto', width: width, display: 'block', maxWidth: '100%' }}
        />
      </button>
    </div>
  );
};
