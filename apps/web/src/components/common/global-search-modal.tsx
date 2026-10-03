'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Search, MapPin, Truck, AlertTriangle, Building2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or props handled in parent
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const quickLinks = [
    { title: 'Command Centre Dashboard', category: 'Officer', path: '/officer', icon: Building2 },
    { title: 'Incident #INC-2026-089', category: 'Incidents', path: '/officer', icon: AlertTriangle },
    { title: 'Vehicle V-12 (Gajuwaka Route)', category: 'Fleet', path: '/supervisor', icon: Truck },
    { title: 'Ward 12 (Gajuwaka)', category: 'GIS Wards', path: '/supervisor', icon: MapPin },
    { title: 'Citizen Portal Home', category: 'Citizen', path: '/citizen', icon: User },
  ];

  const filtered = quickLinks.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, vehicles, wards, bins, or workers... (Ctrl+K)"
            className="w-full rounded-lg border border-input bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Quick Navigation & Assets
          </div>

          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              No matching municipal records found for &quot;{query}&quot;
            </p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(item.path);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary dark:bg-primary/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">Jump &rarr;</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
