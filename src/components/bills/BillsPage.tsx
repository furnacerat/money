"use client";

import React, { useState } from "react";
import { useHousehold } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { Card, Button, Badge, BillCard } from "@/components/ui";
import { Plus, Filter, Calendar } from "lucide-react";

export default function BillsPage() {
  const { household, markBillPaid } = useHousehold();
  const [filter, setFilter] = useState<"all" | "upcoming" | "due_soon" | "paid">("upcoming");

  const filteredBills = household.bills.filter((bill) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return bill.status === "upcoming";
    if (filter === "due_soon") return bill.status === "due_soon" || bill.status === "due_today";
    if (filter === "paid") return bill.status === "paid";
    return true;
  });

  const totalDue = filteredBills
    .filter((b) => b.status !== "paid")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const reservedAmount = filteredBills
    .filter((b) => b.isReserved)
    .reduce((sum, bill) => sum + bill.reservedAmount, 0);

  const handleMarkPaid = (billId: string) => {
    markBillPaid(billId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card variant="gradient">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Due This Period</p>
            <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalDue)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Reserved</p>
            <p className="text-xl font-semibold text-emerald-600">{formatCurrency(reservedAmount)}</p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {[
          { key: "all", label: "All Bills" },
          { key: "upcoming", label: "Upcoming" },
          { key: "due_soon", label: "Due Soon" },
          { key: "paid", label: "Paid" },
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
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500">No bills in this category</p>
          </Card>
        ) : (
          filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onMarkPaid={() => handleMarkPaid(bill.id)}
            />
          ))
        )}
      </div>

      {/* Quick Stats */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Bills at a Glance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-500">Auto-pay</p>
            <p className="text-lg font-bold text-slate-800">
              {household.bills.filter((b) => b.isAutoPay && b.status !== "paid").length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-500">Manual</p>
            <p className="text-lg font-bold text-slate-800">
              {household.bills.filter((b) => !b.isAutoPay && b.status !== "paid").length}
            </p>
          </div>
        </div>
      </Card>

      {/* Reassuring Note */}
      <Card variant="outlined" padding="md" className="text-center">
        <p className="text-slate-600">
          {totalDue > 0
            ? `${formatCurrency(reservedAmount)} is already set aside. You're covered.`
            : "All bills are paid. Great job!"}
        </p>
      </Card>
    </div>
  );
}