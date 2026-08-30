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
import { useState } from 'react';

export function Header() {
  const { sidebarOpen, notifications, setCommandPaletteOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className={`app-header fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md transition-all duration-300 md:px-6 ${sidebarOpen ? 'md:left-64' : 'md:left-16'}`}
    >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             aria-label="Search workspace"
            placeholder="Search videos, ideas, keywords..."
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
             onClick={() => { setCommandPaletteOpen(true); setSearchOpen(true); }}
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
           {searchOpen && (
             <div className="absolute left-0 top-12 z-50 w-full rounded-2xl border border-border bg-card p-2 shadow-xl">
               <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Jump to</p>
               {[['/dashboard', 'Dashboard'], ['/create', 'New video'], ['/videos', 'Video manager'], ['/notifications', 'Notifications']].map(([href, label]) => <Link key={href} href={href} onClick={() => setSearchOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">{label}</Link>)}
             </div>
           )}
        </div>
      </div>
       {searchOpen && <button aria-label="Close search" className="fixed inset-0 z-20 cursor-default bg-transparent" onClick={() => setSearchOpen(false)} />}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          asChild
        >
             <Link href="/notifications" aria-label="Notifications">
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
          aria-label="Toggle dark mode"
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
