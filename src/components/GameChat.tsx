import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Smile } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system' | 'bot';
  emoji?: string;
}

interface GameChatProps {
  isConnected: boolean;
}

export const GameChat = ({ isConnected }: GameChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'SYSTEM',
      message: '🔥 Welcome to Meme Crash! Get ready to lose your money! 🔥',
      timestamp: Date.now() - 60000,
      type: 'system'
    },
    {
      id: '2',
      user: 'CryptoKing420',
      message: 'LFG! TO THE MOON! 🚀🚀🚀',
      timestamp: Date.now() - 45000,
      type: 'user',
      emoji: '🚀'
    },
    {
      id: '3',
      user: 'DiamondHands',
      message: 'Just lost my house but HODLING! 💎🙌',
      timestamp: Date.now() - 30000,
      type: 'user',
      emoji: '💎'
    },
    {
      id: '4',
      user: 'AI_ROAST_BOT',
      message: 'Another degen enters the arena... RIP your funds! 😈',
      timestamp: Date.now() - 15000,
      type: 'bot'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickEmojis = ['🚀', '💎', '🔥', '💀', '😭', '🤑', '🎯', '💸', '🌙', '⚡'];
  const roastMessages = [
    "Another sheep enters the slaughter! 🐑",
    "Your wife's boyfriend is laughing! 😂",
    "McDonald's is hiring! 🍔",
    "Should have bought ETH! 📉",
    "This is financial advice: DON'T! ⚠️"
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: newMessage,
      timestamp: Date.now(),
      type: 'user',
      emoji: selectedEmoji || undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    setSelectedEmoji("");

    // Simulate AI roast response
    setTimeout(() => {
      const roast: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user: 'AI_ROAST_BOT',
        message: roastMessages[Math.floor(Math.random() * roastMessages.length)],
        timestamp: Date.now(),
        type: 'bot'
      };
      setMessages(prev => [...prev, roast]);
    }, 1000 + Math.random() * 2000);
  };

  const getPlayerAvatar = (user: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const hash = user.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-neon-blue/20 border-neon-blue/30 text-neon-blue';
      case 'bot':
        return 'bg-neon-red/20 border-neon-red/30 text-neon-red';
      default:
        return 'bg-secondary/50 border-border';
    }
  };

  return (
    <Card className="h-96 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-lg border-neon-green/30 neon-border flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-transparent bg-gradient-neon bg-clip-text">
            💬 DEGEN CHAT 💬
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-bold">
              {42 + Math.floor(Math.random() * 100)} online
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${getMessageStyle(msg.type)}`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-6 w-6 border border-white/20">
                  <AvatarFallback 
                    className="text-xs font-bold text-white"
                    style={{ backgroundColor: getPlayerAvatar(msg.user) }}
                  >
                    {msg.user.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold truncate">
                      {msg.user}
                    </span>
                    {msg.emoji && (
                      <span className="text-sm">{msg.emoji}</span>
                    )}
                    <span className="text-xs opacity-50">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Quick Emojis */}
        <div className="flex gap-1 overflow-x-auto">
          {quickEmojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEmoji(emoji)}
              className={`text-lg p-1 h-8 w-8 shrink-0 ${
                selectedEmoji === emoji ? 'bg-primary/20' : ''
              }`}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isConnected ? "Type your degen thoughts..." : "Connect wallet to chat"}
              disabled={!isConnected}
              className="pr-20 bg-black/50 border-neon-green/30 focus:border-neon-green"
              maxLength={200}
            />
            {selectedEmoji && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 text-lg">
                {selectedEmoji}
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            variant="neon"
            size="sm"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {!isConnected && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/30">
              🔌 Connect wallet to join the chaos
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};