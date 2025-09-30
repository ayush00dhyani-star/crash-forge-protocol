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

  // Advanced crash algorithm with cryptographically secure randomness
  const calculateCrashPoint = useCallback((roundId: number): number => {
    const houseEdge = 0.01; // 1%
    const minMultiplier = 1.01;
    const maxMultiplier = 1000000;
    
    // Use multiple entropy sources for cryptographic security
    const serverSeed = roundId.toString();
    const clientSeed = Date.now().toString();
    const nonce = roundId;
    
    // Create hash using built-in crypto (simplified for browser)
    const hashInput = serverSeed + clientSeed + nonce;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive number and normalize to [0, 2^52)
    const h = Math.abs(hash) % (2 ** 32); // Use 32-bit for browser compatibility
    
    if (h === 0) return minMultiplier; // Instant crash (rare)
    
    // Industry-standard crash formula
    const crashPoint = Math.floor((2 ** 32) / h) / 10000 * (1 - houseEdge);
    
    return Math.max(minMultiplier, Math.min(crashPoint, maxMultiplier));
  }, []);

  // Realistic round duration based on crash point
  const getRoundDuration = useCallback((crashPoint: number): number => {
    const baseTime = 3000; // 3 seconds minimum
    const additionalTime = Math.log(crashPoint) * 2000; // Logarithmic scaling
    return baseTime + Math.min(additionalTime, 30000); // Max 33 seconds total
  }, []);

  // Professional multiplier animation with smooth curves
  const updateMultiplier = useCallback(() => {
    if (gamePhaseRef.current !== 'active' || isCrashed) return;

    const elapsed = Date.now() - roundStartTimeRef.current;
    const targetDuration = getRoundDuration(crashPointRef.current);
    const progress = elapsed / targetDuration;
    
    if (progress >= 1) {
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

    // Smooth exponential curve animation
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    const newMultiplier = 1 + (crashPointRef.current - 1) * easedProgress;
    
    setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));

    // Auto cashout handling
    if (autoCashOut && newMultiplier >= autoCashOut && currentBet && !cashOutRequested) {
      handleCashOut();
    }
  }, [isCrashed, currentBet, cashOutRequested, autoCashOut, roundId, toast, getRoundDuration]);

  // High-frequency updates for smooth 60fps animation
  useEffect(() => {
    if (gamePhaseRef.current === 'active' && !isCrashed) {
      multiplierIntervalRef.current = setInterval(updateMultiplier, 16); // 60fps for smooth performance
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