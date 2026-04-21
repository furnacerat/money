"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge, ProgressBar, Input, Select, Toggle } from "@/components/ui";
import { formatCurrency, getBillCategoryColor } from "@/lib/utils";
import { Household, Bill, BillCategory, BillFrequency } from "@/lib/types";
import { getHouseholdData, saveHouseholdData, getFundingMap, saveFundingMap } from "@/lib/storage";
import { getBillFundingStatus } from "@/lib/planner";
import { format } from "date-fns";
import { Home, Zap, Shield, Tv, Car, Heart, Package, ChevronLeft, ChevronRight, Check } from "lucide-react";

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

const BILL_CATEGORIES = [
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "insurance", label: "Insurance" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "transportation", label: "Transportation" },
  { value: "healthcare", label: "Healthcare" },
  { value: "debt", label: "Debt" },
  { value: "other", label: "Other" },
];

const BILL_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Yearly" },
  { value: "irregular", label: "Variable" },
];

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [fundingMap, setFundingMap] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    amount: 0,
    dueDay: 1,
    frequency: "monthly" as BillFrequency,
    category: "other" as BillCategory,
    isAutoPay: false,
    priority: 1,
  });

  const billId = params.id as string;

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setFundingMap(getFundingMap());
      const bill = data.bills.find(b => b.id === billId);
      if (bill) {
        setEditForm({
          name: bill.name,
          amount: bill.amount,
          dueDay: bill.dueDay,
          frequency: bill.frequency,
          category: bill.category,
          isAutoPay: bill.isAutoPay,
          priority: bill.priority,
        });
      }
    }
  }, [billId]);

  const bill = household?.bills.find(b => b.id === billId);
  const today = new Date();
  const dueDate = bill ? new Date(today.getFullYear(), today.getMonth(), bill.dueDay) : today;
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (!household || !bill) {
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

  const funding = getBillFundingStatus(bill, fundingMap[bill.id] || 0);
  const Icon = CATEGORY_ICONS[bill.category] || Package;
  const categoryColor = getBillCategoryColor(bill.category);

  const handleSave = async () => {
    setIsSaving(true);
    
    const updatedBills = household.bills.map(b => 
      b.id === billId ? { ...b, ...editForm } : b
    );
    
    const updatedHousehold = { ...household, bills: updatedBills };
    saveHouseholdData(updatedHousehold);
    setHousehold(updatedHousehold);
    
    setIsEditing(false);
    setIsSaving(false);
    setSaved(true);
  };

  const handleMarkPaid = () => {
    const updatedBills = household.bills.map(b =>
      b.id === billId ? { ...b, status: "paid" as const, paidDate: today.toISOString() } : b
    );
    
    const updatedFundingMap = { ...fundingMap };
    delete updatedFundingMap[billId];
    
    const updatedHousehold = { ...household, bills: updatedBills };
    saveHouseholdData(updatedHousehold);
    saveFundingMap(updatedFundingMap);
    
    setHousehold(updatedHousehold);
    setFundingMap(updatedFundingMap);
    setSaved(true);
    
    setTimeout(() => {
      router.push("/bills");
    }, 500);
  };

  if (isEditing) {
    return (
      <ToastProvider>
        <AppShell householdName={household.name}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-xl font-bold text-slate-800">Edit Bill</h2>
            </div>

            <Card padding="lg">
              <div className="space-y-5">
                <Input
                  label="Bill Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Amount"
                  type="number"
                  value={editForm.amount || ""}
                  onChange={(e) => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))}
                />
                <Input
                  label="Due Day (1-31)"
                  type="number"
                  min={1}
                  max={31}
                  value={editForm.dueDay || ""}
                  onChange={(e) => setEditForm(f => ({ ...f, dueDay: Number(e.target.value) }))}
                />
                <Select
                  label="Frequency"
                  options={BILL_FREQUENCIES}
                  value={editForm.frequency}
                  onChange={(e) => setEditForm(f => ({ ...f, frequency: e.target.value as BillFrequency }))}
                />
                <Select
                  label="Category"
                  options={BILL_CATEGORIES}
                  value={editForm.category}
                  onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value as BillCategory }))}
                />
                <Toggle
                  label="Auto-pay"
                  description="Paid automatically each period"
                  checked={editForm.isAutoPay}
                  onChange={(checked) => setEditForm(f => ({ ...f, isAutoPay: checked }))}
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1" isLoading={isSaving}>
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/bills")}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800">{bill.name}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>

          <Card padding="lg">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${categoryColor}15` }}
              >
                <Icon size={28} style={{ color: categoryColor }} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(bill.amount)}
                </p>
                <p className="text-sm text-slate-500 capitalize">{bill.frequency}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Due Day</span>
                <span className="font-medium text-slate-800">Day {bill.dueDay}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Category</span>
                <span className="font-medium text-slate-800 capitalize">{bill.category}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Auto-pay</span>
                <span className="font-medium text-slate-800">
                  {bill.isAutoPay ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Status</span>
                <Badge
                  variant={
                    bill.status === "paid" ? "success" :
                    funding.isFunded ? "success" :
                    daysUntilDue <= 0 ? "danger" :
                    daysUntilDue <= 3 ? "warning" :
                    "info"
                  }
                >
                  {
                    bill.status === "paid" ? "Paid" :
                    funding.isFunded ? "Funded" :
                    daysUntilDue <= 0 ? "Overdue" :
                    daysUntilDue <= 3 ? `Due in ${daysUntilDue}d` :
                    "Upcoming"
                  }
                </Badge>
              </div>
            </div>
          </Card>

          {bill.status !== "paid" && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Funding Status</h3>
              <div className="mb-4">
                <ProgressBar
                  progress={funding.fundedPercentage}
                  color={funding.isFunded ? "#10B981" : "#8B5CF6"}
                  height={12}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Due</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(funding.totalDue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Already Funded</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(funding.fundedAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-slate-600">Still Needed</span>
                  <span className={`font-bold ${funding.isFunded ? "text-emerald-600" : "text-slate-800"}`}>
                    {formatCurrency(funding.remainingNeeded)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Suggested: {formatCurrency(funding.suggestedPerPaycheck)} per paycheck
              </p>
            </Card>
          )}

          {bill.status !== "paid" && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleMarkPaid}
              leftIcon={<Check size={20} />}
            >
              Mark as Paid
            </Button>
          )}
        </div>
      </AppShell>
    </ToastProvider>
  );
}