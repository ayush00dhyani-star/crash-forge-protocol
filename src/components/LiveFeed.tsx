import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedEvent {
  id: string;
  type: "bet" | "cashout" | "crash";
  player: string;
  amount: number;
  multiplier?: number;
  timestamp: number;
}

interface LiveFeedProps {
  events: FeedEvent[];
}

export const LiveFeed = ({ events }: LiveFeedProps) => {
  const formatPlayer = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "bet":
        return "🎯";
      case "cashout":
        return "💰";
      case "crash":
        return "💥";
      default:
        return "📊";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "bet":
        return "bg-neon-blue/20 text-neon-blue border-neon-blue/30";
      case "cashout":
        return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "crash":
        return "bg-neon-red/20 text-neon-red border-neon-red/30";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  const getEventText = (event: FeedEvent) => {
    switch (event.type) {
      case "bet":
        return `placed ${event.amount.toFixed(2)} SOL`;
      case "cashout":
        return `cashed out at ${event.multiplier?.toFixed(2)}x for ${(event.amount * (event.multiplier || 1)).toFixed(2)} SOL`;
      case "crash":
        return `crashed at ${event.multiplier?.toFixed(2)}x`;
      default:
        return "";
    }
  };

  return (
    <Card className="p-4 h-96 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-center">Live Feed</h3>
      <ScrollArea className="h-full">
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No activity yet...
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${getEventColor(event.type)} transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <span className="font-mono text-sm">
                      {formatPlayer(event.player)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
                <div className="text-sm mt-1 opacity-90">
                  {getEventText(event)}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};