import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface FeedEvent {
  id: string;
  type: "bet" | "cashout" | "crash";
  player: string;
  amount: number;
  multiplier?: number;
  timestamp: number;
}

interface GameStats {
  totalPlayers: number;
  totalBets: number;
  roundsCompleted: number;
  biggestWin: number;
  biggestMultiplier: number;
}

export const useGameEngine = () => {
  const { toast } = useToast();
  
  // Core game state
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [roundId, setRoundId] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  
  // Player state
  const [currentBet, setCurrentBet] = useState<number | null>(null);
  const [balance, setBalance] = useState(100.0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [cashOutRequested, setCashOutRequested] = useState(false);
  const [autoCashOut, setAutoCashOut] = useState<number | null>(null);
  
  // Game data
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [roundHistory, setRoundHistory] = useState<{ id: number; crash: number; date: Date }[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 247,
    totalBets: 1337.69,
    roundsCompleted: roundId - 1,
    biggestWin: 420.69,
    biggestMultiplier: 127.34
  });
  
  // Effects and animations
  const [showWinEmojis, setShowWinEmojis] = useState(false);
  const [showLossEmojis, setShowLossEmojis] = useState(false);
  const [showBetEmojis, setShowBetEmojis] = useState(false);
  
  // Refs for precise timing
  const roundStartTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const multiplierIntervalRef = useRef<NodeJS.Timeout>();

  // Advanced crash point calculation (provably fair algorithm)
  const calculateCrashPoint = useCallback((roundId: number): number => {
    // Simple hash-based RNG for demo (in production use VRF)
    const seed = `crash_${roundId}_${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to 0-1 range
    const random = Math.abs(hash) / 2147483647;
    
    // Use inverse exponential distribution for crash points
    // This creates the classic crash game distribution
    const houseEdge = 0.01; // 1% house edge
    const e = Math.E;
    
    // Calculate crash point using formula: crash = 1 / (1 - random * (1 - houseEdge))
    const crashMultiplier = 1 / (1 - random * (1 - houseEdge));
    
    // Clamp between reasonable bounds
    return Math.max(1.01, Math.min(1000, Math.floor(crashMultiplier * 100) / 100));
  }, []);

  // Enhanced multiplier growth with acceleration
  const updateMultiplier = useCallback(() => {
    if (!isRoundActive || isCrashed) return;
    
    const elapsed = Date.now() - roundStartTimeRef.current;
    const elapsedSeconds = elapsed / 1000;
    
    // Accelerating curve: starts slow, gets faster
    const baseGrowth = 0.02; // 2% per tick base
    const acceleration = 1 + (elapsedSeconds * 0.1); // 10% acceleration per second
    const growth = baseGrowth * acceleration;
    
    setCurrentMultiplier(prev => {
      const newMultiplier = prev + growth;
      
      // Check if we've hit the crash point
      if (newMultiplier >= crashPointRef.current) {
        setIsCrashed(true);
        setIsRoundActive(false);
        setCrashPoint(crashPointRef.current);
        
        // Handle player bet
        if (currentBet && !cashOutRequested) {
          // Player lost
          addFeedEvent("crash", "You", currentBet, crashPointRef.current);
          setShowLossEmojis(true);
          setTimeout(() => setShowLossEmojis(false), 2000);
          
          toast({
            title: "💥 REKT! You got liquidated! 💥",
            description: `Lost ${currentBet.toFixed(2)} SOL at ${crashPointRef.current.toFixed(2)}x`,
            variant: "destructive",
          });
        }
        
        // Update history and stats
        setRoundHistory(prev => [...prev, {
          id: roundId,
          crash: crashPointRef.current,
          date: new Date()
        }].slice(-50));
        
        setGameStats(prev => ({
          ...prev,
          roundsCompleted: roundId,
          biggestMultiplier: Math.max(prev.biggestMultiplier, crashPointRef.current)
        }));
        
        // Auto-start next round
        setTimeout(() => {
          startNewRound();
        }, 3000);
        
        return crashPointRef.current;
      }
      
      // Auto cash out check
      if (autoCashOut && newMultiplier >= autoCashOut && currentBet && !cashOutRequested) {
        handleCashOut();
      }
      
      return newMultiplier;
    });
  }, [isRoundActive, isCrashed, currentBet, cashOutRequested, autoCashOut, roundId, toast]);

  // Multiplier update loop with dynamic timing
  useEffect(() => {
    if (isRoundActive && !isCrashed) {
      // Higher refresh rate for better animation
      multiplierIntervalRef.current = setInterval(updateMultiplier, 16); // ~60fps
      return () => {
        if (multiplierIntervalRef.current) {
          clearInterval(multiplierIntervalRef.current);
        }
      };
    }
  }, [isRoundActive, isCrashed, updateMultiplier]);

  // Countdown timer
  useEffect(() => {
    if (!isRoundActive && !isCrashed && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isRoundActive, isCrashed]);

  const startRound = useCallback(() => {
    // Calculate crash point for this round
    const newCrashPoint = calculateCrashPoint(roundId);
    crashPointRef.current = newCrashPoint;
    
    // Reset round state
    setIsRoundActive(true);
    setIsCrashed(false);
    setCurrentMultiplier(1.00);
    setCashOutRequested(false);
    roundStartTimeRef.current = Date.now();
    
    // Add some bot activity
    setTimeout(() => {
      for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
        setTimeout(() => {
          const botNames = ["chad_trader", "degen_ape", "whale_hunter", "paper_hands", "diamond_fists", "moon_boy"];
          const botName = botNames[Math.floor(Math.random() * botNames.length)];
          const betAmount = Math.random() * 50 + 5;
          addFeedEvent("bet", `${botName}...${Math.random().toString(36).substr(2, 4)}`, betAmount);
        }, Math.random() * 2000);
      }
    }, 100);
    
    toast({
      title: "🚀 Round Started! Time to get rich or die trying! 🚀",
      description: `Round #${roundId} is live - place your bets!`,
    });
  }, [roundId, calculateCrashPoint, toast]);

  const startNewRound = useCallback(() => {
    setRoundId(prev => prev + 1);
    setTimeRemaining(5);
    setCurrentBet(null);
    setCashOutRequested(false);
    setCrashPoint(0);
  }, []);

  const addFeedEvent = useCallback((type: "bet" | "cashout" | "crash", player: string, amount: number, multiplier?: number) => {
    const event: FeedEvent = {
      id: `${Date.now()}_${Math.random()}`,
      type,
      player,
      amount,
      multiplier,
      timestamp: Date.now()
    };
    setFeedEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
  }, []);

  const handlePlaceBet = useCallback((amount: number) => {
    if (!isRoundActive || currentBet || balance < amount) return false;
    
    setCurrentBet(amount);
    setBalance(prev => prev - amount);
    addFeedEvent("bet", "You", amount);
    
    setGameStats(prev => ({
      ...prev,
      totalBets: prev.totalBets + amount
    }));
    
    setShowBetEmojis(true);
    setTimeout(() => setShowBetEmojis(false), 1000);
    
    toast({
      title: "🎯 Bet Placed! Welcome to the degen casino! 🎯",
      description: `${amount.toFixed(2)} SOL riding the rocket!`,
    });
    
    return true;
  }, [isRoundActive, currentBet, balance, addFeedEvent, toast]);

  const handleCashOut = useCallback(() => {
    if (!currentBet || !isRoundActive || isCrashed || cashOutRequested) return false;
    
    setCashOutRequested(true);
    const payout = currentBet * currentMultiplier;
    setBalance(prev => prev + payout);
    
    addFeedEvent("cashout", "You", currentBet, currentMultiplier);
    
    setGameStats(prev => ({
      ...prev,
      biggestWin: Math.max(prev.biggestWin, payout)
    }));
    
    setShowWinEmojis(true);
    setTimeout(() => setShowWinEmojis(false), 2000);
    
    toast({
      title: "💰 BASED! Cashed out like a pro! 💰",
      description: `Won ${payout.toFixed(2)} SOL at ${currentMultiplier.toFixed(2)}x!`,
    });
    
    return true;
  }, [currentBet, isRoundActive, isCrashed, cashOutRequested, currentMultiplier, addFeedEvent, toast]);

  const toggleWallet = useCallback(() => {
    setIsWalletConnected(prev => !prev);
    toast({
      title: isWalletConnected ? "👋 Wallet Disconnected" : "🟢 Wallet Connected",
      description: isWalletConnected ? "See you later, space cowboy" : "Ready to lose some money!",
    });
  }, [isWalletConnected, toast]);

  return {
    // Game state
    currentMultiplier,
    isRoundActive,
    isCrashed,
    roundId,
    timeRemaining,
    crashPoint,
    
    // Player state
    currentBet,
    balance,
    isWalletConnected,
    cashOutRequested,
    autoCashOut,
    setAutoCashOut,
    
    // Game data
    feedEvents,
    roundHistory,
    gameStats,
    
    // Effects
    showWinEmojis,
    showLossEmojis,
    showBetEmojis,
    
    // Actions
    handlePlaceBet,
    handleCashOut,
    toggleWallet,
    
    // Utils
    canCashOut: isRoundActive && !isCrashed && !!currentBet && !cashOutRequested,
    hasActiveBet: !!currentBet && !cashOutRequested
  };
};