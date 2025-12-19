import React from 'react';
import { AnimatedNumber } from './AnimatedNumber';

interface JackpotTierCardProps {
  tier: 'GRAND' | 'MAJOR' | 'MINOR';
  ore: number;
  sol: number;
  odds: string;
  bgImage: string;
  labelImage: string;
  scale?: number;
}

export function JackpotTierCard({ tier, ore, sol, odds, bgImage, labelImage, scale = 1 }: JackpotTierCardProps) {
  const isScaled = scale < 1;
  
  // Format numbers for display
  const formatQuest = (num: number) => {
    // Format as whole numbers only, padded to 5 digits: 00000 (removed first 0)
    return Math.floor(num).toString().padStart(5, '0');
  };

  const formatSol = (num: number) => {
    // Format as 000.00 (3 digits before decimal, 2 after - removed first 0)
    const whole = Math.floor(num);
    const decimal = (num - whole).toFixed(2).slice(1); // Get .XX part
    return whole.toString().padStart(3, '0') + decimal;
  };

  // Base dimensions that we scale manually to avoid transform gaps
  const baseHeight = isScaled ? 40 : 60;
  const fontSizeMain = isScaled ? 'text-[14px]' : 'text-[24px] sm:text-[32px]';
  const fontSizeLabel = isScaled ? 'text-[8px]' : 'text-[10px]';
  const oddsFontSize = isScaled ? 'text-[8px]' : 'text-[18px]';
  const oddsValueFontSize = isScaled ? 'text-[8px]' : 'text-[10px]';

  // Tier-specific neon gradients (restored from latest known state)
  const gradients = {
    GRAND: 'linear-gradient(180deg, #4A002E 0%, #FF00A0 50%, #4A002E 100%)',
    MAJOR: 'linear-gradient(180deg, #0A004A 0%, #0077FF 50%, #0A004A 100%)',
    MINOR: 'linear-gradient(180deg, #002E1A 0%, #00A364 50%, #002E1A 100%)',
  };

  return (
    <div className="relative w-full flex flex-col items-center" style={{ perspective: '1000px', overflow: 'visible' }}>
      {/* Label/Header Image (The "GRAND WINNER" style text) */}
      <div 
        className="absolute z-20 pointer-events-none"
        style={{
          top: isScaled ? '-2px' : '5px',
          width: isScaled ? '53%' : '45%',
          maxWidth: isScaled ? '120px' : '140px',
          transform: isScaled ? 'translateY(2px)' : 'none'
        }}
      >
        <img src={labelImage} alt={`${tier} LABEL`} className="w-full h-auto drop-shadow-lg" />
      </div>

      {/* Main Card Body with Bezel */}
      <div 
        className="relative w-full overflow-visible"
        style={{
          height: `${baseHeight}px`,
          marginTop: isScaled ? '8px' : '15px',
          background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
          padding: isScaled ? '2px' : '4px',
          borderRadius: '13px',
          boxShadow: isScaled ? '0 4px 10px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.6)',
        }}
      >
        {/* Inner Content Area with Neon Tier Gradient */}
        <div 
          className="w-full h-full relative overflow-visible flex items-center justify-center"
          style={{
            background: gradients[tier],
            borderRadius: '11px',
            boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7)',
          }}
        >
          {/* Glossy Overlay */}
          <div 
            className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
            style={{ 
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px'
            }}
          />

          {/* Centered Content Layout: QUEST - SOL (with divider) */}
          <div 
            className={`relative z-10 flex items-center justify-center w-full gap-1 sm:gap-4 ${
              isScaled && (tier === 'MAJOR' || tier === 'MINOR')
                ? '' // No padding for MAJOR/MINOR
                : 'px-2 sm:px-6' // Default symmetric padding for GRAND
            }`}
            style={{ 
              transform: isScaled ? 'translateY(3px)' : 'none',
              marginTop: isScaled ? '0px' : '6px'
            }}
          >
            
            {/* Left: QUEST Value */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <img 
                  src="/img/coin.png" 
                  alt="QUEST" 
                  className={`${tier === 'GRAND' ? (isScaled ? 'h-4 sm:h-6' : 'h-6 sm:h-10') : (isScaled ? 'h-2 sm:h-3' : 'h-3 sm:h-5')} w-auto opacity-90`} 
                />
                <div 
                  className={`${fontSizeMain} font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] truncate`}
                  style={{ overflow: 'visible' }}
                >
                  <AnimatedNumber value={formatQuest(ore)} />
                </div>
              </div>
            </div>

            {/* Center: Divider Line */}
            <div className="h-full border-l border-white/10 min-w-[1px]"></div>

            {/* Center: ODDS */}
            <div 
              className={`flex flex-col items-center justify-center px-2 ${!isScaled ? 'border-x border-white/10 min-w-[45px] sm:min-w-[60px]' : 'min-w-0'}`}
              style={!isScaled ? { gap: '0px', height: '34px', paddingBottom: '12px' } : { width: '0px' }}
            >
              {!isScaled && (
                <span 
                  className="text-[10px] font-black text-white/90 uppercase leading-[1] tracking-tighter"
                  style={{ paddingTop: '19px' }}
                >
                  ODDS
                </span>
              )}
              <div 
                className={`${oddsFontSize} font-black text-white/90 leading-[1] whitespace-nowrap`}
                style={!isScaled ? { 
                  verticalAlign: 'top', 
                  height: 'fit-content', 
                  lineHeight: '10px',
                  marginBottom: '3px'
                } : {}}
              >
                {isScaled ? (
                  <div className="flex flex-col items-center scale-90 sm:scale-100">
                    <span className="leading-none">{odds.split('/')[0]}/</span>
                    <span className="leading-none">{odds.split('/')[1]}</span>
                  </div>
                ) : (
                  <span 
                    className="drop-shadow-sm"
                    style={{ 
                      fontSize: '10px', 
                      marginBottom: '8px', 
                      paddingBottom: '7px' 
                    }}
                  >
                    {odds}
                  </span>
                )}
              </div>
            </div>

            {/* Right: SOL Value */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <img 
                  src="/img/solana_logo.png" 
                  alt="SOL" 
                  className={`${tier === 'GRAND' ? (isScaled ? 'h-2.5 sm:h-4' : 'h-4 sm:h-7') : (isScaled ? 'h-1.5 sm:h-2' : 'h-2 sm:h-3.5')} w-auto opacity-90`} 
                />
                <div 
                  className={`${fontSizeMain} font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] truncate`}
                  style={{ overflow: 'visible' }}
                >
                  <AnimatedNumber value={formatSol(sol)} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
