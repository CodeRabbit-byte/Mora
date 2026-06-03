import { useEffect, useMemo, useState } from 'react';
import {
  IconArrowsShuffle,
  IconClock,
  IconDice5,
  IconListCheck,
  IconMessageCircle,
  IconTrafficLights,
} from '@tabler/icons-react';

const workModes = [
  { label: 'Deep focus', detail: 'No switching. One thread.' },
  { label: 'Ask when stuck', detail: 'Pause, name the block, ask.' },
  { label: 'Talk it out', detail: 'Explain the problem to yourself out loud.' },
  { label: 'Quiet review', detail: 'Read, mark, adjust.' },
];

const lightStates = [
  { label: 'Green', detail: 'Keep going', color: 'bg-mora-accent text-mora-bg border-mora-accent' },
  { label: 'Yellow', detail: 'Slow down', color: 'bg-transparent text-mora-accent border-mora-accent' },
  { label: 'Red', detail: 'Reset gently', color: 'bg-transparent text-mora-text border-mora-border' },
];

const fallbackPrompts = [
  'What is the smallest next move?',
  'What would make this easier to restart tomorrow?',
  'What part already has a shape?',
  'What question is the work asking?',
];

function formatClock(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function FocusScreenTools({ taskName, remaining, ideas = [] }) {
  const [now, setNow] = useState(new Date());
  const [modeIndex, setModeIndex] = useState(0);
  const [lightIndex, setLightIndex] = useState(0);
  const [note, setNote] = useState('');
  const [prompt, setPrompt] = useState(fallbackPrompts[0]);

  const promptPool = useMemo(() => {
    const ideaPrompts = ideas.slice(0, 6).map((idea) => idea.text);
    return [...ideaPrompts, ...fallbackPrompts];
  }, [ideas]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const randomizePrompt = () => {
    const next = promptPool[Math.floor(Math.random() * promptPool.length)];
    setPrompt(next);
  };

  const minutesLeft = Math.ceil(remaining / 60);
  const mode = workModes[modeIndex];
  const light = lightStates[lightIndex];

  return (
    <section className="mt-6 w-full rounded-2xl border border-mora-border bg-mora-surface p-4 text-left">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-mora-muted">Focus screen</p>
          <h2 className="heading-tight mt-1 text-xl font-medium">Keep the session pointed at one thing.</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-mora-border px-4 py-2 text-sm text-mora-text">
          <IconClock size={17} stroke={1.8} />
          {formatClock(now)}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-mora-border bg-mora-bg p-4">
          <div className="flex items-center gap-2 text-xs text-mora-muted">
            <IconListCheck size={16} stroke={1.8} />
            Objective
          </div>
          <p className="mt-3 text-base leading-6 text-mora-text">{taskName}</p>
          <p className="mt-3 text-sm text-mora-muted">{minutesLeft} min left in this block</p>
        </article>

        <article className="rounded-2xl border border-mora-border bg-mora-bg p-4">
          <div className="flex items-center gap-2 text-xs text-mora-muted">
            <IconTrafficLights size={16} stroke={1.8} />
            Energy light
          </div>
          <button
            type="button"
            onClick={() => setLightIndex((value) => (value + 1) % lightStates.length)}
            className={`mt-3 w-full rounded-full border px-4 py-3 text-sm font-medium ${light.color}`}
          >
            {light.label} — {light.detail}
          </button>
        </article>

        <article className="rounded-2xl border border-mora-border bg-mora-bg p-4">
          <div className="flex items-center gap-2 text-xs text-mora-muted">
            <IconMessageCircle size={16} stroke={1.8} />
            Work mode
          </div>
          <button
            type="button"
            onClick={() => setModeIndex((value) => (value + 1) % workModes.length)}
            className="mt-3 w-full rounded-2xl border border-mora-border px-4 py-3 text-left"
          >
            <span className="block text-sm font-medium text-mora-text">{mode.label}</span>
            <span className="mt-1 block text-xs text-mora-muted">{mode.detail}</span>
          </button>
        </article>

        <article className="rounded-2xl border border-mora-border bg-mora-bg p-4">
          <div className="flex items-center gap-2 text-xs text-mora-muted">
            <IconDice5 size={16} stroke={1.8} />
            Prompt picker
          </div>
          <p className="mt-3 min-h-[48px] text-sm leading-6 text-mora-text">{prompt}</p>
          <button
            type="button"
            onClick={randomizePrompt}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-mora-accent px-4 py-2 text-xs font-medium text-mora-accent"
          >
            <IconArrowsShuffle size={15} stroke={1.8} />
            New prompt
          </button>
        </article>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs text-mora-muted">Note to self (not saved — copy before leaving)</p>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Write the instruction, constraint, or next move you want visible."
          className="min-h-[92px] w-full resize-none rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-mora-accent"
        />
      </div>
    </section>
  );
}
