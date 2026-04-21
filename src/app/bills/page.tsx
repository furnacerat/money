"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge, ProgressBar, EmptyState } from "@/components/ui";
import { formatCurrency, getBillCategoryColor } from "@/lib/utils";
import { Household, Bill, BillStatus } from "@/lib/types";
import { getHouseholdData, getFundingMap } from "@/lib/storage";
import { getBillFundingStatus } from "@/lib/planner";
import { format } from "date-fns";
import { Plus, Filter, Calendar, ChevronRight, Home, Zap, Shield, Tv, Car, Heart, Package } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  housing: Home,
  utilities: Zap,
  insurance: Shield,
  subscriptions: Tv,
  transportation: Car,
  healthcare: Heart,
  debt: Package,
  other: Package,
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Yearly",
  irregular: "Variable",
};

export default function BillsPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [fundingMap, setFundingMap] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<"all" | "upcoming" | "funded" | "paid" | "overdue">("upcoming");

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setFundingMap(getFundingMap());
    }
  }, []);

  const bills = household?.bills || [];
  const today = new Date();

  const filteredBills = bills.filter((bill) => {
    switch (filter) {
      case "all": return true;
      case "upcoming": return bill.status === "upcoming" || bill.status === "due_soon";
      case "funded": {
        const funded = fundingMap[bill.id] || 0;
        return funded >= bill.amount;
      }
      case "paid": return bill.status === "paid";
      case "overdue": return bill.status === "overdue";
      default: return true;
    }
  });

  const totalMonthly = bills
    .filter(b => b.status !== "paid")
    .reduce((sum, bill) => {
      switch (bill.frequency) {
        case "monthly": return sum + bill.amount;
        case "weekly": return sum + bill.amount * 4.33;
        case "biweekly": return sum + bill.amount * 2.17;
        case "quarterly": return sum + bill.amount / 3;
        case "annual": return sum + bill.amount / 12;
        default: return sum + bill.amount;
      }
    }, 0);

  const autoPayCount = bills.filter(b => b.isAutoPay && b.status !== "paid").length;

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

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
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
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "funded", label: "Funded" },
              { key: "paid", label: "Paid" },
              { key: "overdue", label: "Overdue" },
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
                icon={<Calendar size={24} className="text-slate-400" />}
                title="No bills found"
                description={filter === "all" ? "Add your first bill to get started" : "No bills match this filter"}
                action={
                  <Link href="/bills/new">
                    <Button variant="outline" leftIcon={<Plus size={16} />}>
                      Add Bill
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBills.map((bill) => {
                const status = getBillFundingStatus(bill, fundingMap[bill.id] || 0);
                const Icon = CATEGORY_ICONS[bill.category] || Package;
                const categoryColor = getBillCategoryColor(bill.category);
                const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                const getStatusBadge = () => {
                  if (bill.status === "paid") {
                    return <Badge variant="success" size="sm">Paid</Badge>;
                  }
                  if (status.isFunded) {
                    return <Badge variant="success" size="sm">Funded</Badge>;
                  }
                  if (daysUntilDue <= 0) {
                    return <Badge variant="danger" size="sm" pulse>Overdue</Badge>;
                  }
                  if (daysUntilDue <= 3) {
                    return <Badge variant="warning" size="sm">Due Soon</Badge>;
                  }
                  return <Badge variant="neutral" size="sm">Upcoming</Badge>;
                };

                return (
                  <Link key={bill.id} href={`/bills/${bill.id}`}>
                    <Card padding="md" className="relative overflow-hidden hover:shadow-medium transition-shadow cursor-pointer">
                      <div
                        className="absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full opacity-10"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <div className="relative flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${categoryColor}15` }}
                          >
                            <Icon size={22} style={{ color: categoryColor }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-800">{bill.name}</h3>
                              {getStatusBadge()}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                              <span>Day {bill.dueDay}</span>
                              <span>{FREQUENCY_LABELS[bill.frequency]}</span>
                              {bill.isAutoPay && (
                                <span className="text-violet-600">Auto-pay</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">
                            {formatCurrency(bill.amount)}
                          </p>
                          {bill.status !== "paid" && (
                            <p className={`text-xs mt-1 ${
                              status.isFunded ? "text-emerald-600" : "text-slate-500"
                            }`}>
                              {status.isFunded
                                ? "Fully funded"
                                : `${formatCurrency(status.remainingNeeded)} to go`}
                            </p>
                          )}
                        </div>
                      </div>
                      {bill.status !== "paid" && (
                        <div className="mt-3">
                          <ProgressBar
                            progress={status.fundedPercentage}
                            color={status.isFunded ? "#10B981" : "#8B5CF6"}
                            height={6}
                          />
                        </div>
                      )}
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Add Bill Button */}
          <Link href="/bills/new">
            <Button variant="outline" className="w-full" leftIcon={<Plus size={18} />}>
              Add New Bill
            </Button>
          </Link>
        </div>
      </AppShell>
    </ToastProvider>
  );
}