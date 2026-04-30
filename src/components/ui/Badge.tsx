"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Home, Calendar, PiggyBank, Receipt, Wallet } from "lucide-react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "gradient";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  pulse = false,
  className,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.06)]",
    warning: "bg-amber-50 text-amber-800 border-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]",
    danger: "bg-rose-50 text-rose-700 border-rose-200 shadow-[0_0_0_1px_rgba(225,29,72,0.08)]",
    info: "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-[0_0_0_1px_rgba(6,182,212,0.08)]",
    neutral: "bg-slate-100/80 text-slate-700 border-slate-200",
    gradient: "bg-slate-950 text-white border-transparent shadow-soft",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: "on_track" | "tight_this_week" | "bills_covered" | "shortfall_risk" | "emergency";
}

const statusConfig: Record<StatusBadgeProps["status"], { label: string; variant: BadgeVariant }> = {
  on_track: { label: "On Track", variant: "success" },
  tight_this_week: { label: "Tight This Week", variant: "warning" },
  bills_covered: { label: "Bills Covered", variant: "info" },
  shortfall_risk: { label: "Shortfall Risk", variant: "danger" },
  emergency: { label: "Emergency", variant: "danger" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} pulse={status === "shortfall_risk" || status === "emergency"}>
      {config.label}
    </Badge>
  );
}

interface NavItemProps {
  href: string;
  icon: "home" | "calendar" | "savings" | "bills" | "wallet";
  label: string;
  isActive?: boolean;
}

export function NavItem({ href, icon, label, isActive = false }: NavItemProps) {
  const icons = {
    home: Home,
    calendar: Calendar,
    savings: PiggyBank,
    bills: Receipt,
    wallet: Wallet,
  };
  const Icon = icons[icon];

  return (
    <a
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
        isActive
          ? "text-white bg-white/14 shadow-soft"
          : "text-slate-300 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className={cn("text-xs font-medium", isActive && "font-semibold")}>{label}</span>
    </a>
  );
}
