"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { getOnboardingData } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { format, addDays, startOfToday, parseISO, differenceInDays, isSameDay } from "date-fns";
import { DollarSign, AlertTriangle } from "lucide-react";

export default function TimelinePage() {
  const data = getOnboardingData();
  const today = startOfToday();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const bills = data.bills || [];

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <Card variant="gradient" padding="md">
            <h3 className="font-semibold text-slate-800 mb-4">Next 2 Weeks</h3>
            <div className="space-y-3">
              {days.map((day) => {
                const isToday = isSameDay(day, today);
                const hasPayday = data.nextPayday && isSameDay(day, parseISO(data.nextPayday));
                const dueBills = bills.filter((b) => b.dueDay === day.getDate());

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isToday ? "bg-violet-50" : "bg-slate-50"
                    }`}
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <p className={`text-xs font-medium ${isToday ? "text-violet-600" : "text-slate-500"}`}>
                        {format(day, "EEE")}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? "text-violet-600" : "text-slate-800"}`}>
                        {format(day, "d")}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {hasPayday && (
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <DollarSign size={12} className="text-emerald-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">Payday</p>
                          <p className="text-sm font-semibold text-emerald-600 ml-auto">
                            {formatCurrency(data.paycheckAmount || 0)}
                          </p>
                        </div>
                      )}
                      {dueBills.length > 0 && dueBills.map((bill) => (
                        <div key={bill.name} className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={12} className="text-amber-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 truncate">{bill.name}</p>
                          <p className="text-sm font-semibold text-slate-800 ml-auto">
                            {formatCurrency(bill.amount)}
                          </p>
                        </div>
                      ))}
                      {!hasPayday && dueBills.length === 0 && (
                        <p className="text-sm text-slate-400 py-1">No events</p>
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