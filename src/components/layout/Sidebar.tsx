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
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold gradient-text">Smartyt</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-1 hover:bg-accent transition-colors"
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
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
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
        <div className="border-t border-border p-4">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">U</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Creator</p>
                <p className="text-xs text-muted-foreground truncate">Free Plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
