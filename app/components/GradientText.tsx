import { ReactNode } from 'react';
import './GradientText.css';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8'],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientColors = [...colors, colors[0]].join(', ');

  const style = {
    backgroundImage: `linear-gradient(to right, ${gradientColors})`,
    backgroundSize: '300% 100%',
    animationDuration: `${animationSpeed}s`,
  } as React.CSSProperties;

  return (
    <span
      className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
    >
      {showBorder && <span className="gradient-overlay" style={style} />}
      <span className="text-content" style={style}>
        {children}
      </span>
    </span>
  );
}
