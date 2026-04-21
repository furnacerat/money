"use client";

import React from "react";
import { cn, formatCurrency, calculateProgress } from "@/lib/utils";
import { SavingsGoal } from "@/lib/types";
import { Card } from "./Card";
import { ProgressBar } from "./Progress";
import { Badge } from "./Badge";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Target,
  Plane,
  Home,
  Car,
  Sparkles,
  Plus,
  Check,
} from "lucide-react";

interface SavingsCardProps {
  goal: SavingsGoal;
  onAddContribution?: () => void;
  compact?: boolean;
}

const goalIcons: Record<string, React.ElementType> = {
  emergency: Target,
  vacation: Plane,
  home: Home,
  car: Car,
  debt: Check,
  custom: Sparkles,
};

const goalColors: Record<string, string> = {
  emergency: "#10B981",
  vacation: "#F59E0B",
  home: "#8B5CF6",
  car: "#3B82F6",
  debt: "#EF4444",
  custom: "#EC4899",
};

export function SavingsCard({
  goal,
  onAddContribution,
  compact = false,
}: SavingsCardProps) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const remaining = goal.targetAmount - goal.currentAmount;
  const Icon = goalIcons[goal.type] || Sparkles;
  const color = goalColors[goal.type] || "#6B7280";

  const getDaysRemaining = () => {
    if (!goal.targetDate) return null;
    const days = differenceInDays(parseISO(goal.targetDate), new Date());
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    if (days < 30) return `${days} days left`;
    const months = Math.ceil(days / 30);
    return `${months} month${months > 1 ? "s" : ""} left`;
  };

  if (compact) {
    return (
      <Card padding="sm" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{goal.name}</p>
            <p className="text-xs text-slate-500">
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color }}>
            {Math.round(progress * 100)}%
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{goal.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="neutral" size="sm">
                  {formatCurrency(goal.contributionPerPaycheck)}/paycheck
                </Badge>
                {goal.isCompleted && (
                  <Badge variant="success" size="sm">Complete</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(goal.currentAmount)}
            </p>
            <p className="text-sm text-slate-500">
              of {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>

        <ProgressBar
          progress={progress}
          color={color}
          height={10}
          className="mb-3"
        />

        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            {Math.round(progress * 100)}% complete
          </p>
          <p className="font-medium" style={{ color }}>
            {formatCurrency(remaining)} to go
          </p>
        </div>

        {goal.targetDate && (
          <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
            <span>{getDaysRemaining()}</span>
          </div>
        )}

        {onAddContribution && !goal.isCompleted && (
          <button
            onClick={onAddContribution}
            className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <Plus size={16} />
            Add Contribution
          </button>
        )}
      </div>
    </Card>
  );
}