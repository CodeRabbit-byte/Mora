export default function XPBar({ sessions = 0 }) {
  const progress = Math.min((sessions / 20) * 100, 100);

  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-mora-border">
        <div className="h-full rounded-full bg-mora-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-[13px] text-mora-muted">{sessions} / 20 sessions - Focus profile unlocks at 20</p>
    </div>
  );
}
