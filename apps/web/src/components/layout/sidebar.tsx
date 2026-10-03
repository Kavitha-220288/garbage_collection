'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OriginBadge } from '@/components/ui/origin-badge';
import {
  LayoutDashboard,
  AlertTriangle,
  Truck,
  MapPin,
  Recycle,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Boxes,
  ShieldCheck,
  Calendar,
  Users,
  Award,
  Sparkles,
  LogOut,
  UserCheck,
  ChevronDown,
  Building2,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({ isCollapsed, onToggleCollapse, className = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current active persona shell
  const getCurrentRole = () => {
    if (pathname.startsWith('/citizen')) return { title: 'Citizen Portal', role: 'Citizen User', user: 'Lakshmi S.', avatar: 'LS', bg: 'bg-indigo-600' };
    if (pathname.startsWith('/worker')) return { title: 'Worker PWA', role: 'Driver & Crew', user: 'Ravi Kumar', avatar: 'RK', bg: 'bg-violet-600' };
    if (pathname.startsWith('/supervisor')) return { title: 'Supervisor Console', role: 'Ward Supervisor', user: 'Anitha R.', avatar: 'AR', bg: 'bg-purple-700' };
    if (pathname.startsWith('/public')) return { title: 'Public Transparency', role: 'Guest / Resident', user: 'Public View', avatar: 'PV', bg: 'bg-indigo-700' };
    return { title: 'Command Centre', role: 'Municipal Officer', user: 'Dr. K. V. Rao', avatar: 'KR', bg: 'bg-indigo-600' };
  };

  const persona = getCurrentRole();

  // Navigation structure organized by sections
  const getNavSections = () => {
    if (pathname.startsWith('/citizen')) {
      return [
        {
          title: 'Citizen Hub',
          items: [
            { label: 'Citizen Home', href: '/citizen', icon: LayoutDashboard },
            { label: 'Report New Issue', href: '/citizen/report', icon: AlertTriangle, badge: 'Quick GPS' },
            { label: 'Track Complaints', href: '/citizen#track', icon: Boxes },
            { label: 'Live Vehicle Map', href: '/citizen#map', icon: Truck },
            { label: 'Rate Our Work', href: '/citizen#rating', icon: Award },
          ],
        },
      ];
    }

    if (pathname.startsWith('/worker')) {
      return [
        {
          title: 'Shift Operations',
          items: [
            { label: 'Shift Overview', href: '/worker', icon: LayoutDashboard },
            { label: 'GPS Route Guidance', href: '/worker#route', icon: Truck },
            { label: 'Evidence Upload', href: '/worker#evidence', icon: ShieldCheck, badge: 'EXIF' },
            { label: 'Emergency SOS', href: '/worker#safety', icon: AlertTriangle, badge: 'SOS' },
          ],
        },
      ];
    }

    if (pathname.startsWith('/supervisor')) {
      return [
        {
          title: 'Ward Operations',
          items: [
            { label: 'Supervisor Console', href: '/supervisor', icon: LayoutDashboard },
            { label: 'Ward Fleet & Map', href: '/supervisor#fleet', icon: Truck },
            { label: 'Evidence Approvals', href: '/supervisor#verify', icon: ShieldCheck, badge: '3 Pending' },
            { label: 'Missed Pickup Alerts', href: '/supervisor#missed', icon: Calendar },
          ],
        },
      ];
    }

    if (pathname.startsWith('/public')) {
      return [
        {
          title: 'Public Portal',
          items: [
            { label: 'Public Transparency', href: '/public', icon: LayoutDashboard },
            { label: 'City Cleanliness Score', href: '/public#score', icon: Award },
            { label: 'Ward Leaderboards', href: '/public#wards', icon: MapPin },
          ],
        },
      ];
    }

    if (pathname.startsWith('/admin')) {
      return [
        {
          title: 'Admin Console',
          items: [
            { label: 'System Overview', href: '/admin', icon: Settings },
            { label: 'Command Centre', href: '/officer', icon: LayoutDashboard },
            { label: 'MRF Operations', href: '/mrf', icon: Recycle },
          ],
        },
      ];
    }

    if (pathname.startsWith('/mrf')) {
      return [
        {
          title: 'MRF Facility',
          items: [
            { label: 'MRF Dashboard', href: '/mrf', icon: Recycle },
            { label: 'Command Centre', href: '/officer', icon: LayoutDashboard },
            { label: 'Admin Settings', href: '/admin', icon: Settings },
          ],
        },
      ];
    }

    // Default: Officer Command Centre
    return [
      {
        title: 'Municipal Command',
        items: [
          { label: 'Command Overview', href: '/officer', icon: LayoutDashboard },
          { label: 'GIS Waste Map', href: '/officer#gis', icon: MapPin },
          { label: 'Guarded Incidents', href: '/officer/incidents', icon: AlertTriangle, badge: 'SLA' },
          { label: 'Fleet & Route Intel', href: '/officer#fleet', icon: Truck },
          { label: 'AI Waste Intelligence', href: '/officer#wie', icon: Sparkles },
          { label: 'Admin Settings', href: '/admin', icon: Settings },
          { label: 'MRF Facility', href: '/mrf', icon: Recycle },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-indigo-100 dark:border-indigo-950 bg-card transition-all duration-300 lg:static indigo-shadow-md ${
        isCollapsed ? 'w-16' : 'w-68'
      } ${className}`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-indigo-100 dark:border-indigo-950 px-4 bg-indigo-500/5">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-black text-sm tracking-wider shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/20">
              SS
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-50">Swachh Setu</h1>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Visakhapatnam Municipal Zone
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-black text-sm shadow-md">
            SS
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50 transition-colors lg:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Active User Persona Banner */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50/40 dark:from-indigo-950/40 dark:to-slate-900 p-3 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${persona.bg} text-white text-[11px] font-bold shadow-xs`}>
                {persona.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{persona.user}</p>
                <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">{persona.role}</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" title="Authenticated Session" />
          </div>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-indigo-950 px-2 py-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
          >
            <UserCheck className="h-3 w-3" /> Switch Portal Login
          </Link>
        </div>
      )}

      {/* Structured Categorized Menu Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                <Layers className="h-3 w-3 text-indigo-500" /> {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/officer' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 border-l-4 border-indigo-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:text-indigo-800 dark:hover:text-indigo-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Navigation Controls */}
      <div className="border-t border-indigo-100 dark:border-indigo-950 p-3 space-y-2 bg-indigo-500/5">
        <Link
          href="/login"
          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Sign Out / Change Portal"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          {!isCollapsed && <span>Sign Out / Portal Selection</span>}
        </Link>
      </div>
    </aside>
  );
}

