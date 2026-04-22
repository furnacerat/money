"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Input } from "@/components/ui";
import { FadeIn, SlideUp } from "@/components/ui/Animations";
import { Household } from "@/lib/types";
import { getHouseholdData, saveHouseholdData, getSettings, saveSettings } from "@/lib/storage";
import { 
  ShoppingCart, 
  Fuel, 
  Shield, 
  PiggyBank, 
  Save, 
  Check,
  Bell,
  User,
  CreditCard,
  Palette,
  Globe,
  Moon,
  Sun,
  Mail
} from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("budgets");
  const [settings, setSettings] = useState({
    groceryDefault: 400,
    gasDefault: 150,
    minBuffer: 200,
    minSavings: 200,
    autoReserveBills: true,
  });
  const [notifications, setNotifications] = useState({
    billReminders: true,
    paydayReminders: true,
    weeklySummary: false,
    lowBalanceAlerts: true,
  });
  const [theme, setTheme] = useState<Theme>("light");
  const [householdName, setHouseholdName] = useState("");

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setHouseholdName(data.name);
    }
    const savedSettings = getSettings();
    setSettings(savedSettings);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    saveSettings(settings);
    
    if (household) {
      saveHouseholdData({ ...household, name: householdName });
    }
    
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { id: "budgets", label: "Budgets", icon: CreditCard },
    { id: "savings", label: "Savings", icon: PiggyBank },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
  ];

  return (
    <ToastProvider>
      <AppShell householdName={household?.name}>
        <div className="space-y-6">
          <FadeIn>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-slate-500">Customize your experience</p>
            </div>
          </FadeIn>

          {/* Section Tabs */}
          <FadeIn delay={0.1}>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeSection === section.id
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={16} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </FadeIn>

          {/* Budgets Section */}
          {activeSection === "budgets" && (
            <SlideUp>
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Budget Basics</h2>
                    <p className="text-sm text-slate-500">Your typical spending per paycheck</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Groceries"
                        type="number"
                        value={settings.groceryDefault || ""}
                        onChange={(e) => setSettings(s => ({ ...s, groceryDefault: Number(e.target.value) }))}
                        hint="Weekly or bi-weekly grocery trips"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Fuel className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Gas"
                        type="number"
                        value={settings.gasDefault || ""}
                        onChange={(e) => setSettings(s => ({ ...s, gasDefault: Number(e.target.value) }))}
                        hint="Fuel for your vehicles"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </SlideUp>
          )}

          {/* Savings Section */}
          {activeSection === "savings" && (
            <SlideUp>
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Savings Targets</h2>
                    <p className="text-sm text-slate-500">Financial floor and goals</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Minimum Buffer"
                        type="number"
                        value={settings.minBuffer || ""}
                        onChange={(e) => setSettings(s => ({ ...s, minBuffer: Number(e.target.value) }))}
                        hint="Your emergency fund floor"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
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

              <Card padding="lg" className="mt-4">
                <h3 className="font-semibold text-slate-800 mb-4">Savings Mode</h3>
                <div className="space-y-3">
                  {[
                    { key: "survival" as const, label: "Survival", desc: "Cover essentials only", color: "#EF4444" },
                    { key: "normal" as const, label: "Normal", desc: "Balanced approach", color: "#F59E0B" },
                    { key: "growth" as const, label: "Growth", desc: "Maximize savings", color: "#10B981" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => {
                        if (household) {
                          setHousehold(h => h ? { ...h, settings: { ...h.settings, savingsMode: mode.key } } : h);
                          setSaved(false);
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        household?.settings.savingsMode === mode.key
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-semibold" style={{ color: mode.color }}>
                        {mode.label}
                      </p>
                      <p className="text-sm text-slate-500">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </SlideUp>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <SlideUp>
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Notifications</h2>
                    <p className="text-sm text-slate-500">Choose what to be reminded about</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { key: "billReminders", label: "Bill Reminders", desc: "Get notified before bills are due" },
                    { key: "paydayReminders", label: "Payday Reminders", desc: "Know when your next paycheck is" },
                    { key: "lowBalanceAlerts", label: "Low Balance Alerts", desc: "Warning when buffer is getting low" },
                    { key: "weeklySummary", label: "Weekly Summary", desc: "Quick recap of the week's spending" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-800">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications(n => ({ ...n, [item.key]: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] 
                            ? "bg-emerald-500" 
                            : "bg-slate-200"
                        }`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                            notifications[item.key as keyof typeof notifications]
                              ? "translate-x-5 ml-0.5"
                              : "translate-x-0.5"
                          }`} />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </SlideUp>
          )}

          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <SlideUp>
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Preferences</h2>
                    <p className="text-sm text-slate-500">Make it feel like home</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Household Name</label>
                    <Input
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      placeholder="The Smiths"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: "light" as const, label: "Light", icon: Sun },
                        { key: "dark" as const, label: "Dark", icon: Moon },
                        { key: "system" as const, label: "System", icon: Globe },
                      ].map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.key}
                            onClick={() => setTheme(t.key)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              theme === t.key
                                ? "border-slate-800 bg-slate-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </SlideUp>
          )}

          {/* Save Button */}
          <FadeIn delay={0.3}>
            <Button
              size="lg"
              className="w-full"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={saved ? <Check size={20} /> : <Save size={20} />}
            >
              {saved ? "All Changes Saved!" : "Save Changes"}
            </Button>
          </FadeIn>
        </div>
      </AppShell>
    </ToastProvider>
  );
}