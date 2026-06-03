import Page from '../components/Page.jsx';
import WinCard from '../components/WinCard.jsx';
import { useMora } from '../context/MoraContext.jsx';

export default function Feed() {
  const { wins, sessions } = useMora();
  const sortedWins = [...wins].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Page className="min-h-screen bg-mora-bg px-6 py-8 text-mora-text pb-app-nav">
      <main className="mx-auto max-w-[480px]">
        <h1 className="heading-tight text-2xl font-medium">Your wins</h1>
        <p className="mt-3 text-base text-mora-muted">Every time the work moved forward.</p>

        {sortedWins.length ? (
          <div className="mt-8 space-y-3">
            {sortedWins.map((win) => (
              <WinCard key={win.id} win={win} />
            ))}
          </div>
        ) : (
          <div className="mt-24 text-center">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mx-auto text-mora-muted">
              <circle cx="36" cy="36" r="20" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="36" cy="36" r="3" fill="currentColor" />
            </svg>
            <p className="mt-6 text-sm text-mora-muted">Your wins appear here after your first session.</p>
          </div>
        )}

        {sessions.length < 20 ? (
          <p className="mt-10 text-center text-sm text-mora-muted">
            Focus profile unlocks after {20 - sessions.length} more sessions.
          </p>
        ) : null}
      </main>
    </Page>
  );
}
