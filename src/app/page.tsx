"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, StatusBadge, ProgressBar, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Household, Bill, PayFrequency } from "@/lib/types";
import {
  getDashboardState,
  getBillsDueBeforePayday,
  getBillFundingStatus,
  getNextPayday,
  getSavingsContribution,
  PlanningSettings,
} from "@/lib/planner";
import {
  getHouseholdData,
  getFundingMap,
  isOnboarded,
  getSettings,
  getAlerts,
  getPlanningRules,
} from "@/lib/storage";
import { analyzeShortfall, generateRecommendations, analyzeAlerts } from "@/lib/intelligence";
import { format, differenceInDays } from "date-fns";
import {
  PiggyBank,
  Receipt,
  AlertTriangle,
  DollarSign,
  Target,
  Shield,
  ChevronRight,
  Zap,
  CheckCircle,
  TrendingUp,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function HomeDashboard() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [dashboardState, setDashboardState] = useState<ReturnType<typeof getDashboardState> | null>(null);
  const [settings, setSettings] = useState<PlanningSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shortfall, setShortfall] = useState<ReturnType<typeof analyzeShortfall> | null>(null);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof generateRecommendations>>([]);

  useEffect(() => {
    const checkOnboarding = () => {
      if (!isOnboarded()) {
        router.push("/onboarding");
        return;
      }
      
      const data = getHouseholdData() as Household | null;
      const fundingMap = getFundingMap();
      const sets = getSettings();
      
      if (data) {
        setHousehold(data);
        setSettings(sets);
        const state = getDashboardState(data, fundingMap, sets);
        setDashboardState(state);
        
        const sf = analyzeShortfall();
        setShortfall(sf);
        
        const recs = generateRecommendations();
        setRecommendations(recs);
        
        analyzeAlerts();
      }
      
      setIsLoading(false);
    };
    checkOnboarding();
  }, [router]);

  if (isLoading || !household || !dashboardState || !settings) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const incomeSource = household.incomeSources[0];
  const payday = incomeSource
    ? getNextPayday(incomeSource.frequency, incomeSource.nextPayday)
    : new Date();
  const daysUntil = differenceInDays(payday, new Date());
  const billsDue = dashboardState.billsDueBeforePayday;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on_track": return "On Track";
      case "tight_this_week": return "Tight This Week";
      case "bills_covered": return "Bills Covered";
      case "shortfall_risk": return "Shortfall Risk";
      default: return status;
    }
  };

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6 animate-fade-in">
          {/* Hero: Safe to Spend */}
          <Card variant="gradient" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700 opacity-10" />
            <div className="relative text-center py-8">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                Safe to Spend
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-slate-800">
                {formatCurrency(dashboardState.safeToSpend)}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                from your current balance
              </p>
              <div className="mt-4">
                <StatusBadge status={dashboardState.overallStatus} />
              </div>
            </div>
          </Card>

          {/* Payday Countdown */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="md" className="flex flex-col items-center justify-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${daysUntil <= 1 ? "bg-emerald-100" : "bg-violet-100"}`}>
                <DollarSign className={`w-5 h-5 ${daysUntil <= 1 ? "text-emerald-600" : "text-violet-600"}`} />
              </div>
              <p className="text-sm text-slate-500">Next Payday</p>
              <p className="text-2xl font-bold text-slate-800">{daysUntil}</p>
              <p className="text-xs text-slate-500">{daysUntil === 1 ? "day away" : "days"}</p>
            </Card>
            <Card padding="md" className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
              <p className="text-sm text-slate-500">Current Balance</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {formatCurrency(household.currentBalance)}
              </p>
            </Card>
          </div>

          {/* Set Aside Summary */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Receipt className="text-violet-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Set Aside</p>
                <p className="text-sm text-slate-500">Reserved for upcoming bills</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-violet-600">
              {formatCurrency(dashboardState.amountSetAside)}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between py-2 px-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">Bills due</span>
                <span className="text-sm font-semibold text-slate-800">
                  {formatCurrency(dashboardState.totalBillsDue)}
                </span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">Savings</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(dashboardState.savingsTarget)}
                </span>
              </div>
            </div>
          </Card>

          {/* Bills Due Before Payday */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Bills Before Payday</p>
                  <p className="text-sm text-slate-500">
                    {billsDue.length} bills due
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(dashboardState.totalBillsDue)}
              </p>
            </div>
            {billsDue.length > 0 ? (
              <div className="space-y-2">
                {billsDue.slice(0, 4).map((bill) => {
                  const status = getBillFundingStatus(bill, getFundingMap()[bill.id] || 0);
                  const progress = bill.amount > 0
                    ? status.fundedAmount / bill.amount
                    : 0;
                  
                  return (
                    <div key={bill.id} className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{bill.name}</span>
                          {bill.isAutoPay && (
                            <Badge variant="info" size="sm">Auto</Badge>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                      <ProgressBar
                        progress={progress}
                        color={status.isFunded ? "#10B981" : "#8B5CF6"}
                        height={6}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          {formatCurrency(status.fundedAmount)} funded
                        </span>
                        <span className={`text-xs font-medium ${
                          status.isFunded ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {status.isFunded ? "Covered" : `${formatCurrency(status.remainingNeeded)} needed`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {billsDue.length > 4 && (
                  <p className="text-sm text-slate-500 text-center py-2">
                    +{billsDue.length - 4} more bills
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No bills due before your next payday
              </p>
            )}
          </Card>

          {/* Savings Summary */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Savings</p>
                <p className="text-sm text-slate-500 capitalize">
                  {household.settings.savingsMode} mode
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Per paycheck</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(dashboardState.savingsTarget)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Progress</p>
                <p className="text-xl font-bold text-slate-800">
                  {household.savingsGoals.length} goals
                </p>
              </div>
            </div>
          </Card>

          {/* Intelligent Status Banner */}
          {shortfall && shortfall.isTight && (
            <Card 
              className="border-l-4 border-amber-500 bg-amber-50"
              padding="lg"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-600 mt-1" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">Tight Month Ahead</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {shortfall.shortfallAmount > 0 
                      ? `You're short ${formatCurrency(shortfall.shortfallAmount)} this pay period.`
                      : "Your buffer is lower than usual."
                    }
                  </p>
                  <Link href="/alerts">
                    <button className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1">
                      View Plan <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* All Protected - Positive reinforcement */}
          {shortfall && !shortfall.isTight && (
            <Card 
              className="border-l-4 border-emerald-500 bg-emerald-50"
              padding="lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 mt-1" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-800">You're Protected</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Bills are covered and your buffer is healthy. Great job!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Top Recommendation */}
          {recommendations.length > 0 && !shortfall?.isTight && (
            <Card padding="md" className="bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Zap className="text-blue-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">{recommendations[0].title}</p>
                  <p className="text-sm text-blue-700 mt-1">{recommendations[0].explanation}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="sm" className="text-center">
              <Target className="mx-auto text-blue-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Savings Goals</p>
              <p className="text-lg font-bold text-slate-800">
                {household.savingsGoals.length}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <Shield className="mx-auto text-violet-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Buffer</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(settings.minBuffer)}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <DollarSign className="mx-auto text-emerald-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Per Check</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(incomeSource?.amount || 0)}
              </p>
            </Card>
          </div>

          {/* Reassuring Message */}
          <Card variant="outlined" padding="md" className="text-center">
            <p className="text-slate-600">
              {dashboardState.overallStatus === "on_track"
                ? "You're on track! Your money is working hard for your family."
                : dashboardState.overallStatus === "tight_this_week"
                ? "This week's a bit tight, but you've got this."
                : dashboardState.shortfall > 0
                ? "You have a shortfall. Let's adjust your plan."
                : "Your bills are covered. That's what matters most."}
            </p>
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}