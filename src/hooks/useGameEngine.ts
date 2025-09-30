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
  const [timeRemaining, setTimeRemaining] = useState(3);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  
  // Player state
  const [currentBet, setCurrentBet] = useState<number | null>(null);
  const [balance, setBalance] = useState(1000.0);
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [cashOutRequested, setCashOutRequested] = useState(false);
  const [autoCashOut, setAutoCashOut] = useState<number | null>(null);
  
  // Game data
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [roundHistory, setRoundHistory] = useState<{ id: number; crash: number; date: Date }[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 2847,
    totalBets: 15337.69,
    roundsCompleted: roundId - 1,
    biggestWin: 8420.69,
    biggestMultiplier: 187.34
  });
  
  // Effects and animations
  const [showWinEmojis, setShowWinEmojis] = useState(false);
  const [showLossEmojis, setShowLossEmojis] = useState(false);
  const [showBetEmojis, setShowBetEmojis] = useState(false);
  
  // Refs for precision
  const roundStartTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const multiplierIntervalRef = useRef<NodeJS.Timeout>();
  const gamePhaseRef = useRef<'waiting' | 'countdown' | 'active' | 'crashed'>('waiting');
  const growthRateRef = useRef<number>(1.0022);

  // Advanced crash algorithm with realistic distribution
  const calculateCrashPoint = useCallback((roundId: number): number => {
    // Use multiple entropy sources
    const seed1 = Math.sin(roundId * 12.9898) * 43758.5453;
    const seed2 = Math.sin(roundId * 78.233) * 37659.3734;
    const seed3 = Math.sin(roundId * 15.731) * 29487.2847;
    
    // Combine and normalize
    const combined = Math.abs((seed1 + seed2 + seed3) % 1);
    
    // Industry-standard distribution
    if (combined < 0.33) {
      // 33% chance for 1.01x - 2.5x
      return 1.01 + (combined / 0.33) * 1.49;
    } else if (combined < 0.66) {
      // 33% chance for 2.5x - 10x
      return 2.5 + ((combined - 0.33) / 0.33) * 7.5;
    } else if (combined < 0.90) {
      // 24% chance for 10x - 50x
      return 10 + ((combined - 0.66) / 0.24) * 40;
    } else {
      // 10% chance for 50x - 1000x (moon shots)
      return 50 + ((combined - 0.90) / 0.10) * 950;
    }
  }, []);

  // Dynamic round duration based on crash point
  const getRoundDuration = useCallback((crashPoint: number): number => {
    if (crashPoint < 2) return 2000 + Math.random() * 1000; // 2-3 seconds
    if (crashPoint < 5) return 4000 + Math.random() * 2000; // 4-6 seconds
    if (crashPoint < 20) return 8000 + Math.random() * 4000; // 8-12 seconds
    return 15000 + Math.random() * 10000; // 15-25 seconds for moon shots
  }, []);

  // Smooth multiplier animation with exponential growth
  const updateMultiplier = useCallback(() => {
    if (gamePhaseRef.current !== 'active' || isCrashed) return;

    const elapsed = Date.now() - roundStartTimeRef.current;
    const targetDuration = getRoundDuration(crashPointRef.current);
    const progress = Math.min(elapsed / targetDuration, 1);
    
    // Exponential curve that reaches crash point at target duration
    const exponent = Math.log(crashPointRef.current) / Math.log(Math.E);
    const currentMultiplier = 1 + (crashPointRef.current - 1) * Math.pow(progress, 0.5);
    
    setCurrentMultiplier(parseFloat(currentMultiplier.toFixed(2)));
    
    // Check if we've reached the crash point
    if (progress >= 1 || currentMultiplier >= crashPointRef.current) {
      // Crash moment
      gamePhaseRef.current = 'crashed';
      setIsCrashed(true);
      setIsRoundActive(false);
      setCrashPoint(crashPointRef.current);
      setCurrentMultiplier(crashPointRef.current);
      
      // Handle player outcome
      if (currentBet && !cashOutRequested) {
        addFeedEvent("crash", "You", currentBet, crashPointRef.current);
        setShowLossEmojis(true);
        setTimeout(() => setShowLossEmojis(false), 3000);
        
        toast({
          title: "💥 LIQUIDATED! 💥",
          description: `Lost ${currentBet.toFixed(4)} SOL at ${crashPointRef.current.toFixed(2)}x`,
          variant: "destructive",
        });
      }
      
      // Update history and stats
      setRoundHistory(prev => [{
        id: roundId,
        crash: crashPointRef.current,
        date: new Date()
      }, ...prev.slice(0, 49)]);
      
      setGameStats(prev => ({
        ...prev,
        roundsCompleted: roundId,
        biggestMultiplier: Math.max(prev.biggestMultiplier, crashPointRef.current)
      }));
      
      setTimeout(() => {
        startNewRound();
      }, 3000);
      return;
    }

    // Auto cashout handling
    if (autoCashOut && currentMultiplier >= autoCashOut && currentBet && !cashOutRequested) {
      handleCashOut();
    }
  }, [isCrashed, currentBet, cashOutRequested, autoCashOut, roundId, toast, getRoundDuration]);

  // 60fps smooth animation
  useEffect(() => {
    if (gamePhaseRef.current === 'active' && !isCrashed) {
      multiplierIntervalRef.current = setInterval(updateMultiplier, 50); // 20fps for smooth performance
      return () => {
        if (multiplierIntervalRef.current) {
          clearInterval(multiplierIntervalRef.current);
        }
      };
    } else {
      if (multiplierIntervalRef.current) {
        clearInterval(multiplierIntervalRef.current);
      }
    }
  }, [isRoundActive, isCrashed, updateMultiplier]);

  // Lightning-fast countdown system
  useEffect(() => {
    if (gamePhaseRef.current === 'countdown' && timeRemaining > 0) {
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
  }, [timeRemaining]);

  const startRound = useCallback(() => {
    const newCrashPoint = parseFloat(calculateCrashPoint(roundId).toFixed(2));
    crashPointRef.current = newCrashPoint;
    gamePhaseRef.current = 'active';
    
    console.log(`🚀 Round #${roundId} - Target: ${newCrashPoint}x`);
    
    setIsRoundActive(true);
    setIsCrashed(false);
    setCurrentMultiplier(1.00);
    setCashOutRequested(false);
    roundStartTimeRef.current = Date.now();
    // Per-round randomized growth rate to vary run duration and feel
    growthRateRef.current = 1.0015 + Math.random() * 0.0015;
    
    // Generate realistic bot activity
    setTimeout(() => {
      const botCount = Math.floor(Math.random() * 8) + 5;
      for (let i = 0; i < botCount; i++) {
        setTimeout(() => {
          const botNames = [
            "DegenApe", "DiamondHands", "PaperHands", "WhaleHunter", 
            "MoonBoy", "CryptoChad", "YoloTrader", "LamboSeeker",
            "ToTheMoon", "HodlGang", "ShibaArmy", "SafeMoonKing"
          ];
          const name = botNames[Math.floor(Math.random() * botNames.length)];
          const suffix = Math.random().toString(36).substring(2, 6);
          const amount = Math.random() * 100 + 1;
          addFeedEvent("bet", `${name}${suffix}`, amount);
        }, Math.random() * 3000);
      }
    }, 200);
    
    toast({
      title: "🚀 ROUND LAUNCHED!",
      description: `Round #${roundId} is live - place your bets now!`,
    });
  }, [roundId, calculateCrashPoint, toast]);

  const startNewRound = useCallback(() => {
    gamePhaseRef.current = 'countdown';
    setRoundId(prev => prev + 1);
    setTimeRemaining(Math.floor(Math.random() * 2) + 1); // 1-2 seconds
    setCurrentBet(null);
    setCashOutRequested(false);
    setCrashPoint(0);
    setCurrentMultiplier(1.00);
  }, []);

  const addFeedEvent = useCallback((type: "bet" | "cashout" | "crash", player: string, amount: number, multiplier?: number) => {
    const event: FeedEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      type,
      player,
      amount,
      multiplier,
      timestamp: Date.now()
    };
    setFeedEvents(prev => [event, ...prev.slice(0, 99)]);
  }, []);

  const handlePlaceBet = useCallback((amount: number) => {
    if (currentBet || balance < amount || amount <= 0) return false;
    if (gamePhaseRef.current === 'crashed') return false;
    
    console.log(`💰 Bet placed: ${amount} SOL | Phase: ${gamePhaseRef.current}`);
    
    setCurrentBet(amount);
    setBalance(prev => prev - amount);
    addFeedEvent("bet", "You", amount);
    
    setGameStats(prev => ({
      ...prev,
      totalBets: prev.totalBets + amount
    }));
    
    setShowBetEmojis(true);
    setTimeout(() => setShowBetEmojis(false), 1500);
    
    toast({
      title: "🎯 BET PLACED!",
      description: `${amount.toFixed(4)} SOL is riding the rocket!`,
    });
    
    return true;
  }, [currentBet, balance, addFeedEvent, toast]);

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
    setTimeout(() => setShowWinEmojis(false), 3000);
    
    toast({
      title: "💰 SECURED THE BAG!",
      description: `Won ${payout.toFixed(4)} SOL at ${currentMultiplier.toFixed(2)}x!`,
    });
    
    return true;
  }, [currentBet, isRoundActive, isCrashed, cashOutRequested, currentMultiplier, addFeedEvent, toast]);

  const toggleWallet = useCallback(() => {
    setIsWalletConnected(prev => !prev);
    toast({
      title: isWalletConnected ? "👋 Wallet Disconnected" : "🟢 Wallet Connected",
      description: isWalletConnected ? "See you later!" : "Ready to make some moves!",
    });
  }, [isWalletConnected, toast]);

  // Initialize first round
  useEffect(() => {
    const timer = setTimeout(() => {
      if (gamePhaseRef.current === 'waiting') {
        startNewRound();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [startNewRound]);

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