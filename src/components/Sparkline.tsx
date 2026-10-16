interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  isPositive: boolean;
}

export function Sparkline({ data, width = 90, height = 28, isPositive }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate SVG path points
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * (width - 4) + 2;
      // Invert Y because SVG coordinate 0 is at top
      const y = height - 4 - ((val - min) / range) * (height - 8) + 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#059669' : '#E11D48';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0 select-none"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
