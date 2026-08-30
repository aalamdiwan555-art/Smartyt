import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarOpen: boolean;
  activeChannel: string | null;
  theme: 'light' | 'dark' | 'system';
  commandPaletteOpen: boolean;
  notifications: number;
  setSidebarOpen: (open: boolean) => void;
  setActiveChannel: (channelId: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeChannel: null,
      theme: 'system',
      commandPaletteOpen: false,
      notifications: 0,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveChannel: (channelId) => set({ activeChannel: channelId }),
      setTheme: (theme) => set({ theme }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNotifications: (count) => set({ notifications: count }),
    }),
    {
      name: 'smartyt-store',
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen, 
        activeChannel: state.activeChannel,
        theme: state.theme,
      }),
    }
  )
);

interface AIState {
  isGenerating: boolean;
  generationType: string | null;
  lastResult: any;
  setIsGenerating: (generating: boolean) => void;
  setGenerationType: (type: string | null) => void;
  setLastResult: (result: any) => void;
}

export const useAIStore = create<AIState>()((set) => ({
  isGenerating: false,
  generationType: null,
  lastResult: null,
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationType: (type) => set({ generationType: type }),
  setLastResult: (result) => set({ lastResult: result }),
}));
