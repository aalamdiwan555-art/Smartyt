'use client';

import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Search,
  Command,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function Header() {
  const { sidebarOpen, notifications, setCommandPaletteOpen } = useAppStore();
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 transition-all duration-300"
      style={{ left: sidebarOpen ? '16rem' : '4rem' }}
    >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos, ideas, keywords..."
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            onClick={() => setCommandPaletteOpen(true)}
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          asChild
        >
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
