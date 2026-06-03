import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconLock } from '@tabler/icons-react';
import Page from '../components/Page.jsx';
import FocusProfile from '../components/FocusProfile.jsx';
import StripeModal from '../components/StripeModal.jsx';
import { useMora } from '../context/MoraContext.jsx';

const benefits = ['Custom 1-60 minute timers', 'Image uploads on the session board', 'Profile insights that keep growing'];

export default function Profile() {
  const navigate = useNavigate();
  const { sessions, subscribed } = useMora();
  const [showModal, setShowModal] = useState(false);

  const SubscriptionCard = ({ compact = false }) => (
    <article
      className={`mt-8 rounded-2xl border ${
        subscribed ? 'border-mora-accent' : 'border-mora-border'
      } bg-mora-surface p-6 text-left`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="heading-tight text-lg font-medium">{subscribed ? 'Mora plus is active' : 'Upgrade Mora'}</h2>
          <p className="mt-2 text-sm leading-6 text-mora-muted">
            {subscribed
              ? 'Your sessions now have the full project toolkit.'
              : '$15/year. Your focus profile deepens every month you keep going.'}
          </p>
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
      {!subscribed ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-6 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
        >
          Upgrade — $15/yr
        </button>
      ) : compact ? null : (
        <p className="mt-5 text-sm text-mora-muted">Open a session to use custom timers and image uploads.</p>
      )}
    </article>
  );

  return (
    <Page className="min-h-screen bg-mora-bg px-6 py-8 text-mora-text pb-app-nav">
      <main className="mx-auto max-w-[480px]">
        {sessions.length < 20 ? (
          <section className="text-center">
            <h1 className="heading-tight text-left text-2xl font-medium">Focus profile</h1>
            <div className="mt-20 flex justify-center">
              <IconLock size={48} stroke={1.8} className="text-mora-muted" />
            </div>
            <p className="mx-auto mt-6 max-w-xs text-base leading-7 text-mora-muted">Your profile unlocks after 20 sessions.</p>
            <p className="mt-6 font-medium text-mora-accent">{sessions.length} / 20 sessions</p>
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="mt-8 w-full rounded-full bg-mora-accent px-6 py-4 font-medium text-mora-bg"
            >
              Start a session →
            </button>
            <SubscriptionCard />
          </section>
        ) : (
          <section>
            <h1 className="heading-tight text-2xl font-medium">Your focus profile</h1>
            <p className="mt-3 text-sm text-mora-muted">Early signals — updated as you keep going.</p>
            <FocusProfile />
            <SubscriptionCard compact={subscribed} />
          </section>
        )}
      </main>

      <StripeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        successRedirectTo="/profile?stripe=success"
      />
    </Page>
  );
}
