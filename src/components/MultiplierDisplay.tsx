import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MultiplierDisplayProps {
  currentMultiplier: number;
  isActive: boolean;
  isCrashed: boolean;
}

export const MultiplierDisplay = ({ 
  currentMultiplier, 
  isActive, 
  isCrashed 
}: MultiplierDisplayProps) => {
  const [displayMultiplier, setDisplayMultiplier] = useState(1.00);
  const [rockets, setRockets] = useState<string[]>([]);

  useEffect(() => {
    if (isActive && !isCrashed) {
      setDisplayMultiplier(currentMultiplier);
      
      // Add rockets as multiplier grows
      if (currentMultiplier > 2 && currentMultiplier % 0.5 < 0.01) {
        setRockets(prev => [...prev, '🚀'].slice(-5));
      }
    } else {
      setRockets([]);
    }
  }, [currentMultiplier, isActive, isCrashed]);

  const getDisplayClass = () => {
    if (isCrashed) {
      return "text-neon-red animate-crash-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]";
    }
    if (isActive) {
      const intensity = Math.min(currentMultiplier / 5, 1);
      return `text-neon-green animate-glow drop-shadow-[0_0_${20 + intensity * 30}px_rgba(34,197,94,${0.5 + intensity * 0.5})]`;
    }
    return "text-muted-foreground";
  };

  const getCardClass = () => {
    if (isCrashed) {
      return "border-neon-red shadow-neon-red bg-gradient-to-br from-red-950/20 to-red-900/10 retro-crt";
    }
    if (isActive) {
      const pulse = currentMultiplier > 3 ? "animate-pulse-neon" : "";
      return `border-neon-green shadow-neon-green bg-gradient-to-br from-green-950/20 to-green-900/10 cyber-grid ${pulse}`;
    }
    return "border-border cyber-grid";
  };

  const getMultiplierSize = () => {
    if (currentMultiplier > 10) return "text-9xl";
    if (currentMultiplier > 5) return "text-8xl";
    return "text-7xl";
  };

  return (
    <Card className={`relative p-8 text-center transition-all duration-300 overflow-hidden ${getCardClass()}`}>
      {/* Particle effects background */}
      <div className="absolute inset-0 pointer-events-none">
        {isActive && !isCrashed && (
          <>
            {/* Rising particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-neon-green rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="relative space-y-4">
        {/* Rocket trail */}
        {rockets.length > 0 && (
          <div className="flex justify-center items-center gap-2 mb-2">
            {rockets.map((rocket, i) => (
              <span 
                key={i} 
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {rocket}
              </span>
            ))}
          </div>
        )}

        <div className={`${getMultiplierSize()} font-black tracking-tight ${getDisplayClass()} relative`}>
          {isCrashed ? (
            <div className="space-y-2">
              <div className="text-6xl">💥 CRASHED! 💥</div>
              <div className="text-4xl font-bold">
                {displayMultiplier.toFixed(2)}x
              </div>
            </div>
          ) : (
            <div className="relative">
              <span className="relative z-10">
                {displayMultiplier.toFixed(2)}x
              </span>
              {isActive && currentMultiplier > 2 && (
                <div className="absolute inset-0 animate-ping">
                  <span className="opacity-30">
                    {displayMultiplier.toFixed(2)}x
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Status messages with more personality */}
        {isActive && !isCrashed && (
          <div className="space-y-2">
            <div className="text-lg text-neon-green font-bold animate-bounce">
              🔥 TO THE MOON! CASH OUT NOW! 🔥
            </div>
            <div className="text-sm text-muted-foreground">
              {currentMultiplier > 5 ? "🚨 DANGER ZONE! 🚨" : 
               currentMultiplier > 3 ? "💎 DIAMOND HANDS? 💎" : 
               "📈 Building momentum..."}
            </div>
          </div>
        )}
        
        {isCrashed && (
          <div className="space-y-2">
            <div className="text-lg text-destructive-foreground animate-pulse font-bold">
              😭 GET REKT! BETTER LUCK NEXT TIME! 😭
            </div>
            <Badge variant="destructive" className="animate-bounce">
              💸 FUNDS ARE SAFU... OR ARE THEY? 💸
            </Badge>
          </div>
        )}
        
        {!isActive && !isCrashed && (
          <div className="space-y-2">
            <div className="text-lg text-neon-blue font-bold animate-pulse">
              🎲 GET READY TO LOSE YOUR MONEY! 🎲
            </div>
            <div className="text-sm text-muted-foreground">
              🚀 Next rocket launching soon... 🚀
            </div>
          </div>
        )}

        {/* Multiplier milestones */}
        {isActive && !isCrashed && (
          <div className="flex justify-center gap-2 mt-4">
            {[2, 5, 10, 20, 50].map((milestone) => (
              <Badge
                key={milestone}
                variant={currentMultiplier >= milestone ? "default" : "outline"}
                className={`text-xs ${
                  currentMultiplier >= milestone 
                    ? "bg-neon-green text-black animate-pulse" 
                    : "opacity-50"
                }`}
              >
                {milestone}x
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};