import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BetPanelProps {
  isRoundActive: boolean;
  onPlaceBet: (amount: number) => boolean;
  onCashOut: () => boolean;
  currentBet: number | null;
  hasActiveBet: boolean;
  canCashOut: boolean;
  balance: number;
  autoCashOut: number | null;
  setAutoCashOut: (value: number | null) => void;
}

export const BetPanel = ({ 
  isRoundActive, 
  onPlaceBet, 
  onCashOut, 
  currentBet, 
  hasActiveBet, 
  canCashOut, 
  balance,
  autoCashOut,
  setAutoCashOut
}: BetPanelProps) => {
  const [betAmount, setBetAmount] = useState("5.0");
  const [autoMode, setAutoMode] = useState(false);

  const betPresets = [1, 5, 10, 25, 50];

  const isValidBet = useCallback(() => {
    const amount = parseFloat(betAmount);
    return amount > 0 && amount <= balance && !isNaN(amount);
  }, [betAmount, balance]);

  const handlePlaceBet = useCallback(() => {
    if (isValidBet() && !isRoundActive) {
      const success = onPlaceBet(parseFloat(betAmount));
      if (success && autoMode && autoCashOut) {
        setAutoCashOut(autoCashOut);
      }
    }
  }, [betAmount, isValidBet, isRoundActive, onPlaceBet, autoMode, autoCashOut, setAutoCashOut]);

  const getPotentialWin = () => {
    const amount = parseFloat(betAmount) || 0;
    const multiplier = autoCashOut || 2.0;
    return (amount * multiplier).toFixed(2);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-950/30 to-purple-900/20 backdrop-blur-sm border-neon-purple/30 retro-crt">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-neon-purple">💎 DEGEN BETTING PANEL 💎</h3>
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-neon-purple/20 text-neon-purple border-neon-purple/50 font-mono animate-pulse">
              💰 {balance.toFixed(4)} SOL
            </Badge>
          </div>
        </div>

        {!hasActiveBet ? (
          <div className="space-y-6">
            {/* Bet Amount Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-neon-blue">
                    🎯 BET AMOUNT (SOL)
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Potential Win: {getPotentialWin()} SOL
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={balance}
                    className="bg-black/40 border-border text-center font-mono text-lg pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBetAmount(balance.toString())}
                    className="absolute right-1 top-1 h-8 px-2 text-xs text-neon-red hover:text-red-400"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {/* Quick Bet Presets */}
              <div className="grid grid-cols-5 gap-2">
                {betPresets.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount.toString())}
                    disabled={amount > balance}
                    className={`text-xs font-mono ${
                      parseFloat(betAmount) === amount 
                        ? 'border-neon-green bg-neon-green/20 text-neon-green' 
                        : 'border-border hover:border-neon-green/50'
                    }`}
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Auto Cash Out Setting */}
            <div className="space-y-3 p-4 bg-black/30 rounded-lg border border-neon-yellow/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neon-yellow">⚡ AUTO CASHOUT</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAutoMode(!autoMode);
                    if (!autoMode && !autoCashOut) {
                      setAutoCashOut(2.0);
                    }
                  }}
                  className={`text-xs ${autoMode ? 'text-neon-green' : 'text-muted-foreground'}`}
                >
                  {autoMode ? 'ON 🟢' : 'OFF 🔴'}
                </Button>
              </div>
              
              {autoMode && (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="2.00"
                      step="0.01"
                      min="1.01"
                      max="100"
                      value={autoCashOut || ""}
                      onChange={(e) => setAutoCashOut(e.target.value ? parseFloat(e.target.value) : null)}
                      className="bg-black/40 border-border text-center font-mono pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      x
                    </span>
                  </div>
                  {autoCashOut && (
                    <div className="text-xs text-green-400 text-center animate-pulse">
                      🎯 Will auto cash out at {autoCashOut.toFixed(2)}x
                    </div>
                  )}
                  
                  {/* Quick multiplier presets */}
                  <div className="grid grid-cols-4 gap-1">
                    {[1.5, 2.0, 3.0, 5.0].map((multiplier) => (
                      <Button
                        key={multiplier}
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoCashOut(multiplier)}
                        className={`text-xs font-mono ${
                          autoCashOut === multiplier 
                            ? 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow' 
                            : 'border-border hover:border-neon-yellow/50'
                        }`}
                      >
                        {multiplier}x
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Place Bet Button */}
            <Button
              variant="bet"
              size="xl"
              onClick={handlePlaceBet}
              disabled={isRoundActive || !isValidBet()}
              className="w-full text-lg font-black relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue animate-pulse opacity-20"></div>
              <span className="relative z-10">
                {isRoundActive ? "🚫 ROUND IN PROGRESS" : "🚀 SEND IT TO THE MOON!"}
              </span>
            </Button>

            {/* Risk warning */}
            <div className="text-center">
              <div className="text-xs text-red-300 animate-pulse">
                ⚠️ This will literally steal your money ⚠️
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Bet Display */}
            <div className="text-center space-y-4 p-6 bg-gradient-to-br from-green-950/30 to-green-900/20 border border-neon-green/30 rounded-lg">
              <div className="space-y-2">
                <div className="text-lg font-black text-neon-green">💸 BET PLACED 💸</div>
                <div className="text-2xl font-mono font-black text-white">
                  {currentBet?.toFixed(4)} SOL
                </div>
                {autoCashOut && (
                  <div className="text-sm text-yellow-400">
                    🎯 Auto cash out at {autoCashOut.toFixed(2)}x
                  </div>
                )}
              </div>
            </div>

            {/* Cash Out Button */}
            <Button
              variant="cashout"
              size="xl"
              onClick={onCashOut}
              disabled={!canCashOut}
              className="w-full text-xl font-black relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-green via-green-400 to-neon-green animate-pulse opacity-30"></div>
              <span className="relative z-10">
                {canCashOut ? "💰 CASH OUT NOW! 💰" : "⏳ WAITING..."}
              </span>
            </Button>

            {/* Current Value Display */}
            {currentBet && (
              <div className="text-center p-4 bg-black/30 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">Current Value</div>
                <div className="text-lg font-mono font-bold text-green-400">
                  {(currentBet * 1.0).toFixed(4)} SOL
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center space-y-2">
              <div className="text-xs text-muted-foreground">
                📈 Watch the multiplier rise and cash out before it crashes!
              </div>
              <div className="text-xs text-red-300 animate-pulse">
                💀 One wrong move and you're REKT! 💀
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};