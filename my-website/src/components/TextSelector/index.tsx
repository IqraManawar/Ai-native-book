import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './styles.module.css';

interface TextSelectorProps {
  onTextSelected: (text: string) => void;
  containerSelector?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

/**
 * TextSelector component that detects text selection within doc pages
 * and shows an "Ask AI about this" tooltip.
 */
export default function TextSelector({
  onTextSelected,
  containerSelector = '.markdown, article',
}: TextSelectorProps): JSX.Element | null {
  const [selectedText, setSelectedText] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if selection is within allowed container
  const isSelectionInContainer = useCallback((selection: Selection): boolean => {
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element;

    if (!element) return false;

    // Check if element is within markdown/article content
    return !!element.closest(containerSelector);
  }, [containerSelector]);

  // Calculate tooltip position based on selection
  const calculatePosition = useCallback((selection: Selection): TooltipPosition | null => {
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position above the selection, centered
    const top = rect.top + window.scrollY - 45;
    const left = rect.left + window.scrollX + (rect.width / 2);

    return { top, left };
  }, []);

  // Handle text selection
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      // No selection or selection cleared
      setIsVisible(false);
      setSelectedText('');
      return;
    }

    const text = selection.toString().trim();

    // Minimum selection length (to avoid accidental selections)
    if (text.length < 10) {
      setIsVisible(false);
      setSelectedText('');
      return;
    }

    // Check if selection is in valid container
    if (!isSelectionInContainer(selection)) {
      setIsVisible(false);
      return;
    }

    // Limit text length for context
    const truncatedText = text.length > 500 ? text.slice(0, 500) + '...' : text;
    setSelectedText(truncatedText);

    const position = calculatePosition(selection);
    if (position) {
      setTooltipPosition(position);
      setIsVisible(true);
    }
  }, [isSelectionInContainer, calculatePosition]);

  // Handle click on "Ask AI" button
  const handleAskAI = useCallback(() => {
    if (selectedText) {
      onTextSelected(selectedText);
      setIsVisible(false);
      // Clear the selection
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedText, onTextSelected]);

  // Handle clicks outside tooltip to dismiss
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
      // Small delay to allow button click to register
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setIsVisible(false);
        }
      }, 100);
    }
  }, []);

  // Handle scroll to hide tooltip
  const handleScroll = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleSelectionChange, handleClickOutside, handleScroll]);

  // Handle keyboard shortcut (Escape to dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible || !tooltipPosition) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className={styles.tooltip}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
      role="tooltip"
    >
      <button
        className={styles.askButton}
        onClick={handleAskAI}
        aria-label="Ask AI about selected text"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          className={styles.icon}
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <span>Ask AI about this</span>
      </button>
      <div className={styles.arrow} />
    </div>
  );
}
