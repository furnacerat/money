"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Select, Toggle } from "@/components/ui";
import { OnboardingData, OnboardingStep, Bill, PayFrequency } from "@/lib/types";
import { saveOnboardingData, getOnboardingData, clearOnboardingData, setOnboarded } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import {
  Home,
  DollarSign,
  Receipt,
  PiggyBank,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import { format, addDays } from "date-fns";

const STEPS: OnboardingStep[] = [
  "welcome",
  "household",
  "income",
  "bills",
  "savings",
  "buffer",
  "summary",
];

const STEP_NUMBERS: Record<OnboardingStep, number> = {
  welcome: 0,
  household: 1,
  income: 2,
  bills: 3,
  savings: 4,
  buffer: 5,
  summary: 6,
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

const PAY_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
];

const SAVINGS_MODES = [
  { value: "survival", label: "Survival", description: "Just cover the basics" },
  { value: "normal", label: "Normal", description: "Balanced approach" },
  { value: "growth", label: "Growth", description: "Aggressive savings" },
];

const BILL_EMPTY: Omit<Bill, "id"> = {
  name: "",
  amount: 0,
  dueDay: 1,
  frequency: "monthly",
  isAutoPay: false,
  category: "other",
  priority: 1,
  status: "upcoming",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<Partial<OnboardingData>>(() => getOnboardingData());
  const [newBill, setNewBill] = useState<Omit<Bill, "id">>(BILL_EMPTY);

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;
  const progress = (currentIndex / (STEPS.length - 1)) * 100;

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const updated = { ...prev, ...updates };
      saveOnboardingData(updated);
      return updated;
    });
  }, []);

  const goNext = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleComplete = () => {
    setOnboarded(true);
    router.push("/");
  };

  const addBill = () => {
    if (!newBill.name || newBill.amount <= 0) return;
    updateData({
      bills: [...(data.bills || []), newBill],
    });
    setNewBill(BILL_EMPTY);
  };

  const removeBill = (index: number) => {
    updateData({
      bills: (data.bills || []).filter((_, i) => i !== index),
    });
  };

  const totalMonthlyBills = (data.bills || []).reduce((sum, bill) => {
    if (bill.frequency === "monthly") return sum + bill.amount;
    if (bill.frequency === "weekly") return sum + bill.amount * 4.33;
    if (bill.frequency === "biweekly") return sum + bill.amount * 2.17;
    if (bill.frequency === "quarterly") return sum + bill.amount / 3;
    if (bill.frequency === "annual") return sum + bill.amount / 12;
    return sum + bill.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Progress Bar */}
      {currentStep !== "welcome" && (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  onClick={goBack}
                  className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div className="flex-1">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-sm text-slate-500">
                {STEP_NUMBERS[currentStep]}/{STEPS.length - 1}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* WELCOME SCREEN */}
            {currentStep === "welcome" && (
              <div className="min-h-screen flex flex-col justify-center py-12">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
                    <Home className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-3">
                    Household Planner
                  </h1>
                  <p className="text-lg text-slate-500 max-w-xs mx-auto">
                    Turn every paycheck into a clear plan for your family
                  </p>
                </div>

                <Card padding="lg" className="mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Know your numbers</p>
                        <p className="text-sm text-slate-500">See exactly what's safe to spend</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Bills covered</p>
                        <p className="text-sm text-slate-500">Always know what's coming due</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Growing savings</p>
                        <p className="text-sm text-slate-500">Build your goals automatically</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button size="lg" className="w-full" onClick={goNext} rightIcon={<ChevronRight size={20} />}>
                  Get Started
                </Button>

                <p className="text-center text-sm text-slate-400 mt-6">
                  Takes about 5 minutes to set up
                </p>
              </div>
            )}

            {/* HOUSEHOLD SETUP */}
            {currentStep === "household" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <Home className="w-7 h-7 text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Your Household</h2>
                  <p className="text-slate-500 mt-2">Let's start with your family details</p>
                </div>

                <Card padding="lg">
                  <div className="space-y-5">
                    <Input
                      label="Household name"
                      placeholder="The Smith Family"
                      value={data.householdName || ""}
                      onChange={(e) => updateData({ householdName: e.target.value })}
                    />
                    <Input
                      label="Your name"
                      placeholder="Your first name"
                      value={data.userName || ""}
                      onChange={(e) => updateData({ userName: e.target.value })}
                    />
                    <Input
                      label="Partner/spouse name"
                      placeholder="Their first name"
                      value={data.spouseName || ""}
                      onChange={(e) => updateData({ spouseName: e.target.value })}
                      hint="Optional - you can add them later"
                    />
                    <Toggle
                      label="Invite partner now"
                      description="Send them a link to join your household"
                      checked={data.inviteLater === false}
                      onChange={(checked) => updateData({ inviteLater: !checked })}
                    />
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={goNext} className="flex-1" disabled={!data.householdName || !data.userName}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* INCOME SETUP */}
            {currentStep === "income" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Your Income</h2>
                  <p className="text-slate-500 mt-2">Tell us about your pay schedule</p>
                </div>

                <Card padding="lg">
                  <div className="space-y-5">
                    <Input
                      label="Income source"
                      placeholder="Primary job, side hustle, etc."
                      value={data.incomeSource || ""}
                      onChange={(e) => updateData({ incomeSource: e.target.value })}
                    />
                    <Select
                      label="Pay frequency"
                      options={PAY_FREQUENCIES}
                      value={data.payFrequency || ""}
                      onChange={(e) => updateData({ payFrequency: e.target.value as PayFrequency })}
                      placeholder="Select frequency"
                    />
                    <Input
                      label="Average paycheck amount"
                      type="number"
                      placeholder="2850"
                      value={data.paycheckAmount || ""}
                      onChange={(e) => updateData({ paycheckAmount: Number(e.target.value) })}
                    />
                    <Input
                      label="Next payday"
                      type="date"
                      value={data.nextPayday || ""}
                      onChange={(e) => updateData({ nextPayday: e.target.value })}
                    />
                    <Toggle
                      label="Variable income"
                      description="My income varies each paycheck"
                      checked={data.hasVariableIncome || false}
                      onChange={(checked) => updateData({ hasVariableIncome: checked })}
                    />
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={goNext}
                    className="flex-1"
                    disabled={!data.payFrequency || !data.paycheckAmount || !data.nextPayday}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* BILLS SETUP */}
            {currentStep === "bills" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-7 h-7 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Your Bills</h2>
                  <p className="text-slate-500 mt-2">Add your recurring bills</p>
                </div>

                <Card padding="lg">
                  <div className="space-y-4">
                    <Input
                      label="Bill name"
                      placeholder="Rent, Electric, Netflix..."
                      value={newBill.name}
                      onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Amount"
                        type="number"
                        placeholder="0"
                        value={newBill.amount || ""}
                        onChange={(e) => setNewBill({ ...newBill, amount: Number(e.target.value) })}
                      />
                      <Input
                        label="Due day"
                        type="number"
                        min={1}
                        max={31}
                        placeholder="15"
                        value={newBill.dueDay || ""}
                        onChange={(e) => setNewBill({ ...newBill, dueDay: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Category"
                        options={BILL_CATEGORIES}
                        value={newBill.category}
                        onChange={(e) => setNewBill({ ...newBill, category: e.target.value as Bill["category"] })}
                      />
                      <Select
                        label="Frequency"
                        options={BILL_FREQUENCIES}
                        value={newBill.frequency}
                        onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value as Bill["frequency"] })}
                      />
                    </div>
                    <Toggle
                      label="Auto-pay"
                      description="Paid automatically each month"
                      checked={newBill.isAutoPay}
                      onChange={(checked) => setNewBill({ ...newBill, isAutoPay: checked })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addBill}
                      disabled={!newBill.name || newBill.amount <= 0}
                      leftIcon={<Plus size={16} />}
                      className="w-full"
                    >
                      Add Bill
                    </Button>
                  </div>
                </Card>

                {(data.bills || []).length > 0 && (
                  <Card padding="md">
                    <p className="text-sm font-medium text-slate-500 mb-3">Added bills</p>
                    <div className="space-y-2">
                      {data.bills.map((bill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                        >
                          <div>
                            <p className="font-medium text-slate-800">{bill.name}</p>
                            <p className="text-sm text-slate-500">{formatCurrency(bill.amount)}/mo</p>
                          </div>
                          <button
                            onClick={() => removeBill(index)}
                            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <X size={16} className="text-slate-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={goNext} className="flex-1">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* SAVINGS SETUP */}
            {currentStep === "savings" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <PiggyBank className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Savings Goal</h2>
                  <p className="text-slate-500 mt-2">How much do you want to save?</p>
                </div>

                <Card padding="lg">
                  <div className="space-y-5">
                    <Input
                      label="Emergency fund target"
                      type="number"
                      placeholder="10000"
                      value={data.emergencyFundTarget || ""}
                      onChange={(e) => updateData({ emergencyFundTarget: Number(e.target.value) })}
                      hint="Recommended: 3-6 months of expenses"
                    />
                    <Input
                      label="Minimum savings per paycheck"
                      type="number"
                      placeholder="200"
                      value={data.minSavingsPerPaycheck || ""}
                      onChange={(e) => updateData({ minSavingsPerPaycheck: Number(e.target.value) })}
                    />
                  </div>
                </Card>

                <Card padding="lg">
                  <p className="text-sm font-medium text-slate-500 mb-4">Savings mode</p>
                  <div className="space-y-3">
                    {SAVINGS_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => updateData({ savingsMode: mode.value as OnboardingData["savingsMode"] })}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          data.savingsMode === mode.value
                            ? "border-violet-500 bg-violet-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-slate-800">{mode.label}</p>
                        <p className="text-sm text-slate-500">{mode.description}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <p className="text-sm text-slate-500 text-center">
                  You can add more savings goals after setup
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={goNext} className="flex-1">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* BUFFER SETUP */}
            {currentStep === "buffer" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Starting Balance</h2>
                  <p className="text-slate-500 mt-2">Tell us where you're starting from</p>
                </div>

                <Card padding="lg">
                  <div className="space-y-5">
                    <Input
                      label="Current account balance"
                      type="number"
                      placeholder="2847"
                      value={data.currentBalance || ""}
                      onChange={(e) => updateData({ currentBalance: Number(e.target.value) })}
                    />
                    <Input
                      label="Minimum buffer target"
                      type="number"
                      placeholder="1000"
                      value={data.targetBuffer || ""}
                      onChange={(e) => updateData({ targetBuffer: Number(e.target.value) })}
                      hint="Keep this amount as your floor"
                    />
                    <Input
                      label="Cash on hand"
                      type="number"
                      placeholder="0"
                      value={data.cashOnHand || ""}
                      onChange={(e) => updateData({ cashOnHand: Number(e.target.value) })}
                      hint="Physical cash you have"
                    />
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={goNext} className="flex-1" disabled={!data.currentBalance}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* SUMMARY */}
            {currentStep === "summary" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">You're All Set!</h2>
                  <p className="text-slate-500 mt-2">Here's your plan summary</p>
                </div>

                <Card padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Household</span>
                      <span className="font-semibold text-slate-800">{data.householdName}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Next payday</span>
                      <span className="font-semibold text-slate-800">
                        {data.nextPayday ? format(new Date(data.nextPayday), "MMM d") : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Paycheck</span>
                      <span className="font-semibold text-slate-800">
                        {data.paycheckAmount ? formatCurrency(data.paycheckAmount) : "$0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Monthly bills</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(totalMonthlyBills)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Bills added</span>
                      <span className="font-semibold text-slate-800">
                        {(data.bills || []).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Savings mode</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {data.savingsMode || "Normal"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-slate-600">Starting balance</span>
                      <span className="font-semibold text-slate-800">
                        {data.currentBalance ? formatCurrency(data.currentBalance) : "$0"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" padding="md" className="text-center">
                  <p className="text-sm text-slate-500 mb-2">Your first paycheck plan</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(
                      Math.max(
                        0,
                        (data.currentBalance || 0) -
                          totalMonthlyBills -
                          (data.minSavingsPerPaycheck || 0) -
                          (data.targetBuffer || 0)
                      )
                    )}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">safe to spend</p>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1" leftIcon={<Check size={18} />}>
                    Enter Dashboard
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}