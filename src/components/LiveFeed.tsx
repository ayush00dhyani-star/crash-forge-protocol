import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  const getPlayerAvatar = (address: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
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
        return "bg-neon-blue/20 text-neon-blue border-neon-blue/30 shadow-neon-blue/20";
      case "cashout":
        return "bg-neon-green/20 text-neon-green border-neon-green/30 shadow-neon-green/20";
      case "crash":
        return "bg-neon-red/20 text-neon-red border-neon-red/30 shadow-neon-red/20";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  const getEventText = (event: FeedEvent) => {
    switch (event.type) {
      case "bet":
        return `🎲 YOLO'd ${event.amount.toFixed(3)} SOL`;
      case "cashout":
        return `💎 Cashed out at ${event.multiplier?.toFixed(2)}x for ${(event.amount * (event.multiplier || 1)).toFixed(3)} SOL`;
      case "crash":
        return `🔥 Market crashed at ${event.multiplier?.toFixed(2)}x - RIP degens`;
      default:
        return "";
    }
  };

  const getEventEmoji = (event: FeedEvent) => {
    if (event.type === "cashout" && event.multiplier) {
      if (event.multiplier > 10) return "🚀🌙";
      if (event.multiplier > 5) return "💎🙌";
      if (event.multiplier > 2) return "📈💰";
    }
    if (event.type === "bet") {
      if (event.amount > 10) return "🐋";
      if (event.amount > 5) return "🦈";
      if (event.amount > 1) return "🐟";
      return "🦐";
    }
    return "";
  };

  return (
    <Card className="h-96 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-lg border-neon-purple/30 neon-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-transparent bg-gradient-neon bg-clip-text">
            🔥 LIVE FEED 🔥
          </h3>
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            🔴 LIVE
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="h-80 p-4">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <div className="text-4xl">👻</div>
              <div className="text-sm">No degens active yet...</div>
              <div className="text-xs opacity-70">Be the first to send it! 🚀</div>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${getEventColor(event.type)} group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarFallback 
                        className="text-xs font-bold text-white"
                        style={{ backgroundColor: getPlayerAvatar(event.player) }}
                      >
                        {event.player.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                        <span className="font-mono text-sm font-bold truncate">
                          {formatPlayer(event.player)}
                        </span>
                        <span className="text-lg">{getEventEmoji(event)}</span>
                      </div>
                      <div className="text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                        {getEventText(event)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-xs mb-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </Badge>
                    {event.type === "cashout" && event.multiplier && (
                      <div className={`text-xs font-bold ${
                        event.multiplier > 5 ? 'text-green-400' : 
                        event.multiplier > 2 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {event.multiplier.toFixed(2)}x
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Animated background for special events */}
                {event.type === "cashout" && event.multiplier && event.multiplier > 10 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-green-500/10 to-yellow-500/10 animate-pulse pointer-events-none rounded-xl"></div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};