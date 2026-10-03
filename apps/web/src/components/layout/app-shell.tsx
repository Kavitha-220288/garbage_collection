'use client';

import React, { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <Sidebar
            isCollapsed={false}
            onToggleCollapse={() => setIsMobileSidebarOpen(false)}
            className="relative z-10 w-64 shadow-2xl"
          />
        </div>
      )}

      {/* Main App Workspace */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-border bg-card/50 py-3 px-6 text-center text-xs text-muted-foreground">
          Swachh Setu &copy; 2026 Municipal Sanitation Platform &bull; Visakhapatnam Demo (20 Wards, 5 Zones)
        </footer>

      </div>
    </div>
  );
}
