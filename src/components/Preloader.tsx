import { motion } from 'motion/react';
import React from 'react';

interface PreloaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Preloader({ text = "Discovering Scents", fullScreen = false }: PreloaderProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white" 
    : "flex flex-col items-center justify-center min-h-[50vh] w-full bg-transparent";

  return (
    <div className={containerClasses}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[0.5px] border-yellow-600/20 border-t-yellow-600"
        />
        {/* Inner rotating ring (opposite direction) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-[0.5px] border-neutral-900/10 border-b-neutral-900"
        />
        {/* Center Droplet/Diamond */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-3.5 h-3.5 rotate-45 bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-[0_0_15px_rgba(202,138,4,0.6)]"
        />
      </div>
      <motion.span 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-8 font-serif text-[9px] uppercase tracking-[0.35em] text-neutral-500 font-bold"
      >
        {text}
      </motion.span>
    </div>
  );
}
