import { OnboardingData, OnboardingStep } from "./types";

const STORAGE_KEYS = {
  ONBOARDING_DATA: "household_planner_onboarding",
  HOUSEHOLD_DATA: "household_planner_household",
  FUNDING_MAP: "household_planner_funding",
  PAYCHECK_PLANS: "household_planner_plans",
  SETTINGS: "household_planner_settings",
  IS_ONBOARDED: "household_planner_onboarded",
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