"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, ProgressBar, Badge, EmptyState } from "@/components/ui";
import { formatCurrency, calculateProgress } from "@/lib/utils";
import { Household, SavingsGoal } from "@/lib/types";
import { getHouseholdData, saveHouseholdData, getContributions } from "@/lib/storage";
import { getSavingsContribution } from "@/lib/planner";
import { format, isBefore, parseISO, startOfMonth } from "date-fns";
import { Plus, Target, TrendingUp, Check, Clock, ChevronRight } from "lucide-react";

const GOAL_TYPE_LABELS: Record<string, string> = {
  emergency: "Emergency Fund",
  vacation: "Vacation",
  home: "Home",
  car: "Car",
  debt: "Debt Payoff",
  custom: "Custom Goal",
};

export default function SavingsPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [contributions, setContributions] = useState<unknown[]>([]);

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setContributions(getContributions());
    }
  }, []);

  if (!household) {
    return (
      <ToastProvider>
        <AppShell>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  const goals = household.savingsGoals || [];
  const emergencyGoal = goals.find(g => g.type === "emergency");
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const monthlyContributions = (contributions as unknown[]).filter(c => {
    const cData = c as { date: string };
    return isBefore(parseISO(cData.date || "0"), new Date());
  }).length;

  const incomeSource = household.incomeSources[0];
  const paycheckAmount = incomeSource?.amount || 0;
  const savingsPerPaycheck = getSavingsContribution(household.settings.savingsMode, paycheckAmount);

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    const target = parseISO(targetDate);
    const now = new Date();
    const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6">
          {/* Hero Summary */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Target className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Saved</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(totalSaved)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Progress to all goals</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(totalTarget - totalSaved)} to go
              </span>
            </div>
            <ProgressBar
              progress={totalTarget > 0 ? totalSaved / totalTarget : 0}
              color="#10B981"
              height={8}
            />
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="sm" className="text-center">
              <TrendingUp className="mx-auto text-emerald-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Per Paycheck</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(savingsPerPaycheck)}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <Check className="mx-auto text-blue-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Active Goals</p>
              <p className="text-lg font-bold text-slate-800">
                {activeGoals.length}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <Clock className="mx-auto text-violet-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-lg font-bold text-slate-800">
                {completedGoals.length}
              </p>
            </Card>
          </div>

          {/* Savings Mode */}
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Savings Mode</p>
                <p className="text-sm text-slate-500 capitalize">
                  {household.settings.savingsMode} mode
                </p>
              </div>
              <Badge variant={
                household.settings.savingsMode === "growth" ? "success" :
                household.settings.savingsMode === "normal" ? "info" :
                "warning"
              }>
                {household.settings.savingsMode}
              </Badge>
            </div>
          </Card>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Active Goals</h3>
              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                  const days = getDaysRemaining(goal.targetDate);
                  
                  return (
                    <Link key={goal.id} href={`/savings/${goal.id}`}>
                      <Card padding="md" className="hover:shadow-medium transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-800">{goal.name}</h4>
                              <Badge variant="neutral" size="sm">
                                {GOAL_TYPE_LABELS[goal.type]}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                        <ProgressBar
                          progress={progress}
                          color="#10B981"
                          height={8}
                        />
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-slate-500">
                            {Math.round(progress * 100)}% complete
                          </span>
                          <span className="font-medium text-emerald-600">
                            {formatCurrency(goal.contributionPerPaycheck)}/paycheck
                          </span>
                        </div>
                        {days !== null && days > 0 && (
                          <p className="text-xs text-slate-400 mt-2">
                            Target: {format(parseISO(goal.targetDate!), "MMM d, yyyy")} ({days} days left)
                          </p>
                        )}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Completed</h3>
              <div className="space-y-2">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} padding="sm" className="opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-700 line-through">{goal.name}</p>
                      </div>
                      <Badge variant="success" size="sm">
                        <Check size={12} /> Complete
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <EmptyState
              title="No savings goals yet"
              description="Start building your emergency fund or set a custom savings goal."
              action={
                <Link href="/savings/new">
                  <Button variant="outline" leftIcon={<Plus size={16} />}>
                    Add Goal
                  </Button>
                </Link>
              }
            />
          )}

          {/* Add Goal Button */}
          <Link href="/savings/new">
            <Button variant="outline" className="w-full" leftIcon={<Plus size={18} />}>
              Add Savings Goal
            </Button>
          </Link>
        </div>
      </AppShell>
    </ToastProvider>
  );
}