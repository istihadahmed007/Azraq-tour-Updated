import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const AnimatedSkyBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      style={{ willChange: 'transform' }}
    >
      {/* 1. Base Rich Atmospheric Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06152B] via-[#0A2E50] to-[#041224]" />

      {/* 2. Floating Ambient Light Orbs (Cyan / Teal / Ocean Azure) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
              x: ['-5%', '5%', '-5%'],
              y: ['-5%', '8%', '-5%'],
              scale: [1, 1.15, 1],
            }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[10%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full bg-gradient-to-br from-[#17BEBB]/25 via-[#086788]/20 to-transparent blur-[100px] opacity-70"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
              x: ['6%', '-6%', '6%'],
              y: ['8%', '-8%', '8%'],
              scale: [1.1, 0.95, 1.1],
            }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[25%] -right-[15%] w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] rounded-full bg-gradient-to-bl from-[#00D2C4]/20 via-[#0D9488]/15 to-transparent blur-[110px] opacity-60"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
              x: ['-8%', '8%', '-8%'],
              y: ['10%', '-5%', '10%'],
              scale: [0.95, 1.1, 0.95],
            }
        }
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[60%] -left-[10%] w-[70vw] h-[70vw] max-w-[950px] max-h-[950px] rounded-full bg-gradient-to-tr from-[#086788]/25 via-[#17BEBB]/15 to-transparent blur-[120px] opacity-55"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
              x: ['5%', '-5%', '5%'],
              y: ['-6%', '6%', '-6%'],
              scale: [1, 1.12, 1],
            }
        }
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-10%] right-[10%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tl from-[#0A3D62]/35 via-[#17BEBB]/20 to-transparent blur-[100px] opacity-65"
      />

      {/* 3. Drifting High-Altitude Cloud Wisps (Dual Layer) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
              x: ['-20%', '20%', '-20%'],
            }
        }
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[12%] left-[-20%] w-[140%] h-[350px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent blur-3xl transform rotate-[-3deg]"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
              x: ['15%', '-15%', '15%'],
            }
        }
        transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[48%] left-[-15%] w-[130%] h-[400px] bg-gradient-to-r from-transparent via-[#17BEBB]/[0.05] to-transparent blur-3xl transform rotate-[2deg]"
      />

      {/* 4. Elegant Diagonal Flight Path Streamers */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flightStreamer1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#17BEBB" stopOpacity="0" />
            <stop offset="50%" stopColor="#17BEBB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#086788" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flightStreamer2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5BC7F4" stopOpacity="0" />
            <stop offset="45%" stopColor="#5BC7F4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#17BEBB" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Diagonal trajectory lines with dashed dasharray */}
        <path
          d="M-100,200 C300,100 800,450 1600,220"
          fill="none"
          stroke="url(#flightStreamer1)"
          strokeWidth="1.5"
          strokeDasharray="8 12"
          className="animate-[pulse_6s_ease-in-out_infinite]"
        />
        <path
          d="M100,750 C600,600 1100,900 1800,650"
          fill="none"
          stroke="url(#flightStreamer2)"
          strokeWidth="1.2"
          strokeDasharray="6 14"
          className="animate-[pulse_8s_ease-in-out_infinite]"
        />
      </svg>

      {/* 5. Subtle Fine Micro-Grain / Star Points (Non-intrusive luxury shimmer) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.15)_1px,transparent_1px),radial-gradient(circle_at_75%_40%,rgba(23,190,187,0.18)_1.5px,transparent_1.5px),radial-gradient(circle_at_45%_75%,rgba(255,255,255,0.12)_1px,transparent_1px),radial-gradient(circle_at_85%_85%,rgba(91,199,244,0.15)_1px,transparent_1px)] bg-[length:180px_180px] opacity-40" />
    </div>
  );
};
