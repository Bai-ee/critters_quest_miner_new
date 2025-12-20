import { useSlotMachineAnimation } from '@/hooks/useSlotMachineAnimation';

interface AnimatedNumberProps {
  value: string | number;
  className?: string;
  style?: React.CSSProperties;
  totalDuration?: number;
  delay?: number;
  startChar?: string;
}

/**
 * Identifies leading zero indices in a formatted number string.
 * For whole numbers (e.g., "000308"), returns indices of zeros before the first non-zero digit.
 * For decimal numbers (e.g., "0000.02"), returns indices of zeros before the decimal point.
 */
function getLeadingZeroIndices(valueString: string): Set<number> {
  const leadingZeroIndices = new Set<number>();
  const chars = valueString.split('');
  
  // Check if there's a decimal point
  const decimalIndex = chars.indexOf('.');
  
  if (decimalIndex === -1) {
    // Whole number: find leading zeros before first non-zero digit
    let foundNonZero = false;
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === '0' && !foundNonZero) {
        leadingZeroIndices.add(i);
      } else if (chars[i] !== '0' && chars[i] !== ' ' && chars[i] !== ',') {
        foundNonZero = true;
      }
    }
  } else {
    // Decimal number: find leading zeros before the decimal point
    // For "0000.02", all zeros before the '.' are leading zeros
    let foundNonZero = false;
    for (let i = 0; i < decimalIndex; i++) {
      if (chars[i] === '0' && !foundNonZero) {
        leadingZeroIndices.add(i);
      } else if (chars[i] !== '0' && chars[i] !== ' ' && chars[i] !== ',') {
        foundNonZero = true;
      }
    }
  }
  
  return leadingZeroIndices;
}

export function AnimatedNumber({ 
  value, 
  className = '', 
  style = {},
  totalDuration,
  delay,
  startChar,
}: AnimatedNumberProps) {
  const { containerRef, digitRefs, characters } = useSlotMachineAnimation(value, {
    totalDuration,
    delay,
    startChar,
  });

  const valueString = typeof value === 'number' ? value.toFixed(2) : value;
  const leadingZeroIndices = getLeadingZeroIndices(valueString);

  return (
    <div 
      ref={containerRef}
      className={`inline-flex items-center ${className}`}
      style={style}
    >
      {characters.map((char, index) => {
        const isLeadingZero = leadingZeroIndices.has(index);
        return (
          <span
            key={index}
            ref={(el) => {
              digitRefs.current[index] = el;
            }}
            className="inline-block"
            style={{
              minWidth: char === '.' ? '0.3em' : '0.6em',
              textAlign: 'center',
              opacity: isLeadingZero ? 0.3 : 1,
            }}
          >
            {char === '.' ? '.' : startChar || '-'}
          </span>
        );
      })}
    </div>
  );
}




