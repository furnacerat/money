"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge, BillCard, EmptyState } from "@/components/ui";
import { getOnboardingData, saveOnboardingData } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { Bill, OnboardingData } from "@/lib/types";
import { Plus, Filter } from "lucide-react";

export default function BillsPage() {
  const [data, setData] = useState<Partial<OnboardingData>>(() => getOnboardingData());
  const [filter, setFilter] = useState<"all" | "auto" | "manual">("all");

  const bills = (data.bills || []).map((bill, i) => ({
    name: bill.name,
    amount: bill.amount,
    dueDay: bill.dueDay,
    frequency: bill.frequency,
    isAutoPay: bill.isAutoPay,
    category: bill.category,
    priority: bill.priority,
    status: bill.status,
    id: `bill-${i}`,
  }));

  const filteredBills = bills.filter((bill) => {
    if (filter === "all") return true;
    if (filter === "auto") return bill.isAutoPay;
    if (filter === "manual") return !bill.isAutoPay;
    return true;
  });

  const totalMonthly = bills.reduce((sum, bill) => {
    const monthly = bill.frequency === "monthly" ? bill.amount :
      bill.frequency === "weekly" ? bill.amount * 4.33 :
      bill.frequency === "biweekly" ? bill.amount * 2.17 :
      bill.amount;
    return sum + monthly;
  }, 0);

  const autoPayCount = bills.filter((b) => b.isAutoPay).length;

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          {/* Summary Card */}
          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Monthly Bills</p>
                <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalMonthly)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">{bills.length} bills</p>
                <p className="text-xl font-semibold text-emerald-600">{autoPayCount} auto</p>
              </div>
            </div>
          </Card>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {[
              { key: "all", label: "All Bills" },
              { key: "auto", label: "Auto-pay" },
              { key: "manual", label: "Manual" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? "bg-violet-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bills List */}
          {filteredBills.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                title="No bills added"
                description="Add your bills during onboarding or in settings"
                action={
                  <Button variant="outline" leftIcon={<Plus size={16} />}>
                    Add Bill
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">By Category</h3>
            <div className="space-y-2">
              {["housing", "utilities", "insurance"].map((cat) => {
                const catBills = bills.filter((b) => b.category === cat);
                if (catBills.length === 0) return null;
                const catTotal = catBills.reduce((sum, b) => sum + b.amount, 0);
                return (
                  <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600 capitalize">{cat}</span>
                    <span className="text-sm font-medium text-slate-800">{formatCurrency(catTotal)}</span>
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