'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Lock, Activity, Fingerprint } from 'lucide-react';
import './ReflectiveCard.css';

interface ReflectiveCardProps {
  userName?: string;
  department?: string;
  rollNumber?: string;
  college?: string;
  semester?: number;
  totalPoints?: number;
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
  userName = 'Student',
  department = 'Department',
  rollNumber = '—',
  college = '',
  semester,
  totalPoints,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasWebcam, setHasWebcam] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasWebcam(true);
        }
      } catch {
        setHasWebcam(false);
      }
    };
    startCam();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const rotateX = (mousePos.y - 0.5) * 16;
  const rotateY = (mousePos.x - 0.5) * -16;
  const glareX = mousePos.x * 100;
  const glareY = mousePos.y * 100;

  return (
    <div
      ref={containerRef}
      className="rc-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0.5, y: 0.5 })}
    >
      {/* SVG Filters */}
      <svg className="rc-svg-filters" aria-hidden="true">
        <defs>
          <filter id="rc-glass">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="rc-metallic">
            <feSpecularLighting surfaceScale="3" specularConstant="0.8" specularExponent="25" result="spec">
              <fePointLight x="150" y="60" z="200" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
      </svg>

      <div
        className="rc-card"
        style={{
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Webcam background */}
        <div className="rc-cam-bg">
          {hasWebcam ? (
            <video ref={videoRef} autoPlay muted playsInline className="rc-video" />
          ) : (
            <div className="rc-cam-fallback" />
          )}
        </div>

        {/* Glass overlay */}
        <div
          className="rc-glass-overlay"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(124,92,252,0.18) 0%, rgba(168,148,255,0.08) 40%, transparent 70%)`,
          }}
        />

        {/* Glare */}
        <div
          className="rc-glare"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
          }}
        />

        {/* Content */}
        <div className="rc-content">
          {/* Top row */}
          <div className="rc-top-row">
            <div className="rc-brand">
              <div className="rc-brand-icon">
                <Activity size={16} />
              </div>
              <span className="rc-brand-text">SAIL Slayer</span>
            </div>
            <div className="rc-security-badge">
              <Lock size={11} />
              <span>VERIFIED</span>
            </div>
          </div>

          {/* Middle – user info */}
          <div className="rc-middle">
            <h2 className="rc-user-name">{userName}</h2>
            <p className="rc-user-dept">{department}</p>
            {college && <p className="rc-user-college">{college}</p>}
          </div>

          {/* Bottom row */}
          <div className="rc-bottom-row">
            <div className="rc-id-block">
              <span className="rc-id-label">Reg No</span>
              <span className="rc-id-value">{rollNumber}</span>
            </div>
            {semester && (
              <div className="rc-id-block">
                <span className="rc-id-label">Semester</span>
                <span className="rc-id-value">{semester}</span>
              </div>
            )}
            {totalPoints !== undefined && (
              <div className="rc-id-block">
                <span className="rc-id-label">Points</span>
                <span className="rc-id-value">{totalPoints.toLocaleString()}</span>
              </div>
            )}
            <div className="rc-fingerprint">
              <Fingerprint size={28} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectiveCard;
