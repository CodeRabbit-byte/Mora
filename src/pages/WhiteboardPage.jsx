import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import SessionWhiteboard from '../components/SessionWhiteboard.jsx';
import StripeModal from '../components/StripeModal.jsx';
import { useMora } from '../context/MoraContext.jsx';

export default function WhiteboardPage() {
  const navigate = useNavigate();
  const { currentTask, subscribed } = useMora();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-mora-bg text-mora-text">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-mora-border bg-mora-surface px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-mora-border px-4 py-2 text-sm text-mora-muted transition-colors hover:border-mora-accent hover:text-mora-text"
        >
          <IconArrowLeft size={16} stroke={1.8} />
          Back to session
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium text-mora-text">
          {currentTask}
        </p>
        {/* Spacer keeps title centred when back button has text */}
        <div className="w-[148px] shrink-0" />
      </header>

      {/* Whiteboard — fills remaining height */}
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <SessionWhiteboard
          taskName={currentTask}
          subscribed={subscribed}
          onUpgrade={() => setShowUpgrade(true)}
          isFullscreen
        />
      </div>

      <StripeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        successRedirectTo="/whiteboard?stripe=success"
      />
    </div>
  );
}
