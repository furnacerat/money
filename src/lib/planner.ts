import {
  Household,
  Bill,
  SavingsGoal,
  PaycheckPlan,
  PayFrequency,
  IncomeSource,
} from "./types";
import { differenceInDays, addDays, addWeeks, format, isBefore, isAfter, parseISO, startOfToday } from "date-fns";

export type PlanningSettings = {
  groceryDefault: number;
  gasDefault: number;
  minBuffer: number;
  minSavings: number;
  autoReserveBills: boolean;
};

export type BillFundingStatus = {
  billId: string;
  totalDue: number;
  fundedAmount: number;
  remainingNeeded: number;
  isFunded: boolean;
  fundedPercentage: number;
  suggestedPerPaycheck: number;
};

export type PaycheckAllocation = {
  category: "bills" | "savings" | "groceries" | "gas" | "cushion" | "safe";
  label: string;
  amount: number;
  color: string;
};

export type DashboardState = {
  safeToSpend: number;
  nextPayday: string;
  paydayCountdown: number;
  billsDueBeforePayday: Bill[];
  totalBillsDue: number;
  amountSetAside: number;
  amountReserved: number;
  savingsTarget: number;
  savingsMode: "survival" | "normal" | "growth";
  overallStatus: "on_track" | "tight_this_week" | "bills_covered" | "shortfall_risk";
  shortfall: number;
};

export function getToday(): Date {
  return startOfToday();
}

export function getNextPayday(
  frequency: PayFrequency,
  lastPayday: string,
  baseDate?: Date
): Date {
  const base = baseDate || getToday();
  const last = parseISO(lastPayday);
  
  let next = new Date(last);
  
  while (!isAfter(next, base)) {
    switch (frequency) {
      case "weekly":
        next = addWeeks(next, 1);
        break;
      case "biweekly":
        next = addWeeks(next, 2);
        break;
      case "semimonthly":
        next = addDays(next, 15);
        break;
      case "monthly":
        next = addDays(next, 30);
        break;
      default:
        next = addWeeks(next, 2);
    }
  }
  
  return next;
}

export function getBillsDueBeforePayday(
  bills: Bill[],
  payday: Date,
  referenceDate?: Date
): Bill[] {
  const ref = referenceDate || getToday();
  
  return bills.filter((bill) => {
    if (bill.status === "paid") return false;
    
    const dueDate = new Date(
      ref.getFullYear(),
      ref.getMonth(),
      bill.dueDay
    );
    
    return isBefore(dueDate, payday) || dueDate.getTime() === payday.getTime();
  }).sort((a, b) => a.dueDay - b.dueDay);
}

export function getBillFundingStatus(
  bill: Bill,
  currentFunding: number
): BillFundingStatus {
  const fundedAmount = currentFunding;
  const remainingNeeded = Math.max(0, bill.amount - fundedAmount);
  const isFunded = remainingNeeded === 0;
  const fundedPercentage = bill.amount > 0 
    ? Math.min(fundedAmount / bill.amount, 1) 
    : 1;
  
  return {
    billId: bill.id,
    totalDue: bill.amount,
    fundedAmount,
    remainingNeeded,
    isFunded,
    fundedPercentage,
    suggestedPerPaycheck: bill.amount / 2,
  };
}

export function calculateTotalObligations(
  bills: Bill[],
  payday: Date
): number {
  const billsDue = getBillsDueBeforePayday(bills, payday);
  return billsDue.reduce((sum, bill) => sum + bill.amount, 0);
}

export function calculateTotalReserved(
  fundingMap: Record<string, number>
): number {
  return Object.values(fundingMap).reduce((sum, val) => sum + val, 0);
}

export function getSavingsContribution(
  mode: "survival" | "normal" | "growth",
  paycheckAmount: number
): number {
  switch (mode) {
    case "survival":
      return paycheckAmount * 0.05;
    case "normal":
      return paycheckAmount * 0.10;
    case "growth":
      return paycheckAmount * 0.15;
    default:
      return paycheckAmount * 0.10;
  }
}

export function calculateSafeToSpend(
  currentBalance: number,
  bills: Bill[],
  payday: Date,
  fundingMap: Record<string, number>,
  savingsMode: "survival" | "normal" | "growth",
  paycheckAmount: number,
  settings: PlanningSettings
): { safeToSpend: number; shortfall: number; amountSetAside: number } {
  const today = getToday();
  const billsDue = getBillsDueBeforePayday(bills, payday);
  const totalBills = billsDue.reduce((sum, bill) => sum + bill.amount, 0);
  
  const currentlyReserved = Object.entries(fundingMap).reduce((sum, [billId, funded]) => {
    const bill = bills.find((b) => b.id === billId);
    if (bill && billsDue.some((b) => b.id === billId)) {
      return sum + funded;
    }
    return sum;
  }, 0);
  
  const billsToFund = billsDue.reduce((sum, bill) => {
    const remaining = Math.max(0, bill.amount - (fundingMap[bill.id] || 0));
    return sum + remaining;
  }, 0);
  
  const savingsContribution = getSavingsContribution(savingsMode, paycheckAmount);
  const amountSetAside = billsToFund + savingsContribution + settings.minBuffer;
  
  const availableAfterReserve = currentBalance - currentlyReserved;
  const safeToSpend = availableAfterReserve - billsToFund - savingsContribution - settings.minBuffer;
  const shortfall = safeToSpend < 0 ? Math.abs(safeToSpend) : 0;
  
  return {
    safeToSpend: Math.max(0, safeToSpend),
    shortfall,
    amountSetAside,
  };
}

