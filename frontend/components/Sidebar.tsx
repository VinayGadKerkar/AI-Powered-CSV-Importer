"use client";

import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Generate Leads", icon: "✦" },
  { label: "Manage Leads", icon: "☰" },
  { label: "Engage Leads", icon: "◎" },
  { label: "Team Members", icon: "👥" },
  { label: "Lead Sources", icon: "⬆", active: true },
  { label: "Ad Accounts", icon: "📣" },
  { label: "WhatsApp Account", icon: "💬" },
  { label: "CRM Fields", icon: "⚙" },
  { label: "API Center", icon: "🔗" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30
          flex flex-col
          bg-sidebar text-gray-200
          transition-all duration-300 ease-in-out
          h-full shrink-0
          ${collapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-60"}
        `}
        style={{ backgroundColor: "#1a1a2e" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <span className="text-white font-semibold text-base tracking-wide">
                GrowEasy
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm mx-auto">
              G
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors ml-auto hidden md:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm
                transition-colors duration-150 text-left
                ${
                  item.active
                    ? "bg-accent/20 text-accent border-r-2 border-accent"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className="text-base w-5 shrink-0 text-center">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom user area */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-accent font-semibold text-sm">
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
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-40 md:hidden bg-sidebar p-2 rounded-lg text-white"
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </>
  );
}
