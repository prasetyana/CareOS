import React, { useState, useMemo } from 'react';
import { useTheme } from '@core/hooks/useTheme';

interface ChartData {
  day: string;
  value: number;
}

interface LineChartProps {
  data: ChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartData } | null>(null);
  const { mode } = useTheme();

  const gridColor = mode === 'dark' ? '#374151' : '#E5E7EB';
  const textColor = mode === 'dark' ? '#9CA3AF' : '#6B7281';

  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { xScale, yScale, linePath, areaPath, points } = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value), 0);

    const xScale = (index: number) => margin.left + (index / (data.length - 1)) * innerWidth;
    const yScale = (value: number) => margin.top + innerHeight - (value / maxValue) * innerHeight;

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.value)}`).join(' ');
    const areaPath = `${linePath} L${xScale(data.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;

    const points = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.value),
      data: d,
    }));

    return { xScale, yScale, linePath, areaPath, points };
  }, [data, innerWidth, innerHeight, margin]);

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svgRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - svgRect.left;

    const closestPoint = points.reduce((prev, curr) =>
      Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
    );

    setTooltip({ ...closestPoint });
  };

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Y-axis grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = margin.top + (i / 4) * innerHeight;
          return <line key={i} x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={gridColor} strokeWidth="1" strokeDasharray="2,2" />
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={d.day} x={xScale(i)} y={height - 5} textAnchor="middle" fill={textColor} fontSize="12">
            {d.day}
          </text>
        ))}

        {/* Area Gradient */}
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-brand-primary-rgb))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="rgb(var(--color-brand-primary-rgb))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#area-gradient)" className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }} />

        {/* Line */}
        <path d={linePath} fill="none" stroke="rgb(var(--color-brand-primary-rgb))" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="path-animate"
        />

        {/* Interaction layer */}
        <rect
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />

        {/* Tooltip elements */}
        {tooltip && (
          <g transform={`translate(${tooltip.x}, ${tooltip.y})`}>
            <line y1={margin.top - tooltip.y} y2={innerHeight + margin.top - tooltip.y} stroke={mode === 'dark' ? '#6B7281' : '#A0A0A0'} strokeWidth="1" strokeDasharray="3,3" />
            <circle r="5" fill="rgb(var(--color-brand-primary-rgb))" stroke={mode === 'dark' ? '#111827' : 'white'} strokeWidth="2" />
          </g>
        )}
      </svg>
      {/* Tooltip HTML */}
      {tooltip && (
        <div
          className="absolute p-2 text-sm bg-apple-text text-white rounded-md shadow-lg pointer-events-none transition-transform duration-100"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 45}px`, // Position above the point
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.data.day}: <strong>{tooltip.data.value}</strong>
        </div>
      )}

      <style>{`
        .path-animate {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 1.5s ease-out forwards;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LineChart;