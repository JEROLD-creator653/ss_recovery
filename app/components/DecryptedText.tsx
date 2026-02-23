'use client';

import { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  characters?: string;
  className?: string;
  animateOn?: 'hover' | 'view' | 'both';
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  animateOn = 'hover',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayText(text);
      setRevealed(0);
      return;
    }

    const chars = characters.split('');
    let iteration = 0;
    const totalChars = text.length;

    const interval = setInterval(() => {
      if (sequential) {
        // Reveal one char at a time
        if (revealed < totalChars) {
          setDisplayText(
            text
              .split('')
              .map((char, i) => {
                if (i < revealed) return char;
                if (char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
              })
              .join('')
          );
          setRevealed((prev) => prev + 1);
        } else {
          clearInterval(interval);
          setDisplayText(text);
          setIsAnimating(false);
        }
      } else {
        // Scramble all then reveal
        iteration++;
        if (iteration > maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsAnimating(false);
        } else {
          setDisplayText(
            text
              .split('')
              .map((char) => {
                if (char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
              })
              .join('')
          );
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isAnimating, text, speed, maxIterations, sequential, characters, revealed]);

  // IntersectionObserver for 'view' mode
  useEffect(() => {
    if (animateOn !== 'view' && animateOn !== 'both') return;
    if (typeof window === 'undefined') return; // SSR safety

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAnimating(true);
          } else {
            setIsAnimating(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [animateOn]);

  const hoverProps =
    animateOn === 'hover' || animateOn === 'both'
      ? {
          onMouseEnter: () => setIsAnimating(true),
          onMouseLeave: () => setIsAnimating(false),
        }
      : {};

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}
      {...hoverProps}
    >
      {displayText}
    </span>
  );
}
