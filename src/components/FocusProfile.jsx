import { useState } from 'react';
import { useMora } from '../context/MoraContext.jsx';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function bestTimeLabel(sessions) {
  if (!sessions.length) return 'Weekday evenings';
  const buckets = sessions.reduce((acc, session) => {
    const date = new Date(session.date);
    const hour = date.getHours();
    const weekday = date.getDay() > 0 && date.getDay() < 6 ? 'weekday' : 'weekend';
    const part = hour < 12 ? 'mornings' : hour < 17 ? 'afternoons' : 'evenings';
    const key = `${weekday} ${part}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return sentenceCase(Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0]);
}

function averageDuration(sessions) {
  if (!sessions.length) return 5;
  const total = sessions.reduce((sum, session) => sum + Number(session.duration || 5), 0);
  return Math.max(1, Math.round(total / sessions.length));
}

function mostActiveDay(sessions) {
  if (!sessions.length) return 'Tuesday';
  const days = sessions.reduce((acc, session) => {
    const day = new Date(session.date).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const best = Object.entries(days).sort((a, b) => b[1] - a[1])[0][0];
  return dayNames[Number(best)];
}

export default function FocusProfile() {
  const { sessions, showToast } = useMora();
  const [protectedDay, setProtectedDay] = useState(false);
  const activeDay = mostActiveDay(sessions);

  return (
    <div className="mt-8 space-y-4">
      <article className="rounded-2xl border border-mora-border bg-mora-surface p-6">
        <p className="text-[13px] text-mora-muted">You're sharpest</p>
        <h2 className="heading-tight mt-3 text-[22px] font-medium text-mora-accent">{bestTimeLabel(sessions)}</h2>
        <button
          type="button"
          onClick={() => showToast("We'll add it to your plan.")}
          className="mt-5 text-sm text-mora-muted underline underline-offset-4"
        >
          Schedule one for this week →
        </button>
      </article>
      <article className="rounded-2xl border border-mora-border bg-mora-surface p-6">
        <p className="text-[13px] text-mora-muted">Your sweet spot</p>
        <h2 className="heading-tight mt-3 text-[22px] font-medium text-mora-accent">{averageDuration(sessions)} minutes</h2>
        <p className="mt-3 text-sm leading-6 text-mora-muted">Most of your best sessions run longer than you planned.</p>
      </article>
      <article className="rounded-2xl border border-mora-border bg-mora-surface p-6">
        <p className="text-[13px] text-mora-muted">Your most consistent day</p>
        <h2 className="heading-tight mt-3 text-[22px] font-medium text-mora-accent">{activeDay}</h2>
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm text-mora-muted">Want to protect it?</span>
          <button
            type="button"
            aria-pressed={protectedDay}
            onClick={() => {
              setProtectedDay((value) => {
                if (!value) showToast(`We'll remind you every ${activeDay}.`);
                return !value;
              });
            }}
            className={`flex h-8 w-14 items-center rounded-full border px-1 transition-colors ${
              protectedDay ? 'justify-end border-mora-accent bg-[#1A1F0F]' : 'justify-start border-mora-border bg-mora-bg'
            }`}
          >
            <span className="block h-5 w-5 rounded-full bg-mora-accent" />
          </button>
        </div>
      </article>
    </div>
  );
}
