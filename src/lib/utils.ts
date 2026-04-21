import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(current / target, 1);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    on_track: "#10B981",
    tight_this_week: "#F59E0B",
    bills_covered: "#3B82F6",
    shortfall_risk: "#EF4444",
    emergency: "#DC2626",
  };
  return colors[status] || "#6B7280";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    on_track: "On Track",
    tight_this_week: "Tight This Week",
    bills_covered: "Bills Covered",
    shortfall_risk: "Shortfall Risk",
    emergency: "Emergency",
  };
  return labels[status] || status;
}

export function getBillCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    housing: "#8B5CF6",
    utilities: "#06B6D4",
    insurance: "#10B981",
    subscriptions: "#F59E0B",
    transportation: "#3B82F6",
    healthcare: "#EC4899",
    debt: "#EF4444",
    other: "#6B7280",
  };
  return colors[category] || "#6B7280";
}

export function getBillCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    housing: "home",
    utilities: "zap",
    insurance: "shield",
    subscriptions: "tv",
    transportation: "car",
    healthcare: "heart",
    debt: "credit-card",
    other: "package",
  };
  return icons[category] || "package";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}