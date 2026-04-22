"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card } from "@/components/ui";
import { ProgressFill, FadeIn, SlideUp, Skeleton, SkeletonCard, SkeletonList } from "@/components/ui/Animations";
import { getBills, getExpenses, getSavingsGoals, getContributions, getCurrentHousehold } from "@/lib/db";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  CreditCard,
  PiggyBank,
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  BarChart3,
  PieChart
} from "lucide-react";

type TimeRange = "this_month" | "last_month" | "last_3_months" | "this_year";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

const BUCKET_LABELS: Record<string, string> = {
  groceries: "Groceries",
  gas: "Gas",
  household: "Household",
  kids: "Kids",
  dining: "Dining",
  entertainment: "Entertainment",
  misc: "Misc",
};

const BUCKET_COLORS: Record<string, string> = {
  groceries: "#10B981",
  gas: "#3B82F6",
  household: "#8B5CF6",
  kids: "#F59E0B",
  dining: "#EF4444",
  entertainment: "#EC4899",
  misc: "#6B7280",
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("this_month");
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const household = await getCurrentHousehold();
      if (household) {
        setHouseholdId(household.id);
        
        const [expData, billData, goalData, contribData] = await Promise.all([
          getExpenses(household.id),
          getBills(household.id),
          getSavingsGoals(household.id),
          getContributions(household.id),
        ]);
        
        setExpenses(expData);
        setBills(billData);
        setGoals(goalData);
        setContributions(contribData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (timeRange) {
      case "this_month":
        return { start: startOfMonth(now), end: now };
      case "last_month":
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case "last_3_months":
        return { start: startOfMonth(subMonths(now, 2)), end: now };
      case "this_year":
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: startOfMonth(now), end: now };
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const date = parseISO(e.date);
    const { start, end } = getDateRange();
    return isWithinInterval(date, { start, end });
  });

  const filteredContributions = contributions.filter(c => {
    const date = parseISO(c.date);
    const { start, end } = getDateRange();
    return isWithinInterval(date, { start, end });
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalContributed = filteredContributions.reduce((sum, c) => sum + c.amount, 0);
  
  const spendingByCategory = filteredExpenses.reduce((acc, e) => {
    const bucket = e.bucket || "misc";
    acc[bucket] = (acc[bucket] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const billsPaid = bills.filter(b => b.status === "paid").length;
  const billsTotal = bills.length;
  const billsCoverageRate = billsTotal > 0 ? billsPaid / billsTotal : 0;

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <ToastProvider>
        <AppShell>
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <SkeletonList count={3} />
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <FadeIn>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
              <p className="text-slate-500">See how your money is working</p>
            </div>
          </FadeIn>

          {/* Time Range Selector */}
          <FadeIn delay={0.1}>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { key: "this_month", label: "This Month" },
                { key: "last_month", label: "Last Month" },
                { key: "last_3_months", label: "3 Months" },
                { key: "this_year", label: "This Year" },
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key as TimeRange)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    timeRange === range.key
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <SlideUp delay={0.15}>
              <Card padding="lg" className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 opacity-80" />
                  <span className="text-sm opacity-80">Spent</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs opacity-80 mt-1">{filteredExpenses.length} transactions</p>
              </Card>
            </SlideUp>

            <SlideUp delay={0.2}>
              <Card padding="lg" className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-4 h-4 opacity-80" />
                  <span className="text-sm opacity-80">Saved</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalContributed)}</p>
                <p className="text-xs opacity-80 mt-1">{filteredContributions.length} contributions</p>
              </Card>
            </SlideUp>
          </div>

          {/* Spending by Category */}
          <SlideUp delay={0.25}>
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Spending by Category</h2>
                  <p className="text-sm text-slate-500">Where your money went</p>
                </div>
              </div>

              {Object.keys(spendingByCategory).length === 0 ? (
                <p className="text-slate-400 text-center py-4">No expenses this period</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(spendingByCategory as Record<string, number>)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([bucket, amount], index) => {
                      const percentage = totalExpenses > 0 ? amount / totalExpenses : 0;
                      return (
                        <div key={bucket}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: BUCKET_COLORS[bucket] || "#6B7280" }}
                              />
                              <span className="text-sm font-medium text-slate-700">
                                {BUCKET_LABELS[bucket] || bucket}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-slate-800">
                                {formatCurrency(amount)}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">
                                ({Math.round(percentage * 100)}%)
                              </span>
                            </div>
                          </div>
                          <ProgressFill 
                            progress={percentage} 
                            color={BUCKET_COLORS[bucket] || "#6B7280"}
                            height={6}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </SlideUp>

          {/* Bills Coverage */}
          <SlideUp delay={0.3}>
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Bills Coverage</h2>
                  <p className="text-sm text-slate-500">Your payment track record</p>
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10B981"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${billsCoverageRate * 351} 351`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">
                      {Math.round(billsCoverageRate * 100)}%
                    </span>
                    <span className="text-xs text-slate-500">paid</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="text-xl font-bold text-emerald-600">{billsPaid}</p>
                  <p className="text-xs text-slate-500">Paid</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{billsTotal - billsPaid}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{billsTotal}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
            </Card>
          </SlideUp>

          {/* Savings Progress */}
          <SlideUp delay={0.35}>
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Savings Goals</h2>
                  <p className="text-sm text-slate-500">Your progress over time</p>
                </div>
              </div>

              {goals.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No savings goals yet</p>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 5).map((goal) => {
                    const progress = goal.target_amount > 0 
                      ? goal.current_amount / goal.target_amount 
                      : 0;
                    const isComplete = goal.is_completed;
                    
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isComplete && <Sparkles className="w-4 h-4 text-emerald-500" />}
                            <span className={`text-sm font-medium ${isComplete ? "text-emerald-600" : "text-slate-700"}`}>
                              {goal.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-slate-800">
                              {formatCurrency(goal.current_amount)}
                            </span>
                            <span className="text-xs text-slate-400"> / {formatCurrency(goal.target_amount)}</span>
                          </div>
                        </div>
                        <ProgressFill 
                          progress={progress} 
                          color={isComplete ? "#10B981" : "#8B5CF6"}
                          height={8}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </SlideUp>

          {/* Total Saved */}
          <SlideUp delay={0.4}>
            <Card variant="gradient" padding="lg" className="text-center">
              <p className="text-sm text-slate-500 mb-1">Total Saved Across All Goals</p>
              <p className="text-4xl font-bold text-slate-800">{formatCurrency(totalSaved)}</p>
              <p className="text-sm text-slate-500 mt-2">
                {completedGoals.length} goal{completedGoals.length !== 1 ? 's' : ''} completed
              </p>
            </Card>
          </SlideUp>
        </div>
      </AppShell>
    </ToastProvider>
  );
}