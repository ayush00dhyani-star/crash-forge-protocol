import { useEffect, useState } from "react";

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface FloatingEmojisProps {
  trigger?: boolean;
  type?: 'win' | 'loss' | 'bet';
}

export const FloatingEmojis = ({ trigger, type = 'win' }: FloatingEmojisProps) => {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  const emojiSets = {
    win: ['💰', '🚀', '💎', '📈', '🔥', '⚡', '🌙', '💸'],
    loss: ['💥', '😭', '📉', '💀', '😵', '🪦', '❌', '⛔'],
    bet: ['🎯', '🎲', '🎰', '🍀', '🤞', '🎪', '🎊', '🎉']
  };

  useEffect(() => {
    if (!trigger) return;

    const createEmojis = () => {
      const newEmojis: FloatingEmoji[] = [];
      const emojiArray = emojiSets[type];
      
      for (let i = 0; i < 15; i++) {
        newEmojis.push({
          id: `${Date.now()}-${i}`,
          emoji: emojiArray[Math.floor(Math.random() * emojiArray.length)],
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
          size: Math.random() * 30 + 20
        });
      }
      
      setEmojis(newEmojis);
      
      // Clear emojis after animation
      setTimeout(() => setEmojis([]), 3000);
    };

    createEmojis();
  }, [trigger, type]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="floating-emoji absolute"
          style={{
            left: emoji.x,
            bottom: -50,
            fontSize: emoji.size,
            animationDelay: `${Math.random() * 1000}ms`,
            animationDuration: `${2000 + Math.random() * 1000}ms`
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};