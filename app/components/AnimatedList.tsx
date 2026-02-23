'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import './AnimatedList.css';

interface AnimatedListProps {
  items: Array<{ id: number; name: string; faculty_name?: string }>;
  onItemSelect?: (item: any, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
  itemClassName?: string;
}

export default function AnimatedList({
  items = [],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = true,
  itemClassName = '',
}: AnimatedListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item: any, index: number) => {
      setSelectedIndex(index);
      if (onItemSelect) {
        onItemSelect(item, index);
      }
    },
    [onItemSelect]
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    setTopGradientOpacity(Math.min(scrollTop / 40, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 60, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (onItemSelect) {
          onItemSelect(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const selectedElement = container.querySelector(`[data-index="${selectedIndex}"]`);

    if (selectedElement) {
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const elementTop = (selectedElement as HTMLElement).offsetTop;
      const elementBottom = elementTop + selectedElement.clientHeight;
      const extraMargin = 40;

      if (elementTop < containerScrollTop + extraMargin) {
        container.scrollTo({
          top: Math.max(0, elementTop - extraMargin),
          behavior: 'smooth',
        });
      } else if (elementBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: elementBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="scroll-list-container">
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-index={index}
            className="animated-item"
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            <div
              className={`subject-item ${selectedIndex === index ? 'selected' : ''} ${itemClassName}`}
            >
              <p className="subject-item-name">{item.name}</p>
              {item.faculty_name?.trim() && (
                <p className="subject-item-faculty">{item.faculty_name.trim()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }} />
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
}
