"use client";

import React from "react";
import { useHousehold } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Wallet, Receipt, PiggyBank, ShoppingCart, Fuel, Shield, Check } from "lucide-react";

export default function PaycheckPlan() {
  const { household, getPaycheckPlan } = useHousehold();
  
  const upcomingPaycheck = household.paychecks.find((p) => !p.isReceived);
  const plan = upcomingPaycheck ? getPaycheckPlan(upcomingPaycheck) : null;

  if (!plan) {
    return (
      <div className="space-y-6">
        <Card padding="lg" className="text-center">
          <p className="text-slate-600">No upcoming paycheck to plan.</p>
        </Card>
      </div>
    );
  }

  const allocationItems = [
    { icon: Receipt, displayLabel: "Bills", color: "#8B5CF6", allocation: plan.allocations[0] },
    { icon: PiggyBank, displayLabel: "Savings", color: "#10B981", allocation: plan.allocations[1] },
    { icon: ShoppingCart, displayLabel: "Groceries", color: "#F59E0B", allocation: plan.allocations[2] },
    { icon: Fuel, displayLabel: "Gas", color: "#3B82F6", allocation: plan.allocations[3] },
    { icon: Shield, displayLabel: "Cushion", color: "#06B6D4", allocation: plan.allocations[4] },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Paycheck Header */}
      <Card variant="gradient">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 mb-4">
            <Wallet className="text-violet-600" size={28} />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Next Paycheck
          </p>
          <p className="text-4xl font-bold text-slate-800">
            {formatCurrency(plan.totalAmount)}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            arriving {upcomingPaycheck?.date ? new Date(upcomingPaycheck.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'soon'}
          </p>
        </div>
      </Card>

      {/* Allocation Breakdown */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Money Plan</h2>
        <div className="space-y-4">
          {allocationItems.map((item, index) => (
            <div key={item.displayLabel} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <span className="font-medium text-slate-700">{item.displayLabel}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{formatCurrency(item.allocation.amount)}</p>
                  <p className="text-xs text-slate-500">{Math.round(item.allocation.percentage * 100)}%</p>
                </div>
              </div>
              <ProgressBar
                progress={item.allocation.percentage}
                color={item.color}
                height={4}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Safe to Spend */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full bg-emerald-500 opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Check className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Safe to Spend</p>
              <p className="text-sm text-slate-500">After all obligations</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-emerald-600">
            {formatCurrency(plan.safeToSpend)}
          </p>
          <p className="text-sm text-emerald-700 mt-2">
            This is what's truly yours to enjoy
          </p>
        </div>
      </Card>

      {/* Plan Summary */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Plan Summary</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Paycheck Amount</span>
            <span className="font-semibold text-slate-800">{formatCurrency(plan.totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Bills & Essentials</span>
            <span className="font-semibold text-violet-600">-{formatCurrency(plan.allocations[0].amount + plan.allocations[2].amount + plan.allocations[3].amount)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Savings</span>
            <span className="font-semibold text-emerald-600">-{formatCurrency(plan.allocations[1].amount)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Emergency Cushion</span>
            <span className="font-semibold text-sky-600">-{formatCurrency(plan.allocations[4].amount)}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-semibold text-slate-800">Safe to Spend</span>
            <span className="text-xl font-bold text-emerald-600">{formatCurrency(plan.safeToSpend)}</span>
          </div>
        </div>
      </Card>

      {/* Reassuring Note */}
      <Card variant="outlined" padding="md" className="text-center">
        <p className="text-slate-600">
          Every dollar has a job. Your bills are covered, savings is growing, and you still have room to enjoy life.
        </p>
      </Card>
    </div>
  );
}