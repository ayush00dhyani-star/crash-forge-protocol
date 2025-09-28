import { useGameEngine } from "@/hooks/useGameEngine";
import { TradingChart } from "@/components/TradingChart";
import { MultiplierPanel } from "@/components/MultiplierPanel";
import { ActivityFeed } from "@/components/ActivityFeed";
import { BetPanel } from "@/components/BetPanel";
import { GameStats } from "@/components/GameStats";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BarChart3 } from "lucide-react";

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Crash Trading</h1>
                <p className="text-sm text-muted-foreground">Professional multiplier platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Round</div>
                  <div className="text-lg font-bold number-mono">#{roundId}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Players</div>
                  <div className="text-lg font-bold number-mono">{gameStats.totalPlayers.toLocaleString()}</div>
                </div>
              </div>
              
              <Badge 
                variant={isWalletConnected ? "default" : "secondary"}
                className="px-4 py-2 cursor-pointer"
                onClick={toggleWallet}
              >
                {isWalletConnected ? "Connected" : "Connect Wallet"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Chart Section */}
          <div className="xl:col-span-3 space-y-6">
            <TradingChart
              currentMultiplier={currentMultiplier}
              isActive={isRoundActive}
              isCrashed={isCrashed}
              crashPoint={crashPoint}
            />
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Volume</div>
                    <div className="text-xl font-bold number-mono">
                      {gameStats.totalBets.toLocaleString()} SOL
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-success" />
                  <div>
                    <div className="text-sm text-muted-foreground">Biggest Win</div>
                    <div className="text-xl font-bold number-mono">
                      {gameStats.biggestWin.toLocaleString()} SOL
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-info" />
                  <div>
                    <div className="text-sm text-muted-foreground">Active Players</div>
                    <div className="text-xl font-bold number-mono">
                      {gameStats.totalPlayers.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MultiplierPanel
              currentMultiplier={currentMultiplier}
              isActive={isRoundActive}
              isCrashed={isCrashed}
              timeRemaining={timeRemaining}
            />
            
            <BetPanel
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
          <ActivityFeed events={feedEvents} />
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