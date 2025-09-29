import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Flame, 
  Trophy, 
  Zap,
  TrendingUp,
  Skull,
  Rocket
} from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: number;
  type: 'normal' | 'win' | 'loss' | 'big_win';
  multiplier?: number;
  amount?: number;
}

interface HypeChatProps {
  isActive: boolean;
  currentMultiplier: number;
  isCrashed: boolean;
}

export const HypeChat = ({ isActive, currentMultiplier, isCrashed }: HypeChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [hypeLevel, setHypeLevel] = useState(50);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock usernames and messages
  const mockUsers = ["DegenKing", "MoonBoy", "DiamondHands", "PaperHands", "WhaleWatcher", "HODLER", "Ape2Moon", "CryptoChad"];
  
  const normalMessages = [
    "LFG! 🚀",
    "This one's going to the moon!",
    "Cash out now!",
    "HODL!!!",
    "Next stop: Mars 🌙",
    "Diamond hands 💎",
    "Paper hands folding already",
    "Whale spotted!",
    "TO THE MOON! 🚀🚀🚀",
    "This meme's got legs",
    "Bubble incoming...",
    "Trust the process"
  ];

  const winMessages = [
    "YESSSS! Cashed out just in time!",
    "EZ money! 💰",
    "Called it! 📈",
    "Diamond hands paid off!",
    "That's how it's done!",
    "Perfect timing! ⏰",
    "Meme magic worked! ✨"
  ];

  const lossMessages = [
    "REKT 💀",
    "Paper hands cost me again...",
    "Should have cashed out earlier",
    "F in the chat",
    "Bubble popped too early",
    "Next round I'm all in",
    "Why did I hold?! 😭"
  ];

  // Generate mock messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to generate message
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        let message: ChatMessage;
        
        if (isCrashed) {
          message = {
            id: Date.now().toString(),
            user,
            message: lossMessages[Math.floor(Math.random() * lossMessages.length)],
            timestamp: Date.now(),
            type: 'loss'
          };
        } else if (isActive && Math.random() < 0.1) {
          // Simulate cash out
          const multiplier = Math.random() * (currentMultiplier - 1) + 1;
          const amount = Math.random() * 10 + 0.1;
          message = {
            id: Date.now().toString(),
            user,
            message: `Cashed out at ${multiplier.toFixed(2)}×!`,
            timestamp: Date.now(),
            type: multiplier > 5 ? 'big_win' : 'win',
            multiplier,
            amount
          };
        } else {
          message = {
            id: Date.now().toString(),
            user,
            message: normalMessages[Math.floor(Math.random() * normalMessages.length)],
            timestamp: Date.now(),
            type: 'normal'
          };
        }
        
        setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
      }
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, [isActive, currentMultiplier, isCrashed]);

  // Update hype level based on game state
  useEffect(() => {
    if (isCrashed) {
      setHypeLevel(20);
    } else if (isActive) {
      const level = Math.min(95, 30 + (currentMultiplier - 1) * 10);
      setHypeLevel(level);
    } else {
      setHypeLevel(50);
    }
  }, [isActive, currentMultiplier, isCrashed]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: newMessage,
      timestamp: Date.now(),
      type: 'normal'
    };
    
    setMessages(prev => [...prev.slice(-49), message]);
    setNewMessage("");
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'big_win': return <Trophy className="h-4 w-4 text-neon-yellow" />;
      case 'win': return <TrendingUp className="h-4 w-4 text-neon-green" />;
      case 'loss': return <Skull className="h-4 w-4 text-neon-red" />;
      default: return <MessageCircle className="h-4 w-4 text-neon-cyan" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'big_win': return "border-l-4 border-neon-yellow bg-neon-yellow/10";
      case 'win': return "border-l-4 border-neon-green bg-neon-green/10";
      case 'loss': return "border-l-4 border-neon-red bg-neon-red/10";
      default: return "border-l-4 border-transparent";
    }
  };

  return (
    <Card className="h-[600px] p-4 glass-elevated flex flex-col">
      {/* Header with Hype Meter */}
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-neon-magenta">
            HYPE CHAT
          </h3>
          <Badge variant="outline" className="font-mono">
            <Flame className="h-3 w-3 mr-1" />
            {messages.length} degenerates
          </Badge>
        </div>

        {/* Hype Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">HYPE LEVEL</span>
            <span className={`font-bold ${
              hypeLevel > 80 ? 'text-neon-red' :
              hypeLevel > 60 ? 'text-neon-yellow' :
              hypeLevel > 40 ? 'text-neon-cyan' : 'text-muted-foreground'
            }`}>
              {hypeLevel}%
            </span>
          </div>
          <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                hypeLevel > 80 ? 'bg-gradient-to-r from-neon-yellow to-neon-red' :
                hypeLevel > 60 ? 'bg-gradient-to-r from-neon-cyan to-neon-yellow' :
                hypeLevel > 40 ? 'bg-neon-cyan' : 'bg-surface-3'
              } ${hypeLevel > 80 ? 'animate-glow-pulse' : ''}`}
              style={{ width: `${hypeLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-3 rounded-lg ${getMessageStyle(msg.type)} transition-all`}
            >
              <div className="flex items-start gap-2">
                {getMessageIcon(msg.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-mono font-bold ${
                      msg.user === "You" ? 'text-neon-cyan' : 'text-foreground'
                    }`}>
                      {msg.user}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-body break-words">{msg.message}</p>
                  {msg.multiplier && msg.amount && (
                    <div className="mt-1 text-xs font-mono text-neon-green">
                      +{(msg.amount * msg.multiplier - msg.amount).toFixed(3)} SOL profit
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Drop some alpha..."
          className="bg-surface-2 border-border/50 font-body"
          maxLength={200}
        />
        <Button 
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="px-4 gradient-neon-primary text-black"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick reactions */}
      <div className="flex gap-2 mt-2">
        {[
          { emoji: "🚀", text: "LFG!" },
          { emoji: "💎", text: "HODL" },
          { emoji: "📈", text: "MOON" },
          { emoji: "💀", text: "REKT" }
        ].map(({ emoji, text }) => (
          <Button
            key={text}
            variant="outline"
            size="sm"
            onClick={() => setNewMessage(`${emoji} ${text}`)}
            className="text-xs font-mono hover:border-neon-cyan"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </Card>
  );
};