export function getOverallStatus(
  safeToSpend: number,
  shortfall: number,
  billsDueCount: number,
  settings: PlanningSettings
): DashboardState["overallStatus"] {
  if (shortfall > 0) return "shortfall_risk";
  if (safeToSpend < settings.minBuffer) return "tight_this_week";
  if (billsDueCount > 4) return "bills_covered";
  return "on_track";
}

export function suggestPaycheckAllocation(
  paycheckAmount: number,
  bills: Bill[],
  payday: Date,
  fundingMap: Record<string, number>,
  savingsMode: "survival" | "normal" | "growth",
  settings: PlanningSettings
): PaycheckAllocation[] {
  const billsDue = getBillsDueBeforePayday(bills, payday);
  
  const billsToFund = billsDue.reduce((sum, bill) => {
    const remaining = Math.max(0, bill.amount - (fundingMap[bill.id] || 0));
    return sum + remaining;
  }, 0);
  
  const savingsContribution = getSavingsContribution(savingsMode, paycheckAmount);
  const groceries = settings.groceryDefault;
  const gas = settings.gasDefault;
  const cushion = settings.minBuffer;
  
  const totalAllocated = billsToFund + savingsContribution + groceries + gas + cushion;
  const safeAmount = Math.max(0, paycheckAmount - totalAllocated);
  
  return [
    {
      category: "bills",
      label: "Bills & Reserves",
      amount: billsToFund,
      color: "#8B5CF6",
    },
    {
      category: "savings",
      label: "Savings",
      amount: savingsContribution,
      color: "#10B981",
    },
    {
      category: "groceries",
      label: "Groceries",
      amount: groceries,
      color: "#F59E0B",
    },
    {
      category: "gas",
      label: "Gas",
      amount: gas,
      color: "#3B82F6",
    },
    {
      category: "cushion",
      label: "Buffer",
      amount: cushion,
      color: "#06B6D4",
    },
    {
      category: "safe",
      label: "Safe to Spend",
      amount: safeAmount,
      color: "#EC4899",
    },
  ];
}

export function calculateBillReserveFromPaycheck(
  bill: Bill,
  fundingMap: Record<string, number>,
  paycheckAmount: number,
  percentage: number = 0.25
): number {
  const remaining = Math.max(0, bill.amount - (fundingMap[bill.id] || 0));
  const maxFromPaycheck = paycheckAmount * percentage;
  return Math.min(remaining, maxFromPaycheck);
}

export function getDashboardState(
  household: Household,
  fundingMap: Record<string, number>,
  settings: PlanningSettings
): DashboardState {
  const today = getToday();
  const incomeSource = household.incomeSources[0];
  
  if (!incomeSource) {
    return {
      safeToSpend: 0,
      nextPayday: today.toISOString(),
      paydayCountdown: 0,
      billsDueBeforePayday: [],
      totalBillsDue: 0,
      amountSetAside: 0,
      amountReserved: 0,
      savingsTarget: 0,
      savingsMode: household.settings.savingsMode,
      overallStatus: "on_track",
      shortfall: 0,
    };
  }
  
  const payday = getNextPayday(incomeSource.frequency, incomeSource.nextPayday);
  const billsDue = getBillsDueBeforePayday(household.bills, payday);
  
  const { safeToSpend, shortfall, amountSetAside } = calculateSafeToSpend(
    household.currentBalance,
    household.bills,
    payday,
    fundingMap,
    household.settings.savingsMode,
    incomeSource.amount,
    settings
  );
  
  const amountReserved = calculateTotalReserved(fundingMap);
  const savingsTarget = getSavingsContribution(
    household.settings.savingsMode,
    incomeSource.amount
  );
  
  const totalBillsDue = billsDue.reduce((sum, bill) => sum + bill.amount, 0);
  
  return {
    safeToSpend,
    nextPayday: payday.toISOString(),
    paydayCountdown: differenceInDays(payday, today),
    billsDueBeforePayday: billsDue,
    totalBillsDue,
    amountSetAside,
    amountReserved,
    savingsTarget,
    savingsMode: household.settings.savingsMode,
    overallStatus: getOverallStatus(safeToSpend, shortfall, billsDue.length, settings),
    shortfall,
  };
}