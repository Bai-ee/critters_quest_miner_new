import { AnimatedNumber } from './AnimatedNumber';

interface JackpotTierCardProps {
  tier: 'GRAND' | 'MAJOR' | 'MINOR';
  value: number;
  ore: number;
  sol: number;
  odds: string;
  bgImage: string;
  labelImage?: string; // Optional label image path
  scale?: number; // Scale factor (default 1, use 0.5 for half size)
}

// Constants for responsive calculations
const CONTAINER_CONFIG = {
  minWidth: 320,
  maxWidth: 750,
} as const;

// Formatting utilities
const formatNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(1);
};

const formatMainValue = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '0000.00';
  const parts = num.toFixed(2).split('.');
  const integerPart = (parts[0] || '0').padStart(4, '0');
  const decimalPart = parts[1] || '00';
  return `${integerPart}.${decimalPart}`;
};

// Sub-components
interface LabelProps {
  imagePath: string;
  scale?: number;
}

function JackpotLabel({ imagePath, scale = 1 }: LabelProps & { scale?: number }) {
  // Use consistent label sizing - both images are 555x143, maintain aspect ratio
  // Scale the label proportionally with the card scale
  const baseWidth = 150;
  const baseHeight = 38.65;
  const isScaled = scale < 1;
  
  // For scaled cards, labels shrink proportionally with the bg image
  // Use responsive sizing that scales with viewport
  const scaledWidth = isScaled 
    ? `clamp(${baseWidth * scale * 0.5}px, calc(${baseWidth * scale * 0.5}px + 10vw), ${baseWidth * scale}px)`
    : `${baseWidth * scale}px`;
  const scaledHeight = isScaled
    ? `clamp(${baseHeight * scale * 0.5}px, calc(${baseHeight * scale * 0.5}px + 2.5vw), ${baseHeight * scale}px)`
    : `${baseHeight * scale}px`;
  
  return (
    <div
      className={`flex items-center justify-center ${isScaled ? 'absolute' : 'relative'}`}
      style={{
        backgroundImage: `url(${imagePath})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: scaledWidth,
        height: scaledHeight,
        minHeight: scaledHeight,
        zIndex: isScaled ? 30 : 10,
        top: isScaled ? 'clamp(-51px, calc(-40px + 2vw), -26px)' : 'auto',
        left: isScaled ? '50%' : 'auto',
        transform: isScaled ? 'translateX(-50%)' : 'none',
      }}
    />
  );
}

interface SlotMachineValueProps {
  value: number;
  scale?: number;
}

function SlotMachineValue({ value, scale = 1 }: SlotMachineValueProps) {
  const formattedValue = formatMainValue(value);
  // For scaled cards, use fixed sizes to ensure identical styling
  const isScaled = scale < 1;
  const textScale = isScaled ? 0.85 : 1; // 15% smaller for scaled cards
  // Reduce by 1/4 more for scaled cards (75% of current size)
  const sizeReduction = isScaled ? 0.75 : 1;
  
  // Responsive sizes for scaled cards - smaller minimums for mobile
  const baseLogoHeight = 1.25 * textScale * sizeReduction;
  const baseLogoMargin = 0.15 * textScale * sizeReduction;
  const baseValueFontSize = 1.875 * textScale * sizeReduction;
  
  // For mobile, use much smaller minimums (15% of base for logo, 25% for value)
  const mobileMinLogoHeight = baseLogoHeight * 0.15;
  const mobileMinLogoMargin = baseLogoMargin * 0.15;
  const mobileMinValueFontSize = baseValueFontSize * 0.25;
  
  const logoHeight = isScaled 
    ? `clamp(${mobileMinLogoHeight}rem, calc(${mobileMinLogoHeight}rem + 4vw), ${baseLogoHeight}rem)`
    : `clamp(0.8rem, calc(0.8rem + (100cqw - 320px) * 0.1), 3.5rem)`;
  const logoMargin = isScaled 
    ? `clamp(${mobileMinLogoMargin}rem, calc(${mobileMinLogoMargin}rem + 1vw), ${baseLogoMargin}rem)`
    : `clamp(0.25rem, calc(0.25rem + (100cqw - 320px) * 0.02), 1.25rem)`;
  const valueFontSize = isScaled 
    ? `clamp(${mobileMinValueFontSize}rem, calc(${mobileMinValueFontSize}rem + 8vw), ${baseValueFontSize}rem)`
    : `clamp(1.2rem, calc(1.2rem + (100cqw - 320px) * 0.18), 5.5rem)`;
  
  return (
    <div className={`flex items-center justify-center w-fit ${isScaled ? 'mr-0 sm:mr-2' : 'mr-1 sm:mr-2 md:mr-3'}`}>
      <img 
        src="/img/solana_logo.png" 
        alt="Solana" 
        style={{ 
          height: logoHeight,
          width: 'auto',
          marginRight: logoMargin,
        }}
      />
      <AnimatedNumber
        value={formattedValue}
        className="leading-none font-bold text-center"
        style={{
          color: '#ffffff',
          fontSize: valueFontSize,
          textShadow: 'none',
          WebkitTextStroke: 'none',
        }}
      />
    </div>
  );
}

interface ValueDisplayProps {
  ore: number;
  value: number;
  odds: string;
  scale?: number;
}

function ValueDisplay({ ore, value, odds, scale = 1 }: ValueDisplayProps) {
  // For scaled cards, use responsive sizes for mobile
  // For full-size cards, use container queries
  const isScaled = scale < 1;
  const textScale = isScaled ? 0.85 : 1; // 15% smaller for scaled cards
  
  // Responsive sizes for scaled cards that scale down more aggressively on mobile
  // For mobile, use smaller minimums (about 40% of base)
  const baseOreFontSize = 0.75 * textScale;
  const baseOddsFontSize = 0.75 * textScale;
  const baseOddsLineHeight = 11 * textScale;
  
  const mobileMinOreFontSize = baseOreFontSize * 0.35;
  const mobileMinOddsFontSize = baseOddsFontSize * 0.35;
  const mobileMinOddsLineHeight = baseOddsLineHeight * 0.35;
  
  const oreFontSize = isScaled 
    ? `clamp(${mobileMinOreFontSize}rem, calc(${mobileMinOreFontSize}rem + 3vw), ${baseOreFontSize}rem)`
    : `clamp(0.6rem, calc(0.6rem + (100cqw - 320px) * 0.025), 1.1rem)`;
  const oddsFontSize = isScaled 
    ? `clamp(${mobileMinOddsFontSize}rem, calc(${mobileMinOddsFontSize}rem + 3vw), ${baseOddsFontSize}rem)`
    : `clamp(0.6rem, calc(0.6rem + (100cqw - 320px) * 0.025), 1.1rem)`;
  const oddsLineHeight = isScaled 
    ? `clamp(${mobileMinOddsLineHeight}px, calc(${mobileMinOddsLineHeight}px + 1vw), ${baseOddsLineHeight}px)`
    : '12px';

  return (
    <div 
      className="relative z-20 flex items-center justify-between w-full mt-3"
      style={{
        paddingTop: isScaled ? '0' : 'clamp(4px, calc(1.86cqw - 6px), 12px)',
        paddingBottom: isScaled ? '0' : '0',
        paddingLeft: isScaled ? 'clamp(0px, calc(0px + 2vw), 8px)' : 'clamp(0px, calc(0px + 6%), 28px)',
        paddingRight: isScaled ? 'clamp(0px, 2vw, 8px)' : 'clamp(0px, calc(0px + 6%), 28px)',
        marginTop: isScaled ? '8px' : '0',
        gap: isScaled ? '4px' : '4px',
        top: isScaled ? '3px' : '0px',
      }}
    >
      {/* ORE on left */}
      <div 
        className="flex items-center gap-1"
        style={{
          fontSize: oreFontSize,
        }}
      >
        {!isScaled ? (
          <img 
            src="/img/coin.png" 
            alt="ORE" 
            style={{ 
              height: `clamp(${1.75 * 0.6}rem, calc(${1.75 * 0.6}rem + (100cqw - 320px) * 0.04), ${2 * 0.8}rem)`,
              width: 'auto',
            }}
          />
        ) : (
        <img 
          src="/img/coin.png" 
          alt="ORE" 
          className="hidden sm:block"
          style={{ 
            height: `clamp(${1.75 * textScale * 0.4}rem, calc(${1.75 * textScale * 0.4}rem + 6vw), ${1.75 * textScale}rem)`,
            width: 'auto',
          }}
        />
        )}
        <AnimatedNumber
          value={formatNumber(ore)}
          className="font-bold"
          style={{ color: '#ffffff' }}
        />
      </div>

      {/* Main value in center */}
      <SlotMachineValue value={value} scale={scale} />

      {/* Odds on right */}
      <div 
        className="flex flex-col items-end"
        style={{
          fontSize: oddsFontSize,
          lineHeight: oddsLineHeight,
        }}
      >
        {!isScaled && (
          <span className="uppercase tracking-wider font-bold" style={{ color: '#ffffff', opacity: 1 }}>ODDS:</span>
        )}
        <AnimatedNumber
          value={odds}
          className=""
          style={{ color: '#ffffff', opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

interface BackgroundContainerProps {
  bgImage: string;
  children: React.ReactNode;
  tier: 'GRAND' | 'MAJOR' | 'MINOR';
  scale?: number;
}

function BackgroundContainer({ bgImage, children, tier, scale = 1 }: BackgroundContainerProps) {
  const isScaled = scale < 1;
  const marginTop = isScaled ? '-39px' : '-27px';
  
  const height = isScaled 
    ? 'clamp(26.67px, calc(26.67px + 4vw), 56.67px)' 
    : 'clamp(53.33px, calc(53.33px + (100cqw - 320px) * 0.08), 93.33px)';
  const borderRadius = isScaled ? '12px' : '24px';

  // Tier-specific neon gradients
  const gradients = {
    GRAND: 'linear-gradient(180deg, #4A002E 0%, #FF00A0 50%, #4A002E 100%)',
    MAJOR: 'linear-gradient(180deg, #0A004A 0%, #0077FF 50%, #0A004A 100%)',
    MINOR: 'linear-gradient(180deg, #002E1A 0%, #00FF9D 50%, #002E1A 100%)',
  };

  return (
    <div 
      className="relative w-full flex flex-col items-center justify-center overflow-visible"
      style={{
        marginTop: marginTop,
        height: height,
        width: '100%',
      }}
    >
      {/* Outer Gold Border / Bezel */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
          padding: '4px',
          borderRadius: borderRadius,
          boxShadow: `
            0 10px 25px rgba(0,0,0,0.6),
            inset 0 2px 3px rgba(255,255,255,0.8),
            inset 0 -2px 3px rgba(0,0,0,0.4)
          `
        }}
      >
        {/* Inner Content Area with Neon Tier Gradient */}
        <div 
          className="w-full h-full relative overflow-hidden"
          style={{
            background: gradients[tier],
            borderRadius: `calc(${borderRadius} - 4px)`,
            boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.7), 0 0 10px rgba(255,255,255,0.1)'
          }}
        >
          {/* Glossy Reflection Overlay */}
          <div 
            className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent mx-2 mt-1"
            style={{ 
              filter: 'blur(1px)',
              borderRadius: `${parseFloat(borderRadius) * 0.8}px ${parseFloat(borderRadius) * 0.8}px 0 0`
            }}
          />
        </div>
      </div>

      {/* The children (ValueDisplay) */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </div>
  );
}

// Main component
export function JackpotTierCard({ 
  tier, 
  value, 
  ore, 
  sol, 
  odds, 
  bgImage,
  labelImage,
  scale = 1,
}: JackpotTierCardProps) {
  // Determine label image based on tier if not provided
  const defaultLabelImage = labelImage || 
    (tier === 'GRAND' ? '/img/grand_winner_label.png' :
     tier === 'MAJOR' ? '/img/major_winner_label.png' :
     '/img/minor_winner_label.png');

  // Scale max-width and other dimensions
  const scaledMaxWidth = 750 * scale;
  const scaledMarginTop = 30 * scale;

  // For scale = 1, use original styling without transform
  if (scale === 1) {
    return (
      <div 
        className="w-full max-w-[750px] mx-auto flex flex-col items-center justify-center relative mt-[10px] sm:mt-[30px]" 
        style={{ 
          containerType: 'inline-size', 
          marginBottom: '0',
          minHeight: 'fit-content',
          overflow: 'visible',
          paddingBottom: '0',
        }}
      >
        <JackpotLabel imagePath={defaultLabelImage} scale={scale} />
        <BackgroundContainer bgImage={bgImage} tier={tier} scale={scale}>
          <ValueDisplay ore={ore} value={value} odds={odds} scale={scale} />
        </BackgroundContainer>
      </div>
    );
  }

  // For scaled versions, fill width of parent (set to 120% per user request)
  const visualWidth = scale < 1 ? '120%' : '100%';
  
  return (
    <div 
      className="w-full flex flex-col items-center justify-center relative" 
      style={{ 
        containerType: 'inline-size', 
        minHeight: 'fit-content',
        overflow: 'visible',
        width: visualWidth,
        maxWidth: 'none',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      <JackpotLabel imagePath={defaultLabelImage} scale={scale} />
      <BackgroundContainer bgImage={bgImage} tier={tier} scale={scale}>
        <ValueDisplay ore={ore} value={value} odds={odds} scale={scale} />
      </BackgroundContainer>
    </div>
  );
}
