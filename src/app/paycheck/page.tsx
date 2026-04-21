"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { getOnboardingData } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Wallet, Calendar, ChevronRight } from "lucide-react";

export default function PaycheckPage() {
  const data = getOnboardingData();

  const monthlyIncome = (data.paycheckAmount || 0) * 2;
  const nextPayday = data.nextPayday
    ? format(new Date(data.nextPayday), "EEEE, MMM d")
    : "Not set";

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <Card variant="gradient" padding="lg" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700 opacity-10" />
            <div className="relative text-center py-6">
              <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-violet-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                Next Paycheck
              </p>
              <p className="text-4xl font-bold text-slate-800">
                {formatCurrency(data.paycheckAmount || 0)}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                arriving {nextPayday}
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Pay frequency</span>
                <span className="font-medium text-slate-800 capitalize">
                  {data.payFrequency || "Bi-weekly"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Monthly estimate</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(monthlyIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Savings mode</span>
                <span className="font-medium text-slate-800 capitalize">
                  {data.savingsMode || "Normal"}
                </span>
              </div>
            </div>
          </Card>

          <EmptyState
            icon={<Calendar size={24} className="text-slate-400" />}
            title="More coming soon"
            description="Full paycheck planning with bill allocation will be available after Phase 2."
          />
        </div>
      </AppShell>
    </ToastProvider>
  );
}