import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Page from '../components/Page.jsx';
import TaskTile from '../components/TaskTile.jsx';
import { useMora } from '../context/MoraContext.jsx';

const tiles = ['A piece of writing', 'Revision or studying', 'Something creative', "Something I've been avoiding"];

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    onboarded,
    currentTask,
    onboardingStep,
    addTask,
    setOnboardingStep,
    setOnboarded,
  } = useMora();
  const [selected, setSelected] = useState('');
  const [task, setTask] = useState(currentTask || 'Open the document');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!onboardingStep || onboardingStep < 1) setOnboardingStep(1);
  }, [onboardingStep, setOnboardingStep]);

  if (onboarded) return <Navigate to="/home" replace />;

  const completeSave = () => {
    setOnboarded(true);
    setOnboardingStep(1);
    navigate('/home');
  };

  return (
    <Page className="min-h-screen bg-mora-bg px-5 py-10 text-mora-text">
      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[480px] flex-col justify-center">
        <div className="absolute left-1/2 top-8 flex -translate-x-1/2 gap-2">
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`h-2 w-2 rounded-full ${dot <= onboardingStep ? 'bg-mora-accent' : 'border border-mora-border'}`}
            />
          ))}
        </div>

        {onboardingStep === 1 ? (
          <section>
            <h1 className="heading-tight text-[28px] font-medium">What have you been putting off?</h1>
            <p className="mt-3 text-base text-mora-muted">Pick one thing. Just one.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {tiles.map((tile) => (
                <TaskTile
                  key={tile}
                  selected={selected === tile}
                  onClick={() => {
                    setSelected(tile);
                    setTask('Open the document');
                  }}
                >
                  {tile}
                </TaskTile>
              ))}
            </div>
            {selected ? (
              <div className="mt-8">
                <input
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  placeholder="What's the smallest first step?"
                  className="w-full rounded-2xl border border-mora-border bg-mora-surface px-4 py-4 outline-none transition-colors focus:border-mora-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!task.trim()) return;
                    addTask(task);
                    setOnboardingStep(2);
                  }}
                  className="mt-4 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
                >
                  Let's go →
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {onboardingStep === 2 ? (
          <section className="text-center">
            <h1 className="heading-tight text-[28px] font-medium">Your first session is 5 minutes.</h1>
            <p className="mt-3 text-base leading-7 text-mora-muted">That's it. After 5 minutes you can stop. You probably won't.</p>
            <div className="mt-12 text-[72px] font-medium leading-none text-mora-accent">5:00</div>
            <p className="mt-5 text-sm text-mora-muted">Your session hasn't started yet.</p>
            <button
              type="button"
              onClick={() => navigate('/session', { state: { fromOnboarding: true } })}
              className="mt-10 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
            >
              Start the timer →
            </button>
          </section>
        ) : null}

        {onboardingStep === 3 ? (
          <section>
            <h1 className="heading-tight text-[28px] font-medium">Save your progress?</h1>
            <p className="mt-3 text-base leading-7 text-mora-muted">We'll remember your XP and wins across devices.</p>
            <div className="mt-8">
              <input
                value={email}
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email"
                className="w-full rounded-2xl border border-mora-border bg-mora-surface px-4 py-4 outline-none transition-colors focus:border-mora-accent"
              />
              <button
                type="button"
                onClick={completeSave}
                className="mt-4 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
              >
                Save progress
              </button>
              <p className="mt-4 text-center text-[13px] text-mora-muted">Or skip for now — we'll save locally.</p>
              <button
                type="button"
                onClick={completeSave}
                className="mx-auto mt-5 block text-sm text-mora-muted underline underline-offset-4"
              >
                Skip for now
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </Page>
  );
}
