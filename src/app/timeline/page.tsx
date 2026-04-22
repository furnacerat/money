"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Badge, ProgressBar } from "@/components/ui";
import { Household } from "@/lib/types";
import { getHouseholdData, getFundingMap, getSettings } from "@/lib/storage";
import { getNextPayday, getBillsDueBeforePayday, getSavingsContribution } from "@/lib/planner";
import { formatCurrency } from "@/lib/utils";
import { format, addDays, startOfToday, parseISO, differenceInDays, isSameDay, addMonths } from "date-fns";
import { DollarSign, AlertTriangle, TrendingUp, Shield, Target, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function TimelinePage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [settings, setSettings] = useState<ReturnType<typeof getSettings> | null>(null);
  const [viewDays, setViewDays] = useState(14);

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setSettings(getSettings());
    }
  }, []);

  if (!household || !settings) {
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

  const today = startOfToday();
  const incomeSource = household.incomeSources[0];
  const payday = incomeSource ? getNextPayday(incomeSource.frequency, incomeSource.nextPayday) : new Date();
  
  const billsDue = getBillsDueBeforePayday(household.bills, payday);
  const totalBillsDue = billsDue.reduce((sum, b) => sum + b.amount, 0);
  
  const savingsPerPaycheck = getSavingsContribution(household.settings.savingsMode, incomeSource?.amount || 0);
  
  const safeToSpend = Math.max(0, household.currentBalance - totalBillsDue - savingsPerPaycheck - settings.minBuffer);
  const isTight = safeToSpend < settings.minBuffer * 0.5;

  const days = Array.from({ length: viewDays }, (_, i) => addDays(today, i));
  const nextMonthDays = Array.from({ length: 30 }, (_, i) => addDays(today, i + 14));

  const getBillDueOnDay = (day: Date) => {
    return household.bills.filter(b => 
      b.status !== "paid" && b.dueDay === day.getDate()
    );
  };

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewDays(14)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                viewDays === 14 ? "bg-violet-600 text-white" : "bg-white text-slate-600"
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setViewDays(30)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                viewDays === 30 ? "bg-violet-600 text-white" : "bg-white text-slate-600"
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Summary Card */}
          <Card variant="gradient" padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Upcoming Cash Flow</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500">Next Payday</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(incomeSource?.amount || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  {format(payday, "EEE, MMM d")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Bills Due</p>
                <p className="text-lg font-bold text-amber-600">
                  {formatCurrency(totalBillsDue)}
                </p>
                <p className="text-xs text-slate-500">
                  {billsDue.length} bills before payday
                </p>
              </div>
            </div>
            
            {isTight && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Cash flow will be tight. Consider adjusting expenses.
                </p>
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-800 mb-4">Timeline</h3>
            <div className="space-y-3">
              {days.map((day) => {
                const isTodayDate = isSameDay(day, today);
                const isPayday = incomeSource?.nextPayday && isSameDay(day, payday);
                const dueBills = getBillDueOnDay(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isTodayDate ? "bg-violet-50" : "bg-slate-50"
                    }`}
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <p className={`text-xs font-medium ${isTodayDate ? "text-violet-600" : "text-slate-500"}`}>
                        {format(day, "EEE")}
                      </p>
                      <p className={`text-lg font-bold ${isTodayDate ? "text-violet-600" : "text-slate-800"}`}>
                        {format(day, "d")}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      {isPayday && (
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <DollarSign size={12} className="text-emerald-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">Payday</p>
                          <p className="text-sm font-semibold text-emerald-600 ml-auto">
                            +{formatCurrency(incomeSource?.amount || 0)}
                          </p>
                        </div>
                      )}
                      {dueBills.map((bill) => (
                        <div key={bill.id} className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={12} className="text-amber-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 truncate">{bill.name}</p>
                          <p className="text-sm font-semibold text-slate-800 ml-auto">
                            -{formatCurrency(bill.amount)}
                          </p>
                        </div>
                      ))}
                      {(!isPayday && dueBills.length === 0) && (
                        <p className="text-sm text-slate-400 py-1">-</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}