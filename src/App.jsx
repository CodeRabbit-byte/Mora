import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MoraProvider, useMora } from './context/MoraContext.jsx';
import Nav from './components/Nav.jsx';
import Landing from './pages/Landing.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Session from './pages/Session.jsx';
import Feed from './pages/Feed.jsx';
import Profile from './pages/Profile.jsx';
import WhiteboardPage from './pages/WhiteboardPage.jsx';

function ProtectedRoute({ children }) {
  const { onboarded } = useMora();
  return onboarded ? children : <Navigate to="/start" replace />;
}

function ToastLayer() {
  const { toast } = useMora();

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed left-1/2 z-50 -translate-x-1/2 rounded-full bg-mora-border px-6 py-3 text-sm text-mora-text"
          style={{ bottom: 80 }}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StripeReturnHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSubscribed, showToast } = useMora();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('stripe') !== 'success') return;

    setSubscribed(true);
    showToast("You're in - Mora is yours.");
    params.delete('stripe');
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  }, [location.pathname, location.search, navigate, setSubscribed, showToast]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <StripeReturnHandler />
      <Nav />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Onboarding />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/session" element={<Session />} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/whiteboard"
            element={
              <ProtectedRoute>
                <WhiteboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <ToastLayer />
    </>
  );
}

export default function App() {
  return (
    <MoraProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </MoraProvider>
  );
}
