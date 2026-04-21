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
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    gradient: "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
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
        "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
        isActive
          ? "text-violet-600 bg-violet-50"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className={cn("text-xs font-medium", isActive && "font-semibold")}>{label}</span>
    </a>
  );
}