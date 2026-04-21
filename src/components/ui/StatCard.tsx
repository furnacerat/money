"use client";

import React from "react";
import { cn, formatCurrency, formatCurrencyPrecise } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  sublabel?: string;
  variant?: "hero" | "default" | "compact";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  sublabel,
  variant = "default",
  trend,
  trendValue,
  color,
  icon,
  onClick,
}: StatCardProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-soft transition-all duration-250",
        isHero && "p-6 sm:p-8",
        isCompact && "p-4",
        !isHero && !isCompact && "p-5",
        onClick && "cursor-pointer hover:shadow-medium active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex-1", isHero && "text-center sm:text-left")}>
          <p
            className={cn(
              "text-slate-500 font-medium",
              isHero && "text-lg sm:text-xl",
              isCompact && "text-sm",
              !isHero && !isCompact && "text-base"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "font-bold text-slate-900 mt-1",
              isHero && "text-4xl sm:text-5xl md:text-6xl",
              isCompact && "text-xl sm:text-2xl",
              !isHero && !isCompact && "text-2xl sm:text-3xl"
            )}
            style={color ? { color } : undefined}
          >
            {formatCurrency(value)}
          </p>
          {sublabel && (
            <p className="text-slate-500 text-sm mt-1">{sublabel}</p>
          )}
          {trend && trendValue && (
            <p
              className={cn(
                "text-sm font-semibold mt-2 flex items-center gap-1",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-slate-600"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-xl",
              isHero && "hidden sm:flex w-14 h-14",
              isCompact && "w-10 h-10",
              !isHero && !isCompact && "w-12 h-12"
            )}
            style={{ backgroundColor: `${color}15` || "#F1F5F9" }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function MiniStat({ label, value, icon, color }: MiniStatProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      {icon && (
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ backgroundColor: `${color}20` || "#E2E8F0" }}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}