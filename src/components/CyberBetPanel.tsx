import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Rocket, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Skull,
  Settings
} from "lucide-react";

interface CyberBetPanelProps {
  balance: number;
  currentBet: number;
  isRoundActive: boolean;
  canCashOut: boolean;
  hasActiveBet: boolean;
  autoCashOut: number;
  setAutoCashOut: (value: number) => void;
  onPlaceBet: (amount: number) => void;
  onCashOut: () => void;
  currentMultiplier: number;
}

export const CyberBetPanel = ({
  balance,
  currentBet,
  isRoundActive,
  canCashOut,
  hasActiveBet,
  autoCashOut,
  setAutoCashOut,
  onPlaceBet,
  onCashOut,
  currentMultiplier
}: CyberBetPanelProps) => {
  const [betAmount, setBetAmount] = useState(0.1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const potentialWin = currentBet * currentMultiplier;
  const profitAmount = potentialWin - currentBet;

  const quickAmounts = [0.1, 0.5, 1.0, 5.0];
  const quickMultipliers = [2, 5, 10, 25];

  const getBetButtonState = () => {
    if (hasActiveBet && canCashOut) {
      return {
        text: `CASH OUT ${potentialWin.toFixed(3)} SOL`,
        icon: <TrendingUp className="h-5 w-5" />,
        className: "gradient-neon-success neon-glow-green text-black font-black animate-glow-pulse",
        disabled: false,
        action: onCashOut
      };
    }
    
    if (isRoundActive && !hasActiveBet) {
      return {
        text: "TOO LATE - NEXT ROUND",
        icon: <Skull className="h-5 w-5" />,
        className: "bg-surface-2 text-muted-foreground",
        disabled: true,
        action: () => {}
      };
    }

    return {
      text: "LAUNCH ROCKET",
      icon: <Rocket className="h-5 w-5" />,
      className: "gradient-neon-primary neon-glow-cyan text-black font-black",
      disabled: betAmount <= 0 || betAmount > balance || isRoundActive,
      action: () => onPlaceBet(betAmount)
    };
  };

  const buttonState = getBetButtonState();

  return (
    <Card className="p-6 glass-elevated space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-neon-cyan">
          MISSION CONTROL
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-neon-purple hover:text-neon-magenta"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Balance Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-mono">WALLET BALANCE</span>
          <Badge variant="outline" className="font-mono">
            <DollarSign className="h-3 w-3 mr-1" />
            {balance.toFixed(3)} SOL
          </Badge>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Bet Amount Input */}
      <div className="space-y-3">
        <label className="text-sm font-mono text-neon-cyan uppercase tracking-wide">
          BET AMOUNT (SOL)
        </label>
        
        <div className="relative">
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
            step={0.01}
            min={0.01}
            max={balance}
            disabled={isRoundActive && hasActiveBet}
            className="bg-surface-2 border-border/50 text-center text-lg font-mono font-bold h-12"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs text-neon-cyan font-mono">SOL</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(amount)}
              disabled={isRoundActive && hasActiveBet}
              className="font-mono text-xs hover:border-neon-cyan hover:text-neon-cyan"
            >
              {amount}
            </Button>
          ))}
        </div>

        {/* Max Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBetAmount(balance)}
          disabled={isRoundActive && hasActiveBet}
          className="w-full font-mono hover:border-neon-magenta hover:text-neon-magenta"
        >
          MAX ({balance.toFixed(3)} SOL)
        </Button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <>
          <Separator className="bg-border/50" />
          
          <div className="space-y-3">
            <label className="text-sm font-mono text-neon-purple uppercase tracking-wide">
              AUTO CASH OUT
            </label>
            
            <div className="relative">
              <Input
                type="number"
                value={autoCashOut}
                onChange={(e) => setAutoCashOut(parseFloat(e.target.value) || 0)}
                step={0.1}
                min={1.1}
                max={100}
                className="bg-surface-2 border-border/50 text-center text-lg font-mono font-bold h-12"
                placeholder="2.0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Target className="h-4 w-4 text-neon-purple" />
              </div>
            </div>

            {/* Quick Multiplier Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickMultipliers.map((mult) => (
                <Button
                  key={mult}
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoCashOut(mult)}
                  className="font-mono text-xs hover:border-neon-purple hover:text-neon-purple"
                >
                  {mult}×
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator className="bg-border/50" />

      {/* Main Action Button */}
      <Button
        onClick={buttonState.action}
        disabled={buttonState.disabled}
        className={`w-full h-14 text-lg font-display font-black ${buttonState.className}`}
        size="lg"
      >
        <div className="flex items-center gap-3">
          {buttonState.icon}
          {buttonState.text}
        </div>
      </Button>

      {/* Active Bet Info */}
      {hasActiveBet && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground font-mono">BET</div>
              <div className="font-mono font-bold text-neon-cyan">
                {currentBet.toFixed(3)} SOL
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-muted-foreground font-mono">POTENTIAL WIN</div>
              <div className="font-mono font-bold text-neon-green">
                {potentialWin.toFixed(3)} SOL
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-mono">PROFIT</div>
            <div className={`text-lg font-mono font-bold ${
              profitAmount > 0 ? 'text-neon-green' : 'text-neon-red'
            }`}>
              {profitAmount > 0 ? '+' : ''}{profitAmount.toFixed(3)} SOL
            </div>
          </div>

          {autoCashOut > 0 && (
            <div className="text-center p-2 bg-surface-2 rounded-lg">
              <div className="text-xs text-neon-purple font-mono">
                AUTO CASH OUT AT {autoCashOut}×
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning for high multipliers */}
      {currentMultiplier > 10 && hasActiveBet && (
        <div className="p-3 bg-gradient-to-r from-neon-red/20 to-neon-magenta/20 border border-neon-red/30 rounded-lg">
          <div className="flex items-center gap-2 text-neon-red text-sm font-mono">
            <Zap className="h-4 w-4" />
            DANGER ZONE - BUBBLE ALERT!
          </div>
        </div>
      )}
    </Card>
  );
};