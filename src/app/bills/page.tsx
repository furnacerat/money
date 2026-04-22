"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge, ProgressBar, EmptyState, Input } from "@/components/ui";
import { formatCurrency, getBillCategoryColor } from "@/lib/utils";
import { Household, Bill, BillStatus } from "@/lib/types";
import { getHouseholdData, getFundingMap, saveHouseholdData, saveFundingMap } from "@/lib/storage";
import { getBillFundingStatus, getComputedBillStatus, isBillPaidForCurrentPeriod, getCurrentPeriod, markBillAsPaid, resetBillForNewPeriod, getNextBillDueDate } from "@/lib/planner";
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
  const [filter, setFilter] = useState<"all" | "unpaid" | "funded" | "paid" | "due_soon" | "past_due">("unpaid");
  const [showPeriodPicker, setShowPeriodPicker] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [showFundModal, setShowFundModal] = useState<string | null>(null);
  const [existingFunds, setExistingFunds] = useState("");

  const getPastMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ key, label });
    }
    return months;
  };

  const handlePayClick = (billId: string) => {
    const bill = household?.bills.find(b => b.id === billId);
    if (!bill) return;
    
    const nextDue = getNextBillDueDate(bill);
    const currentMonth = new Date();
    
    if (nextDue < new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)) {
      setSelectedBillId(billId);
      setShowPeriodPicker(billId);
    } else {
      handleMarkPaid(billId);
    }
  };

  const handlePeriodSelect = (period: string) => {
    if (selectedBillId) {
      handleMarkPaid(selectedBillId, period);
      setShowPeriodPicker(null);
      setSelectedBillId(null);
    }
  };

  const handleAddExistingFunds = (billId: string) => {
    const amount = parseFloat(existingFunds) || 0;
    if (amount <= 0 || !household) return;
    
    const currentFunded = fundingMap[billId] || 0;
    const updatedFunding = { ...fundingMap, [billId]: currentFunded + amount };
    setFundingMap(updatedFunding);
    saveFundingMap(updatedFunding);
    
    setShowFundModal(null);
    setExistingFunds("");
  };

  const openFundModal = (billId: string) => {
    setSelectedBillId(billId);
    setShowFundModal(billId);
  };

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      const resetBills = (data.bills || []).map(resetBillForNewPeriod);
      const updatedData = { ...data, bills: resetBills };
      setHousehold(updatedData);
      setFundingMap(getFundingMap());
    }
  }, []);

  const bills = household?.bills || [];
  const today = new Date();
  const currentPeriod = getCurrentPeriod();

  const filteredBills = bills.filter((bill) => {
    const computedStatus = getComputedBillStatus(bill, today);
    const isPaid = isBillPaidForCurrentPeriod(bill);
    const nextDueDate = getNextBillDueDate(bill);
    const wasDueBeforeCurrentMonth = nextDueDate < new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (filter) {
      case "all": return true;
      case "unpaid": return !isPaid;
      case "funded": {
        const funded = fundingMap[bill.id] || 0;
        return funded >= bill.amount && !isPaid;
      }
      case "paid": return isPaid;
      case "due_soon": return computedStatus === "due_soon";
      case "past_due": return !isPaid && wasDueBeforeCurrentMonth;
      default: return true;
    }
  });

  const handleMarkPaid = (billId: string, period?: string) => {
    if (!household) return;
    
    const targetPeriod = period || getCurrentPeriod();
    
    const updatedBills = household.bills.map(bill => {
      if (bill.id === billId) {
        return {
          ...bill,
          status: "paid" as const,
          paidDate: new Date().toISOString().split("T")[0],
          paidPeriod: targetPeriod,
        };
      }
      return bill;
    });
    
    const updatedHousehold = { ...household, bills: updatedBills };
    setHousehold(updatedHousehold);
    saveHouseholdData(updatedHousehold);
  };

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
          {/* Period Picker Modal */}
          {showPeriodPicker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card padding="lg" className="w-full max-w-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Mark as Paid</h3>
                <p className="text-sm text-slate-500 mb-4">This bill is past due. Which month are you paying?</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getPastMonths().map((month) => (
                    <button
                      key={month.key}
                      onClick={() => handlePeriodSelect(month.key)}
                      className="w-full p-3 text-left rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{month.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowPeriodPicker(null);
                    setSelectedBillId(null);
                  }}
                  className="mt-4 w-full p-3 text-center rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </Card>
            </div>
          )}

          {/* Add Existing Funds Modal */}
          {showFundModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card padding="lg" className="w-full max-w-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Add Existing Funds</h3>
                <p className="text-sm text-slate-500 mb-4">
                  How much have you already set aside for this bill outside the app?
                </p>
                <Input
                  label="Amount already saved"
                  type="number"
                  value={existingFunds}
                  onChange={(e) => setExistingFunds(e.target.value)}
                  placeholder="0.00"
                />
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowFundModal(null);
                      setExistingFunds("");
                      setSelectedBillId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleAddExistingFunds(showFundModal)}
                  >
                    Add Funds
                  </Button>
                </div>
              </Card>
            </div>
          )}

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
              { key: "past_due", label: "Past Due" },
              { key: "unpaid", label: "To Pay" },
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
          {filteredBills.length === 0 ? (
            <Card padding="lg">
              <EmptyState
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
                const isPaid = isBillPaidForCurrentPeriod(bill);
                const computedStatus = getComputedBillStatus(bill, today);

                const getStatusBadge = () => {
                  if (isPaid) {
                    return <Badge variant="success" size="sm">Paid</Badge>;
                  }
                  if (status.isFunded) {
                    return <Badge variant="success" size="sm">Funded</Badge>;
                  }
                  if (computedStatus === "due_today") {
                    return <Badge variant="danger" size="sm" pulse>Due Today</Badge>;
                  }
                  if (computedStatus === "due_soon") {
                    return <Badge variant="warning" size="sm">Due Soon</Badge>;
                  }
                  return <Badge variant="neutral" size="sm">To Pay</Badge>;
                };

                const handlePayClickLocal = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePayClick(bill.id);
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
                          {!isPaid && (
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
                      {!isPaid && (
                        <div className="mt-3 space-y-2">
                          <ProgressBar
                            progress={status.fundedPercentage}
                            color={status.isFunded ? "#10B981" : "#8B5CF6"}
                            height={6}
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openFundModal(bill.id);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                          >
                            + Add existing funds
                          </button>
                        </div>
                      )}
                      {isPaid ? (
                        <div className="mt-2 text-xs text-emerald-600 font-medium">
                          Paid for {currentPeriod}
                        </div>
                      ) : (
                        <button
                          onClick={handlePayClickLocal}
                          className="mt-2 text-xs text-blue-600 font-medium hover:text-blue-700"
                        >
                          Mark as paid →
                        </button>
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