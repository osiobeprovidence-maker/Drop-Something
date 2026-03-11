import React from 'react';

export function CoinLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative ${className} group`}>
      {/* 3D Side/Edge of the coin */}
      <div className="absolute inset-0 rounded-full bg-black translate-y-[2px]" />
      
      {/* Main coin face */}
      <div className="absolute inset-0 rounded-full bg-[#FF8BA7] border-2 border-black flex items-center justify-center transition-transform group-hover:-translate-y-[2px] active:translate-y-0">
        <span className="text-black font-black italic tracking-tighter select-none" style={{ fontSize: '110%' }}>D</span>
      </div>
    </div>
  );
}
