"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input } from "@/components/ui";
import { Household } from "@/lib/types";
import { getHouseholdData, saveHouseholdData, getSettings, saveSettings } from "@/lib/storage";
import { ShoppingCart, Fuel, Shield, PiggyBank, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    groceryDefault: 400,
    gasDefault: 150,
    minBuffer: 200,
    minSavings: 200,
    autoReserveBills: true,
  });

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
    }
    const savedSettings = getSettings();
    setSettings(savedSettings);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    saveSettings(settings);
    
    if (household) {
      saveHouseholdData(household);
    }
    
    setIsSaving(false);
    setSaved(true);
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
          <Card variant="gradient" padding="lg">
            <h2 className="text-lg font-semibold text-slate-800">Planning Settings</h2>
            <p className="text-sm text-slate-500 mt-1">
              Customize defaults for paycheck planning
            </p>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Per Paycheck Defaults</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <Input
                    label="Grocery Budget"
                    type="number"
                    value={settings.groceryDefault || ""}
                    onChange={(e) => setSettings(s => ({ ...s, groceryDefault: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <Input
                    label="Gas Budget"
                    type="number"
                    value={settings.gasDefault || ""}
                    onChange={(e) => setSettings(s => ({ ...s, gasDefault: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Savings & Buffer</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1">
                  <Input
                    label="Minimum Buffer"
                    type="number"
                    value={settings.minBuffer || ""}
                    onChange={(e) => setSettings(s => ({ ...s, minBuffer: Number(e.target.value) }))}
                    hint="Keep this amount as your financial floor"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <Input
                    label="Minimum Savings"
                    type="number"
                    value={settings.minSavings || ""}
                    onChange={(e) => setSettings(s => ({ ...s, minSavings: Number(e.target.value) }))}
                    hint="Base amount to save each paycheck"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Savings Mode</h3>
            <div className="space-y-3">
              {[
                { key: "survival" as const, label: "Survival", desc: "Just cover the basics", color: "#EF4444" },
                { key: "normal" as const, label: "Normal", desc: "Balanced approach", color: "#F59E0B" },
                { key: "growth" as const, label: "Growth", desc: "Aggressive savings", color: "#10B981" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => {
                    setHousehold(h => h ? { ...h, settings: { ...h.settings, savingsMode: mode.key } } : h);
                    setSaved(false);
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    household.settings.savingsMode === mode.key
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-slate-800" style={{ color: mode.color }}>
                    {mode.label}
                  </p>
                  <p className="text-sm text-slate-500">{mode.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={saved ? <Check size={20} /> : <Save size={20} />}
          >
            {saved ? "Settings Saved!" : "Save Settings"}
          </Button>
        </div>
      </AppShell>
    </ToastProvider>
  );
}