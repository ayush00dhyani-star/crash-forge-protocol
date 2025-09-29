import { useGameEngine } from "@/hooks/useGameEngine";
import { CyberChart } from "@/components/CyberChart";
import { CyberBetPanel } from "@/components/CyberBetPanel";
import { HypeChat } from "@/components/HypeChat";
import { GameStats } from "@/components/GameStats";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, BarChart3, Skull } from "lucide-react";

const Index = () => {
  const {
    currentMultiplier,
    isRoundActive,
    isCrashed,
    roundId,
    timeRemaining,
    crashPoint,
    currentBet,
    balance,
    isWalletConnected,
    cashOutRequested,
    autoCashOut,
    setAutoCashOut,
    feedEvents,
    roundHistory,
    gameStats,
    handlePlaceBet,
    handleCashOut,
    toggleWallet,
    canCashOut,
    hasActiveBet
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-background">
      {/* Cyberpunk Header */}
      <header className="border-b border-border/30 glass-elevated sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Zap className="h-10 w-10 text-neon-cyan animate-glow-pulse" />
              <div>
                <h1 className="text-3xl font-display font-black text-neon-cyan">
                  MEME MARKET CRASH
                </h1>
                <p className="text-sm text-neon-purple font-mono">
                  Where memes go to die or moon 🚀
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center p-2 bg-surface-2 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-mono">ROUND</div>
                  <div className="text-xl font-display font-bold text-neon-cyan">#{roundId}</div>
                </div>
                <div className="text-center p-2 bg-surface-2 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-mono">DEGENS</div>
                  <div className="text-xl font-display font-bold text-neon-magenta">{gameStats.totalPlayers.toLocaleString()}</div>
                </div>
              </div>
              
              <Badge 
                variant={isWalletConnected ? "default" : "secondary"}
                className={`px-6 py-3 cursor-pointer font-mono font-bold ${
                  isWalletConnected ? 'gradient-neon-success neon-glow-green' : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black'
                }`}
                onClick={toggleWallet}
              >
                {isWalletConnected ? "🔗 CONNECTED" : "🔌 CONNECT"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Cyberpunk Interface */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Chart Section */}
          <div className="xl:col-span-3 space-y-6">
            <CyberChart
              currentMultiplier={currentMultiplier}
              isActive={isRoundActive}
              isCrashed={isCrashed}
              crashPoint={crashPoint}
            />
          </div>

          {/* Cyberpunk Sidebar */}
          <div className="space-y-6">
            <CyberBetPanel
              balance={balance}
              currentBet={currentBet}
              isRoundActive={isRoundActive}
              canCashOut={canCashOut}
              hasActiveBet={hasActiveBet}
              autoCashOut={autoCashOut}
              setAutoCashOut={setAutoCashOut}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              currentMultiplier={currentMultiplier}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <HypeChat 
            isActive={isRoundActive}
            currentMultiplier={currentMultiplier}
            isCrashed={isCrashed}
          />
          <GameStats 
            gameStats={gameStats} 
            roundHistory={roundHistory}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;