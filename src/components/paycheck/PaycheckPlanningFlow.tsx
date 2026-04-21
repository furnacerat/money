"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Input, ProgressBar, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  getDashboardState,
  suggestPaycheckAllocation,
  getBillsDueBeforePayday,
  getBillFundingStatus,
  getNextPayday,
  PlanningSettings,
} from "@/lib/planner";
import {
  Household,
  Bill,
  PaycheckEntry,
  PaycheckAllocation,
  PayFrequency,
} from "@/lib/types";
import {
  getHouseholdData,
  getFundingMap,
  saveFundingMap,
  savePaycheckPlans,
  getPaycheckPlans,
  getSettings,
  saveSettings as saveSettingsToStorage,
} from "@/lib/storage";
import { format, parseISO } from "date-fns";
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Fuel,
  Shield,
} from "lucide-react";

type Step = "entry" | "allocation" | "bills" | "confirm" | "result";

const STEPS: Step[] = ["entry", "allocation", "bills", "confirm", "result"];

export default function PaycheckPlanningFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("entry");
  const [household, setHousehold] = useState<Household | null>(null);
  const [fundingMap, setFundingMap] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<PlanningSettings | null>(null);
  const [paycheckAmount, setPaycheckAmount] = useState(0);
  const [paycheckDate, setPaycheckDate] = useState("");
  const [notes, setNotes] = useState("");
  const [allocations, setAllocations] = useState<PaycheckAllocation[]>([]);
  const [billAllocations, setBillAllocations] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentStep === "result";
  const progress = (currentIndex / (STEPS.length - 1)) * 100;

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      const fm = getFundingMap();
      setFundingMap(fm);
      const sets = getSettings();
      setSettings(sets);
    }
  }, []);

  const incomeSource = household?.incomeSources[0];
  const payday = incomeSource
    ? getNextPayday(incomeSource.frequency, incomeSource.nextPayday)
    : new Date();

  const billsDue = household?.bills
    ? getBillsDueBeforePayday(household.bills, payday)
    : [];

  const goNext = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  };

  const goBack = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  };

  const handleEntryContinue = () => {
    if (!paycheckAmount || !paycheckDate) return;
    
    const suggested = suggestPaycheckAllocation(
      paycheckAmount,
      household?.bills || [],
      payday,
      fundingMap,
      household?.settings.savingsMode || "normal",
      settings!
    );
    setAllocations(suggested);
    
    const initialBillAlloc: Record<string, number> = {};
    billsDue.forEach((bill) => {
      const remaining = bill.amount - (fundingMap[bill.id] || 0);
      initialBillAlloc[bill.id] = Math.min(remaining, paycheckAmount * 0.25);
    });
    setBillAllocations(initialBillAlloc);
    
    goNext();
  };

  const handleAllocationAdjust = (category: string, amount: number) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.category === category ? { ...a, amount } : a
      )
    );
  };

  const handleBillAllocationAdjust = (billId: string, amount: number) => {
    setBillAllocations((prev) => ({ ...prev, [billId]: amount }));
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    
    const newFundingMap = { ...fundingMap };
    Object.entries(billAllocations).forEach(([billId, amount]) => {
      newFundingMap[billId] = (newFundingMap[billId] || 0) + amount;
    });
    saveFundingMap(newFundingMap);
    setFundingMap(newFundingMap);

    const plan: PaycheckEntry = {
      id: `plan-${Date.now()}`,
      amount: paycheckAmount,
      date: paycheckDate,
      incomeSourceId: incomeSource?.id || "",
      notes,
      allocations,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    const existingPlans = getPaycheckPlans();
    savePaycheckPlans([...existingPlans, plan]);

    setTimeout(() => {
      setIsProcessing(false);
      goNext();
    }, 1000);
  };

  const handleDone = () => {
    router.push("/");
  };

  if (!household || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      {currentStep !== "result" && (
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
                {currentIndex + 1}/{STEPS.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* STEP 1: Entry */}
          {currentStep === "entry" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">New Paycheck</h2>
                <p className="text-slate-500 mt-2">Enter your paycheck details</p>
              </div>

              <Card padding="lg">
                <div className="space-y-5">
                  <Input
                    label="Paycheck Amount"
                    type="number"
                    placeholder="2850"
                    value={paycheckAmount || ""}
                    onChange={(e) => setPaycheckAmount(Number(e.target.value))}
                    hint="How much is this paycheck?"
                  />
                  <Input
                    label="Date Received"
                    type="date"
                    value={paycheckDate}
                    onChange={(e) => setPaycheckDate(e.target.value)}
                  />
                  <Input
                    label="Notes (optional)"
                    placeholder="Any notes about this paycheck"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full"
                onClick={handleEntryContinue}
                disabled={!paycheckAmount || !paycheckDate}
                rightIcon={<ChevronRight size={20} />}
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 2: Allocation Breakdown */}
          {currentStep === "allocation" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Suggested Plan</h2>
                <p className="text-slate-500 mt-2">
                  Here's how to allocate your {formatCurrency(paycheckAmount)}
                </p>
              </div>

              <Card padding="lg">
                <div className="space-y-4">
                  {allocations.map((item) => {
                    const percentage = paycheckAmount > 0
                      ? (item.amount / paycheckAmount) * 100
                      : 0;
                    
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${item.color}20` }}
                            >
                              {item.category === "bills" && <Receipt size={16} style={{ color: item.color }} />}
                              {item.category === "savings" && <PiggyBank size={16} style={{ color: item.color }} />}
                              {item.category === "groceries" && <ShoppingCart size={16} style={{ color: item.color }} />}
                              {item.category === "gas" && <Fuel size={16} style={{ color: item.color }} />}
                              {item.category === "cushion" && <Shield size={16} style={{ color: item.color }} />}
                              {item.category === "safe" && <DollarSign size={16} style={{ color: item.color }} />}
                            </div>
                            <span className="font-medium text-slate-700">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{formatCurrency(item.amount)}</p>
                            <p className="text-xs text-slate-500">{Math.round(percentage)}%</p>
                          </div>
                        </div>
                        <ProgressBar
                          progress={percentage / 100}
                          color={item.color}
                          height={6}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Bill Funding Detail */}
          {currentStep === "bills" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Bill Reserves</h2>
                <p className="text-slate-500 mt-2">
                  {billsDue.length} bills due before payday
                </p>
              </div>

              {billsDue.length === 0 ? (
                <Card padding="lg" className="text-center">
                  <p className="text-slate-500">No bills due before your next payday</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {billsDue.map((bill) => {
                    const status = getBillFundingStatus(bill, fundingMap[bill.id] || 0);
                    const allocated = billAllocations[bill.id] || 0;
                    const afterAllocation = status.fundedAmount + allocated;
                    const newRemaining = Math.max(0, bill.amount - afterAllocation);
                    
                    return (
                      <Card key={bill.id} padding="md">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-800">{bill.name}</p>
                            <p className="text-sm text-slate-500">
                              Due day {bill.dueDay} • {formatCurrency(bill.amount)}
                            </p>
                          </div>
                          <Badge
                            variant={status.isFunded ? "success" : "warning"}
                            size="sm"
                          >
                            {status.isFunded ? "Funded" : "Need more"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Already funded</span>
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(status.fundedAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">This paycheck</span>
                            <span className="font-medium text-violet-600">
                              +{formatCurrency(allocated)}
                            </span>
                          </div>
                          <ProgressBar
                            progress={afterAllocation / bill.amount}
                            color={afterAllocation >= bill.amount ? "#10B981" : "#8B5CF6"}
                            height={8}
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Remaining after</span>
                            <span className={`font-medium ${newRemaining === 0 ? "text-emerald-600" : "text-slate-800"}`}>
                              {formatCurrency(newRemaining)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1">
                  Confirm Plan
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm */}
          {currentStep === "confirm" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Confirm Plan</h2>
                <p className="text-slate-500 mt-2">
                  Review your paycheck allocation
                </p>
              </div>

              <Card padding="lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Paycheck</span>
                    <span className="text-xl font-bold text-slate-800">
                      {formatCurrency(paycheckAmount)}
                    </span>
                  </div>
                  {allocations.filter(a => a.amount > 0).map((item) => (
                    <div key={item.category} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  isLoading={isProcessing}
                  leftIcon={<Check size={18} />}
                >
                  Confirm & Apply
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Result */}
          {currentStep === "result" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Paycheck Planned!</h2>
                <p className="text-slate-500 mt-2">
                  Your {formatCurrency(paycheckAmount)} has been allocated
                </p>
              </div>

              <Card variant="gradient" padding="lg">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">Safe to Spend</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    {formatCurrency(
                      allocations.find(a => a.category === "safe")?.amount || 0
                    )}
                  </p>
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="font-semibold text-slate-800 mb-4">Bills Covered</h3>
                <div className="space-y-2">
                  {billsDue.map((bill) => {
                    const total = (fundingMap[bill.id] || 0) + (billAllocations[bill.id] || 0);
                    const isFunded = total >= bill.amount;
                    return (
                      <div key={bill.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <span className="text-slate-700">{bill.name}</span>
                        <Badge variant={isFunded ? "success" : "info"} size="sm">
                          {isFunded ? "Covered" : `${Math.round((total / bill.amount) * 100)}%`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Button size="lg" className="w-full" onClick={handleDone}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}