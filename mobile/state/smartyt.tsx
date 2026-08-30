import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Idea = {
  id: string;
  title: string;
  angle: string;
  score: number;
  status: 'ready' | 'draft' | 'published';
  saved: boolean;
};

export type Draft = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  status: 'Draft' | 'Scheduled' | 'Published';
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export type CreatorProfile = {
  creatorName: string;
  handle: string;
  audience: string;
  language: string;
  topics: string[];
};

type SmartytState = {
  ideas: Idea[];
  drafts: Draft[];
  notifications: NotificationItem[];
  profile: CreatorProfile;
  hasOnboarded: boolean;
};

type SmartytContextValue = SmartytState & {
  hydrated: boolean;
  addIdea: (idea: Omit<Idea, 'id' | 'saved'>) => void;
  toggleIdeaSaved: (id: string) => void;
  addDraft: (draft: Omit<Draft, 'id' | 'updatedAt'>) => void;
  markNotificationRead: (id: string) => void;
  completeOnboarding: (profile: CreatorProfile) => void;
  updateProfile: (profile: CreatorProfile) => void;
};

const STORAGE_KEY = 'smartyt-mobile-state';

const initialState: SmartytState = {
  ideas: [
    {
      id: 'idea-1',
      title: 'The 5-minute workflow that makes every video sharper',
      angle: 'A practical before-and-after system for creators who want more signal and less editing chaos.',
      score: 92,
      status: 'ready',
      saved: true,
    },
    {
      id: 'idea-2',
      title: 'I tested 12 hooks on one audience',
      angle: 'Turn one topic into a repeatable hook library with a clear learning loop.',
      score: 86,
      status: 'draft',
      saved: false,
    },
    {
      id: 'idea-3',
      title: 'Why your good videos stop growing',
      angle: 'A diagnostic story about packaging, retention, and the first 30 seconds.',
      score: 79,
      status: 'published',
      saved: false,
    },
  ],
  drafts: [
    { id: 'draft-1', title: 'The 5-minute workflow that makes every video sharper', type: 'Long form', updatedAt: 'Today, 9:42 AM', status: 'Draft' },
    { id: 'draft-2', title: '3 hooks for your next tutorial', type: 'Shorts', updatedAt: 'Yesterday', status: 'Scheduled' },
  ],
  notifications: [
    { id: 'notification-1', title: 'Your weekly signal is ready', body: 'Smartyt found 4 topics gaining momentum in your niche.', time: '12 min ago', read: false },
    { id: 'notification-2', title: 'Scheduled upload in 2 days', body: 'Your short about creator systems is queued for Tuesday at 6:00 PM.', time: 'Yesterday', read: false },
    { id: 'notification-3', title: 'SEO score improved', body: 'Your latest draft moved from 68 to 84 after the title refresh.', time: '2 days ago', read: true },
  ],
  profile: {
    creatorName: 'Aarav',
    handle: '@aaravcreates',
    audience: 'Creators and indie builders',
    language: 'English',
    topics: ['Creator systems', 'AI tools', 'Productivity'],
  },
  hasOnboarded: true,
};

const SmartytContext = createContext<SmartytContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SmartytProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SmartytState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            setState({ ...initialState, ...JSON.parse(stored) });
          } catch {
            setState(initialState);
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
    }
  }, [hydrated, state]);

  const value = useMemo<SmartytContextValue>(
    () => ({
      ...state,
      hydrated,
      addIdea: (idea) => setState((current) => ({ ...current, ideas: [{ ...idea, id: makeId('idea'), saved: false }, ...current.ideas] })),
      toggleIdeaSaved: (id) => setState((current) => ({ ...current, ideas: current.ideas.map((idea) => (idea.id === id ? { ...idea, saved: !idea.saved } : idea)) })),
      addDraft: (draft) => setState((current) => ({ ...current, drafts: [{ ...draft, id: makeId('draft'), updatedAt: 'Just now' }, ...current.drafts] })),
      markNotificationRead: (id) => setState((current) => ({ ...current, notifications: current.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)) })),
      completeOnboarding: (profile) => setState((current) => ({ ...current, profile, hasOnboarded: true })),
      updateProfile: (profile) => setState((current) => ({ ...current, profile })),
    }),
    [hydrated, state],
  );

  return <SmartytContext.Provider value={value}>{children}</SmartytContext.Provider>;
}

export function useSmartyt() {
  const context = useContext(SmartytContext);
  if (!context) throw new Error('useSmartyt must be used within SmartytProvider');
  return context;
}