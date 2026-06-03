import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconHome, IconList, IconPlayerPlay, IconUser } from '@tabler/icons-react';

const tabs = [
  { to: '/home', label: 'Home', icon: IconHome },
  { to: '/session', label: 'Start', icon: IconPlayerPlay },
  { to: '/feed', label: 'Wins', icon: IconList },
  { to: '/profile', label: 'Profile', icon: IconUser },
];

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (location.pathname === '/') {
    return (
      <header
        className={`fixed inset-x-0 top-0 z-40 h-14 bg-mora-bg/85 backdrop-blur transition-colors ${
          scrolled ? 'border-b border-mora-border' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
          <Link to="/" className="text-lg font-medium text-mora-text">
            Mora
          </Link>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-mora-muted transition-colors hover:text-mora-text">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => navigate('/start')}
              className="rounded-full bg-mora-accent px-5 py-2 text-sm font-medium text-mora-bg"
            >
              Get started — $15/yr
            </button>
          </div>
        </div>
      </header>
    );
  }

  if (location.pathname === '/start' || location.pathname === '/session' || location.pathname === '/whiteboard') {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-mora-border bg-mora-surface">
      <div className="mx-auto grid h-full max-w-md grid-cols-4">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
                active ? 'text-mora-accent' : 'text-mora-muted'
              }`}
            >
              <Icon size={21} stroke={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
