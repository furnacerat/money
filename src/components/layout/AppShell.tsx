"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/ui";
import { Sheet } from "@/components/ui/Modal";
import {
  MoreHorizontal,
  ChevronRight,
  PiggyBank,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  Users,
  Sliders,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
  householdName?: string;
}

const navItems = [
  { href: "/", icon: "home" as const, label: "Today" },
  { href: "/paycheck", icon: "wallet" as const, label: "Plan" },
  { href: "/bills", icon: "bills" as const, label: "Bills" },
  { href: "/timeline", icon: "calendar" as const, label: "Calendar" },
  { href: "#more", icon: "more" as const, label: "More" },
];

const moreLinks = [
  { href: "/savings", icon: PiggyBank, label: "Savings Goals", group: "Money tools" },
  { href: "/expenses", icon: CreditCard, label: "Spending", group: "Money tools" },
  { href: "/alerts", icon: Bell, label: "Alerts", group: "Money tools" },
  { href: "/reports", icon: BarChart3, label: "Reports", group: "Review" },
  { href: "/scenarios", icon: FlaskConical, label: "What If", group: "Review" },
  { href: "/rules", icon: Sliders, label: "Planning Rules", group: "Setup" },
  { href: "/household", icon: Users, label: "Household", group: "Setup" },
  { href: "/invite", icon: Users, label: "Invite Family", group: "Setup" },
  { href: "/settings", icon: Settings, label: "Settings", group: "Setup" },
];

export function AppShell({ children, householdName = "Your Household" }: AppShellProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isMoreActive = pathname.startsWith("/savings") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/scenarios") ||
    pathname.startsWith("/rules") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/household");

  const groupedLinks = moreLinks.reduce<Record<string, typeof moreLinks>>((groups, link) => {
    groups[link.group] = groups[link.group] || [];
    groups[link.group].push(link);
    return groups;
  }, {});

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-50 border-b border-slate-700/70 bg-slate-950/88 text-white backdrop-blur-2xl">
        <div className="surface-line h-0.5 w-full" />
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">Household Planner</h1>
            <p className="text-xs font-medium text-slate-300">{householdName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 shadow-medium flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-wide">
                {householdName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
        <div className="glass-panel max-w-lg mx-auto flex items-center justify-around rounded-lg px-1 py-2">
          {navItems.map((item) => {
            if (item.href === "#more") {
              return (
                <button
                  key={item.href}
                  onClick={() => setIsMoreOpen(true)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
                    isMoreActive
                      ? "text-white bg-white/14 shadow-soft"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <MoreHorizontal size={24} strokeWidth={isMoreActive ? 2.5 : 2} />
                  <span className={cn("text-xs font-medium", isMoreActive && "font-semibold")}>
                    {item.label}
                  </span>
                </button>
              );
            }
            return (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon as "home" | "bills" | "savings"}
                label={item.label}
                isActive={pathname === item.href}
              />
            );
          })}
        </div>
      </nav>

      <Sheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="More"
      >
        <div className="space-y-5">
          {Object.entries(groupedLinks).map(([group, links]) => (
            <div key={group}>
              <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{group}</p>
              <div className="space-y-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50/80 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-800">{link.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {user && (
            <button
              onClick={() => {
                setIsMoreOpen(false);
                signOut();
              }}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-red-50 transition-colors w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium text-red-600">Sign Out</span>
              </div>
            </button>
          )}
        </div>
      </Sheet>
    </div>
  );
}
