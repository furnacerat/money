"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { getOnboardingData } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Target, Plus } from "lucide-react";

export default function SavingsPage() {
  const data = getOnboardingData();

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <Card variant="gradient" padding="lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Emergency Fund</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(0)} <span className="text-lg text-slate-400">/ {formatCurrency(data.emergencyFundTarget || 10000)}</span>
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">This Paycheck</h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Savings mode</span>
              <span className="font-medium text-slate-800 capitalize">{data.savingsMode || "Normal"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600">Per paycheck</span>
              <span className="font-medium text-slate-800">{formatCurrency(data.minSavingsPerPaycheck || 200)}</span>
            </div>
          </Card>

          <EmptyState
            icon={<Target size={24} className="text-slate-400" />}
            title="Add savings goals"
            description="Create custom goals like vacation, car, or home repairs."
            action={
              <button className="px-4 py-2 bg-violet-600 text-white rounded-xl font-medium text-sm">
                <Plus size={16} className="inline mr-2" />
                Add Goal
              </button>
            }
          />
        </div>
      </AppShell>
    </ToastProvider>
  );
}