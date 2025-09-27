import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedStatsProps {
  gameStats: {
    totalPlayers: number;
    totalBets: number;
    roundsCompleted: number;
    biggestWin: number;
    biggestMultiplier: number;
  };
  roundHistory: { id: number; crash: number; date: Date }[];
  currentMultiplier: number;
  isActive: boolean;
}

export const AdvancedStats = ({ 
  gameStats, 
  roundHistory, 
  currentMultiplier, 
  isActive 
}: AdvancedStatsProps) => {
  
  const getRecentAverage = () => {
    if (roundHistory.length === 0) return 2.45;
    const recent = roundHistory.slice(0, 10);
    return recent.reduce((sum, round) => sum + round.crash, 0) / recent.length;
  };

  const getVolatilityLevel = () => {
    if (roundHistory.length < 5) return "UNKNOWN";
    const recent = roundHistory.slice(0, 10);
    const avg = getRecentAverage();
    const variance = recent.reduce((sum, round) => sum + Math.pow(round.crash - avg, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 1) return "LOW";
    if (stdDev < 3) return "MEDIUM";
    if (stdDev < 6) return "HIGH";
    return "EXTREME";
  };

  const getVolatilityColor = () => {
    const level = getVolatilityLevel();
    switch (level) {
      case "LOW": return "text-green-400 border-green-400/30";
      case "MEDIUM": return "text-yellow-400 border-yellow-400/30";
      case "HIGH": return "text-orange-400 border-orange-400/30";
      case "EXTREME": return "text-red-400 border-red-400/30";
      default: return "text-gray-400 border-gray-400/30";
    }
  };

  const getHotStreak = () => {
    let streak = 0;
    for (const round of roundHistory) {
      if (round.crash >= 2.0) streak++;
      else break;
    }
    return streak;
  };

  const getColdStreak = () => {
    let streak = 0;
    for (const round of roundHistory) {
      if (round.crash < 2.0) streak++;
      else break;
    }
    return streak;
  };

  const getProfitabilityScore = () => {
    if (roundHistory.length === 0) return 65;
    const profitable = roundHistory.filter(r => r.crash >= 2.0).length;
    return Math.round((profitable / roundHistory.length) * 100);
  };

  const getRiskDistribution = () => {
    if (roundHistory.length === 0) {
      return { low: 35, medium: 40, high: 25 };
    }
    
    const low = roundHistory.filter(r => r.crash < 2.0).length;
    const medium = roundHistory.filter(r => r.crash >= 2.0 && r.crash < 5.0).length;
    const high = roundHistory.filter(r => r.crash >= 5.0).length;
    const total = roundHistory.length;
    
    return {
      low: Math.round((low / total) * 100),
      medium: Math.round((medium / total) * 100),
      high: Math.round((high / total) * 100)
    };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-border">
          <TabsTrigger value="overview" className="font-mono">OVERVIEW</TabsTrigger>
          <TabsTrigger value="analytics" className="font-mono">ANALYTICS</TabsTrigger>
          <TabsTrigger value="risk" className="font-mono">RISK</TabsTrigger>
          <TabsTrigger value="trends" className="font-mono">TRENDS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-950/30 to-green-900/20 backdrop-blur-sm border border-neon-green/20">
              <div className="text-center space-y-2">
                <div className="text-2xl">💰</div>
                <div className="text-sm text-green-300">TOTAL VOLUME</div>
                <div className="text-lg font-black text-neon-green font-mono">
                  {gameStats.totalBets.toLocaleString()} SOL
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-950/30 to-blue-900/20 backdrop-blur-sm border border-neon-blue/20">
              <div className="text-center space-y-2">
                <div className="text-2xl">👥</div>
                <div className="text-sm text-blue-300">PLAYERS</div>
                <div className="text-lg font-black text-neon-blue font-mono">
                  {gameStats.totalPlayers.toLocaleString()}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-950/30 to-purple-900/20 backdrop-blur-sm border border-neon-purple/20">
              <div className="text-center space-y-2">
                <div className="text-2xl">🎯</div>
                <div className="text-sm text-purple-300">ROUNDS</div>
                <div className="text-lg font-black text-neon-purple font-mono">
                  {gameStats.roundsCompleted.toLocaleString()}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-950/30 to-yellow-900/20 backdrop-blur-sm border border-neon-yellow/20">
              <div className="text-center space-y-2">
                <div className="text-2xl">🚀</div>
                <div className="text-sm text-yellow-300">MAX MULTI</div>
                <div className="text-lg font-black text-neon-yellow font-mono">
                  {gameStats.biggestMultiplier.toFixed(2)}x
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-black/40 backdrop-blur-sm border border-border">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">🔥 LIVE METRICS</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Current Multiplier</div>
                  <div className={`text-2xl font-black font-mono ${
                    isActive ? 'text-green-400 animate-pulse' : 'text-gray-400'
                  }`}>
                    {currentMultiplier.toFixed(2)}x
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Recent Average</div>
                  <div className="text-2xl font-black font-mono text-blue-400">
                    {getRecentAverage().toFixed(2)}x
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Volatility</div>
                  <Badge variant="outline" className={`${getVolatilityColor()} font-mono`}>
                    {getVolatilityLevel()}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-black/40 backdrop-blur-sm border border-border">
              <h3 className="text-lg font-black text-white mb-4">📊 PROFITABILITY ANALYSIS</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profit Probability</span>
                    <span className="text-green-400 font-mono">{getProfitabilityScore()}%</span>
                  </div>
                  <Progress value={getProfitabilityScore()} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-400 font-mono">
                      {roundHistory.filter(r => r.crash >= 2.0).length}
                    </div>
                    <div className="text-xs text-green-300">Profitable Rounds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-400 font-mono">
                      {roundHistory.filter(r => r.crash < 2.0).length}
                    </div>
                    <div className="text-xs text-red-300">Bust Rounds</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/40 backdrop-blur-sm border border-border">
              <h3 className="text-lg font-black text-white mb-4">🔥 STREAK TRACKER</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-950/30 rounded-lg">
                  <div>
                    <div className="text-sm text-green-300">Hot Streak</div>
                    <div className="text-xs text-green-200">Consecutive 2x+ crashes</div>
                  </div>
                  <div className="text-2xl font-black text-green-400 font-mono">
                    {getHotStreak()}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-950/30 rounded-lg">
                  <div>
                    <div className="text-sm text-red-300">Cold Streak</div>
                    <div className="text-xs text-red-200">Consecutive sub-2x crashes</div>
                  </div>
                  <div className="text-2xl font-black text-red-400 font-mono">
                    {getColdStreak()}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="p-6 bg-black/40 backdrop-blur-sm border border-border">
            <h3 className="text-lg font-black text-white mb-4">⚠️ RISK DISTRIBUTION</h3>
            <div className="space-y-4">
              {(() => {
                const risk = getRiskDistribution();
                return (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Low Risk (&lt;2x)</span>
                        <span className="text-green-400 font-mono">{risk.low}%</span>
                      </div>
                      <Progress value={risk.low} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-400">Medium Risk (2x-5x)</span>
                        <span className="text-yellow-400 font-mono">{risk.medium}%</span>
                      </div>
                      <Progress value={risk.medium} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">High Risk (5x+)</span>
                        <span className="text-red-400 font-mono">{risk.high}%</span>
                      </div>
                      <Progress value={risk.high} className="h-2" />
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6 bg-black/40 backdrop-blur-sm border border-border">
            <h3 className="text-lg font-black text-white mb-4">📈 RECENT TRENDS</h3>
            <div className="space-y-3">
              {roundHistory.slice(0, 10).map((round, index) => (
                <div key={round.id} className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs font-mono w-16 justify-center">
                      #{round.id}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {round.date.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-black font-mono ${
                      round.crash >= 10 ? 'text-purple-400' :
                      round.crash >= 5 ? 'text-yellow-400' :
                      round.crash >= 2 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {round.crash.toFixed(2)}x
                    </div>
                    <div className="text-xl">
                      {round.crash >= 10 ? '🌙' :
                       round.crash >= 5 ? '🚀' :
                       round.crash >= 2 ? '📈' : '💥'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};