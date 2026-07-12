"use client";

import { useState } from "react";

export type NavPage =
  | "Dashboard"
  | "Generate Leads"
  | "Manage Leads"
  | "Engage Leads"
  | "Team Members"
  | "Lead Sources"
  | "Ad Accounts"
  | "WhatsApp Account"
  | "CRM Fields"
  | "API Center";

const navItems: { label: NavPage; icon: string }[] = [
  { label: "Dashboard",        icon: "⊞" },
  { label: "Generate Leads",   icon: "✦" },
  { label: "Manage Leads",     icon: "☰" },
  { label: "Engage Leads",     icon: "◎" },
  { label: "Team Members",     icon: "👥" },
  { label: "Lead Sources",     icon: "⬆" },
  { label: "Ad Accounts",      icon: "📣" },
  { label: "WhatsApp Account", icon: "💬" },
  { label: "CRM Fields",       icon: "⚙" },
  { label: "API Center",       icon: "🔗" },
];

interface Props {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export default function Sidebar({ activePage, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30 flex flex-col h-full shrink-0
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-16" : "w-60"}
        `}
        style={{ backgroundColor: "#1a1a2e" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: "#e94560" }}
              >
                G
              </div>
              <span className="text-white font-semibold text-base tracking-wide">
                GrowEasy
              </span>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto"
              style={{ backgroundColor: "#e94560" }}
            >
              G
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors ml-auto hidden md:block text-lg"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.label);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                  transition-colors duration-150
                  ${isActive
                    ? "bg-white/10 border-r-2 border-r-[#e94560]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <span
                  className={`text-base w-5 shrink-0 text-center ${isActive ? "text-[#e94560]" : ""}`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className={`truncate ${isActive ? "text-white font-medium" : ""}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                style={{ backgroundColor: "#e9456033", color: "#e94560" }}
              >
                V
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">Vinay</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg text-white"
        style={{ backgroundColor: "#1a1a2e" }}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </>
  );
}
