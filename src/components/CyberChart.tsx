import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity, TrendingUp, Skull } from "lucide-react";

interface ChartPoint {
  time: number;
  multiplier: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface CyberChartProps {
  currentMultiplier: number;
  isActive: boolean;
  isCrashed: boolean;
  crashPoint?: number;
}

export const CyberChart = ({ 
  currentMultiplier, 
  isActive, 
  isCrashed, 
  crashPoint 
}: CyberChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [shake, setShake] = useState(false);
  const animationRef = useRef<number>();
  const particleAnimationRef = useRef<number>();

  // Reset chart for new rounds
  useEffect(() => {
    if (isActive && !isCrashed && startTime === 0) {
      setStartTime(Date.now());
      setChartData([{ time: 0, multiplier: 1.0 }]);
      setParticles([]);
      setShake(false);
    } else if (!isActive && !isCrashed) {
      setChartData([]);
      setStartTime(0);
      setParticles([]);
    }
  }, [isActive, isCrashed, startTime]);

  // Handle crash effect
  useEffect(() => {
    if (isCrashed) {
      setShake(true);
      // Create explosion particles
      const explosionParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        explosionParticles.push({
          id: `explosion-${i}`,
          x: Math.random() * 800,
          y: Math.random() * 400,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          life: 0,
          maxLife: 60,
          size: Math.random() * 4 + 2,
          color: `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`
        });
      }
      setParticles(explosionParticles);
      
      setTimeout(() => setShake(false), 800);
    }
  }, [isCrashed]);

  // Data collection
  useEffect(() => {
    if (isActive && !isCrashed && startTime > 0) {
      const currentTime = Date.now() - startTime;
      
      setChartData(prev => {
        const newPoint = { time: currentTime, multiplier: currentMultiplier };
        const newData = [...prev, newPoint];
        
        // Add trailing particles
        if (prev.length > 0) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const padding = 40;
            const chartWidth = rect.width - (padding * 2);
            const chartHeight = rect.height - (padding * 2);
            const maxTime = Math.max(...newData.map(p => p.time));
            const maxMultiplier = Math.max(2.0, Math.max(...newData.map(p => p.multiplier)) * 1.1);
            const minMultiplier = 1.0;
            
            const x = padding + (currentTime / Math.max(1, maxTime)) * chartWidth;
            const y = padding + chartHeight - ((currentMultiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
            
            // Add particle trail
            if (Math.random() < 0.3) {
              setParticles(prev => [...prev, {
                id: `trail-${Date.now()}-${Math.random()}`,
                x,
                y,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3,
                life: 0,
                maxLife: 30,
                size: Math.random() * 2 + 1,
                color: currentMultiplier < 2 ? 'hsl(180, 100%, 50%)' : 
                       currentMultiplier < 5 ? 'hsl(300, 100%, 50%)' :
                       'hsl(271, 76%, 53%)'
              }]);
            }
          }
        }
        
        return newData.slice(-1000);
      });
    }
  }, [currentMultiplier, isActive, isCrashed, startTime]);

