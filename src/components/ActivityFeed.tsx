import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, DollarSign, AlertTriangle, Activity } from "lucide-react";

interface FeedEvent {
  id: string;
  type: "bet" | "cashout" | "crash";
  player: string;
  amount: number;
  multiplier?: number;
  timestamp: number;
}

interface ActivityFeedProps {
  events: FeedEvent[];
}

export const ActivityFeed = ({ events }: ActivityFeedProps) => {
  const formatPlayer = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getPlayerColor = (address: string) => {
    const colors = [
      'hsl(216 87% 52%)', 'hsl(142 64% 52%)', 'hsl(45 93% 60%)', 
      'hsl(271 91% 65%)', 'hsl(0 75% 55%)', 'hsl(168 76% 42%)'
    ];
    const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getEventIcon = (type: string) => {
    const iconClass = 'h-4 w-4';
    switch (type) {
      case "bet":
        return <TrendingUp className={`${iconClass} text-primary`} />;
      case "cashout":
        return <DollarSign className={`${iconClass} text-success`} />;
      case "crash":
        return <AlertTriangle className={`${iconClass} text-destructive`} />;
      default:
        return <Activity className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "bet":
        return "border-primary/20 bg-primary/5";
      case "cashout":
        return "border-success/20 bg-success/5";
      case "crash":
        return "border-destructive/20 bg-destructive/5";
      default:
        return "border-border bg-surface-2";
    }
  };

  const getEventText = (event: FeedEvent) => {
    switch (event.type) {
      case "bet":
        return `Placed bet: ${event.amount.toFixed(4)} SOL`;
      case "cashout":
        return `Cashed out at ${event.multiplier?.toFixed(2)}× • ${(event.amount * (event.multiplier || 1)).toFixed(4)} SOL`;
      case "crash":
        return `Round crashed at ${event.multiplier?.toFixed(2)}×`;
      default:
        return "";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="h-[600px] glass">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Activity Feed</h3>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(600px-73px)] p-4">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 space-y-2">
              <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              <div className="text-sm">No activity yet</div>
              <div className="text-xs opacity-70">Waiting for players to join</div>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border transition-smooth hover:bg-muted/20 ${getEventColor(event.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback 
                        className="text-xs font-bold text-white text-shadow"
                        style={{ backgroundColor: getPlayerColor(event.player) }}
                      >
                        {event.player.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getEventIcon(event.type)}
                        <span className="font-mono text-sm font-medium truncate">
                          {formatPlayer(event.player)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getEventText(event)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground number-mono">
                      {formatTime(event.timestamp)}
                    </div>
                    {event.type === "cashout" && event.multiplier && (
                      <div className={`text-xs font-bold number-mono mt-1 ${
                        event.multiplier > 5 ? 'text-success' : 
                        event.multiplier > 2 ? 'text-warning' : 'text-muted-foreground'
                      }`}>
                        {event.multiplier.toFixed(2)}×
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};