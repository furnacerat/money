import { OnboardingData, OnboardingStep } from "./types";

const STORAGE_KEYS = {
  ONBOARDING_DATA: "household_planner_onboarding",
  HOUSEHOLD_DATA: "household_planner_household",
  FUNDING_MAP: "household_planner_funding",
  PAYCHECK_PLANS: "household_planner_plans",
  SETTINGS: "household_planner_settings",
  IS_ONBOARDED: "household_planner_onboarded",
  EXPENSES: "household_planner_expenses",
  CONTRIBUTIONS: "household_planner_contributions",
  ACTIVITY_FEED: "household_planner_activity",
  ALERTS: "household_planner_alerts",
  PLANNING_RULES: "household_planner_rules",
  TRIGGERED_ALERTS: "household_planner_triggered_alerts",
  SCENARIOS: "household_planner_scenarios",
} as const;

export function saveOnboardingData(data: Partial<OnboardingData>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getOnboardingData();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save onboarding data:", error);
  }
}

export function getOnboardingData(): Partial<OnboardingData> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load onboarding data:", error);
    return {};
  }
}

export function clearOnboardingData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA);
  } catch (error) {
    console.error("Failed to clear onboarding data:", error);
  }
}

export function saveHouseholdData(data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLD_DATA, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save household data:", error);
  }
}

export function getHouseholdData(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load household data:", error);
    return null;
  }
}

export function saveFundingMap(fundingMap: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.FUNDING_MAP, JSON.stringify(fundingMap));
  } catch (error) {
    console.error("Failed to save funding map:", error);
  }
}

export function getFundingMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FUNDING_MAP);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load funding map:", error);
    return {};
  }
}

export function updateBillFunding(billId: string, amount: number): void {
  const current = getFundingMap();
  current[billId] = amount;
  saveFundingMap(current);
}

export function savePaycheckPlans(plans: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PAYCHECK_PLANS, JSON.stringify(plans));
  } catch (error) {
    console.error("Failed to save paycheck plans:", error);
  }
}

export function getPaycheckPlans(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYCHECK_PLANS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load paycheck plans:", error);
    return [];
  }
}

export type PlanningSettings = {
  groceryDefault: number;
  gasDefault: number;
  minBuffer: number;
  minSavings: number;
  autoReserveBills: boolean;
};

const DEFAULT_SETTINGS: PlanningSettings = {
  groceryDefault: 400,
  gasDefault: 150,
  minBuffer: 200,
  minSavings: 200,
  autoReserveBills: true,
};

export function saveSettings(settings: Partial<PlanningSettings>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function getSettings(): PlanningSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function setOnboarded(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save onboarded status:", error);
  }
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error("Failed to load onboarded status:", error);
    return false;
  }
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear all data:", error);
  }
}

export function saveExpenses(expenses: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    console.error("Failed to save expenses:", error);
  }
}

export function getExpenses(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load expenses:", error);
    return [];
  }
}

export function addExpense(expense: unknown): void {
  const expenses = getExpenses();
  expenses.unshift(expense);
  if (expenses.length > 100) expenses.pop();
  saveExpenses(expenses);
}

export function saveContributions(contributions: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
  } catch (error) {
    console.error("Failed to save contributions:", error);
  }
}

export function getContributions(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load contributions:", error);
    return [];
  }
}

export function saveActivityFeed(activities: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(activities));
  } catch (error) {
    console.error("Failed to save activity feed:", error);
  }
}

export function getActivityFeed(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load activity feed:", error);
    return [];
  }
}

export function addActivityEntry(entry: unknown): void {
  const activities = getActivityFeed();
  activities.unshift(entry);
  if (activities.length > 50) activities.pop();
  saveActivityFeed(activities);
}

export function saveAlerts(alerts: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (error) {
    console.error("Failed to save alerts:", error);
  }
}

export function getAlerts(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load alerts:", error);
    return [];
  }
}

export function addAlert(alert: unknown): void {
  const alerts = getAlerts() as unknown[];
  alerts.unshift(alert);
  if (alerts.length > 50) alerts.pop();
  saveAlerts(alerts);
}

export function dismissAlert(alertId: string): void {
  const alerts = getAlerts() as { id: string; isDismissed: boolean }[];
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.isDismissed = true;
    saveAlerts(alerts);
  }
}

export function markAlertRead(alertId: string): void {
  const alerts = getAlerts() as { id: string; isRead: boolean }[];
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.isRead = true;
    saveAlerts(alerts);
  }
}

export function getDefaultPlanningRules(): unknown {
  return {
    minBufferTarget: 500,
    minSavingsTarget: 100,
    savingsModeDefault: "normal",
    groceryBaseline: 400,
    gasBaseline: 150,
    billPriorityRules: [],
    autoReserveBehavior: "full",
    shortfallHandlingPreference: "reduce_savings",
  };
}

export function savePlanningRules(rules: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLANNING_RULES, JSON.stringify(rules));
  } catch (error) {
    console.error("Failed to save planning rules:", error);
  }
}

export function getPlanningRules(): unknown {
  if (typeof window === "undefined") return getDefaultPlanningRules();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PLANNING_RULES);
    return data ? JSON.parse(data) : getDefaultPlanningRules();
  } catch (error) {
    console.error("Failed to load planning rules:", error);
    return getDefaultPlanningRules();
  }
}

export function saveTriggeredAlerts(alerts: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRIGGERED_ALERTS, JSON.stringify(alerts));
  } catch (error) {
    console.error("Failed to save triggered alerts:", error);
  }
}

export function getTriggeredAlerts(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRIGGERED_ALERTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load triggered alerts:", error);
    return [];
  }
}

export function addTriggeredAlert(alert: unknown): void {
  const alerts = getTriggeredAlerts() as unknown[];
  alerts.unshift(alert);
  if (alerts.length > 100) alerts.pop();
  saveTriggeredAlerts(alerts);
}

export function saveScenarios(scenarios: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
  } catch (error) {
    console.error("Failed to save scenarios:", error);
  }
}

export function getScenarios(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load scenarios:", error);
    return [];
  }
}

export function getBills(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("household_planner_household");
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.bills || [];
    }
  } catch (error) {
    console.error("Failed to load bills:", error);
  }
  return [];
}

export function getSavingsGoals(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("household_planner_household");
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.savingsGoals || [];
    }
  } catch (error) {
    console.error("Failed to load savings goals:", error);
  }
  return [];
}

export function getPaychecks(): unknown[] {
  return getPaycheckPlans();
}

export function getBalance(): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = localStorage.getItem("household_planner_household");
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.currentBalance || 0;
    }
  } catch (error) {
    console.error("Failed to load balance:", error);
  }
  return 0;
}