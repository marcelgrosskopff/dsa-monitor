// Faint concentric line-field behind dark sections (hero + closer).
export function ConcentricField({ className }: { className?: string }) {
  const cx = 430;
  const cy = 150;
  const step = 30;
  const count = 11;
  const rings = [];
  for (let i = 1; i <= count; i++) {
    const op = Math.max(0.02, 0.14 - (i - 1) * 0.012);
    rings.push(
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={i * step}
        stroke={`rgba(255,255,255,${op.toFixed(3)})`}
      />
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 480 320"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <g fill="none" strokeWidth="1">
        {rings}
      </g>
    </svg>
  );
}
