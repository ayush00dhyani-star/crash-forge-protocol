import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BetPanelProps {
  isRoundActive: boolean;
  onPlaceBet: (amount: number) => void;
  onCashOut: () => void;
  currentBet: number | null;
  hasActiveBet: boolean;
  canCashOut: boolean;
  balance: number;
}

export const BetPanel = ({
  isRoundActive,
  onPlaceBet,
  onCashOut,
  currentBet,
  hasActiveBet,
  canCashOut,
  balance
}: BetPanelProps) => {
  const [betAmount, setBetAmount] = useState("0.1");
  const [autoMode, setAutoMode] = useState(false);
  const [autoCashoutAt, setAutoCashoutAt] = useState([2]);
  
  const presetAmounts = [0.1, 0.5, 1.0, 5.0, 10.0];
  const quickAmounts = ["MIN", "1/2", "2X", "MAX"];

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (amount > 0 && amount <= balance) {
      onPlaceBet(amount);
    }
  };

  const handleQuickAmount = (type: string) => {
    const currentAmount = parseFloat(betAmount) || 0;
    switch (type) {
      case "MIN":
        setBetAmount("0.01");
        break;
      case "1/2":
        setBetAmount((currentAmount / 2).toFixed(2));
        break;
      case "2X":
        setBetAmount(Math.min(currentAmount * 2, balance).toFixed(2));
        break;
      case "MAX":
        setBetAmount(balance.toFixed(2));
        break;
    }
  };

  const isValidBet = () => {
    const amount = parseFloat(betAmount);
    return amount > 0 && amount <= balance && !isNaN(amount);
  };

  const getPotentialWin = () => {
    const amount = parseFloat(betAmount) || 0;
    return (amount * autoCashoutAt[0]).toFixed(2);
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-lg border-neon-blue/30 neon-border">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-transparent bg-gradient-neon bg-clip-text">
          🎰 YOLO BET 🎰
        </h3>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground">BANK ROLL</div>
          <Badge variant="outline" className="bg-neon-green/20 text-neon-green border-neon-green/50 font-mono">
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
                  Win: {getPotentialWin()} SOL
                </div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.1"
                  className="text-center font-mono text-lg bg-black/50 border-neon-blue/30 focus:border-neon-green"
                  disabled={isRoundActive}
                  step="0.01"
                  min="0.01"
                  max={balance}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  SOL
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((type) => (
                <Button
                  key={type}
                  variant="game"
                  size="sm"
                  onClick={() => handleQuickAmount(type)}
                  disabled={isRoundActive}
                  className="text-xs font-bold"
                >
                  {type}
                </Button>
              ))}
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount.toString())}
                  disabled={isRoundActive}
                  className={`text-xs border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/20 ${
                    betAmount === amount.toString() ? 'bg-neon-purple/30 border-neon-purple' : ''
                  }`}
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Auto Mode Section */}
          <div className="space-y-3 p-4 bg-black/30 rounded-lg border border-neon-yellow/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neon-yellow">⚡ AUTO CASHOUT</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
                className={`text-xs ${autoMode ? 'text-neon-green' : 'text-muted-foreground'}`}
              >
                {autoMode ? 'ON 🟢' : 'OFF 🔴'}
              </Button>
            </div>
            
            {autoMode && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Cash out at:</span>
                  <span className="font-mono text-neon-yellow">{autoCashoutAt[0].toFixed(2)}x</span>
                </div>
                <Slider
                  value={autoCashoutAt}
                  onValueChange={setAutoCashoutAt}
                  max={20}
                  min={1.1}
                  step={0.1}
                  className="w-full"
                />
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
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Bet Display */}
          <div className="text-center space-y-3 p-6 bg-gradient-to-br from-green-950/30 to-green-900/20 rounded-lg border border-neon-green/30">
            <div className="text-sm text-neon-green font-bold">🎯 ACTIVE BET</div>
            <div className="text-3xl font-black text-neon-green font-mono">
              {currentBet?.toFixed(4)} SOL
            </div>
            <div className="text-xs text-muted-foreground">
              {autoMode && `Auto cashout at ${autoCashoutAt[0].toFixed(2)}x`}
            </div>
          </div>

          {/* Cash Out Button */}
          <Button
            variant="cashout"
            size="xl"
            onClick={onCashOut}
            disabled={!canCashOut}
            className="w-full text-xl font-black animate-bounce-scale relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-green-400 opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {canCashOut ? (
                <>
                  💰 CASH OUT NOW! 💰
                </>
              ) : (
                "❌ CANNOT CASH OUT"
              )}
            </span>
          </Button>

          {/* Potential Win Display */}
          {canCashOut && currentBet && (
            <div className="text-center p-3 bg-black/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Potential Win</div>
              <div className="text-lg font-bold text-neon-green">
                {(currentBet * 1.5).toFixed(4)} SOL
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Disclaimer */}
      <div className="text-center text-xs text-muted-foreground opacity-70 border-t border-border pt-4">
        ⚠️ NOT FINANCIAL ADVICE • ONLY RISK WHAT YOU CAN AFFORD TO LOSE ⚠️
      </div>
    </Card>
  );
};