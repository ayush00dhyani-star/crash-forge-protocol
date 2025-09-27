import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameStatsProps {
  gameStats: {
    totalPlayers: number;
    totalBets: number;
    roundsCompleted: number;
    biggestWin: number;
    biggestMultiplier: number;
  };
  roundHistory: { id: number; crash: number; date: Date }[];
}

export const GameStats = ({ gameStats, roundHistory }: GameStatsProps) => {
  return (
    <div className="space-y-4">
      {/* Live Stats */}
      <Card className="p-4 bg-black/40 backdrop-blur-sm border-border">
        <h3 className="text-lg font-bold text-primary mb-3 flex items-center">
          📊 Live Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Players Online:</span>
            <div className="font-bold text-green-400">{gameStats.totalPlayers}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Total Bets:</span>
            <div className="font-bold text-yellow-400">{gameStats.totalBets.toFixed(2)} SOL</div>
          </div>
          <div>
            <span className="text-muted-foreground">Rounds:</span>
            <div className="font-bold text-blue-400">{gameStats.roundsCompleted}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Biggest Win:</span>
            <div className="font-bold text-purple-400">{gameStats.biggestWin.toFixed(2)} SOL</div>
          </div>
        </div>
      </Card>

      {/* Recent Crashes */}
      <Card className="p-4 bg-black/40 backdrop-blur-sm border-border">
        <h3 className="text-lg font-bold text-primary mb-3 flex items-center">
          💥 Recent Crashes
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {roundHistory.slice(0, 10).map((round) => (
            <div key={round.id} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Round #{round.id}</span>
              <Badge 
                variant="outline" 
                className={`${
                  round.crash >= 10 ? 'text-green-400 border-green-400' :
                  round.crash >= 2 ? 'text-yellow-400 border-yellow-400' :
                  'text-red-400 border-red-400'
                }`}
              >
                {round.crash.toFixed(2)}x
              </Badge>
            </div>
          ))}
          {roundHistory.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No rounds completed yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};