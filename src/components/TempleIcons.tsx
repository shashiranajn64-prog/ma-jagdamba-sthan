import React from 'react';

export const MandirSeal: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 110 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    className={`select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer scalloped / double circle */}
    <circle cx="100" cy="100" r="94" stroke="#7a0000" strokeWidth="4" strokeDasharray="6 3" />
    <circle cx="100" cy="100" r="86" stroke="#7a0000" strokeWidth="2.5" />
    <circle cx="100" cy="100" r="62" stroke="#7a0000" strokeWidth="1.5" strokeDasharray="4 2" />

    {/* Circular text along path */}
    <path
      id="sealTextTop"
      d="M 28 100 A 72 72 0 0 1 172 100"
      fill="none"
    />
    <path
      id="sealTextBottom"
      d="M 172 100 A 72 72 0 0 1 28 100"
      fill="none"
    />
    <text fill="#7a0000" fontSize="13.5" fontWeight="bold" letterSpacing="2.5" textAnchor="middle">
      <textPath href="#sealTextTop" startOffset="50%">
        ★ माँ जगदंबा स्थान ट्रस्ट ★
      </textPath>
    </text>
    <text fill="#7a0000" fontSize="11" fontWeight="bold" letterSpacing="1.8" textAnchor="middle">
      <textPath href="#sealTextBottom" startOffset="50%">
        मथुरापुर, मुजफ्फरपुर (बिहार)
      </textPath>
    </text>

    {/* Center Emblem: Sacred Kalash & Trishul */}
    <g transform="translate(100, 100)">
      {/* Trishul center */}
      <path
        d="M 0 -36 L 0 18 M -14 -24 Q -12 -8 0 0 Q 12 -8 14 -24 M -14 -24 L -18 -26 M 14 -24 L 18 -26"
        stroke="#7a0000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Little Om */}
      <text
        x="0"
        y="14"
        textAnchor="middle"
        fill="#7a0000"
        fontSize="16"
        fontWeight="bold"
        fontFamily="serif"
      >
        ॐ
      </text>
      {/* Base decorative ribbon */}
      <text
        x="0"
        y="28"
        textAnchor="middle"
        fill="#7a0000"
        fontSize="8"
        fontWeight="800"
        letterSpacing="1"
      >
        ★ अधिकृत मोहर ★
      </text>
    </g>
  </svg>
);

export const KalashIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C11 2 9.5 3.5 10 5.5C8 5.8 7 7 7 9C7 10 8 11 9 11.5V13C6.5 13.5 5 15.5 5 18C5 20.2 6.8 22 9 22H15C17.2 22 19 20.2 19 18C19 15.5 17.5 13.5 15 13V11.5C16 11 17 10 17 9C17 7 16 5.8 14 5.5C14.5 3.5 13 2 12 2ZM12 4C12.5 4 13.2 4.6 13 5.5H11C10.8 4.6 11.5 4 12 4ZM10.5 13H13.5V14H10.5V13ZM9 16H15C16.1 16 17 16.9 17 18C17 19.1 16.1 20 15 20H9C7.9 20 7 19.1 7 18C7 16.9 7.9 16 9 16Z" />
  </svg>
);

export const DiyaIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C12.5 4 14.5 6 13.5 8C13 9 12 9.5 12 9.5C12 9.5 11 9 10.5 8C9.5 6 11.5 4 12 2ZM4 15C4 18.5 7.5 21 12 21C16.5 21 20 18.5 20 15C20 13.5 18.5 13 17 13H7C5.5 13 4 13.5 4 15ZM7 15H17C17.5 15.5 17.5 16 16.5 17C15.5 18 14 19 12 19C10 19 8.5 18 7.5 17C6.5 16 6.5 15.5 7 15Z" />
  </svg>
);

export const MandirShikharIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1L14 4H10L12 1ZM12 5L17 10H7L12 5ZM5 11H19L20 14H4L5 11ZM3 15H21V22H17V17H7V22H3V15ZM9 17H15V22H9V17Z" />
  </svg>
);

export const OmIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <span className={`inline-flex items-center justify-center font-bold select-none ${className}`}>
    ॐ
  </span>
);
