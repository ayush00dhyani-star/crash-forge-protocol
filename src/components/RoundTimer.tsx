import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface RoundTimerProps {
  timeRemaining: number;
  isRoundActive: boolean;
  isCrashed: boolean;
  roundId: number;
}

export const RoundTimer = ({ timeRemaining, isRoundActive, isCrashed, roundId }: RoundTimerProps) => {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [timeRemaining]);

  const getTimerColor = () => {
    if (isCrashed) return "text-red-400 border-red-400/50";
    if (isRoundActive) return "text-green-400 border-green-400/50";
    if (timeRemaining <= 2) return "text-red-400 border-red-400/50 animate-pulse";
    return "text-yellow-400 border-yellow-400/50";
  };

  const getTimerText = () => {
    if (isCrashed) return "💥 CRASHED";
    if (isRoundActive) return "🚀 LIVE";
    if (timeRemaining > 0) return `⏰ ${timeRemaining}s`;
    return "🏁 STARTING";
  };

  return (
    <Card className="p-4 bg-black/40 backdrop-blur-sm border-border cyber-grid">
      <div className="text-center space-y-3">
        <div className="text-sm font-bold text-muted-foreground">
          ROUND #{roundId}
        </div>
        
        <div key={pulseKey} className="relative">
          <Badge 
            variant="outline" 
            className={`${getTimerColor()} font-mono text-lg px-4 py-2 transition-all duration-300`}
          >
            {getTimerText()}
          </Badge>
          
          {/* Countdown progress bar */}
          {!isRoundActive && !isCrashed && timeRemaining > 0 && (
            <div className="mt-2 w-full bg-black/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-red-400 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${((5 - timeRemaining) / 5) * 100}%` 
                }}
              />
            </div>
          )}
        </div>

        {/* Status messages */}
        <div className="text-xs text-muted-foreground">
          {!isRoundActive && !isCrashed && timeRemaining > 0 && "Next round starting..."}
          {isRoundActive && "Round in progress!"}
          {isCrashed && "Round ended!"}
        </div>
      </div>
    </Card>
  );
};