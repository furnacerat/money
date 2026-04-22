"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input } from "@/components/ui";
import { Household, ExpenseBucket } from "@/lib/types";
import { getHouseholdData } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { addExpense } from "@/lib/storage";
import { format } from "date-fns";
import { ChevronLeft, Check } from "lucide-react";

const BUCKETS: { value: ExpenseBucket; label: string; color: string }[] = [
  { value: "groceries", label: "Groceries", color: "#10B981" },
  { value: "gas", label: "Gas", color: "#3B82F6" },
  { value: "household", label: "Household", color: "#8B5CF6" },
  { value: "kids", label: "Kids", color: "#F59E0B" },
  { value: "dining", label: "Dining Out", color: "#EF4444" },
  { value: "entertainment", label: "Entertainment", color: "#EC4899" },
  { value: "misc", label: "Misc", color: "#6B7280" },
];

export default function NewExpensePage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    amount: 0,
    bucket: "groceries" as ExpenseBucket,
    note: "",
    date: format(new Date(), "yyyy-MM-dd"),
    enteredBy: "",
  });

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setForm(f => ({ ...f, enteredBy: data.owner.name }));
    }
  }, []);

  const handleSave = async () => {
    if (form.amount <= 0) return;

    setIsSaving(true);

    const newExpense = {
      id: generateId(),
      amount: form.amount,
      bucket: form.bucket,
      note: form.note,
      date: form.date,
      enteredBy: form.enteredBy,
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);

    setIsSaving(false);
    setSaved(true);

    setTimeout(() => {
      router.push("/expenses");
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
            <h2 className="text-xl font-bold text-slate-800">Add Expense</h2>
          </div>

          <Card padding="lg">
            <div className="space-y-5">
              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {BUCKETS.map((bucket) => (
                    <button
                      key={bucket.value}
                      onClick={() => setForm(f => ({ ...f, bucket: bucket.value }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.bucket === bucket.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: bucket.color }}
                      />
                      <p className="text-sm font-medium text-slate-700">
                        {bucket.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Description (optional)"
                placeholder="What did you buy?"
                value={form.note}
                onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              />

              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={form.amount <= 0}
            leftIcon={saved ? <Check size={20} /> : undefined}
          >
            {saved ? "Expense Added!" : "Add Expense"}
          </Button>
        </div>
      </AppShell>
    </ToastProvider>
  );
}