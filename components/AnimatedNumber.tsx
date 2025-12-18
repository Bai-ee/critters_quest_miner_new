import { useSlotMachineAnimation } from '@/hooks/useSlotMachineAnimation';

interface AnimatedNumberProps {
  value: string | number;
  className?: string;
  style?: React.CSSProperties;
  totalDuration?: number;
  delay?: number;
  startChar?: string;
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

  return (
    <div 
      ref={containerRef}
      className={`inline-flex items-center ${className}`}
      style={style}
    >
      {characters.map((char, index) => (
        <span
          key={index}
          ref={(el) => {
            digitRefs.current[index] = el;
          }}
          className="inline-block"
          style={{
            minWidth: char === '.' ? '0.3em' : '0.6em',
            textAlign: 'center',
          }}
        >
          {char === '.' ? '.' : startChar || '-'}
        </span>
      ))}
    </div>
  );
}


