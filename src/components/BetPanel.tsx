import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  
  const presetAmounts = [0.1, 0.5, 1.0, 5.0, 10.0];

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (amount > 0 && amount <= balance) {
      onPlaceBet(amount);
    }
  };

  const isValidBet = () => {
    const amount = parseFloat(betAmount);
    return amount > 0 && amount <= balance && !isNaN(amount);
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Place Your Bet</h3>
        <Badge variant="outline" className="bg-secondary/50">
          {balance.toFixed(2)} SOL
        </Badge>
      </div>

      {!hasActiveBet ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Bet Amount (SOL)
            </label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.1"
              className="text-center font-mono"
              disabled={isRoundActive}
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="game"
                size="sm"
                onClick={() => setBetAmount(amount.toString())}
                disabled={isRoundActive}
                className="text-xs"
              >
                {amount}
              </Button>
            ))}
          </div>

          <Button
            variant="bet"
            size="xl"
            onClick={handlePlaceBet}
            disabled={isRoundActive || !isValidBet()}
            className="w-full"
          >
            {isRoundActive ? "Round in Progress" : "Place Bet"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Current Bet</div>
            <div className="text-2xl font-bold text-neon-blue">
              {currentBet?.toFixed(2)} SOL
            </div>
          </div>

          <Button
            variant="cashout"
            size="xl"
            onClick={onCashOut}
            disabled={!canCashOut}
            className="w-full animate-bounce-scale"
          >
            {canCashOut ? "CASH OUT NOW!" : "Cannot Cash Out"}
          </Button>
        </div>
      )}
    </Card>
  );
};