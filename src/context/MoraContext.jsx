import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mora_state';

const initialState = {
  sessions: [],
  totalXP: 0,
  wins: [],
  ideas: [],
  onboarded: false,
  subscribed: false,
  currentTask: 'Open the document',
  sessionMinutes: 5,
  tasks: [
    {
      id: 'task_default_open_document',
      name: 'Open the document',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  onboardingStep: 1,
  whiteboardNodes: [{ id: 'root', parentId: null, text: 'Open the document', x: 50, y: 50 }],
  whiteboardStickies: [],
};

const MoraContext = createContext(null);

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function hydrateState() {
  if (typeof window === 'undefined') return initialState;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    return { ...initialState, ...JSON.parse(saved) };
  } catch {
    return initialState;
  }
}

export function MoraProvider({ children }) {
  const [state, setState] = useState(hydrateState);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showToast = useCallback((message) => {
    const id = makeId('toast');
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2500);
  }, []);

  const addSession = useCallback((session) => {
    setState((current) => {
      const normalized = {
        id: makeId('session'),
        taskName: current.currentTask,
        duration: 5,
        date: new Date().toISOString(),
        xp: 10,
        ...session,
      };

      return {
        ...current,
        sessions: [...current.sessions, normalized],
        totalXP: current.totalXP + normalized.xp,
      };
    });
  }, []);

  const addWin = useCallback((win) => {
    setState((current) => ({
      ...current,
      wins: [
        ...current.wins,
        {
          id: makeId('win'),
          date: new Date().toISOString(),
          xp: 10,
          ...win,
        },
      ],
    }));
  }, []);

  const addIdea = useCallback((ideaText) => {
    const text = ideaText.trim();
    if (!text) return;

    setState((current) => ({
      ...current,
      ideas: [
        {
          id: makeId('idea'),
          text,
          date: new Date().toISOString(),
        },
        ...(current.ideas || []),
      ].slice(0, 12),
    }));
  }, []);

  const setOnboarded = useCallback((onboarded) => {
    setState((current) => ({ ...current, onboarded }));
  }, []);

  const setSubscribed = useCallback((subscribed) => {
    setState((current) => ({ ...current, subscribed }));
  }, []);

  const setCurrentTask = useCallback((currentTask) => {
    setState((current) => {
      const name = (currentTask || 'Open the document').trim() || 'Open the document';
      const taskExists = current.tasks.some((task) => task.name.toLowerCase() === name.toLowerCase());

      return {
        ...current,
        currentTask: name,
        tasks: taskExists
          ? current.tasks
          : [
              ...current.tasks,
              {
                id: makeId('task'),
                name,
                createdAt: new Date().toISOString(),
              },
            ],
      };
    });
  }, []);

  const setSessionMinutes = useCallback((sessionMinutes) => {
    const minutes = Math.min(60, Math.max(1, Number(sessionMinutes) || 5));
    setState((current) => ({ ...current, sessionMinutes: minutes }));
  }, []);

  const addTask = useCallback((taskName) => {
    const name = taskName.trim();
    if (!name) return;

    setState((current) => {
      const existing = current.tasks.find((task) => task.name.toLowerCase() === name.toLowerCase());

      if (existing) {
        return { ...current, currentTask: existing.name };
      }

      return {
        ...current,
        currentTask: name,
        tasks: [
          ...current.tasks,
          {
            id: makeId('task'),
            name,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  }, []);

  const setOnboardingStep = useCallback((onboardingStep) => {
    setState((current) => ({ ...current, onboardingStep }));
  }, []);

  const setWhiteboardNodes = useCallback((nodesOrUpdater) => {
    setState((current) => ({
      ...current,
      whiteboardNodes: typeof nodesOrUpdater === 'function'
        ? nodesOrUpdater(current.whiteboardNodes)
        : nodesOrUpdater,
    }));
  }, []);

  const setWhiteboardStickies = useCallback((stickiesOrUpdater) => {
    setState((current) => ({
      ...current,
      whiteboardStickies: typeof stickiesOrUpdater === 'function'
        ? stickiesOrUpdater(current.whiteboardStickies)
        : stickiesOrUpdater,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      toast,
      addSession,
      addWin,
      addIdea,
      setOnboarded,
      setSubscribed,
      setCurrentTask,
      setSessionMinutes,
      addTask,
      setOnboardingStep,
      showToast,
      setWhiteboardNodes,
      setWhiteboardStickies,
    }),
    [
      state,
      toast,
      addSession,
      addWin,
      addIdea,
      setOnboarded,
      setSubscribed,
      setCurrentTask,
      setSessionMinutes,
      addTask,
      setOnboardingStep,
      showToast,
      setWhiteboardNodes,
      setWhiteboardStickies,
    ],
  );

  return <MoraContext.Provider value={value}>{children}</MoraContext.Provider>;
}

export function useMora() {
  const context = useContext(MoraContext);
  if (!context) {
    throw new Error('useMora must be used within MoraProvider');
  }
  return context;
}
