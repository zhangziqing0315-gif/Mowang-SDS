import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Button: React.FC<{ 
    text: string,
    onClick?: () => void,
    active?: boolean 
}> = ({ text, onClick, active }) => (
  <button 
    onClick={onClick}
    className={`
      relative flex items-center justify-center px-16 py-4
      border-2 transition-all duration-300 ease-out
      group overflow-hidden
      border-st-red text-st-red
      ${active 
        ? "bg-st-red/20 shadow-[0_0_20px_rgba(231,29,54,0.6)] hover:bg-st-red/30 hover:shadow-[0_0_30px_rgba(231,29,54,0.8)]" 
        : "bg-transparent shadow-none hover:bg-st-red/10"
      }
    `}
  >
    {/* Scanline / Glitch effect on button */}
    <div className={`absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%] transition-opacity duration-300 ${active ? 'opacity-20' : 'opacity-10'}`} />

    {/* Text Section */}
    <span className="font-serif font-black tracking-[0.15em] text-lg uppercase text-center relative z-10">
        {text}
    </span>
  </button>
);

interface OverlayProps {
    assembled: boolean;
    setAssembled: (val: boolean) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ assembled, setAssembled }) => {
  return (
    <main className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
      
      {/* Header - Stranger Things Style */}
      <header className="flex flex-col items-center w-full mt-4 scale-75 origin-top pointer-events-auto select-none">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="text-center flex flex-col items-center"
        >
            {/* The Bars */}
            <div className="w-16 h-1 bg-st-red shadow-[0_0_10px_#E71D36] mb-4" />
            
            <h1 className="font-stranger text-7xl md:text-8xl tracking-tight leading-none text-stranger-outline">
                MERRY
            </h1>
            <p className="font-stranger text-3xl md:text-5xl tracking-[0.2em] mt-2 text-st-red drop-shadow-[0_0_10px_rgba(231,29,54,0.8)]">
                CHRISTMAS
            </p>
            
             {/* The Bars */}
             <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-st-red to-transparent mt-6 opacity-50" />
        </motion.div>
      </header>

      {/* Main Controls */}
      <div className="absolute bottom-32 left-0 w-full flex justify-center pointer-events-auto">
        <Button 
            text={assembled ? "RUN" : "JOIN"}
            onClick={() => setAssembled(!assembled)} 
            active={!assembled}
        />
      </div>
      
    </main>
  );
};