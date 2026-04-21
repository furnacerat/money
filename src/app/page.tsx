"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { isOnboarded, getOnboardingData } from "@/lib/storage";
import { Card, StatCard, StatusBadge, Countdown, ProgressBar, MiniStat, BillCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { OnboardingData } from "@/lib/types";
import { getDashboardData } from "@/lib/data";
import { Household } from "@/lib/types";
import { PiggyBank, Receipt, AlertTriangle, TrendingUp, DollarSign, Target, Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = () => {
      if (!isOnboarded()) {
        router.push("/onboarding");
        return;
      }
      const data = getOnboardingData();
      setOnboardingData(data);
      setIsLoading(false);
    };
    checkOnboarding();
  }, [router]);

  if (isLoading || !onboardingData) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const mockHH: Household = {
    id: "default",
    name: onboardingData.householdName || "Your Household",
    owner: { id: "1", name: onboardingData.userName || "You" },
    incomeSources: [],
    bills: (onboardingData.bills || []).map((bill, i) => ({
      ...bill,
      id: `bill-${i}`,
      dueDate: bill.dueDay ? new Date(2026, 4, bill.dueDay).toISOString() : "",
    })),
    savingsGoals: [
      {
        id: "emergency",
        name: "Emergency Fund",
        targetAmount: onboardingData.emergencyFundTarget || 10000,
        currentAmount: 0,
        type: "emergency",
        isCompleted: false,
        priority: 1,
        contributionPerPaycheck: onboardingData.minSavingsPerPaycheck || 200,
      },
    ],
    settings: {
      savingsMode: (onboardingData.savingsMode || "normal") as "survival" | "normal" | "growth",
      minSavingsPerPaycheck: onboardingData.minSavingsPerPaycheck || 200,
      buffer: {
        currentBalance: onboardingData.currentBalance || 0,
        targetBuffer: onboardingData.targetBuffer || 1000,
        cashOnHand: onboardingData.cashOnHand || 0,
      },
      notifications: {
        billReminders: true,
        paydayReminders: true,
        lowBalanceAlerts: true,
      },
    },
    currentBalance: onboardingData.currentBalance || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const dashboard = getDashboardData(mockHH);

  return (
    <ToastProvider>
      <AppShell householdName={onboardingData.householdName}>
        <div className="space-y-6 animate-fade-in">
          {/* Hero: Safe to Spend */}
          <Card variant="gradient" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700 opacity-10" />
            <div className="relative text-center py-8">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                Safe to Spend
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-slate-800">
                {formatCurrency(dashboard.safeToSpend)}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                from your current balance
              </p>
              <div className="mt-4">
                <StatusBadge status={dashboard.overallStatus} />
              </div>
            </div>
          </Card>

          {/* Payday Countdown */}
          <div className="grid grid-cols-2 gap-4">
            <Countdown
              targetDate={onboardingData.nextPayday || new Date().toISOString()}
              label="Next Payday"
              size="md"
            />
            <Card padding="md" className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
              <p className="text-sm text-slate-500">Current Balance</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {formatCurrency(onboardingData.currentBalance || 0)}
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
              {formatCurrency(dashboard.amountSetAside)}
            </p>
            <div className="mt-3 space-y-2">
              <MiniStat
                label="Monthly bills"
                value={formatCurrency(dashboard.totalBillsDue)}
                color="#8B5CF6"
              />
              <MiniStat
                label="Savings per paycheck"
                value={formatCurrency(onboardingData.minSavingsPerPaycheck || 0)}
                color="#10B981"
              />
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
                    {dashboard.billsDueBeforePayday.length} bills due
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(dashboard.totalBillsDue)}
              </p>
            </div>
            {dashboard.billsDueBeforePayday.length > 0 ? (
              <div className="space-y-2">
                {dashboard.billsDueBeforePayday.slice(0, 3).map((bill) => (
                  <BillCard key={bill.id} bill={bill} compact />
                ))}
                {dashboard.billsDueBeforePayday.length > 3 && (
                  <p className="text-sm text-slate-500 text-center py-2">
                    +{dashboard.billsDueBeforePayday.length - 3} more bills
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No bills due before your next payday
              </p>
            )}
          </Card>

          {/* Savings Progress */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Savings</p>
                <p className="text-sm text-slate-500">
                  {onboardingData.savingsMode || "Normal"} mode
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Emergency Fund</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatCurrency(0)} / {formatCurrency(onboardingData.emergencyFundTarget || 10000)}
                  </p>
                </div>
                <ProgressBar
                  progress={0}
                  color="#10B981"
                  height={8}
                />
              </div>
            </div>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="sm" className="text-center">
              <Target className="mx-auto text-blue-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Total Saved</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(dashboard.savingsProgress)}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <TrendingUp className="mx-auto text-violet-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Per Paycheck</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(onboardingData.paycheckAmount || 0)}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <Shield className="mx-auto text-emerald-500 mb-2" size={20} />
              <p className="text-xs text-slate-500">Buffer</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(onboardingData.targetBuffer || 0)}
              </p>
            </Card>
          </div>

          {/* Reassuring Message */}
          <Card variant="outlined" padding="md" className="text-center">
            <p className="text-slate-600">
              {dashboard.overallStatus === "on_track"
                ? "You're on track! Your money is working hard for your family."
                : dashboard.overallStatus === "tight_this_week"
                ? "This week's a bit tight, but you've got this."
                : "Your bills are covered. That's what matters most."}
            </p>
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}