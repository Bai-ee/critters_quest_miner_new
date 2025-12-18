'use client';

import { Grid } from '@/components/Grid';
import { MainControl } from '@/components/MainControl';
import { Motherlode } from '@/components/Motherlode';
import { Timer } from '@/components/Timer';
import { WalletButton } from '@/components/WalletButton';
import { GlossyButton } from '@/components/GlossyButton';
import { Modal } from '@/components/Modal';
import { RoundResults } from '@/components/RoundResults';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { HowTo } from '@/components/HowTo';
import { useRoundData } from '@/hooks/useRoundData';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { CALCULATIONS } from '@/lib/constants';
import toast from 'react-hot-toast';


export default function Home() {
  const { board, round, previousRound, currentSlot, loading, error, lastUpdate, miner, automation } = useRoundData();
  const { connected, publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();

  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [lastShownRoundId, setLastShownRoundId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Show modal when previousRound is updated (round just completed)
    if (previousRound && previousRound.id.toString() !== lastShownRoundId) {
      setIsResultsModalOpen(true);
      setLastShownRoundId(previousRound.id.toString());
    }
  }, [previousRound, lastShownRoundId]);

  // Get token balance
  const { balance: tokenBalance } = useTokenBalance({
    tokenMint: 'QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s',
    walletAddress: publicKey?.toBase58() || '',
    decimals: 9
  });

  // Shared state for square selection
  const [selectedSquares, setSelectedSquares] = useState<Set<number>>(new Set());
  const [amount, setAmount] = useState<number>(0.01);

  const toggleSquare = (index: number) => {
    const newSelected = new Set(selectedSquares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSquares(newSelected);
  };

  const selectAll = () => {
    setSelectedSquares(new Set(Array.from({ length: 25 }, (_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedSquares(new Set());
  };

  const randomSelection = () => {
    // Default to 5 random squares if no count specified
    const numSquares = Math.floor(Math.random() * 25) + 1;
    const maxSquares = Math.min(numSquares, 25);

    // Create array of all square indices [0-24]
    const allSquares = Array.from({ length: 25 }, (_, i) => i);

    // Shuffle array using Fisher-Yates algorithm
    for (let i = allSquares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSquares[i], allSquares[j]] = [allSquares[j], allSquares[i]];
    }

    // Take first N squares from shuffled array
    const randomSquares = allSquares.slice(0, maxSquares);
    setSelectedSquares(new Set(randomSquares));
  }

  const incrementAmount = () => {
    setAmount(prev => +(prev + 0.001).toFixed(3));
  };

  const decrementAmount = () => {
    setAmount(prev => Math.max(0.001, +(prev - 0.001).toFixed(3)));
  };

  const handleDeploy = async () => {
    if (selectedSquares.size === 0) {
        toast.error('Please select at least one square');
        return;
    }

    // Check if user has enough SOL balance
    const totalCost = amount * selectedSquares.size;
    const estimatedFees = 0.01; // Estimate for transaction fees
    const requiredBalance = totalCost + estimatedFees;

    if (solBalance < requiredBalance) {
        toast.error(`Insufficient balance! Need ${requiredBalance.toFixed(4)} SOL (including fees), but you have ${solBalance.toFixed(4)} SOL`);
        return;
    }

    let needCheckpoint = false;

    // Checkpoint is needed if miner's round is behind the current round
    if (miner && round && BigInt(miner.roundId) < BigInt(round.id)) {
        needCheckpoint = true;
    }

    try {
        // We'll need to use the deploy function from the hook, 
        // but for now we'll just show a toast or handle it if we pass the hook down
        // Since this is Home component, we'll need to define deploy here or import it
        toast.success(`Deploying to ${selectedSquares.size} squares...`);
        // clearSelection(); // Clear selection after successful deploy
    } catch (error) {
        console.error('Deploy failed:', error);
        toast.error(`Deploy failed: ${error}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center">
        <div className="text-center cq-panel p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cq-neon mx-auto mb-4"></div>
          <p className="text-lg font-bold text-cq-neon">Loading QUEST data...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to Solana...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center p-4">
        <div className="cq-panel p-6 max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-400">
            Error
          </h1>
          <div className="cq-panel p-4 border-red-500/50">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="cq-button-primary mt-4 w-full py-2 text-sm font-bold text-black"
            >
              RETRY
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!board || !round) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center">
        <div className="cq-panel p-8">
          <h1 className="text-2xl font-bold text-center text-cq-neon">
            No data available
          </h1>
        </div>
      </main>
    );
  }

  // Format last update time
  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <main className="min-h-screen bg-cq-bg-0 text-white flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* Drawer Backdrop for Mobile */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-30 sm:hidden bg-black/20 backdrop-blur-[2px]"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cq-bg-1 via-cq-bg-0 to-cq-bg-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(116,253,231,0.1)_0%,transparent_70%)]"></div>
      </div>

      {/* Mining items gradient image at top - scrolls with page */}
      <div className="relative flex justify-center items-center mx-auto" style={{ zIndex: 1, marginTop: '0px', width: '4000px', overflow: 'visible', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="absolute flex items-start justify-center gap-1 sm:gap-2" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: '100%', maxWidth: '100vw' }}>
          {/* Left: Wallet Button (Replaced Placeholder) */}
          <div className="flex-none flex items-center justify-center" style={{ width: 'clamp(80px, 22vw, 110px)', marginTop: '-5px', marginLeft: '-3px' }}>
            <WalletButton 
              className="mr-0 mt-0" 
            />
          </div>
          <img 
            src="/img/miner_logo.png" 
            alt="Miner Logo" 
            style={{
              width: '140px',
              height: 'auto',
              display: 'block',
              maxWidth: '35%',
              marginTop:'-20px',
              flexShrink: 0
            }}
          />
          {/* Right: SOL and QUEST Balances */}
          <div className="flex-none flex flex-col gap-2" style={{ width: 'clamp(80px, 22vw, 110px)', marginRight: '2px' }}>
            <div className="relative">
              <img 
                src="/img/sol_amount.png" 
                alt="SOL Balance Background" 
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-1" style={{ paddingLeft: '21px' }}>
                <div className="text-[10px] sm:text-[12px] font-bold text-white leading-none mt-[3px]">
                  <AnimatedNumber value={solBalance.toFixed(2).padStart(7, '0')} />
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/img/quest_amount.png" 
                alt="QUEST Balance Background" 
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-1" style={{ paddingLeft: '21px' }}>
                <div className="text-[10px] sm:text-[12px] font-bold text-white leading-none mt-[3px]">
                  <AnimatedNumber value={Math.floor(tokenBalance).toString().padStart(5, '0')} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {board?.endSlot && currentSlot && (
          <div className="absolute top-[90px]" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/img/pickaxe_front.gif" 
              alt="Pickaxe" 
              className="h-[133px] sm:h-[133px] sm:mt-[50px] md:h-[133px]"
              style={{
                width: 'auto',
                marginTop:'-50px'
              }}
            />
          </div>
        )}
        <img 
          src="/img/mining_items_gradient.png" 
          alt="" 
          className="sm:mt-[20px]"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxWidth: '1674.97px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            marginTop: '10px',
          }}
        />
      </div>

      {/* TOP HUD - Fixed height */}
      <div
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Title */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <h1 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-cq-primary-blue to-cq-primary-yellow bg-clip-text text-transparent">
                QUEST MINER
              </h1>
            </div>

            {/* Right: Balances + Wallet - REMOVED small redundant wallet */}
            <div className="flex-1 flex items-center justify-end gap-2" style={{ background: 'transparent' }}>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER STAGE - Grid always centered */}
      <div 
        className="flex-1 flex flex-col items-center justify-start px-3 sm:px-4 relative"
        style={{ minHeight: 'calc(100svh - 80px - 120px)', overflow: 'visible', marginTop: '0px' }}
      >
        <div 
          className="absolute inset-0 w-full"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            top: '0',
            left: '0',
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              backgroundImage: 'url(/img/bg_mining.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        <div className="w-full max-w-[min(92vw,520px)] md:max-w-[1200px] mx-auto relative z-30 mb-0" style={{ overflow: 'visible', marginTop: '-102px' }}>
          <div className="mt-0" style={{ overflow: 'visible' }}>
            <Motherlode
              endSlot={board.endSlot}
              currentSlot={currentSlot}
              startSlot={board.startSlot}
            />
          </div>
        </div>

        <div className="w-full max-w-[min(92vw,520px)] mx-auto relative z-30" style={{ overflow: 'visible' }}>
          {/* Timer and Selection Controls placed below Motherlode and on top of the Mining Grid */}
          {board?.endSlot && currentSlot && (
            <div className="w-full flex items-center justify-center gap-2 mb-2">
              <div className="flex-1 min-w-0" style={{ marginLeft: '-5px' }}>
                <Timer 
                  endSlot={board.endSlot} 
                  currentSlot={currentSlot} 
                  startSlot={board.startSlot} 
                  roundId={board.roundId?.toString()}
                  selectedCount={selectedSquares.size}
                />
              </div>
              
              <div className="flex-1 flex gap-1 justify-between items-center min-w-0">
                <GlossyButton
                  onClick={selectAll}
                  size="sm"
                  variant="success"
                  className="flex-1 min-w-0 !px-0 !py-2 !text-[11px] sm:!text-[13px]"
                >
                  ALL
                </GlossyButton>
                <GlossyButton
                  onClick={randomSelection}
                  size="sm"
                  variant="success"
                  className="flex-1 min-w-0 !px-0 !py-2 !text-[11px] sm:!text-[13px]"
                >
                  RANDOM
                </GlossyButton>
                <GlossyButton
                  onClick={clearSelection}
                  size="icon"
                  variant="danger"
                  className="flex-none !w-8 !h-8 sm:!w-9 sm:!h-9"
                >
                  ✕
                </GlossyButton>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-[min(92vw,520px)] relative z-30" style={{ overflow: 'visible' }}>
          <div className="mt-0" style={{ overflow: 'visible' }}>
            <Grid
              round={round}
              selectedSquares={selectedSquares}
              toggleSquare={toggleSquare}
            />
          </div>
          
          <HowTo />
        </div>
      </div>

      {/* BOTTOM CONTROL BAR - Sticky */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-[rgb(120,63,4)] transition-all duration-500 ease-in-out"
        style={{ 
          backgroundColor: '#FFB84A',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
          height: isDrawerOpen ? 'auto' : (selectedSquares.size > 0 ? '110px' : '68px'),
          paddingBottom: '20px',
          bottom: 0,
          maxHeight: isDrawerOpen ? '85vh' : 'auto'
        }}
      >
        {/* Drawer Handle Area - Always Fixed at top of drawer */}
        <div 
          className="w-full h-[48px] flex items-center justify-between px-6 cursor-pointer border-b border-black/10 flex-none"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          {/* Left: Selected Info */}
          <div className="flex items-center gap-1.5 min-w-0 mt-[10px]">
            <span className="text-[10px] font-black text-black/40 uppercase whitespace-nowrap">Selected:</span>
            <span className="text-xs font-black text-black/60 leading-none">{selectedSquares.size}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-4">
            <div className="w-12 h-1.5 bg-black/20 rounded-full mb-1"></div>
            <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] whitespace-nowrap">
              {isDrawerOpen ? 'CLOSE CONTROLS' : 'OPEN CONTROLS'}
            </span>
          </div>

          {/* Right: Round Info */}
          <div className="flex items-center gap-1.5 min-w-0 mt-[10px]">
            <span className="text-[10px] font-black text-black/40 uppercase whitespace-nowrap">Round:</span>
            <span className="text-xs font-black text-black/60 leading-none">#{board?.roundId?.toString() || '0'}</span>
          </div>
        </div>

        {/* Expandable Content Area */}
        <div className="w-full flex flex-col h-full overflow-visible">
          {/* Contextual MINE Action Bar - Revealed when squares selected */}
          <div 
            className={`w-full border-b border-black/5 flex-none transition-all duration-500 ease-in-out ${
              selectedSquares.size > 0 ? 'h-[42px] opacity-100' : 'h-0 opacity-0 pointer-events-none'
            }`}
          >
            <div className="max-w-xl mx-auto flex items-center h-full px-4">
              {/* Left Side: Cost & Amt (Fixed widths, pushed left) */}
              <div className="flex-1 flex items-center justify-start gap-6">
                <div className="w-[60px] flex flex-col items-start justify-center flex-none">
                  <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase whitespace-nowrap leading-none mb-0.5">Cost</span>
                  <span className="text-sm font-black text-[rgb(120,63,4)] leading-none">{(amount * selectedSquares.size).toFixed(3)}</span>
                </div>
                <div className="w-[45px] flex flex-col items-start justify-center flex-none">
                  <span className="text-[9px] font-black text-[rgb(120,63,4)]/60 uppercase whitespace-nowrap leading-none mb-0.5">Amt</span>
                  <span className="text-sm font-black text-[rgb(120,63,4)] leading-none">{amount}</span>
                </div>
              </div>

              {/* Center: MINE Button (Always Geometric Center) */}
              <div className="flex-none px-2">
                <GlossyButton
                  onClick={handleDeploy}
                  size="md"
                  variant="success"
                  className="min-w-[110px] !py-1 !text-lg"
                >
                  MINE
                </GlossyButton>
              </div>

              {/* Right Side: Increment Controls (Pushed right) */}
              <div className="flex-1 flex items-center justify-end gap-4">
                <GlossyButton onClick={incrementAmount} size="icon" variant="success" className="!w-8 !h-8 !text-3xl">+</GlossyButton>
                <GlossyButton onClick={decrementAmount} size="icon" variant="danger" className="!w-8 !h-8 !text-3xl">-</GlossyButton>
              </div>
            </div>
          </div>

          {/* Full Menu Content */}
          <div className={`max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 transition-opacity duration-300 overflow-visible ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <MainControl
              round={round}
              miner={miner}
              selectedSquares={selectedSquares}
              selectAll={selectAll}
              clearSelection={clearSelection}
              randomSelection={randomSelection}
              solBalance={solBalance}
              automation={automation}
            />
          </div>
        </div>
      </div>

      {/* Round Results Modal - Pops up on round completion */}
      <Modal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        title="Round Results"
        size="lg"
      >
        <RoundResults 
          round={previousRound || round} 
          miner={miner} 
        />
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsResultsModalOpen(false)}
            className="cq-button-primary px-8 py-3 text-lg font-bold text-black"
          >
            CONTINUE MINING
          </button>
        </div>
      </Modal>
    </main>
  );
}
