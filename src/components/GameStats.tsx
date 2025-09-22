import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameStatsProps {
  totalPlayers: number;
  totalBets: number;
  roundId: number;
  timeRemaining: number;
}

export const GameStats = ({ 
  totalPlayers, 
  totalBets, 
  roundId, 
  timeRemaining 
}: GameStatsProps) => {
  const formatTime = (seconds: number) => {
    return seconds > 0 ? `${seconds}s` : "Starting...";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
        <div className="text-sm text-muted-foreground">Round</div>
        <div className="text-2xl font-bold text-neon-blue">#{roundId}</div>
      </Card>
      
      <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
        <div className="text-sm text-muted-foreground">Players</div>
        <div className="text-2xl font-bold text-neon-green">{totalPlayers}</div>
      </Card>
      
      <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
        <div className="text-sm text-muted-foreground">Total Bets</div>
        <div className="text-2xl font-bold text-neon-purple">{totalBets.toFixed(2)} SOL</div>
      </Card>
      
      <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
        <div className="text-sm text-muted-foreground">Next Round</div>
        <div className="text-2xl font-bold text-neon-yellow">
          {formatTime(timeRemaining)}
        </div>
      </Card>
    </div>
  );
};