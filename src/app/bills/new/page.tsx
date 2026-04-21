"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input, Select, Toggle } from "@/components/ui";
import { Household, Bill, BillCategory, BillFrequency, BillStatus } from "@/lib/types";
import { getHouseholdData, saveHouseholdData } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { ChevronLeft, Check } from "lucide-react";

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

export default function NewBillPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    amount: 0,
    dueDay: 1,
    frequency: "monthly" as BillFrequency,
    category: "other" as BillCategory,
    isAutoPay: false,
    priority: 1,
  });

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
    }
  }, []);

  const handleSave = async () => {
    if (!form.name || form.amount <= 0) {
      return;
    }

    setIsSaving(true);

    const newBill: Bill = {
      id: generateId(),
      name: form.name,
      amount: form.amount,
      dueDay: form.dueDay,
      frequency: form.frequency,
      category: form.category,
      isAutoPay: form.isAutoPay,
      priority: form.priority,
      status: "upcoming" as BillStatus,
    };

    const updatedBills = [...(household?.bills || []), newBill];
    const updatedHousehold = { ...household!, bills: updatedBills };
    saveHouseholdData(updatedHousehold);

    setIsSaving(false);
    setSaved(true);
    
    setTimeout(() => {
      router.push("/bills");
    }, 500);
  };

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Add New Bill</h2>
          </div>

          <Card padding="lg">
            <div className="space-y-5">
              <Input
                label="Bill Name"
                placeholder="Rent, Electric, Netflix..."
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              />
              <Input
                label="Due Day (1-31)"
                type="number"
                min={1}
                max={31}
                placeholder="1"
                value={form.dueDay || ""}
                onChange={(e) => setForm(f => ({ ...f, dueDay: Number(e.target.value) }))}
              />
              <Select
                label="Frequency"
                options={BILL_FREQUENCIES}
                value={form.frequency}
                onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value as BillFrequency }))}
              />
              <Select
                label="Category"
                options={BILL_CATEGORIES}
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value as BillCategory }))}
              />
              <Toggle
                label="Auto-pay"
                description="This bill is paid automatically"
                checked={form.isAutoPay}
                onChange={(checked) => setForm(f => ({ ...f, isAutoPay: checked }))}
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              isLoading={isSaving}
              disabled={!form.name || form.amount <= 0}
              leftIcon={saved ? <Check size={18} /> : undefined}
            >
              {saved ? "Added!" : "Add Bill"}
            </Button>
          </div>
        </div>
      </AppShell>
    </ToastProvider>
  );
}