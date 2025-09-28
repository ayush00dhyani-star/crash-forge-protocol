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
  const lastMultiplierRef = useRef<number>(1.0);

  // Reset chart for new rounds
  useEffect(() => {
    if (isActive && !isCrashed && startTime === 0) {
      setStartTime(Date.now());
      setChartData([{ time: 0, multiplier: 1.0 }]);
      lastMultiplierRef.current = 1.0;
    } else if (!isActive && !isCrashed) {
      setChartData([]);
      setStartTime(0);
      lastMultiplierRef.current = 1.0;
    }
  }, [isActive, isCrashed, startTime]);

  // Ultra-high frequency data collection for buttery smooth curves
  useEffect(() => {
    if (isActive && !isCrashed && startTime > 0) {
      const currentTime = Date.now() - startTime;
      
      // Add data points at high frequency for ultra-smooth animation
      if (Math.abs(currentMultiplier - lastMultiplierRef.current) > 0.001 || 
          chartData.length === 0 || 
          currentTime - chartData[chartData.length - 1]?.time > 50) {
        
        setChartData(prev => {
          const newPoint = { time: currentTime, multiplier: currentMultiplier };
          const newData = [...prev, newPoint];
          lastMultiplierRef.current = currentMultiplier;
          
          // Keep last 1000 points for ultra-smooth rendering
          return newData.slice(-1000);
        });
      }
    }
  }, [currentMultiplier, isActive, isCrashed, startTime, chartData.length]);

  // Professional-grade chart rendering with advanced effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // High-DPI support
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear with ultra-smooth anti-aliasing
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (chartData.length === 0) return;

    // Dynamic bounds calculation
    const maxTime = Math.max(...chartData.map(p => p.time)) + 400;
    const maxMultiplier = Math.max(2.0, Math.max(...chartData.map(p => p.multiplier)) * 1.1);
    const minMultiplier = 1.0;

    // Chart dimensions with professional spacing
    const padding = 50;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);

    // Professional grid system
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.lineWidth = 1;
    
    // Dynamic horizontal grid lines
    const multiplierStep = maxMultiplier > 10 ? 2 : maxMultiplier > 5 ? 1 : 0.5;
    for (let m = minMultiplier; m <= maxMultiplier; m += multiplierStep) {
      const y = padding + chartHeight - ((m - minMultiplier) / (maxMultiplier - minMultiplier)) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      // Professional labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${m.toFixed(1)}x`, padding - 10, y + 4);
    }

    // Dynamic vertical grid lines
    const timeStep = Math.max(1000, maxTime / 8);
    for (let t = 0; t <= maxTime; t += timeStep) {
      const x = padding + (t / Math.max(1, maxTime)) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
      
      // Time labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${(t/1000).toFixed(0)}s`, x, padding + chartHeight + 20);
    }

    // Ultra-smooth curve rendering with advanced effects
     if (chartData.length > 1) {
       // Dynamic color based on multiplier and state
       const baseHue = isCrashed ? 0 : currentMultiplier > 5 ? 45 : currentMultiplier > 2 ? 142 : 217;
      const saturation = Math.min(100, 60 + (currentMultiplier - 1) * 10);
      const lightness = Math.min(70, 45 + (currentMultiplier - 1) * 5);
      
      const mainColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
      const glowColor = `hsl(${baseHue}, ${saturation}%, ${lightness + 10}%)`;
      
      // Create ultra-smooth path with cubic bezier splines
      const path = new Path2D();
      let prevX = 0, prevY = 0;
      
      chartData.forEach((point, index) => {
        const x = padding + (point.time / Math.max(1, maxTime)) * chartWidth;
        const y = padding + chartHeight - ((point.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
        
        if (index === 0) {
          path.moveTo(x, y);
          prevX = x;
          prevY = y;
        } else if (index === 1) {
          path.lineTo(x, y);
          prevX = x;
          prevY = y;
        } else {
          // Smooth cubic bezier curves for professional appearance
          const controlX1 = prevX + (x - prevX) * 0.3;
          const controlY1 = prevY;
          const controlX2 = x - (x - prevX) * 0.3;
          const controlY2 = y;
          
          path.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, x, y);
          prevX = x;
          prevY = y;
        }
      });

      // Multi-layer glow effect
      for (let i = 0; i < 3; i++) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 - (i * 5);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 6 - (i * 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path);
      }
      
      // Reset shadow
      ctx.shadowBlur = 0;

      // Gradient area fill
      const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
      gradient.addColorStop(0, `${mainColor.replace(')', ', 0.3)')}`);
      gradient.addColorStop(1, `${mainColor.replace(')', ', 0.05)')}`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Create filled area
      chartData.forEach((point, index) => {
        const x = padding + (point.time / Math.max(1, maxTime)) * chartWidth;
        const y = padding + chartHeight - ((point.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
        
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

      // Current position indicator with pulsing effect
      if ((isActive || isCrashed) && chartData.length > 0) {
        const currentPoint = chartData[chartData.length - 1];
        const currentX = padding + (currentPoint.time / Math.max(1, maxTime)) * chartWidth;
        const currentY = padding + chartHeight - ((currentPoint.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
        
        // Pulsing outer ring
        const pulseRadius = 8 + Math.sin(Date.now() * 0.01) * 3;
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(currentX, currentY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Solid center dot
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Professional crash overlay
    if (isCrashed && crashPoint) {
      // Draw vertical drop line to baseline for dramatic crash
      const lastPoint = chartData[chartData.length - 1];
      if (lastPoint) {
        const currentX = padding + (lastPoint.time / Math.max(1, maxTime)) * chartWidth;
        const currentY = padding + chartHeight - ((lastPoint.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(currentX, padding + chartHeight);
        ctx.stroke();
      }

      // Dramatic explosion effect
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('💥 CRASHED!', rect.width / 2, rect.height / 2 - 20);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(`${crashPoint.toFixed(2)}x`, rect.width / 2, rect.height / 2 + 20);
      
      // Red overlay
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

  }, [chartData, isCrashed, crashPoint, currentMultiplier, isActive]);

  // Status display logic
  const getChartStatus = () => {
    if (isCrashed) return "CRASHED";
    if (isActive) return "ACTIVE";
    return "WAITING";
  };

  const getStatusColor = () => {
    if (isCrashed) return "bg-red-500/30 text-red-400 border-red-500/50 animate-crash-pulse";
    if (isActive) return "bg-green-500/30 text-green-400 border-green-500/50 animate-pulse-neon";
    return "bg-yellow-500/30 text-yellow-400 border-yellow-500/50 animate-pulse";
  };

  return (
    <Card className="relative h-[500px] p-6 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/80 backdrop-blur-xl border-2 border-neon-green/20 cyber-grid overflow-hidden">
      {/* Professional status indicator */}
      <div className="absolute top-6 left-6 z-20">
        <Badge variant="outline" className={`${getStatusColor()} font-mono text-sm px-4 py-2`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isCrashed ? 'bg-red-400' : isActive ? 'bg-green-400' : 'bg-yellow-400'
            } animate-pulse`} />
            {getChartStatus()}
          </div>
        </Badge>
      </div>

      {/* Live multiplier display */}
      <div className="absolute top-6 right-6 z-20">
        <div className={`text-4xl font-black font-mono ${
          isCrashed ? 'text-red-400 animate-crash-pulse' : 
          isActive ? 'text-green-400 animate-glow' : 'text-yellow-400'
        } drop-shadow-lg`}>
          {currentMultiplier.toFixed(2)}x
        </div>
        {isActive && (
          <div className="text-sm text-center text-green-300 animate-pulse mt-1">
            {((Date.now() - (startTime || Date.now())) / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {/* High-performance canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] rounded-lg"
        style={{ 
          background: 'radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.05) 0%, transparent 60%)',
          filter: isActive ? 'contrast(1.1) brightness(1.05)' : 'contrast(0.9) brightness(0.8)'
        }}
      />

      {/* Waiting state with better UX */}
      {!isActive && !isCrashed && chartData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center space-y-6 p-8 bg-black/40 rounded-xl backdrop-blur-sm">
            <div className="text-6xl animate-bounce-scale">🚀</div>
            <div className="text-xl font-bold text-white">
              Next rocket launching soon...
            </div>
            <div className="text-sm text-gray-300">
              Get ready to ride the multiplier to the moon!
            </div>
          </div>
        </div>
      )}

      {/* Enhanced particle effects */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none z-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-ping ${
                currentMultiplier > 5 ? 'bg-yellow-400' : 
                currentMultiplier > 2 ? 'bg-green-400' : 'bg-blue-400'
              }`}
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${0.5 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Crash explosion effect */}
      {isCrashed && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.3 + Math.random() * 0.7}s`
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};