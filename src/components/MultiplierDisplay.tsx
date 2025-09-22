import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

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

  useEffect(() => {
    if (isActive && !isCrashed) {
      setDisplayMultiplier(currentMultiplier);
    }
  }, [currentMultiplier, isActive, isCrashed]);

  const getDisplayClass = () => {
    if (isCrashed) {
      return "text-neon-red animate-crash-pulse";
    }
    if (isActive) {
      return "text-neon-green animate-glow";
    }
    return "text-muted-foreground";
  };

  const getCardClass = () => {
    if (isCrashed) {
      return "border-neon-red shadow-neon-red bg-destructive/10";
    }
    if (isActive) {
      return "border-neon-green shadow-neon-green bg-primary/10 animate-pulse-neon";
    }
    return "border-border";
  };

  return (
    <Card className={`p-8 text-center transition-all duration-300 ${getCardClass()}`}>
      <div className="space-y-4">
        <div className={`text-8xl font-black tracking-tight ${getDisplayClass()}`}>
          {isCrashed ? "CRASHED!" : `${displayMultiplier.toFixed(2)}x`}
        </div>
        
        {isActive && !isCrashed && (
          <div className="text-sm text-muted-foreground animate-bounce">
            Cash out before it crashes!
          </div>
        )}
        
        {isCrashed && (
          <div className="text-sm text-destructive-foreground animate-pulse">
            Better luck next round...
          </div>
        )}
        
        {!isActive && !isCrashed && (
          <div className="text-sm text-muted-foreground">
            Round starting soon...
          </div>
        )}
      </div>
    </Card>
  );
};