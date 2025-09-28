import { useEffect, useState } from "react";
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
  const [displayMultiplier, setDisplayMultiplier] = useState(currentMultiplier);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ultra-smooth number animation
  useEffect(() => {
    if (isActive && !isCrashed) {
      setIsAnimating(true);
      const interval = setInterval(() => {
        setDisplayMultiplier(prev => {
          const diff = currentMultiplier - prev;
          if (Math.abs(diff) < 0.001) return currentMultiplier;
          return prev + (diff * 0.3); // Smooth interpolation
        });
      }, 16); // 60fps

      return () => clearInterval(interval);
    } else {
      setDisplayMultiplier(currentMultiplier);
      setIsAnimating(false);
    }
  }, [currentMultiplier, isActive, isCrashed]);

  const getMultiplierColor = () => {
    if (isCrashed) return "text-red-400";
    if (currentMultiplier >= 10) return "text-yellow-400";
    if (currentMultiplier >= 5) return "text-orange-400";
    if (currentMultiplier >= 2) return "text-green-400";
    return "text-blue-400";
  };

  const getGlowEffect = () => {
    if (isCrashed) return "drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-crash-pulse";
    if (isActive && currentMultiplier >= 5) return "drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-glow";
    if (isActive) return "drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse";
    return "drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]";
  };

  const getRocketEmoji = () => {
    if (isCrashed) return "💥";
    if (currentMultiplier >= 20) return "🌙";
    if (currentMultiplier >= 10) return "🚀";
    if (currentMultiplier >= 5) return "✈️";
    if (currentMultiplier >= 2) return "📈";
    return "🎯";
  };

  const getPressureLevel = () => {
    if (currentMultiplier < 1.5) return "SAFE ZONE";
    if (currentMultiplier < 2) return "CAUTION";
    if (currentMultiplier < 5) return "DANGER ZONE";
    if (currentMultiplier < 10) return "HIGH RISK";
    return "EXTREME DANGER";
  };

  const getPressureColor = () => {
    if (currentMultiplier < 1.5) return "text-green-400 border-green-400/30";
    if (currentMultiplier < 2) return "text-yellow-400 border-yellow-400/30";
    if (currentMultiplier < 5) return "text-orange-400 border-orange-400/30";
    if (currentMultiplier < 10) return "text-red-400 border-red-400/30";
    return "text-purple-400 border-purple-400/30 animate-crash-pulse";
  };

  return (
    <div className="space-y-6">
      {/* Main Multiplier Display */}
      <Card className="relative p-8 bg-gradient-to-br from-black/80 via-gray-900/60 to-black/90 backdrop-blur-xl border-2 border-neon-green/20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent animate-pulse" />
        
        {/* Cyber grid overlay */}
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        <div className="relative z-10 text-center space-y-4">
          {/* Rocket emoji with status */}
          <div className="text-6xl animate-bounce-scale">
            {getRocketEmoji()}
          </div>
          
          {/* Main multiplier */}
          <div className={`text-8xl font-black font-mono ${getMultiplierColor()} ${getGlowEffect()} transition-all duration-300`}>
            {displayMultiplier.toFixed(2)}
            <span className="text-4xl">x</span>
          </div>
          
          {/* Status message */}
          <div className="space-y-2">
            {isCrashed ? (
              <div className="text-2xl font-black text-red-400 animate-crash-pulse">
                💀 LIQUIDATED! 💀
              </div>
            ) : isActive ? (
              <div className="text-xl font-bold text-green-400 animate-pulse">
                🚀 TO THE MOON! 🚀
              </div>
            ) : (
              <div className="text-lg font-bold text-yellow-400">
                ⏳ Preparing for launch...
              </div>
            )}
            
            {/* Pressure indicator */}
            {isActive && (
              <Badge variant="outline" className={`${getPressureColor()} font-mono text-sm px-4 py-2`}>
                ⚠️ {getPressureLevel()}
              </Badge>
            )}
          </div>
        </div>

        {/* Particle effects */}
        {isActive && currentMultiplier > 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: Math.min(20, Math.floor(currentMultiplier * 2)) }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full animate-ping ${
                  currentMultiplier > 10 ? 'bg-purple-400' :
                  currentMultiplier > 5 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Secondary stats panel */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-black/40 backdrop-blur-sm border border-border">
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground">CURRENT</div>
            <div className="text-lg font-bold text-white font-mono">
              {currentMultiplier.toFixed(3)}x
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-black/40 backdrop-blur-sm border border-border">
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground">STATUS</div>
            <div className={`text-sm font-bold ${
              isCrashed ? 'text-red-400' : isActive ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {isCrashed ? 'CRASHED' : isActive ? 'LIVE' : 'WAITING'}
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-black/40 backdrop-blur-sm border border-border">
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground">RISK</div>
            <div className={`text-sm font-bold ${
              currentMultiplier < 2 ? 'text-green-400' :
              currentMultiplier < 5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {currentMultiplier < 2 ? 'LOW' :
               currentMultiplier < 5 ? 'HIGH' : 'EXTREME'}
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};