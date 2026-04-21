"use client";

import React from "react";
import { useHousehold } from "@/lib/context";
import { formatCurrency, calculateProgress } from "@/lib/utils";
import { Card, Button, SavingsCard, ProgressBar, Badge } from "@/components/ui";
import { Target, TrendingUp, Plus } from "lucide-react";

export default function SavingsPage() {
  const { household } = useHousehold();

  const totalSaved = household.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = household.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalPerPaycheck = household.savingsGoals.reduce((sum, g) => sum + g.contributionPerPaycheck, 0);
  const overallProgress = calculateProgress(totalSaved, totalTarget);

  const completedGoals = household.savingsGoals.filter((g) => g.isCompleted);
  const activeGoals = household.savingsGoals.filter((g) => !g.isCompleted);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card variant="gradient">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
            <Target className="text-emerald-600" size={28} />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Total Saved
          </p>
          <p className="text-4xl font-bold text-emerald-600">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            of {formatCurrency(totalTarget)} across all goals
          </p>
          <div className="mt-4 max-w-xs mx-auto">
            <ProgressBar progress={overallProgress} color="#10B981" height={8} />
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md" className="text-center">
          <p className="text-xs text-slate-500 mb-1">Per Paycheck</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalPerPaycheck)}</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-xs text-slate-500 mb-1">Active Goals</p>
          <p className="text-xl font-bold text-slate-800">{activeGoals.length}</p>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Active Goals</h2>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <SavingsCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Completed</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} padding="md" className="opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-700 line-through">{goal.name}</p>
                    <Badge variant="success" size="sm">Complete!</Badge>
                  </div>
                  <p className="font-bold text-emerald-600">{formatCurrency(goal.currentAmount)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Goal */}
      <Card variant="outlined" padding="lg" className="text-center">
        <p className="text-slate-600 mb-4">Ready for a new savings goal?</p>
        <Button variant="outline" leftIcon={<Plus size={18} />}>
          Add Goal
        </Button>
      </Card>

      {/* Reassuring Note */}
      <Card variant="outlined" padding="md" className="text-center">
        <p className="text-slate-600">
          {activeGoals.length > 0
            ? `${formatCurrency(totalPerPaycheck)} goes to savings with each paycheck. Every contribution brings you closer.`
            : "You've achieved all your goals! Time to celebrate and set new ones."}
        </p>
      </Card>
    </div>
  );
}