'use client';

import { useState, useEffect } from 'react';
import './AlertPopup.css';

interface AlertPopupProps {
  title?: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  onClose?: () => void;
  autoClose?: number;
  size?: 'normal' | 'large';
}

export default function AlertPopup({
  title = 'Alert',
  message,
  type = 'info',
  onClose,
  autoClose,
  size = 'normal',
}: AlertPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const icons = {
    error: '✕',
    success: '✓',
    warning: '!',
    info: 'ℹ',
  };

  return (
    <div className="alert-popup-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="alert-title">
      <div className={`alert-popup alert-popup-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className={`alert-popup-header alert-${type}`}>
          <div className={`alert-icon alert-icon-${type}`} aria-hidden="true">
            {icons[type]}
          </div>
          <h2 className="alert-title" id="alert-title">{title}</h2>
          <button className="alert-close-btn" onClick={handleClose} aria-label="Close alert">×</button>
        </div>
        
        <div className="alert-popup-body">
          <p className="alert-message">{message}</p>
        </div>

        <div className="alert-popup-footer">
          <button className={`alert-btn alert-btn-${type}`} onClick={handleClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
