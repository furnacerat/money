"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/ui";

interface AppShellProps {
  children: ReactNode;
  householdName?: string;
}

const navItems = [
  { href: "/", icon: "home" as const, label: "Home" },
  { href: "/paycheck", icon: "wallet" as const, label: "Plan" },
  { href: "/bills", icon: "bills" as const, label: "Bills" },
  { href: "/savings", icon: "savings" as const, label: "Savings" },
  { href: "/calendar", icon: "calendar" as const, label: "Calendar" },
];

export function AppShell({ children, householdName = "Your Family" }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Household Planner</h1>
            <p className="text-xs text-slate-500">{householdName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">JD</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}