  // Particle animation
  const updateParticles = useCallback(() => {
    setParticles(prev => prev
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life + 1,
        vy: particle.vy + 0.1 // gravity
      }))
      .filter(particle => particle.life < particle.maxLife)
    );
  }, []);

  useEffect(() => {
    const animate = () => {
      updateParticles();
      particleAnimationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current);
      }
    };
  }, [updateParticles]);

  // Main chart rendering
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;

    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);

    const maxTime = Math.max(...chartData.map(p => p.time));
    const maxMultiplier = Math.max(2.0, Math.max(...chartData.map(p => p.multiplier)) * 1.1);
    const minMultiplier = 1.0;

    // Grid
    ctx.strokeStyle = 'hsl(180, 100%, 50%, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid
    for (let i = 0; i <= 5; i++) {
      const ratio = i / 5;
      const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * ratio;
      const y = padding + chartHeight - (ratio * chartHeight);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = 'hsl(180, 100%, 70%)';
      ctx.font = '12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${multiplier.toFixed(1)}×`, padding - 8, y + 4);
    }

    // Vertical grid
    for (let i = 0; i <= 6; i++) {
      const ratio = i / 6;
      const time = maxTime * ratio;
      const x = padding + (ratio * chartWidth);
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
      
      ctx.fillStyle = 'hsl(180, 100%, 70%)';
      ctx.font = '11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${(time/1000).toFixed(0)}s`, x, padding + chartHeight + 20);
    }

    // Chart line with dynamic color
    if (chartData.length > 1) {
      const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
      
      if (isCrashed) {
        gradient.addColorStop(0, 'hsl(0, 100%, 50%)');
        gradient.addColorStop(1, 'hsl(0, 100%, 30%)');
      } else if (currentMultiplier >= 10) {
        gradient.addColorStop(0, 'hsl(271, 76%, 53%)');
        gradient.addColorStop(1, 'hsl(300, 100%, 50%)');
      } else if (currentMultiplier >= 2) {
        gradient.addColorStop(0, 'hsl(300, 100%, 50%)');
        gradient.addColorStop(1, 'hsl(180, 100%, 50%)');
      } else {
        gradient.addColorStop(0, 'hsl(180, 100%, 50%)');
        gradient.addColorStop(1, 'hsl(180, 100%, 30%)');
      }
      
      ctx.beginPath();
      
      chartData.forEach((point, index) => {
        const x = padding + (point.time / Math.max(1, maxTime)) * chartWidth;
        const y = padding + chartHeight - ((point.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // Line stroke with glow effect
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = isCrashed ? 'hsl(0, 100%, 50%)' : 'hsl(180, 100%, 50%)';
      ctx.shadowBlur = 20;
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;

      // Area fill
      if (!isCrashed) {
        const areaGradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        areaGradient.addColorStop(0, 'hsl(180, 100%, 50%, 0.2)');
        areaGradient.addColorStop(1, 'hsl(180, 100%, 50%, 0.02)');
        
        ctx.fillStyle = areaGradient;
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.closePath();
        ctx.fill();
      }

      // Current position indicator
      if ((isActive || isCrashed) && chartData.length > 0) {
        const currentPoint = chartData[chartData.length - 1];
        const currentX = padding + (currentPoint.time / Math.max(1, maxTime)) * chartWidth;
        const currentY = padding + chartHeight - ((currentPoint.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
        
        // Pulsing dot with glow
        ctx.fillStyle = isCrashed ? 'hsl(0, 100%, 50%)' : 'hsl(180, 100%, 50%)';
        ctx.shadowColor = isCrashed ? 'hsl(0, 100%, 50%)' : 'hsl(180, 100%, 50%)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Crash drop line
    if (isCrashed && crashPoint && chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      const currentX = padding + (lastPoint.time / Math.max(1, maxTime)) * chartWidth;
      const currentY = padding + chartHeight - ((lastPoint.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
      
      ctx.strokeStyle = 'hsl(0, 100%, 50%)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.shadowColor = 'hsl(0, 100%, 50%)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(currentX, padding + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

  }, [chartData, isCrashed, crashPoint, isActive, currentMultiplier]);

  // Particle rendering
  const renderParticles = useCallback(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    particles.forEach(particle => {
      const alpha = 1 - (particle.life / particle.maxLife);
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('hsl(', 'hsla(');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [particles]);

  // Animation loops
  useEffect(() => {
    const animate = () => {
      renderChart();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderChart]);

  useEffect(() => {
    renderParticles();
  }, [renderParticles]);

  const getStatusIcon = () => {
    if (isCrashed) return <Skull className="h-4 w-4" />;
    if (isActive) return <Zap className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (isCrashed) return "destructive";
    if (isActive) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (isCrashed) return "CRASHED";
    if (isActive) return "MOON MODE";
    return "LOADING";
  };

  return (
    <Card className={`relative h-[600px] p-6 glass-elevated overflow-hidden ${shake ? 'animate-screen-shake' : ''}`}>
      {/* Cyberpunk Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-display font-bold text-neon-cyan">MEME MARKET CRASH</h2>
          <Badge 
            variant={getStatusColor()} 
            className={`flex items-center gap-1.5 font-mono font-bold ${
              isActive ? 'neon-glow-cyan animate-glow-pulse' : ''
            } ${isCrashed ? 'neon-glow-red' : ''}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
              MULTIPLIER
            </div>
            <div className={`text-3xl font-display font-bold number-mono ${
              isCrashed ? 'text-neon-red animate-neon-flicker' : 
              isActive ? 'text-neon-cyan' : 'text-muted-foreground'
            } ${isActive ? 'animate-value-pump' : ''}`}>
              {currentMultiplier.toFixed(2)}×
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-[calc(100%-80px)] chart-container chart-grid rounded-xl overflow-hidden">
        {/* Main chart canvas */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Particle canvas overlay */}
        <canvas 
          ref={particleCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        
        {/* Waiting state with cyberpunk loading */}
        {!isActive && !isCrashed && chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Activity className="h-16 w-16 text-neon-cyan mx-auto animate-glow-pulse" />
              <div className="text-xl font-display font-bold text-neon-cyan animate-float">
                INITIALIZING MOON MISSION
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                Next meme rocket launching soon...
              </div>
            </div>
          </div>
        )}

        {/* Crash overlay with dramatic effect */}
        {isCrashed && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-neon-red/20 via-transparent to-neon-red/10 animate-crash-explosion" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Skull className="h-20 w-20 text-neon-red mx-auto animate-neon-flicker" />
                <div className="text-3xl font-display font-black text-neon-red animate-screen-shake">
                  REKT AT {crashPoint?.toFixed(2)}×
                </div>
                <div className="text-lg font-mono text-neon-red/80">
                  MEME BUBBLE POPPED
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};