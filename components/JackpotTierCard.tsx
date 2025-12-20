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
  
  // Format numbers for display - minimum digits required
  const formatQuest = (num: number) => {
    // Format as whole numbers only, no padding
    return Math.floor(num).toString();
  };

  const formatSol = (num: number) => {
    // Format with minimum digits, 2 decimal places
    const whole = Math.floor(num);
    const decimal = (num - whole).toFixed(2).slice(1); // Get .XX part
    return whole.toString() + decimal;
  };

  // Base dimensions that we scale manually to avoid transform gaps
  const baseHeight = isScaled ? 40 : 60;
  // Increase font sizes by 1/5 (20%)
  const fontSizeMain = isScaled ? 'text-[17px]' : 'text-[29px] sm:text-[38px]';
  const fontSizeLabel = isScaled ? 'text-[10px]' : 'text-[12px]';
  const oddsFontSize = isScaled ? 'text-[10px]' : 'text-[22px]';
  const oddsValueFontSize = isScaled ? 'text-[10px]' : 'text-[12px]';

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
          padding: '2px',
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
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <span 
                  className={`${tier === 'GRAND' ? (isScaled ? 'text-[8px]' : 'text-[10px]') : oddsFontSize} font-black text-white/90 uppercase leading-[1]`}
                >
                  QUEST
                </span>
                <div 
                  className={`${fontSizeMain} font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}
                  style={{ overflow: 'visible', textAlign: 'center' }}
                >
                  <AnimatedNumber value={formatQuest(ore)} />
                </div>
              </div>
            </div>

            {/* Center: Divider Line - only show for GRAND */}
            {tier === 'GRAND' && (
              <>
                <div className="h-full border-l border-white/10 min-w-[1px]"></div>

                {/* Center: GRAND JACKPOT */}
                <div 
                  className={`flex flex-col items-center justify-center px-2 ${!isScaled ? 'border-x border-white/10 min-w-[45px] sm:min-w-[60px]' : 'min-w-0'}`}
                  style={!isScaled ? { gap: '0px', height: '34px', paddingBottom: '12px', textAlign: 'center', verticalAlign: 'middle' } : { width: '0px' }}
                >
                  <div 
                    className={`${tier === 'GRAND' ? (isScaled ? 'text-[8px]' : 'text-[10px]') : oddsFontSize} font-black text-white/90 leading-[1]`}
                    style={!isScaled ? { 
                      verticalAlign: 'top', 
                      height: 'fit-content', 
                      lineHeight: '10px',
                      marginBottom: '3px'
                    } : {}}
                  >
                    <div className="flex flex-col items-center scale-90 sm:scale-100">
                      <span className="leading-none" style={{ marginTop: '20px' }}>GRAND</span>
                      <span className="leading-none">JACKPOT</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Right: SOL Value */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <div 
                  className={`${fontSizeMain} font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}
                  style={{ overflow: 'visible', textAlign: 'center' }}
                >
                  <AnimatedNumber value={formatSol(sol)} />
                </div>
                <span 
                  className={`${tier === 'GRAND' ? (isScaled ? 'text-[8px]' : 'text-[10px]') : oddsFontSize} font-black text-white/90 uppercase leading-[1]`}
                >
                  SOL
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
