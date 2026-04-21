import { OnboardingData, OnboardingStep } from "./types";

const STORAGE_KEYS = {
  ONBOARDING_DATA: "household_planner_onboarding",
  HOUSEHOLD_DATA: "household_planner_household",
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

export function saveSettings(data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function getSettings(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return null;
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