import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, AlertTriangle } from "lucide-react";

interface ChartPoint {
  time: number;
  multiplier: number;
}

interface TradingChartProps {
  currentMultiplier: number;
  isActive: boolean;
  isCrashed: boolean;
  crashPoint?: number;
}

export const TradingChart = ({ 
  currentMultiplier, 
  isActive, 
  isCrashed, 
  crashPoint 
}: TradingChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Reset chart for new rounds
  useEffect(() => {
    if (isActive && !isCrashed && startTime === 0) {
      setStartTime(Date.now());
      setChartData([{ time: 0, multiplier: 1.0 }]);
    } else if (!isActive && !isCrashed) {
      setChartData([]);
      setStartTime(0);
    }
  }, [isActive, isCrashed, startTime]);

  // High-frequency data collection for smooth curves
  useEffect(() => {
    if (isActive && !isCrashed && startTime > 0) {
      const currentTime = Date.now() - startTime;
      
      // Throttle updates to 60fps
      if (currentTime - lastUpdateRef.current > 16) {
        setChartData(prev => {
          const newPoint = { time: currentTime, multiplier: currentMultiplier };
          const newData = [...prev, newPoint];
          lastUpdateRef.current = currentTime;
          return newData.slice(-500); // Keep last 500 points
        });
      }
    }
  }, [currentMultiplier, isActive, isCrashed, startTime]);

  // Professional chart rendering
  const renderChart = useCallback(() => {
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

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);

    // Dynamic bounds
    const maxTime = Math.max(...chartData.map(p => p.time));
    const maxMultiplier = Math.max(2.0, Math.max(...chartData.map(p => p.multiplier)) * 1.1);
    const minMultiplier = 1.0;

    // Grid system
    ctx.strokeStyle = 'hsl(210 8% 18%)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const ratio = i / ySteps;
      const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * ratio;
      const y = padding + chartHeight - (ratio * chartHeight);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = 'hsl(210 6% 58%)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${multiplier.toFixed(1)}×`, padding - 8, y + 3);
    }

    // Vertical grid lines
    const xSteps = 6;
    for (let i = 0; i <= xSteps; i++) {
      const ratio = i / xSteps;
      const time = maxTime * ratio;
      const x = padding + (ratio * chartWidth);
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
      
      // Time labels
      ctx.fillStyle = 'hsl(210 6% 58%)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${(time/1000).toFixed(0)}s`, x, padding + chartHeight + 20);
    }

    // Chart line
    if (chartData.length > 1) {
      const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
      gradient.addColorStop(0, 'hsl(216 87% 52%)');
      gradient.addColorStop(1, 'hsl(216 87% 42%)');
      
      // Create smooth path
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

      // Stroke
      ctx.strokeStyle = isCrashed ? 'hsl(0 75% 55%)' : 'hsl(216 87% 52%)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Area fill
      if (!isCrashed) {
        const areaGradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        areaGradient.addColorStop(0, 'hsl(216 87% 52% / 0.15)');
        areaGradient.addColorStop(1, 'hsl(216 87% 52% / 0.02)');
        
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
        
        // Pulsing dot
        ctx.fillStyle = isCrashed ? 'hsl(0 75% 55%)' : 'hsl(216 87% 52%)';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring
        ctx.strokeStyle = isCrashed ? 'hsl(0 75% 55% / 0.6)' : 'hsl(216 87% 52% / 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Crash drop line
    if (isCrashed && crashPoint && chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      const currentX = padding + (lastPoint.time / Math.max(1, maxTime)) * chartWidth;
      const currentY = padding + chartHeight - ((lastPoint.multiplier - minMultiplier) / Math.max(0.001, (maxMultiplier - minMultiplier))) * chartHeight;
      
      ctx.strokeStyle = 'hsl(0 75% 55%)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(currentX, padding + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [chartData, isCrashed, crashPoint, isActive, currentMultiplier]);

  // Animation loop
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

  const getStatusIcon = () => {
    if (isCrashed) return <AlertTriangle className="h-4 w-4" />;
    if (isActive) return <Activity className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (isCrashed) return "destructive";
    if (isActive) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (isCrashed) return "CRASHED";
    if (isActive) return "LIVE";
    return "WAITING";
  };

  return (
    <Card className="relative h-[600px] p-6 glass">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Multiplier Chart</h2>
          <Badge variant={getStatusColor()} className="flex items-center gap-1.5">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Current</div>
            <div className={`text-2xl font-bold number-mono ${
              isCrashed ? 'text-destructive' : 
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {currentMultiplier.toFixed(2)}×
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-[calc(100%-80px)] trading-grid rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Waiting state */}
        {!isActive && !isCrashed && chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="text-lg font-medium text-foreground">
                Waiting for next round
              </div>
              <div className="text-sm text-muted-foreground">
                Chart will appear when the round starts
              </div>
            </div>
          </div>
        )}

        {/* Crash overlay */}
        {isCrashed && (
          <div className="absolute inset-0 bg-destructive/5 flex items-center justify-center">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
              <div className="text-2xl font-bold text-destructive">
                CRASHED AT {crashPoint?.toFixed(2)}×
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};