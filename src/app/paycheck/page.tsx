"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button } from "@/components/ui";
import { getHouseholdData } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { Household } from "@/lib/types";
import { getNextPayday } from "@/lib/planner";
import { format, differenceInDays } from "date-fns";
import { Wallet, Plus, ChevronRight } from "lucide-react";
import PaycheckPlanningFlow from "@/components/paycheck/PaycheckPlanningFlow";

export default function PaycheckPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [showPlanning, setShowPlanning] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const data = getHouseholdData() as Household | null;
      if (data) {
        setHousehold(data);
      }
    };

    void Promise.resolve().then(loadData);
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

  if (showPlanning) {
    return (
      <ToastProvider>
        <AppShell householdName={household.name}>
          <PaycheckPlanningFlow />
        </AppShell>
      </ToastProvider>
    );
  }

  const incomeSource = household.incomeSources[0];
  const payday = incomeSource
    ? getNextPayday(incomeSource.frequency, incomeSource.nextPayday)
    : null;
  const daysUntil = payday ? differenceInDays(payday, new Date()) : 0;

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6">
          <Card padding="lg" className="relative overflow-hidden bg-slate-950 text-white shadow-lifted">
            <div className="absolute inset-x-0 top-0 h-1 surface-line" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,70,229,0.28),transparent_45%),linear-gradient(225deg,rgba(20,184,166,0.22),transparent_40%)]" />
            <div className="relative text-center py-6">
              <div className="w-14 h-14 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Next Paycheck
              </p>
              <p className="text-4xl font-black tracking-tight text-white">
                {formatCurrency(incomeSource?.amount || 0)}
              </p>
              <p className="text-sm text-slate-300 mt-2">
                {payday ? `arriving ${format(payday, "EEEE, MMM d")} (${daysUntil} days)` : "Set up your income in onboarding"}
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowPlanning(true)}
            leftIcon={<Plus size={20} />}
            rightIcon={<ChevronRight size={20} />}
          >
            Plan a Paycheck
          </Button>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Income Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Source</span>
                <span className="font-medium text-slate-800">
                  {incomeSource?.name || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Frequency</span>
                <span className="font-medium text-slate-800 capitalize">
                  {incomeSource?.frequency || "Bi-weekly"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Per month</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency((incomeSource?.amount || 0) * 2)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Savings mode</span>
                <span className="font-medium text-slate-800 capitalize">
                  {household.settings.savingsMode}
                </span>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Upcoming</h3>
            {payday && (
              <div className="flex items-center justify-between py-3 rounded-xl bg-slate-50 px-4">
                <div>
                  <p className="font-medium text-slate-800">Next payday</p>
                  <p className="text-sm text-slate-500">{format(payday, "EEEE, MMM d")}</p>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(incomeSource?.amount || 0)}
                </p>
              </div>
            )}
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}
