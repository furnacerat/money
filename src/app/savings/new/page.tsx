"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input, Select, Toggle } from "@/components/ui";
import { Household, SavingsGoal, SavingsGoalType } from "@/lib/types";
import { getHouseholdData, saveHouseholdData } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { ChevronLeft, Check } from "lucide-react";

const GOAL_TYPES = [
  { value: "emergency", label: "Emergency Fund" },
  { value: "vacation", label: "Vacation" },
  { value: "home", label: "Home" },
  { value: "car", label: "Car" },
  { value: "debt", label: "Debt Payoff" },
  { value: "custom", label: "Custom" },
];

const PRIORITIES = [
  { value: "1", label: "High - Focus on this first" },
  { value: "2", label: "Medium - Normal priority" },
  { value: "3", label: "Low - When extra funds available" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    targetAmount: 0,
    targetDate: "",
    type: "custom" as SavingsGoalType,
    priority: 2,
    contributionPerPaycheck: 200,
    hasTargetDate: false,
  });

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
    }
  }, []);

  const handleSave = async () => {
    if (!form.name || form.targetAmount <= 0) return;

    setIsSaving(true);

    const newGoal: SavingsGoal = {
      id: generateId(),
      name: form.name,
      targetAmount: form.targetAmount,
      currentAmount: 0,
      type: form.type,
      targetDate: form.hasTargetDate ? form.targetDate : undefined,
      isCompleted: false,
      priority: Number(form.priority),
      contributionPerPaycheck: form.contributionPerPaycheck,
    };

    const updatedGoals = [...(household?.savingsGoals || []), newGoal];
    const updatedHousehold = { ...household!, savingsGoals: updatedGoals };
    saveHouseholdData(updatedHousehold);

    setIsSaving(false);
    setSaved(true);

    setTimeout(() => {
      router.push("/savings");
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
            <h2 className="text-xl font-bold text-slate-800">Add Savings Goal</h2>
          </div>

          <Card padding="lg">
            <div className="space-y-5">
              <Input
                label="Goal Name"
                placeholder="Emergency Fund, Hawaii Trip..."
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />

              <Select
                label="Goal Type"
                options={GOAL_TYPES}
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value as SavingsGoalType }))}
              />

              <Input
                label="Target Amount"
                type="number"
                placeholder="5000"
                value={form.targetAmount || ""}
                onChange={(e) => setForm(f => ({ ...f, targetAmount: Number(e.target.value) }))}
              />

              <Toggle
                label="Set a target date"
                description="When do you want to reach this goal?"
                checked={form.hasTargetDate}
                onChange={(checked) => setForm(f => ({ ...f, hasTargetDate: checked }))}
              />

              {form.hasTargetDate && (
                <Input
                  label="Target Date"
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm(f => ({ ...f, targetDate: e.target.value }))}
                />
              )}

              <Input
                label="Contribution Per Paycheck"
                type="number"
                placeholder="200"
                value={form.contributionPerPaycheck || ""}
                onChange={(e) => setForm(f => ({ ...f, contributionPerPaycheck: Number(e.target.value) }))}
                hint="How much you plan to save with each paycheck"
              />

              <Select
                label="Priority"
                options={PRIORITIES}
                value={String(form.priority)}
                onChange={(e) => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
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
              disabled={!form.name || form.targetAmount <= 0}
              leftIcon={saved ? <Check size={18} /> : undefined}
            >
              {saved ? "Added!" : "Add Goal"}
            </Button>
          </div>
        </div>
      </AppShell>
    </ToastProvider>
  );
}