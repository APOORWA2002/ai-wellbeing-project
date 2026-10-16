import React from 'react';

interface StressinaLogoProps {
  variant?: 'full' | 'emblem' | 'wordmark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StressinaLogo: React.FC<StressinaLogoProps> = ({
  variant = 'full',
  size = 'md',
  showSubtitle = false,
  className = '',
  onClick,
}) => {
  // Dimensions scale mapping
  const sizeMap = {
    xs: { emblemSize: 22, textClass: 'text-sm', dotSize: 3 },
    sm: { emblemSize: 30, textClass: 'text-base', dotSize: 3.5 },
    md: { emblemSize: 38, textClass: 'text-lg', dotSize: 4 },
    lg: { emblemSize: 52, textClass: 'text-2xl', dotSize: 5 },
    xl: { emblemSize: 72, textClass: 'text-4xl', dotSize: 6 },
  };

  const { emblemSize, textClass } = sizeMap[size] || sizeMap.md;

  const renderEmblem = () => (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: emblemSize, height: emblemSize }}
    >
      {/* Ambient Neon Backglow */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-70 pointer-events-none transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.5) 0%, rgba(6, 182, 212, 0.15) 60%, transparent 100%)',
          transform: 'scale(1.3)',
        }}
      />

      {/* High-Precision SVG Emblem replicating official logo */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_10px_rgba(34,211,238,0.45)]"
      >
        <defs>
          {/* Top Leaf-Wave Gradient (Mint to Turquoise) */}
          <linearGradient id="sTopGrad" x1="25%" y1="10%" x2="85%" y2="50%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="35%" stopColor="#5EEAD4" />
            <stop offset="75%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Center Spine Glass Ribbon Gradient */}
          <linearGradient id="sCenterGrad" x1="20%" y1="30%" x2="70%" y2="75%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Bottom Wave Ribbon Gradient (Ocean Blue to Sapphire) */}
          <linearGradient id="sBottomGrad" x1="20%" y1="60%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="40%" stopColor="#0284C7" />
            <stop offset="85%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Glow filter for constellation nodes */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Orbital Neural Circuit Arcs */}
        {/* Top-right orbital filament */}
        <path
          d="M 28 26 C 26 15, 62 10, 80 28"
          stroke="rgba(34, 211, 238, 0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="40 2"
        />
        {/* Bottom orbital filament */}
        <path
          d="M 72 74 C 74 85, 38 90, 20 72"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="40 2"
        />
        {/* Left perimeter filament */}
        <path
          d="M 18 42 C 16 30, 22 22, 32 18"
          stroke="rgba(94, 234, 212, 0.4)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* 1. Bottom Wave Ribbon of the 'S' */}
        <path
          d="M 52 50 C 66 52, 82 62, 78 76 C 74 88, 56 90, 40 85 C 28 81, 16 71, 14 62 C 18 64, 26 66, 34 64 C 44 62, 50 56, 52 50 Z"
          fill="url(#sBottomGrad)"
          opacity="0.95"
        />

        {/* 2. Main Flowing Body of 'S' */}
        {/* Sculpted ribbon curving from top-right down to center-left and sweeping down */}
        <path
          d="M 82 30 C 76 34, 66 38, 55 38 C 42 38, 30 33, 27 25 C 26 21, 30 16, 42 16 C 58 16, 75 22, 82 30 Z"
          fill="url(#sTopGrad)"
          opacity="0.9"
        />

        {/* 3. Primary Volumetric 3D Ribbon Loop */}
        <path
          d="M 82 30 C 65 38, 48 35, 38 42 C 26 50, 28 65, 36 72 C 45 80, 64 82, 72 74 C 80 66, 76 56, 62 52 C 50 48, 42 45, 42 38 C 42 32, 48 26, 60 26 C 70 26, 78 28, 82 30 Z"
          fill="url(#sCenterGrad)"
        />

        {/* 4. Top Leaf Tip Pointing Upper Right */}
        <path
          d="M 72 26 C 78 27, 86 28, 90 28 C 86 33, 79 36, 72 37 C 76 32, 76 28, 72 26 Z"
          fill="#A7F3D0"
          opacity="0.95"
        />

        {/* 5. Inner Glass Highlights & Refraction Glints */}
        <path
          d="M 44 20 C 56 19, 70 24, 78 29"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 33 46 C 29 54, 30 64, 36 70"
          stroke="rgba(255, 255, 255, 0.55)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M 52 50 C 64 54, 72 61, 71 70"
          stroke="rgba(103, 232, 249, 0.6)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* 6. Neural Network Constellation Glowing Nodes */}
        {/* Node 1: Top Orbit */}
        <circle cx="28" cy="18" r="2.8" fill="#5EEAD4" filter="url(#nodeGlow)" />
        <circle cx="28" cy="18" r="1.4" fill="#FFFFFF" />

        {/* Node 2: Top Right Perimeter */}
        <circle cx="80" cy="28" r="2.8" fill="#67E8F9" filter="url(#nodeGlow)" />
        <circle cx="80" cy="28" r="1.4" fill="#FFFFFF" />

        {/* Node 3: Center Left Branch */}
        <circle cx="20" cy="42" r="3" fill="#22D3EE" filter="url(#nodeGlow)" />
        <circle cx="20" cy="42" r="1.5" fill="#FFFFFF" />

        {/* Node 4: Inner Core Hub */}
        <circle cx="48" cy="42" r="3.2" fill="#38BDF8" filter="url(#nodeGlow)" />
        <circle cx="48" cy="42" r="1.6" fill="#FFFFFF" />

        {/* Node 5: Lower Mid Body */}
        <circle cx="50" cy="58" r="2.6" fill="#06B6D4" filter="url(#nodeGlow)" />
        <circle cx="50" cy="58" r="1.2" fill="#FFFFFF" />

        {/* Node 6: Right Lower Orbit */}
        <circle cx="72" cy="74" r="2.6" fill="#38BDF8" filter="url(#nodeGlow)" />
        <circle cx="72" cy="74" r="1.3" fill="#FFFFFF" />

        {/* Node 7: Bottom Sweep Orbit */}
        <circle cx="20" cy="72" r="2.8" fill="#22D3EE" filter="url(#nodeGlow)" />
        <circle cx="20" cy="72" r="1.4" fill="#FFFFFF" />
      </svg>
    </div>
  );

  const renderWordmark = () => (
    <div className="flex flex-col select-none">
      <div className="flex items-baseline tracking-tight">
        <span className={`${textClass} font-bold text-white tracking-wide`}>
          stressina
        </span>
        <span
          className={`${textClass} font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.75)]`}
        >
          .Ai
        </span>
      </div>
      {showSubtitle && (
        <span className="text-[10px] tracking-wider uppercase font-semibold text-cyan-400/80 -mt-0.5">
          Intelligent Healthcare & Wellbeing
        </span>
      )}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {variant !== 'wordmark' && renderEmblem()}
      {variant !== 'emblem' && renderWordmark()}
    </div>
  );
};