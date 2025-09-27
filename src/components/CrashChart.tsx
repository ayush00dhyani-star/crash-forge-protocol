import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChartPoint {
  time: number;
  multiplier: number;
}

interface CrashChartProps {
  currentMultiplier: number;
  isActive: boolean;
  isCrashed: boolean;
  crashPoint?: number;
  onAnimationComplete?: () => void;
}

export const CrashChart = ({ 
  currentMultiplier, 
  isActive, 
  isCrashed, 
  crashPoint,
  onAnimationComplete 
}: CrashChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const animationRef = useRef<number>();

  // Reset chart when new round starts
  useEffect(() => {
    if (isActive && !isCrashed) {
      setStartTime(Date.now());
      setChartData([{ time: 0, multiplier: 1.0 }]);
    } else if (!isActive && !isCrashed) {
      // Clear chart for next round
      setChartData([]);
      setStartTime(0);
    }
  }, [isActive, isCrashed]);

  // Add data points during active round with smooth interpolation
  useEffect(() => {
    if (isActive && !isCrashed && startTime > 0) {
      const currentTime = Date.now() - startTime;
      
      setChartData(prev => {
        const lastPoint = prev[prev.length - 1];
        
        // Always add new points for smooth animation
        if (!lastPoint || Math.abs(lastPoint.multiplier - currentMultiplier) > 0.001) {
          const newPoint = { time: currentTime, multiplier: currentMultiplier };
          const newData = [...prev, newPoint];
          
          // Keep last 500 points for ultra-smooth animation
          return newData.slice(-500);
        }
        return prev;
      });
    }
  }, [currentMultiplier, isActive, isCrashed, startTime]);

  // Clear data when round ends
  useEffect(() => {
    if (!isActive && !isCrashed) {
      setChartData([]);
    }
  }, [isActive, isCrashed]);

  // Render chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Theme colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryVar = rootStyles.getPropertyValue('--primary').trim() || '142 71% 45%';
    const destructiveVar = rootStyles.getPropertyValue('--destructive').trim() || '0 84% 60%';
    const mutedVar = rootStyles.getPropertyValue('--muted-foreground').trim() || '215 20% 65%';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (chartData.length === 0) return;

    // Calculate bounds
    const maxTime = Math.max(...chartData.map(p => p.time));
    const maxMultiplier = Math.max(...chartData.map(p => p.multiplier));
    const minMultiplier = 1.0;

    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);

    // Draw grid
    ctx.strokeStyle = `hsl(${primaryVar} / 0.12)`;
    ctx.lineWidth = 1;
    
    // Horizontal lines (multiplier)
    const safeDen = Math.max(0.0001, (maxMultiplier - minMultiplier));
    for (let i = 1; i <= Math.ceil(maxMultiplier); i++) {
      const y = padding + chartHeight - ((i - minMultiplier) / safeDen) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = `hsl(${mutedVar})`;
      ctx.font = '12px monospace';
      ctx.fillText(`${i.toFixed(1)}x`, 5, y + 4);
    }

    // Vertical lines (time)
    const timeInterval = Math.max(500, maxTime / 8);
    for (let t = 0; t <= maxTime; t += timeInterval) {
      const x = padding + (t / Math.max(1, maxTime)) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Draw the main line with enhanced animation
    if (chartData.length > 1) {
      // Create gradient line using theme
      const gradient = ctx.createLinearGradient(padding, 0, padding + chartWidth, 0);
      const mainColor = isCrashed ? `hsl(${destructiveVar})` : `hsl(${primaryVar})`;
      gradient.addColorStop(0, mainColor);
      gradient.addColorStop(0.7, mainColor);
      gradient.addColorStop(1, mainColor);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Enhanced glow effect
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      const wiggleAmp = Math.min(10, chartHeight * 0.03);
      // Draw smooth bezier curve with subtle wiggle
      ctx.beginPath();
      chartData.forEach((point, index) => {
        const x = padding + (point.time / Math.max(1, maxTime)) * chartWidth;
        const baseY = padding + chartHeight - ((point.multiplier - minMultiplier) / Math.max(0.0001, (maxMultiplier - minMultiplier))) * chartHeight;
        const wiggle = isCrashed ? 0 : Math.sin((point.time / 120) + index * 0.35) * wiggleAmp;
        const y = baseY - wiggle;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else if (index === 1) {
          ctx.lineTo(x, y);
        } else {
          // Smooth curve using quadratic bezier
          const prevPoint = chartData[index - 1];
          const prevX = padding + (prevPoint.time / Math.max(1, maxTime)) * chartWidth;
          const prevBaseY = padding + chartHeight - ((prevPoint.multiplier - minMultiplier) / Math.max(0.0001, (maxMultiplier - minMultiplier))) * chartHeight;
          const prevWiggle = isCrashed ? 0 : Math.sin((prevPoint.time / 120) + (index - 1) * 0.35) * wiggleAmp;
          const prevY = prevBaseY - prevWiggle;
          
          const controlX = (prevX + x) / 2;
          const controlY = (prevY + y) / 2;
          
          ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
      });
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw area under curve
      ctx.fillStyle = isCrashed 
        ? `hsl(${destructiveVar} / 0.08)` 
        : `hsl(${primaryVar} / 0.08)`;
      
      ctx.beginPath();
      const wiggleAmpArea = Math.min(10, chartHeight * 0.03);
      chartData.forEach((point, index) => {
        const x = padding + (point.time / Math.max(1, maxTime)) * chartWidth;
        const baseY = padding + chartHeight - ((point.multiplier - minMultiplier) / Math.max(0.0001, (maxMultiplier - minMultiplier))) * chartHeight;
        const wiggle = isCrashed ? 0 : Math.sin((point.time / 120) + index * 0.35) * wiggleAmpArea;
        const y = baseY - wiggle;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // Complete the area
      const lastPoint = chartData[chartData.length - 1];
      const lastX = padding + (lastPoint.time / Math.max(1, maxTime)) * chartWidth;
      const bottomY = padding + chartHeight;
      
      ctx.lineTo(lastX, bottomY);
      ctx.lineTo(padding, bottomY);
      ctx.closePath();
      ctx.fill();

      // Draw current point
      if (isActive || isCrashed) {
        const currentPoint = chartData[chartData.length - 1];
        const currentX = padding + (currentPoint.time / Math.max(1, maxTime)) * chartWidth;
        const baseY = padding + chartHeight - ((currentPoint.multiplier - minMultiplier) / Math.max(0.0001, (maxMultiplier - minMultiplier))) * chartHeight;
        const wiggle = isCrashed ? 0 : Math.sin((currentPoint.time / 120) + chartData.length * 0.35) * Math.min(10, chartHeight * 0.03);
        const currentY = baseY - wiggle;
        
        // Pulsing circle
        const mainColor = isCrashed ? `hsl(${destructiveVar})` : `hsl(${primaryVar})`;
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw crash point if crashed
    if (isCrashed && crashPoint) {
      ctx.fillStyle = `hsl(${destructiveVar})`;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('💥 CRASHED!', rect.width / 2, 30);
      ctx.fillText(`${crashPoint.toFixed(2)}x`, rect.width / 2, 50);
    }

  }, [chartData, isCrashed, crashPoint]);

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      // Chart updates happen via useEffect above
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isActive) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  const getChartStatus = () => {
    if (isCrashed) return "CRASHED";
    if (isActive) return "LIVE";
    return "WAITING";
  };

  const getStatusColor = () => {
    if (isCrashed) return "bg-red-500/20 text-red-400 border-red-500/50";
    if (isActive) return "bg-green-500/20 text-green-400 border-green-500/50";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  };

  return (
    <Card className="relative h-[400px] p-6 bg-black/40 backdrop-blur-sm border-border cyber-grid overflow-hidden">
      {/* Status badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="outline" className={`${getStatusColor()} animate-pulse font-mono`}>
          🔴 {getChartStatus()}
        </Badge>
      </div>

      {/* Current multiplier display */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`text-2xl font-black font-mono ${
          isCrashed ? 'text-red-400' : isActive ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {currentMultiplier.toFixed(2)}x
        </div>
      </div>

      {/* Chart canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)]"
        style={{ 
          background: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.06) 0%, transparent 50%)'
        }}
      />

      {/* Waiting state */}
      {!isActive && !isCrashed && chartData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-4xl animate-bounce">📈</div>
            <div className="text-lg font-bold text-muted-foreground">
              Preparing for next rocket launch...
            </div>
          </div>
        </div>
      )}

      {/* Particles effect */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};