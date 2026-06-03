import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconCheck, IconSparkles } from '@tabler/icons-react';
import Page from '../components/Page.jsx';
import StripeModal from '../components/StripeModal.jsx';
import WinCard from '../components/WinCard.jsx';
import XPBar from '../components/XPBar.jsx';
import { useMora } from '../context/MoraContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { sessions, totalXP, wins, ideas = [], currentTask, tasks, subscribed, setCurrentTask, addTask, addIdea } = useMora();
  const [editing, setEditing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [task, setTask] = useState(currentTask);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (!editing) setTask(currentTask);
  }, [currentTask, editing]);
  const [newIdea, setNewIdea] = useState('');
  const recentWins = [...wins].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentIdeas = ideas.slice(0, 4);
  const benefits = ['Custom timers', 'Image-rich project boards', 'Focus profile that deepens monthly'];

  const saveTask = (taskName) => {
    const trimmed = taskName.trim();
    if (!trimmed) {
      setTask(currentTask);
      setEditing(false);
      return;
    }
    addTask(trimmed);
    setTask(trimmed);
    setNewTask('');
    setEditing(false);
  };

  return (
    <Page className="min-h-screen bg-mora-bg px-6 py-8 text-mora-text pb-app-nav">
      <main className="mx-auto max-w-[480px]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Mora</h1>
          <div className="rounded-full bg-[#1A1F0F] px-4 py-2 text-sm font-medium text-mora-accent">⚡ {totalXP} XP</div>
        </div>

        <section className="mt-6 rounded-2xl border border-mora-border bg-mora-surface p-6">
          <p className="text-xs text-mora-muted">Today's task</p>
          {editing ? (
            <input
              autoFocus
              value={task}
              onChange={(event) => setTask(event.target.value)}
              onBlur={() => {
                saveTask(task);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  saveTask(task);
                }
              }}
              className="mt-3 w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 text-lg outline-none transition-colors focus:border-mora-accent"
            />
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="mt-3 block text-left text-lg text-mora-text">
              {currentTask}
            </button>
          )}
          <button type="button" onClick={() => setEditing(true)} className="mt-2 text-sm text-mora-muted">
            Tap to change task
          </button>

          <div className="mt-6 border-t border-mora-border pt-5">
            <p className="text-xs text-mora-muted">Saved tasks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tasks.map((savedTask) => {
                const active = savedTask.name === currentTask;
                return (
                  <button
                    key={savedTask.id}
                    type="button"
                    onClick={() => {
                      setCurrentTask(savedTask.name);
                      setTask(savedTask.name);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      active
                        ? 'border-mora-accent bg-[#1A1F0F] text-mora-accent'
                        : 'border-mora-border bg-transparent text-mora-muted hover:border-mora-accent hover:text-mora-text'
                    }`}
                  >
                    {savedTask.name}
                  </button>
                );
              })}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveTask(newTask);
              }}
            >
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add a custom task"
                className="min-w-0 flex-1 rounded-full border border-mora-border bg-mora-bg px-4 py-3 text-sm outline-none transition-colors focus:border-mora-accent"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full border border-mora-accent px-5 py-3 text-sm font-medium text-mora-accent"
              >
                Add
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => navigate('/session')}
            className="mt-6 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
          >
            Start session →
          </button>
        </section>

        <section className="mt-8">
          <div className="rounded-2xl border border-mora-border bg-mora-surface p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-[#1A1F0F] p-2 text-mora-accent">
                <IconSparkles size={18} stroke={1.8} />
              </div>
              <div>
                <p className="text-[13px] text-mora-muted">Idea garden</p>
                <h2 className="heading-tight mt-2 text-xl font-medium">Capture what's next.</h2>
                <p className="mt-2 text-sm leading-6 text-mora-muted">
                  Drop a loose thought here. When it's ready, turn it into a session.
                </p>
              </div>
            </div>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                addIdea(newIdea);
                setNewIdea('');
              }}
            >
              <input
                value={newIdea}
                onChange={(event) => setNewIdea(event.target.value)}
                placeholder="Capture an idea, question, or next angle"
                className="min-w-0 flex-1 rounded-full border border-mora-border bg-mora-bg px-4 py-3 text-sm outline-none transition-colors focus:border-mora-accent"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full border border-mora-accent px-5 py-3 text-sm font-medium text-mora-accent"
              >
                Save
              </button>
            </form>
            {recentIdeas.length ? (
              <div className="mt-4 space-y-2">
                {recentIdeas.map((idea) => (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => {
                      setCurrentTask(idea.text);
                      setTask(idea.text);
                      navigate('/session');
                    }}
                    className="w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 text-left text-sm leading-6 text-mora-text transition-colors hover:border-mora-accent"
                  >
                    {idea.text}
                    <span className="mt-1 block text-xs text-mora-muted">Start a session from this idea →</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-center text-sm text-mora-muted">Your ideas will gather here as you notice them.</p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[13px] text-mora-muted">Recent wins</p>
          {recentWins.length ? (
            <div className="-mx-6 mt-4 flex gap-3 overflow-x-auto px-6 pb-2">
              {recentWins.map((win) => (
                <WinCard key={win.id} win={win} compact />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-mora-muted">Your wins appear here after your first session.</p>
          )}
        </section>

        <section className="mt-8">
          <p className="mb-4 text-[13px] text-mora-muted">Progress</p>
          <XPBar sessions={sessions.length} />
          {sessions.length >= 20 ? (
            <Link
              to="/profile"
              className="mt-5 inline-flex rounded-full bg-mora-accent px-5 py-2.5 text-sm font-medium text-mora-bg"
            >
              Focus profile ready →
            </Link>
          ) : null}
        </section>

        <section
          className={`mt-8 rounded-2xl border ${
            subscribed ? 'border-mora-accent' : 'border-mora-border'
          } bg-mora-surface p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] text-mora-muted">Mora plus</p>
              <h2 className="heading-tight mt-2 text-xl font-medium">
                {subscribed ? 'Upgrade active' : 'Unlock the full workspace'}
              </h2>
            </div>
            {subscribed ? (
              <span className="rounded-full bg-[#1A1F0F] px-3 py-1 text-xs font-medium text-mora-accent">Active</span>
            ) : null}
          </div>
          <div className="mt-5 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm text-mora-text">
                <IconCheck size={16} stroke={2} className="shrink-0 text-mora-accent" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          {subscribed ? (
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="mt-6 w-full rounded-full border border-mora-accent px-6 py-4 text-sm font-medium text-mora-accent"
            >
              Use plus tools →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCheckout(true)}
              className="mt-6 w-full rounded-full bg-mora-accent px-6 py-4 text-sm font-medium text-mora-bg"
            >
              Get full access — $15/yr
            </button>
          )}
        </section>
      </main>
      <StripeModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        successRedirectTo="/home?stripe=success"
      />
    </Page>
  );
}
