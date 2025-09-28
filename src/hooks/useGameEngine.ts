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

  // Ultra-advanced crash point calculation with quantum randomness simulation
  const calculateCrashPoint = useCallback((roundId: number): number => {
    // Multiple entropy sources for true randomness
    const timestamp = Date.now();
    const perfNow = performance.now();
    const random1 = Math.random();
    const random2 = Math.random();
    
    // Complex hash function with multiple rounds
    let hash = 0;
    const seed = `quantum_${roundId}_${timestamp}_${perfNow}_${random1}_${random2}`;
    
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32-bit integer
      hash = hash ^ (hash >>> 16); // XOR folding
    }
    
    // Additional randomization rounds
    for (let round = 0; round < 5; round++) {
      hash = Math.imul(hash, 0x85ebca6b);
      hash = hash ^ (hash >>> 13);
      hash = Math.imul(hash, 0xc2b2ae35);
      hash = hash ^ (hash >>> 16);
    }
    
    // Normalize to 0-1
    const normalized = Math.abs(hash) / 2147483647;
    
    // Weighted distribution for realistic crash points
    const weights = [
      { max: 1.5, weight: 0.28, multiplier: 0.9 },   // 28% crash before 1.5x
      { max: 3.0, weight: 0.24, multiplier: 1.2 },   // 24% crash 1.5x-3x
      { max: 10.0, weight: 0.22, multiplier: 1.6 },  // 22% crash 3x-10x
      { max: 50.0, weight: 0.20, multiplier: 2.1 },  // 20% crash 10x-50x
      { max: 1000, weight: 0.06, multiplier: 2.8 },  // 6% moon shots
    ];
    
    let cumulative = 0;
    for (const tier of weights) {
      cumulative += tier.weight;
      if (normalized <= cumulative) {
        const tierRandom = (normalized - (cumulative - tier.weight)) / tier.weight;
        const base = 1.01;
        const range = tier.max - base;
        const crash = base + (Math.pow(tierRandom, tier.multiplier) * range);
        return Math.max(1.01, Math.min(1000, Math.round(crash * 100) / 100));
      }
    }
    
    return 2.0; // Fallback
  }, []);

  // Ultra-smooth exponential multiplier growth with micro-adjustments
  const updateMultiplier = useCallback(() => {
    if (gamePhaseRef.current !== 'active' || isCrashed) return;

    const elapsed = Date.now() - roundStartTimeRef.current;
    const seconds = elapsed / 1000;

    setCurrentMultiplier(prev => {
      // Professional-grade exponential curve with micro-adjustments
      const baseGrowth = Math.pow(growthRateRef.current, elapsed); // Ultra-smooth base with per-round pacing
      const acceleration = 1 + (seconds * 0.0008); // Gentle acceleration
      const microVariation = 1 + (Math.sin(elapsed * 0.01) * 0.0001); // Tiny variations
      
      const newMultiplier = baseGrowth * acceleration * microVariation;
      
      // Check crash condition with precision
      if (newMultiplier >= crashPointRef.current) {
        gamePhaseRef.current = 'crashed';
        setIsCrashed(true);
        setIsRoundActive(false);
        setCrashPoint(crashPointRef.current);
        
        // Handle player outcomes
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
        
        // Auto-start next round
        const delay = 600 + Math.random() * 800;
        setTimeout(() => {
          startNewRound();
        }, delay);
        
        return crashPointRef.current;
      }
      
      // Auto cash out
      if (autoCashOut && newMultiplier >= autoCashOut && currentBet && !cashOutRequested) {
        handleCashOut();
      }
      
      return newMultiplier;
    });
  }, [isCrashed, currentBet, cashOutRequested, autoCashOut, roundId, toast]);

  // Ultra-high frequency updates for buttery smooth animation
  useEffect(() => {
    if (gamePhaseRef.current === 'active' && !isCrashed) {
      multiplierIntervalRef.current = setInterval(updateMultiplier, 8); // 125fps for ultimate smoothness
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
    const newCrashPoint = calculateCrashPoint(roundId);
    crashPointRef.current = newCrashPoint;
    gamePhaseRef.current = 'active';
    
    console.log(`🚀 Round #${roundId} - Target: ${newCrashPoint.toFixed(2)}x`);
    
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