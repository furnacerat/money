"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input, Badge } from "@/components/ui";
import { PlanningRules, SavingsMode } from "@/lib/types";
import { savePlanningRules, getPlanningRules, getDefaultPlanningRules } from "@/lib/storage";
import { ShoppingCart, Fuel, Shield, PiggyBank, Save, Check, Settings, AlertTriangle, DollarSign, Zap } from "lucide-react";

export default function PlanningRulesPage() {
  const [rules, setRules] = useState<PlanningRules>(getDefaultPlanningRules() as PlanningRules);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("basics");

  useEffect(() => {
    const loadedRules = getPlanningRules() as PlanningRules;
    if (loadedRules) {
      setRules(loadedRules);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    savePlanningRules(rules);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateRule = <K extends keyof PlanningRules>(key: K, value: PlanningRules[K]) => {
    setRules(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <Card variant="gradient" padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Planning Rules</h1>
                <p className="text-slate-500 text-sm">Control how the app plans your money</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "basics", label: "Basics", icon: <DollarSign size={16} /> },
              { id: "savings", label: "Savings", icon: <PiggyBank size={16} /> },
              { id: "shortfall", label: "Shortfall", icon: <AlertTriangle size={16} /> },
              { id: "auto", label: "Automation", icon: <Zap size={16} /> },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>

          {activeSection === "basics" && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Baseline Budgets</h3>
              <p className="text-sm text-slate-500 mb-6">
                Set your typical spending baselines per pay period
              </p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Grocery Baseline"
                      type="number"
                      value={rules.groceryBaseline || ""}
                      onChange={(e) => updateRule("groceryBaseline", Number(e.target.value))}
                      hint="Your typical grocery spending per pay period"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Gas Baseline"
                      type="number"
                      value={rules.gasBaseline || ""}
                      onChange={(e) => updateRule("gasBaseline", Number(e.target.value))}
                      hint="Your typical gas spending per pay period"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "savings" && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Savings Targets</h3>
              <p className="text-sm text-slate-500 mb-6">
                Minimum amounts to protect
              </p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Minimum Buffer Target"
                      type="number"
                      value={rules.minBufferTarget || ""}
                      onChange={(e) => updateRule("minBufferTarget", Number(e.target.value))}
                      hint="Keep at least this much in your buffer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Minimum Savings Target"
                      type="number"
                      value={rules.minSavingsTarget || ""}
                      onChange={(e) => updateRule("minSavingsTarget", Number(e.target.value))}
                      hint="Base amount to save each pay period"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Savings Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "survival" as const, label: "Survival", desc: "Just basics", color: "#EF4444" },
                      { key: "normal" as const, label: "Normal", desc: "Balanced", color: "#F59E0B" },
                      { key: "growth" as const, label: "Growth", desc: "Max save", color: "#10B981" },
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => updateRule("savingsModeDefault", mode.key)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          rules.savingsModeDefault === mode.key
                            ? "border-slate-800 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-slate-800" style={{ color: mode.color }}>
                          {mode.label}
                        </p>
                        <p className="text-xs text-slate-500">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "shortfall" && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Shortfall Handling</h3>
              <p className="text-sm text-slate-500 mb-6">
                How to handle tight money situations
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    When money is tight, prefer to:
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: "reduce_savings" as const, label: "Reduce savings first", desc: "Lower contributions to protect bills" },
                      { key: "use_buffer" as const, label: "Use your buffer", desc: "Draw down buffer for emergencies" },
                      { key: "alert_only" as const, label: "Just alert me", desc: "Don't auto-adjust anything" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => updateRule("shortfallHandlingPreference", option.key)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          rules.shortfallHandlingPreference === option.key
                            ? "border-slate-800 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-slate-800">{option.label}</p>
                        <p className="text-sm text-slate-500">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "auto" && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Automation</h3>
              <p className="text-sm text-slate-500 mb-6">
                How aggressively to auto-reserve money
              </p>
              <div className="space-y-3">
                {[
                  { key: "full" as const, label: "Full Auto", desc: "Reserve as much as possible for bills" },
                  { key: "minimal" as const, label: "Minimal", desc: "Only reserve what's clearly due" },
                  { key: "none" as const, label: "Manual Only", desc: "Let me decide everything" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => updateRule("autoReserveBehavior", option.key)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      rules.autoReserveBehavior === option.key
                        ? "border-slate-800 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-800">{option.label}</p>
                    <p className="text-sm text-slate-500">{option.desc}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={saved ? <Check size={20} /> : <Save size={20} />}
          >
            {saved ? "Rules Saved!" : "Save Planning Rules"}
          </Button>
        </div>
      </AppShell>
    </ToastProvider>
  );
}