'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  Lightbulb,
  Search,
  FileText,
  Type,
  AlignLeft,
  Image,
  Upload,
  Calendar,
  Video,
  BarChart3,
  Tv,
  FlaskConical,
  Wand2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Create', href: '/create', icon: PlusCircle },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'SEO', href: '/seo', icon: Search },
  { name: 'Keywords', href: '/keywords', icon: FileText },
  { name: 'Titles', href: '/titles', icon: Type },
  { name: 'Descriptions', href: '/descriptions', icon: AlignLeft },
  { name: 'Thumbnails', href: '/thumbnails', icon: Image },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Channel', href: '/channel', icon: Tv },
  { name: 'Research', href: '/research', icon: FlaskConical },
  { name: 'AI Studio', href: '/ai-studio', icon: Wand2 },
  { name: 'Tools', href: '/tools', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-[100dvh] bg-foreground text-background shadow-xl transition-all duration-300 ease-in-out md:block',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-background/10 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
               <span className="font-display text-lg font-semibold">smartyt<span className="text-secondary">.</span></span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
             className="rounded-md p-1 text-background/60 transition-colors hover:bg-background/10 hover:text-background"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                       isActive
                         ? 'bg-primary text-primary-foreground shadow-sm'
                         : 'text-background/60 hover:bg-background/10 hover:text-background',
                      !sidebarOpen && 'justify-center px-2'
                    )}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-background/10 p-4">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
               <span className="text-xs font-bold text-secondary-foreground">C</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                 <p className="truncate text-sm font-medium">Creator</p>
                 <p className="truncate text-xs text-background/50">Free plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
