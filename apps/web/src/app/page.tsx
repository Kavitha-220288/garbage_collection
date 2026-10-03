'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Truck,
  Users,
  Eye,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Shield,
  Phone,
} from 'lucide-react';

interface PortalOption {
  id: string;
  roleTitle: string;
  user: string;
  defaultEmail: string;
  path: string;
  icon: any;
  badge: string;
  description: string;
  color: string;
}

export default function Home() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const portals: PortalOption[] = [
    {
      id: 'citizen',
      roleTitle: 'Resident / Citizen Portal',
      user: 'Lakshmi S. (Citizen)',
      defaultEmail: 'citizen.lakshmi@ghmc.gov.in',
      path: '/citizen',
      icon: Users,
      badge: 'Multilingual Voice',
      description: 'Report waste in Telugu, Hindi, or English + Photo upload & real-time resolution tracking.',
      color: 'from-indigo-600 to-violet-700',
    },
    {
      id: 'worker',
      roleTitle: 'Sanitation Driver & Worker PWA',
      user: 'Ravi Kumar (Driver V-03)',
      defaultEmail: 'driver.v03@smartwaste360.gov.in',
      path: '/worker',
      icon: Truck,
      badge: 'Auto-Task Dispatch',
      description: 'Receive automatic pickup tasks, GPS turn-by-turn route & After-Cleaning photo upload.',
      color: 'from-indigo-700 to-indigo-800',
    },
    {
      id: 'officer',
      roleTitle: 'Municipal Command Centre',
      user: 'Dr. K. V. Rao (Chief Officer)',
      defaultEmail: 'officer.hq@smartwaste360.gov.in',
      path: '/officer',
      icon: Building2,
      badge: 'Command Control',
      description: 'Live GIS vehicle map, auto-clustering, SLA clock & AI Before/After verification.',
      color: 'from-violet-700 to-indigo-900',
    },
  ];

  const [selectedPortal, setSelectedPortal] = useState<PortalOption>(portals[0]);
  const [email, setEmail] = useState(portals[0].defaultEmail);
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState(portals[0].user);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePortalSelect = (portal: PortalOption) => {
    setSelectedPortal(portal);
    setEmail(portal.defaultEmail);
    setFullName(portal.user);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push(selectedPortal.path);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f4f6ff] text-slate-900 flex flex-col font-sans">
      {/* Brand Header */}
      <header className="border-b border-indigo-100 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-base shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/20">
            SS
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-indigo-950">Swachh Setu</h1>
            <p className="text-[10px] font-semibold text-indigo-600">
              Greater Hyderabad Municipal Corporation (GHMC) &bull; AI-Powered Sanitation Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/public"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <Eye className="h-4 w-4 text-indigo-600" /> Public Transparency Portal
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Portal Selection Gateway */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-indigo-950 tracking-tight flex items-center gap-2">
                <span>Municipal Portal Logins</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                  Official Portal
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Select your designated role below to access the Citizen, Worker PWA, or Municipal Command workspace.
              </p>
            </div>

            {/* Sign In vs Sign Up Tabs */}
            <div className="flex items-center rounded-2xl border border-indigo-200 bg-indigo-50/80 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-800 hover:text-indigo-950'
                }`}
              >
                <LogIn className="h-4 w-4" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-800 hover:text-indigo-950'
                }`}
              >
                <UserPlus className="h-4 w-4" /> Register
              </button>
            </div>
          </div>

          {/* Grid Layout: 3 Portal Cards (Left 7 cols) + Login Box (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 3 Portal Selection Cards */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-indigo-600" /> Select Role Portal
                </h3>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                  Municipal Portals
                </span>
              </div>

              <div className="space-y-3">
                {portals.map((portal) => {
                  const Icon = portal.icon;
                  const isSelected = selectedPortal.id === portal.id;
                  return (
                    <button
                      type="button"
                      key={portal.id}
                      onClick={() => handlePortalSelect(portal)}
                      className={`w-full rounded-2xl p-4 text-left transition-all relative flex flex-col justify-between border ${
                        isSelected
                          ? 'border-indigo-500 bg-white ring-2 ring-indigo-500/30 shadow-md'
                          : 'border-indigo-100 bg-white/80 hover:bg-indigo-50/40 hover:border-indigo-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${portal.color} text-white shadow-sm`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{portal.roleTitle}</p>
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                              {portal.badge}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {portal.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{portal.user}</span>
                        <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {isSelected ? 'Selected' : 'Select'} <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sign In / Register Box */}
            <div className="lg:col-span-5 rounded-3xl border border-indigo-200 bg-white p-6 shadow-xl space-y-5">
              <div className="border-b border-indigo-100 pb-3 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${selectedPortal.color} text-white`}>
                  <selectedPortal.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {authMode === 'signin' ? 'Sign In to Portal' : 'Create Account'}
                  </h3>
                  <p className="text-[11px] font-semibold text-indigo-600">
                    {selectedPortal.roleTitle}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-600" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-indigo-200 bg-indigo-50/20 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-indigo-600" /> Mobile Number
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-indigo-200 bg-indigo-50/20 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-600" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-indigo-200 bg-indigo-50/20 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-indigo-600" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-indigo-200 bg-indigo-50/20 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Entering Workspace...</span>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Enter {selectedPortal.roleTitle}
                    </>
                  )}
                </button>
              </form>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                <p className="text-[11px] text-slate-600 font-medium">
                  Official Municipal Credentials & Access Point
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-100 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Swachh Setu &copy; 2026 Greater Hyderabad Municipal Corporation (GHMC) &bull; Smart Sanitation Operations
      </footer>
    </div>
  );
}
