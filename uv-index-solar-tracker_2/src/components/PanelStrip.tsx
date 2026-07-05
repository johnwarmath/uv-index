export default function PanelStrip({ percent, segments = 12 }: { percent: number; segments?: number }) {
  const filled = Math.round((percent / 100) * segments);
  return (
    <div className="panel-strip" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: segments }).map((_, i) => (
        <span key={i} data-filled={i < filled} />
      ))}
    </div>
  );
}
