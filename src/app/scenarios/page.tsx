"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Scenario } from "@/lib/types";
import { getScenarios, saveScenarios, getBalance, getBills, getSavingsGoals, getPaychecks } from "@/lib/storage";
import { runScenario } from "@/lib/intelligence";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, X, ArrowRight } from "lucide-react";

const SCENARIO_TYPES = [
  {
    key: "spend_extra" as const,
    label: "Extra Spending",
    description: "What if I spend extra today?",
    icon: <TrendingDown className="w-5 h-5" />,
    defaultAmount: 100,
  },
  {
    key: "skip_savings" as const,
    label: "Skip Savings",
    description: "What if I skip savings this pay?",
    icon: <TrendingDown className="w-5 h-5" />,
    defaultAmount: 0,
  },
  {
    key: "bill_increase" as const,
    label: "Bill Increase",
    description: "What if a bill goes up?",
    icon: <AlertTriangle className="w-5 h-5" />,
    defaultAmount: 50,
  },
  {
    key: "extra_income" as const,
    label: "Extra Income",
    description: "What if I get extra money?",
    icon: <TrendingUp className="w-5 h-5" />,
    defaultAmount: 200,
  },
];

export default function ScenariosPage() {
  const [selectedType, setSelectedType] = useState<Scenario["type"]>("spend_extra");
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<Scenario[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    const savedScenarios = getScenarios() as Scenario[];
    setHistory(savedScenarios);
    
    const balance = getBalance();
    const bills = getBills() as { amount: number }[];
    const goals = getSavingsGoals() as { contributionPerPaycheck: number }[];
    
    setCurrentBalance(balance);
    setTotalBills(bills.reduce((sum, b) => sum + b.amount, 0));
    setTotalSavings(goals.reduce((sum, g) => sum + g.contributionPerPaycheck, 0));
    
    const typeConfig = SCENARIO_TYPES.find(t => t.key === selectedType);
    if (typeConfig) {
      setAmount(typeConfig.defaultAmount);
    }
  }, [selectedType]);

  const handleRunScenario = () => {
    const scenarioResult = runScenario(selectedType, amount);
    setResult(scenarioResult);
    
    const updatedHistory = [scenarioResult, ...history].slice(0, 10);
    setHistory(updatedHistory);
    saveScenarios(updatedHistory);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveScenarios([]);
  };

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Scenario Tester</h1>
            <p className="text-slate-500">See how choices affect your finances</p>
          </div>

          <Card variant="gradient" padding="lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-500">Balance</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(currentBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Bills Due</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(totalBills)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Savings/Period</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(totalSavings)}</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">What do you want to test?</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {SCENARIO_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedType(type.key);
                    setResult(null);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedType === type.key
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      type.key === "extra_income" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {type.icon}
                    </div>
                    <span className="font-semibold text-slate-800">{type.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{type.description}</p>
                </button>
              ))}
            </div>

            {selectedType !== "skip_savings" && (
              <div className="mb-4">
                <Input
                  label="Amount"
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleRunScenario}
              leftIcon={<ArrowRight size={20} />}
            >
              Run Scenario
            </Button>
          </Card>

          {result && (
            <Card 
              padding="lg" 
              className={`border-2 ${result.impact.billsCovered ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {result.impact.billsCovered ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="font-semibold text-slate-800">
                  {result.impact.billsCovered ? "Bills Still Covered" : "Bills At Risk"}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">New Balance</p>
                  <p className={`text-xl font-bold ${result.impact.newBalance < 0 ? "text-red-600" : "text-slate-800"}`}>
                    {formatCurrency(result.impact.newBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Savings Impact</p>
                  <p className={`text-xl font-bold ${result.impact.savingsAffected < 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {result.impact.savingsAffected === 0 
                      ? "No change" 
                      : `${result.impact.savingsAffected > 0 ? "+" : ""}${formatCurrency(result.impact.savingsAffected)}`
                    }
                  </p>
                </div>
              </div>

              {!result.impact.billsCovered && (
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    Warning: This scenario would leave you unable to cover all bills. Consider reducing spending or adjusting your plan.
                  </p>
                </div>
              )}

              {result.impact.billsCovered && result.impact.newBalance < 200 && (
                <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium">
                    Your buffer would be low after this. Consider if this is worth it.
                  </p>
                </div>
              )}
            </Card>
          )}

          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700">Recent Scenarios</h3>
                <button 
                  onClick={handleClearHistory}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {history.map((scenario) => (
                  <Card key={scenario.id} padding="md" className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{scenario.name}</p>
                      <p className="text-sm text-slate-500">
                        {scenario.impact.billsCovered ? "✓ Bills covered" : "✗ Bills at risk"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${scenario.impact.newBalance < 0 ? "text-red-600" : "text-slate-800"}`}>
                        {formatCurrency(scenario.impact.newBalance)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ToastProvider>
  );
}