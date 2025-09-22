import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MultiplierDisplay } from "@/components/MultiplierDisplay";
import { BetPanel } from "@/components/BetPanel";
import { GameStats } from "@/components/GameStats";
import { LiveFeed } from "@/components/LiveFeed";
import { useToast } from "@/hooks/use-toast";

interface FeedEvent {
  id: string;
  type: "bet" | "cashout" | "crash";
  player: string;
  amount: number;
  multiplier?: number;
  timestamp: number;
}

const Index = () => {
  const { toast } = useToast();
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [roundId, setRoundId] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [currentBet, setCurrentBet] = useState<number | null>(null);
  const [balance, setBalance] = useState(100.0); // Mock balance
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  
  // Mock game stats
  const [gameStats, setGameStats] = useState({
    totalPlayers: 42,
    totalBets: 156.7
  });

  // Simulate multiplier growth during active rounds
  useEffect(() => {
    if (isRoundActive && !isCrashed) {
      const interval = setInterval(() => {
        setCurrentMultiplier(prev => {
          const newMultiplier = prev + 0.01;
          // Random crash between 1.1x and 10x
          const crashPoint = 1.1 + Math.random() * 8.9;
          if (newMultiplier >= crashPoint) {
            setIsCrashed(true);
            setIsRoundActive(false);
            addFeedEvent("crash", "system", 0, newMultiplier);
            toast({
              title: "Round Crashed! 💥",
              description: `Crashed at ${newMultiplier.toFixed(2)}x`,
              variant: "destructive",
            });
            setTimeout(() => {
              startNewRound();
            }, 3000);
          }
          return newMultiplier;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isRoundActive, isCrashed, toast]);

  // Countdown timer for next round
  useEffect(() => {
    if (!isRoundActive && !isCrashed) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRoundActive(true);
            setCurrentMultiplier(1.00);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRoundActive, isCrashed]);

  const startNewRound = () => {
    setIsCrashed(false);
    setIsRoundActive(false);
    setCurrentMultiplier(1.00);
    setRoundId(prev => prev + 1);
    setTimeRemaining(5);
    setCurrentBet(null);
  };

  const addFeedEvent = (type: "bet" | "cashout" | "crash", player: string, amount: number, multiplier?: number) => {
    const event: FeedEvent = {
      id: Date.now().toString(),
      type,
      player,
      amount,
      multiplier,
      timestamp: Date.now()
    };
    setFeedEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  };

  const handlePlaceBet = (amount: number) => {
    if (balance >= amount) {
      setCurrentBet(amount);
      setBalance(prev => prev - amount);
      const mockPlayer = `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`;
      addFeedEvent("bet", mockPlayer, amount);
      setGameStats(prev => ({
        ...prev,
        totalBets: prev.totalBets + amount
      }));
      toast({
        title: "Bet Placed! 🎯",
        description: `${amount.toFixed(2)} SOL bet placed`,
      });
    }
  };

  const handleCashOut = () => {
    if (currentBet && isRoundActive && !isCrashed) {
      const payout = currentBet * currentMultiplier;
      setBalance(prev => prev + payout);
      const mockPlayer = `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`;
      addFeedEvent("cashout", mockPlayer, currentBet, currentMultiplier);
      setCurrentBet(null);
      toast({
        title: "Cashed Out! 💰",
        description: `Won ${payout.toFixed(2)} SOL at ${currentMultiplier.toFixed(2)}x`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-game">
      {/* Header */}
      <header className="border-b border-border bg-card/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black bg-gradient-neon bg-clip-text text-transparent">
                MEME CRASH
              </h1>
              <Badge variant="outline" className="bg-neon-green/20 text-neon-green border-neon-green/30">
                LIVE
              </Badge>
            </div>
            <Button variant="neon" size="lg">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Game Stats */}
        <GameStats
          totalPlayers={gameStats.totalPlayers}
          totalBets={gameStats.totalBets}
          roundId={roundId}
          timeRemaining={timeRemaining}
        />

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Multiplier Display */}
          <div className="lg:col-span-2">
            <MultiplierDisplay
              currentMultiplier={currentMultiplier}
              isActive={isRoundActive}
              isCrashed={isCrashed}
            />
          </div>

          {/* Bet Panel */}
          <div className="space-y-6">
            <BetPanel
              isRoundActive={isRoundActive}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              currentBet={currentBet}
              hasActiveBet={!!currentBet}
              canCashOut={isRoundActive && !isCrashed && !!currentBet}
              balance={balance}
            />

            {/* Live Feed */}
            <LiveFeed events={feedEvents} />
          </div>
        </div>

        {/* Additional Game Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 text-center">How to Play</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Place your bet before the round starts</p>
              <p>• Watch the multiplier climb from 1.00x</p>
              <p>• Cash out before it crashes to win!</p>
              <p>• The longer you wait, the higher the multiplier</p>
              <p>• But if you wait too long... 💥</p>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 text-center">Recent Results</h3>
            <div className="space-y-2">
              {[3.47, 1.23, 8.91, 2.15, 1.08].map((crash, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Round #{roundId - index - 1}</span>
                  <Badge 
                    variant="outline" 
                    className={`${crash > 2 ? 'text-neon-green border-neon-green/30' : 'text-neon-red border-neon-red/30'}`}
                  >
                    {crash.toFixed(2)}x
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/20 backdrop-blur-lg mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>🎲 Provably Fair • 🔒 Fully On-Chain • ⚡ Powered by Solana</p>
            <p className="mt-2">Gamble responsibly. This is a demo implementation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
