import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, AlertTriangle } from "lucide-react";

interface MultiplierPanelProps {
  currentMultiplier: number;
  isActive: boolean;
  isCrashed: boolean;
  timeRemaining: number;
}

export const MultiplierPanel = ({ 
  currentMultiplier, 
  isActive, 
  isCrashed,
  timeRemaining
}: MultiplierPanelProps) => {
  const [displayMultiplier, setDisplayMultiplier] = useState(currentMultiplier);
  const [prevMultiplier, setPrevMultiplier] = useState(currentMultiplier);

  // Smooth number interpolation
  useEffect(() => {
    if (isActive && !isCrashed) {
      const interval = setInterval(() => {
        setDisplayMultiplier(prev => {
          const diff = currentMultiplier - prev;
          if (Math.abs(diff) < 0.001) return currentMultiplier;
          return prev + (diff * 0.15);
        });
      }, 16);

      return () => clearInterval(interval);
    } else {
      setDisplayMultiplier(currentMultiplier);
    }
  }, [currentMultiplier, isActive, isCrashed]);

  // Track value changes for animation
  useEffect(() => {
    if (currentMultiplier !== prevMultiplier) {
      setPrevMultiplier(currentMultiplier);
    }
  }, [currentMultiplier, prevMultiplier]);

  const getStatusIcon = () => {
    if (isCrashed) return <AlertTriangle className="h-5 w-5" />;
    if (isActive) return <Activity className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  const getStatusColor = () => {
    if (isCrashed) return "destructive";
    if (isActive) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (isCrashed) return "Crashed";
    if (isActive) return "Live";
    return timeRemaining > 0 ? `Starting in ${timeRemaining}` : "Waiting";
  };

  const getMultiplierColor = () => {
    if (isCrashed) return "text-destructive";
    if (currentMultiplier >= 10) return "text-warning";
    if (currentMultiplier >= 5) return "text-info";
    if (currentMultiplier >= 2) return "text-success";
    return "text-primary";
  };

  const getRiskLevel = () => {
    if (currentMultiplier < 1.5) return { level: "Low", color: "text-success" };
    if (currentMultiplier < 3) return { level: "Medium", color: "text-warning" };
    if (currentMultiplier < 10) return { level: "High", color: "text-destructive" };
    return { level: "Extreme", color: "text-destructive animate-pulse-danger" };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-4">
      {/* Main Multiplier Display */}
      <Card className="p-8 glass">
        <div className="text-center space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant={getStatusColor()} className="flex items-center gap-2 px-4 py-2">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>

          {/* Main Multiplier */}
          <div className={`text-8xl font-black number-mono ${getMultiplierColor()} animate-value-change`}>
            {displayMultiplier.toFixed(2)}
            <span className="text-4xl">×</span>
          </div>

          {/* Risk Indicator */}
          {isActive && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wide">Risk Level:</span>
              <span className={`text-sm font-semibold ${risk.color}`}>{risk.level}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 surface-2">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Current</div>
            <div className="text-lg font-bold number-mono text-foreground">
              {currentMultiplier.toFixed(3)}×
            </div>
          </div>
        </Card>
        
        <Card className="p-4 surface-2">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
            <div className={`text-sm font-semibold ${
              isCrashed ? 'text-destructive' : 
              isActive ? 'text-success' : 'text-muted-foreground'
            }`}>
              {isCrashed ? 'Crashed' : isActive ? 'Live' : 'Waiting'}
            </div>
          </div>
        </Card>
        
        <Card className="p-4 surface-2">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Duration</div>
            <div className="text-sm font-semibold text-foreground number-mono">
              {isActive ? `${((Date.now() - Date.now()) / 1000).toFixed(1)}s` : '0.0s'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};