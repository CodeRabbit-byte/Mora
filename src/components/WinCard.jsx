function relativeDate(date) {
  const then = new Date(date).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`.replace(/^\d+\s/, (match) => match);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`.replace(/^\d+\s/, (match) => match);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function fullDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
    .format(new Date(date))
    .replace(',', ' ·');
}

export default function WinCard({ win, compact = false }) {
  return (
    <article
      className={`border border-mora-border bg-mora-surface ${
        compact ? 'min-w-[200px] rounded-xl p-4' : 'w-full rounded-[14px] p-5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base leading-6 text-mora-text">{win.text}</p>
        {!compact ? (
          <span className="shrink-0 rounded-full bg-[#1A1F0F] px-3 py-1 text-xs font-medium text-mora-accent">
            ⚡ {win.xp ?? 10} XP
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[13px] text-mora-muted">{compact ? relativeDate(win.date) : fullDate(win.date)}</p>
    </article>
  );
}
