import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconCircleCheck, IconLock } from '@tabler/icons-react';
import Page from '../components/Page.jsx';
import FocusScreenTools from '../components/FocusScreenTools.jsx';
import SessionWhiteboard from '../components/SessionWhiteboard.jsx';
import StripeModal from '../components/StripeModal.jsx';
import { useMora } from '../context/MoraContext.jsx';

const FREE_SESSION_MINUTES = 5;
const SUBSCRIBED_PRESETS = [5, 10, 15, 25];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentTask,
    sessions,
    totalXP,
    ideas = [],
    subscribed,
    sessionMinutes,
    onboarded,
    onboardingStep,
    addSession,
    addWin,
    setSessionMinutes,
    setOnboardingStep,
  } = useMora();
  const activeMinutes = subscribed ? sessionMinutes : FREE_SESSION_MINUTES;
  const sessionSeconds = activeMinutes * 60;
  const [mode, setMode] = useState('pre');
  const [remaining, setRemaining] = useState(sessionSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [extensions, setExtensions] = useState(0);
  const [pendingExtensions, setPendingExtensions] = useState(0);
  const [earnedXP, setEarnedXP] = useState(10);
  const [displayXP, setDisplayXP] = useState(0);
  const [finalTotalXP, setFinalTotalXP] = useState(totalXP);
  const [profileReady, setProfileReady] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [focusToolsOpen, setFocusToolsOpen] = useState(false);
  const completedRef = useRef(false);
  const remainingRef = useRef(sessionSeconds);
  const elapsedRef = useRef(0);
  const extensionsRef = useRef(0);
  const pendingExtensionsRef = useRef(0);
  const extensionStartedAtRef = useRef(null);
  const totalXPRef = useRef(totalXP);
  const sessionsRef = useRef(sessions);
  const currentTaskRef = useRef(currentTask);
  const fromOnboarding = useRef(
    !!(location.state?.fromOnboarding || (!onboarded && onboardingStep === 2))
  ).current;

  useEffect(() => {
    if (mode !== 'pre') return;
    remainingRef.current = sessionSeconds;
    setRemaining(sessionSeconds);
  }, [mode, sessionSeconds]);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    extensionsRef.current = extensions;
  }, [extensions]);

  useEffect(() => {
    pendingExtensionsRef.current = pendingExtensions;
  }, [pendingExtensions]);

  useEffect(() => { totalXPRef.current = totalXP; }, [totalXP]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);
  useEffect(() => { currentTaskRef.current = currentTask; }, [currentTask]);

  useEffect(() => {
    if (location.state?.fromOnboarding) {
      navigate(location.pathname, { replace: true, state: { ...location.state, fromOnboarding: undefined } });
    }
  }, []);

  useEffect(() => {
    if (mode !== 'active') return undefined;
    const timer = window.setInterval(() => {
      if (remainingRef.current <= 1) {
        window.clearInterval(timer);
        remainingRef.current = 0;
        setRemaining(0);
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        completeSession();
        return;
      }

      remainingRef.current -= 1;
      setRemaining(remainingRef.current);
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'complete') return undefined;
    let current = 0;
    const increment = Math.max(1, Math.ceil(earnedXP / 20));
    const timer = window.setInterval(() => {
      current = Math.min(earnedXP, current + increment);
      setDisplayXP(current);
      if (current >= earnedXP) window.clearInterval(timer);
    }, 40);
    return () => window.clearInterval(timer);
  }, [earnedXP, mode]);

  if (!onboarded && !fromOnboarding) {
    return <Navigate to="/start" replace />;
  }

  function completeSession() {
    if (completedRef.current) return;
    completedRef.current = true;
    const completedPendingExtension =
      pendingExtensionsRef.current > 0 &&
      extensionStartedAtRef.current !== null &&
      elapsedRef.current - extensionStartedAtRef.current >= sessionSeconds;
    const completedExtensions =
      extensionsRef.current + (completedPendingExtension ? pendingExtensionsRef.current : 0);
    const xp = 10 + completedExtensions * 5;
    const duration = Math.max(1, Math.round(elapsedRef.current / 60));
    const date = new Date().toISOString();
    const task = currentTaskRef.current;
    setEarnedXP(xp);
    setFinalTotalXP(totalXPRef.current + xp);
    setProfileReady(sessionsRef.current.length + 1 === 20);
    addSession({ taskName: task, duration, date, xp });
    addWin({ text: `Showed up for ${task}`, date, xp });
    setMode('complete');
  }

  function resetSession() {
    completedRef.current = false;
    setMode('pre');
    remainingRef.current = sessionSeconds;
    setRemaining(sessionSeconds);
    setElapsed(0);
    setExtensions(0);
    setPendingExtensions(0);
    extensionStartedAtRef.current = null;
    setEarnedXP(10);
    setDisplayXP(0);
    setFinalTotalXP(totalXP);
    setProfileReady(false);
  }

  const progress = ((sessionSeconds - remaining) / sessionSeconds) * 100;

  return (
    <Page className="min-h-screen bg-mora-bg px-6 text-mora-text">
      <main
        className={`mx-auto flex min-h-screen flex-col items-center justify-center text-center ${
          mode === 'active' ? 'max-w-[860px] py-8' : 'max-w-[480px]'
        }`}
      >
        {mode === 'pre' ? (
          <section className="w-full">
            <p className="text-lg text-mora-muted">{currentTask}</p>
            <div className="mt-8 text-[80px] font-medium leading-none text-mora-accent">{formatTime(remaining)}</div>
            <p className="mt-6 text-base text-mora-muted">Ready when you are</p>

            <div className="mt-8 rounded-2xl border border-mora-border bg-mora-surface p-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-mora-muted">Session length</p>
                  <p className="mt-1 text-sm text-mora-text">
                    {subscribed ? 'Custom sessions are unlocked' : 'Unlock longer sessions after upgrading'}
                  </p>
                </div>
                {!subscribed ? <IconLock size={18} stroke={1.8} className="text-mora-muted" /> : null}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {SUBSCRIBED_PRESETS.map((minutes) => {
                  const disabled = !subscribed && minutes !== FREE_SESSION_MINUTES;
                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => {
                        if (disabled) {
                          setShowUpgradeModal(true);
                          return;
                        }
                        setSessionMinutes(minutes);
                      }}
                      className={`rounded-full border px-3 py-2 text-sm ${
                        activeMinutes === minutes
                          ? 'border-mora-accent bg-[#1A1F0F] text-mora-accent'
                          : 'border-mora-border text-mora-muted'
                      }`}
                    >
                      {minutes}m
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={activeMinutes}
                  disabled={!subscribed}
                  onChange={(event) => setSessionMinutes(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-mora-border bg-mora-bg px-4 py-3 text-sm outline-none transition-colors focus:border-mora-accent disabled:text-mora-muted"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!subscribed) {
                      setShowUpgradeModal(true);
                    }
                  }}
                  className="rounded-full border border-mora-accent px-5 py-3 text-sm font-medium text-mora-accent"
                >
                  {subscribed ? 'Set' : 'Upgrade'}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('active')}
              className="mt-10 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
            >
              begin
            </button>
          </section>
        ) : null}

        {mode === 'active' ? (
          <section className="w-full">
            <div className="text-[80px] font-medium leading-none text-mora-accent">{formatTime(remaining)}</div>
            <p className="mt-6 text-base text-mora-muted">{currentTask}</p>
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-mora-border">
              <div className="h-full rounded-full bg-mora-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={completeSession}
                className="rounded-full border border-mora-border bg-transparent px-5 py-4 text-sm font-medium text-mora-text"
              >
                I'm done
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingExtensions((n) => n + 1);
                  extensionStartedAtRef.current = elapsedRef.current;
                  remainingRef.current = sessionSeconds;
                  setRemaining(sessionSeconds);
                }}
                className="rounded-full border border-mora-accent bg-transparent px-5 py-4 text-sm font-medium text-mora-accent"
              >
                Keep going +{activeMinutes} min
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFocusToolsOpen((value) => !value)}
              className="mx-auto mt-4 block rounded-full border border-mora-border px-4 py-2 text-xs font-medium text-mora-muted"
            >
              {focusToolsOpen ? 'Focus tools ↑' : 'Focus tools ↓'}
            </button>
            {focusToolsOpen ? (
              <motion.div initial={{ height: 0, overflow: 'hidden' }} animate={{ height: 'auto' }}>
                <FocusScreenTools taskName={currentTask} remaining={remaining} ideas={ideas} />
              </motion.div>
            ) : null}
            <SessionWhiteboard
              taskName={currentTask}
              subscribed={subscribed}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </section>
        ) : null}

        {mode === 'complete' ? (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {fromOnboarding ? (
              <div className="rounded-2xl border border-mora-border bg-mora-surface p-8">
                <IconCircleCheck className="mx-auto text-mora-accent" size={48} stroke={1.8} />
                <h1 className="heading-tight mt-6 text-[32px] font-medium">Session complete.</h1>
                <div className="mt-6 text-5xl font-medium text-mora-accent">+{displayXP} XP</div>
                <p className="mt-5 text-base text-mora-muted">Total XP so far: {finalTotalXP}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStep(3);
                    navigate('/start');
                  }}
                  className="mt-8 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
                >
                  Continue →
                </button>
              </div>
            ) : (
              <>
                <IconCircleCheck className="mx-auto text-mora-accent" size={48} stroke={1.8} />
                <h1 className="heading-tight mt-6 text-[32px] font-medium">Session complete.</h1>
                <div className="mt-6 text-5xl font-medium text-mora-accent">+{displayXP} XP</div>
                <p className="mt-5 text-base text-mora-muted">Total XP so far: {finalTotalXP}</p>
                {profileReady ? (
                  <div className="mt-8 rounded-2xl border border-mora-accent bg-mora-surface p-6">
                    <h2 className="heading-tight text-xl font-medium">Your focus profile is ready.</h2>
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="mt-5 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
                    >
                      View profile →
                    </button>
                  </div>
                ) : (
                  <div className="mt-10 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={resetSession}
                      className="rounded-full bg-mora-accent px-5 py-4 text-sm font-medium text-mora-bg"
                    >
                      Start another
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/home')}
                      className="rounded-full border border-mora-border bg-transparent px-5 py-4 text-sm font-medium text-mora-text"
                    >
                      Done for now
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.section>
        ) : null}
      </main>
      <StripeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        successRedirectTo="/session?stripe=success"
      />
    </Page>
  );
}
