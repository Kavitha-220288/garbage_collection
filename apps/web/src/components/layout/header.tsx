'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LanguageSelector } from '@/components/common/language-selector';
import { NotificationsDrawer } from '@/components/common/notifications-drawer';
import { GlobalSearchModal } from '@/components/common/global-search-modal';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  ChevronDown,
  Menu,
  ShieldCheck,
  Building2,
  Truck,
  Users,
  Recycle,
  Settings,
  Eye,
  LogOut,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const roleOptions = [
    { role: 'Citizen Portal', path: '/citizen', icon: Users, badge: 'Lakshmi (Citizen)' },
    { role: 'Worker PWA', path: '/worker', icon: Truck, badge: 'Ravi (Driver/Worker)' },
    { role: 'Supervisor Console', path: '/supervisor', icon: ShieldCheck, badge: 'Anitha (Supervisor)' },
    { role: 'Command Centre', path: '/officer', icon: Building2, badge: 'Dr. Rao (Officer)' },
    { role: 'Public Dashboard', path: '/public', icon: Eye, badge: 'Public (Anonymized)' },
  ];


  const currentRole = roleOptions.find((r) => pathname.startsWith(r.path)) || roleOptions[3];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-indigo-100 dark:border-indigo-950 bg-white/95 dark:bg-slate-900/90 px-4 backdrop-blur-md sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/50 lg:hidden"
            aria-label="Toggle sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Role Shell Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/40 px-3.5 py-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-100 hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <currentRole.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">{currentRole.role}</span>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 sm:hidden">{currentRole.role.split(' ')[0]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </button>

          {isRoleOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsRoleOpen(false)} />
              <div className="absolute left-0 mt-2 z-50 w-72 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-indigo-100 dark:border-indigo-900 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Switch Active Portal Shell
                  </span>
                  <button
                    onClick={() => {
                      router.push('/login');
                      setIsRoleOpen(false);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    <KeyRound className="h-3 w-3" /> Login Hub
                  </button>
                </div>
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = pathname.startsWith(opt.path);
                  return (
                    <button
                      key={opt.path}
                      onClick={() => {
                        router.push(opt.path);
                        setIsRoleOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        <span>{opt.role}</span>
                      </div>
                      <span className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {opt.badge.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/30 px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-indigo-100/60 transition-colors"
          aria-label="Global Search"
        >
          <Search className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden md:inline font-medium">Search GIS & Incidents...</span>
        </button>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-2 text-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors shadow-2xs"
          title="Toggle Light / Dark Theme"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>

        {/* Notifications Drawer Toggle */}
        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-2 text-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors shadow-2xs"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-xs">
            3
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full border-2 border-indigo-400 p-1 hover:bg-indigo-50 transition-colors shadow-xs"
            aria-label="User Profile"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              KR
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 z-50 w-60 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="border-b border-emerald-100 dark:border-emerald-900 pb-2 px-2">
                  <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">Dr. K. V. Rao</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Chief Municipal Officer</p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Visakhapatnam Municipal Corp
                  </p>
                </div>
                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      router.push('/login');
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Switch Portal Login</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/login');
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
