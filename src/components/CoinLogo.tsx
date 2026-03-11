import { cn } from "../lib/utils";

export function CoinLogo({ className, rotation = "-15deg" }: { className?: string, rotation?: string }) {
  return (
    <div className={cn("relative group select-none", className)} style={{ transform: `rotate(${rotation})` }}>
      {/* 3D Side/Edge (Black depth) */}
      <div className="absolute inset-0 bg-black rounded-full translate-y-1.5" />
      
      {/* Main Coin Face */}
      <div className="absolute inset-0 bg-[#FF8BA7] border-[3px] border-black rounded-full flex items-center justify-center transition-transform group-hover:-translate-y-1 active:translate-y-0.5">
        <span className="text-black font-black italic tracking-tighter leading-none" style={{ fontSize: '120%' }}>D</span>
      </div>
    </div>
  );
}
