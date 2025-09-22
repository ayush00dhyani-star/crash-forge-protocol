import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MultiplierDisplay } from "@/components/MultiplierDisplay";
import { BetPanel } from "@/components/BetPanel";
import { GameStats } from "@/components/GameStats";
import { LiveFeed } from "@/components/LiveFeed";
import { GameChat } from "@/components/GameChat";
import { MatrixRain } from "@/components/MatrixRain";
import { FloatingEmojis } from "@/components/FloatingEmojis";
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
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showWinEmojis, setShowWinEmojis] = useState(false);
  const [showLossEmojis, setShowLossEmojis] = useState(false);
  const [showBetEmojis, setShowBetEmojis] = useState(false);
  
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
            setShowLossEmojis(true);
            setTimeout(() => setShowLossEmojis(false), 100);
            toast({
              title: "💥 REKT! Market Crashed! 💥",
              description: `Get fucked at ${newMultiplier.toFixed(2)}x - should have cashed out!`,
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
      setShowBetEmojis(true);
      setTimeout(() => setShowBetEmojis(false), 100);
      toast({
        title: "🎯 Bet Placed! Time to get REKT! 🎯",
        description: `${amount.toFixed(2)} SOL sent to the void`,
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
      setShowWinEmojis(true);
      setTimeout(() => setShowWinEmojis(false), 100);
      toast({
        title: "💰 BASED! Cashed Out Like a Chad! 💰",
        description: `Won ${payout.toFixed(2)} SOL at ${currentMultiplier.toFixed(2)}x - not totally retarded!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-game relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Floating Emojis */}
      <FloatingEmojis trigger={showWinEmojis} type="win" />
      <FloatingEmojis trigger={showLossEmojis} type="loss" />
      <FloatingEmojis trigger={showBetEmojis} type="bet" />

      {/* Header */}
      <header className="border-b border-border bg-black/20 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black bg-gradient-neon bg-clip-text text-transparent animate-glow">
                💥 MEME CRASH 💥
              </h1>
              <Badge variant="outline" className="bg-red-500/30 text-red-400 border-red-500/50 animate-pulse">
                🔴 LIVE DESTRUCTION
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/30 text-yellow-400 border-yellow-500/50">
                ⚠️ NOT FINANCIAL ADVICE
              </Badge>
            </div>
            <Button 
              variant="neon" 
              size="xl"
              onClick={() => setIsWalletConnected(!isWalletConnected)}
              className="font-black"
            >
              {isWalletConnected ? "🟢 WALLET CONNECTED" : "🔌 CONNECT WALLET"}
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

            {/* Live Feed & Chat */}
            <div className="space-y-6">
              <LiveFeed events={feedEvents} />
              <GameChat isConnected={isWalletConnected} />
            </div>
          </div>
        </div>

        {/* Meme Sections */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-950/30 to-green-900/20 backdrop-blur-sm border-neon-green/30 retro-crt">
            <h3 className="text-lg font-black mb-4 text-center text-neon-green">🎮 HOW TO GET REKT</h3>
            <div className="space-y-2 text-sm text-green-300">
              <p>• YOLO your life savings before the round starts 🎯</p>
              <p>• Watch the multiplier moon from 1.00x 📈</p>
              <p>• Cash out before it crashes to actually win! 💰</p>
              <p>• The longer you wait, the more you'll lose 🔥</p>
              <p>• Diamond hands usually get REKT 💎🙌💀</p>
              <p>• Your wife's boyfriend is laughing 😂</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-950/30 to-red-900/20 backdrop-blur-sm border-neon-red/30 retro-crt">
            <h3 className="text-lg font-black mb-4 text-center text-neon-red">💀 RECENT CASUALTIES</h3>
            <div className="space-y-2">
              {[
                { round: roundId - 1, crash: 3.47, rekt: "47 degens" },
                { round: roundId - 2, crash: 1.23, rekt: "123 paper hands" },
                { round: roundId - 3, crash: 8.91, rekt: "12 diamond hands" },
                { round: roundId - 4, crash: 2.15, rekt: "89 gamblers" },
                { round: roundId - 5, crash: 1.08, rekt: "ALL OF THEM" }
              ].map((result, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-black/30 rounded">
                  <span className="text-xs text-red-300">Round #{result.round}</span>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`${result.crash > 2 ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'} text-xs`}
                    >
                      💥 {result.crash.toFixed(2)}x
                    </Badge>
                    <div className="text-xs text-red-200 mt-1">{result.rekt} REKT</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-950/30 to-purple-900/20 backdrop-blur-sm border-neon-purple/30 retro-crt">
            <h3 className="text-lg font-black mb-4 text-center text-neon-purple">🏆 DEGEN LEADERBOARD</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: "xX_MoneyLaundr_Xx", profit: "+69.420", emoji: "🐋" },
                { rank: 2, name: "DiamondHandsDeep", profit: "+42.069", emoji: "💎" },
                { rank: 3, name: "ToTheMoonApe", profit: "+13.37", emoji: "🚀" },
                { rank: 4, name: "CryptoChad9000", profit: "-420.69", emoji: "💀" },
                { rank: 5, name: "Your_Mom_69", profit: "-1337.0", emoji: "😭" }
              ].map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-2 bg-black/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{player.emoji}</span>
                    <span className="text-xs font-mono truncate">{player.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${
                    player.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {player.profit} SOL
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom CTA Section */}
        <Card className="p-8 bg-gradient-to-r from-red-950/50 via-yellow-950/50 to-red-950/50 backdrop-blur-sm border-neon-red/30 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text animate-glow">
              ⚠️ FINAL WARNING ⚠️
            </h2>
            <p className="text-lg text-red-300 font-bold">
              This game will literally steal your money and laugh at you while doing it.
            </p>
            <p className="text-sm text-red-200">
              Seriously, go touch grass instead. Your future self will thank you.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="destructive" className="animate-pulse">
                💸 100% GUARANTEED LOSS
              </Badge>
              <Badge variant="destructive" className="animate-pulse">
                😭 TEARS INCLUDED
              </Badge>
              <Badge variant="destructive" className="animate-pulse">
                🤡 BECOME THE JOKE
              </Badge>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 bg-black/50 backdrop-blur-sm border-yellow-500/30 text-center">
          <div className="space-y-2 text-yellow-300">
            <p className="text-sm font-bold">⚠️ LEGAL DISCLAIMER ⚠️</p>
            <p className="text-xs">
              This is a demo implementation for educational purposes. Any resemblance to actual financial instruments is purely coincidental.
              Past performance does not guarantee future results. Actually, nothing guarantees anything here.
              Your capital is at risk. So is your sanity. Gamble responsibly, or don't - we're not your mom.
            </p>
          </div>
        </Card>

        {/* Final Footer */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-6 text-2xl">
            <span className="animate-bounce">🎲</span>
            <span className="animate-pulse">💸</span>
            <span className="animate-bounce">😭</span>
            <span className="animate-pulse">🤡</span>
            <span className="animate-bounce">💀</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with 💔 by degens, for degens. Powered by Solana ⚡
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
