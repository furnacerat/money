"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Badge } from "@/components/ui";
import { Household, IncomeSource } from "@/lib/types";
import { getFundingMap, getHouseholdData, getSettings } from "@/lib/storage";
import { getBillsDueBeforePayday, getNextPayday, getSavingsContribution, isBillPaidForCurrentPeriod } from "@/lib/planner";
import { cn, formatCurrency } from "@/lib/utils";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { AlertTriangle, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";

type CalendarEntry = {
  id: string;
  type: "payday" | "bill";
  title: string;
  amount: number;
  isFunded?: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function advancePayday(date: Date, source: IncomeSource): Date {
  switch (source.frequency) {
    case "weekly":
      return addWeeks(date, 1);
    case "biweekly":
      return addWeeks(date, 2);
    case "semimonthly":
      return addDays(date, 15);
    case "monthly":
      return addMonths(date, 1);
    default:
      return addWeeks(date, 2);
  }
}

function getPaydaysForRange(source: IncomeSource | undefined, start: Date, end: Date): Date[] {
  if (!source) return [];

  let cursor = getNextPayday(source.frequency, source.nextPayday, subMonths(start, 2));
  while (cursor < start) {
    cursor = advancePayday(cursor, source);
  }

  const paydays: Date[] = [];
  while (cursor <= end) {
    paydays.push(cursor);
    cursor = advancePayday(cursor, source);
  }

  return paydays;
}

export default function TimelinePage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [settings, setSettings] = useState<ReturnType<typeof getSettings> | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(startOfToday());

  useEffect(() => {
    const loadData = () => {
      const data = getHouseholdData() as Household | null;
      if (data) {
        setHousehold(data);
        setSettings(getSettings());
      }
    };

    void Promise.resolve().then(loadData);
  }, []);

  const calendarStart = startOfWeek(startOfMonth(visibleMonth));
  const calendarEnd = endOfWeek(endOfMonth(visibleMonth));
  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  if (!household || !settings) {
    return (
      <ToastProvider>
        <AppShell>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  const today = startOfToday();
  const incomeSource = household.incomeSources[0];
  const nextPayday = incomeSource ? getNextPayday(incomeSource.frequency, incomeSource.nextPayday) : new Date();
  const billsDue = getBillsDueBeforePayday(household.bills, nextPayday);
  const totalBillsDue = billsDue.reduce((sum, bill) => sum + bill.amount, 0);
  const savingsPerPaycheck = getSavingsContribution(
    household.settings.savingsMode,
    incomeSource?.amount || 0,
    settings.minSavings
  );
  const safeToSpend = Math.max(0, household.currentBalance - totalBillsDue - savingsPerPaycheck - settings.minBuffer);
  const isTight = safeToSpend < settings.minBuffer * 0.5;
  const fundingMap = getFundingMap();
  const paydays = getPaydaysForRange(incomeSource, calendarStart, calendarEnd);

  const getEntriesForDay = (day: Date): CalendarEntry[] => {
    const paydayEntries = paydays
      .filter((payday) => isSameDay(payday, day))
      .map((payday) => ({
        id: `payday-${payday.toISOString()}`,
        type: "payday" as const,
        title: "Payday",
        amount: incomeSource?.amount || 0,
      }));

    const billEntries = household.bills
      .filter((bill) => !isBillPaidForCurrentPeriod(bill) && bill.dueDay === day.getDate())
      .map((bill) => ({
        id: `bill-${bill.id}`,
        type: "bill" as const,
        title: bill.name,
        amount: bill.amount,
        isFunded: (fundingMap[bill.id] || 0) >= bill.amount,
      }));

    return [...paydayEntries, ...billEntries];
  };

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6">
          <Card className="relative overflow-hidden bg-slate-950 text-white shadow-lifted" padding="lg">
            <div className="absolute inset-x-0 top-0 h-1 surface-line" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,70,229,0.28),transparent_45%),linear-gradient(225deg,rgba(20,184,166,0.22),transparent_40%)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Cash Flow Calendar</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                    {format(visibleMonth, "MMMM yyyy")}
                  </h2>
                </div>
                <Badge variant={isTight ? "warning" : "success"}>{isTight ? "Tight" : "Protected"}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-xs text-slate-300">Next Payday</p>
                  <p className="mt-1 text-xl font-black text-emerald-300">{formatCurrency(incomeSource?.amount || 0)}</p>
                  <p className="text-xs text-slate-300">{format(nextPayday, "EEE, MMM d")}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-xs text-slate-300">Bills Before Payday</p>
                  <p className="mt-1 text-xl font-black text-amber-300">{formatCurrency(totalBillsDue)}</p>
                  <p className="text-xs text-slate-300">{billsDue.length} bills due</p>
                </div>
              </div>
              {isTight && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/12 p-3">
                  <AlertTriangle className="h-5 w-5 text-amber-300" />
                  <p className="text-sm text-amber-100">Cash flow looks tight before the next check.</p>
                </div>
              )}
            </div>
          </Card>

          <Card padding="md" className="bg-slate-900/88 text-white border-slate-700/70">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
                className="rounded-lg bg-white/10 p-2 text-slate-200 transition-colors hover:bg-white/15"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-300">Calendar View</p>
                <p className="text-lg font-black tracking-tight text-white">{format(visibleMonth, "MMMM yyyy")}</p>
              </div>
              <button
                onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
                className="rounded-lg bg-white/10 p-2 text-slate-200 transition-colors hover:bg-white/15"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday} className="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {weekday}
                </div>
              ))}

              {days.map((day) => {
                const entries = getEntriesForDay(day);
                const isTodayDate = isSameDay(day, today);
                const isCurrentMonth = isSameMonth(day, visibleMonth);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-24 rounded-lg border p-1.5 transition-colors",
                      isCurrentMonth
                        ? "border-slate-700 bg-slate-800/82"
                        : "border-slate-800 bg-slate-900/58 text-slate-500",
                      isTodayDate && "border-cyan-300 bg-cyan-950/55"
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md text-xs font-black",
                          isTodayDate ? "bg-cyan-300 text-slate-950" : "text-slate-200",
                          !isCurrentMonth && "text-slate-500"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {entries.slice(0, 3).map((entry) => (
                        <div
                          key={entry.id}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold leading-tight",
                            entry.type === "payday"
                              ? "bg-emerald-400/18 text-emerald-200"
                              : entry.isFunded
                              ? "bg-cyan-400/16 text-cyan-200"
                              : "bg-amber-400/18 text-amber-200"
                          )}
                          title={`${entry.title}: ${formatCurrency(entry.amount)}`}
                        >
                          {entry.type === "payday" ? (
                            <DollarSign className="h-3 w-3 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                          )}
                          <span className="truncate">{entry.title}</span>
                        </div>
                      ))}
                      {entries.length > 3 && (
                        <p className="px-1 text-[10px] font-semibold text-slate-400">+{entries.length - 3} more</p>
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
