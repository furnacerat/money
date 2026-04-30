import {
  Household,
  Bill,
  PayFrequency,
} from "./types";
import { differenceInDays, addDays, addWeeks, isBefore, isAfter, parseISO, startOfToday } from "date-fns";

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

function getPeriodKeyForDate(date: Date): string {
  return getPeriodKey(date.getFullYear(), date.getMonth() + 1);
}

function getDueDateForMonth(bill: Bill, year: number, monthIndex: number): Date {
  const dueDay = Math.min(bill.dueDay, new Date(year, monthIndex + 1, 0).getDate());
  return new Date(year, monthIndex, dueDay);
}

function isPaidForPeriod(bill: Bill, date: Date): boolean {
  return bill.paidPeriod === getPeriodKeyForDate(date);
}

function getBillDueDateCandidates(bill: Bill, referenceDate: Date, throughDate: Date): Date[] {
  const candidates: Date[] = [];
  const refMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const throughMonthStart = new Date(throughDate.getFullYear(), throughDate.getMonth(), 1);

  let cursor = new Date(refMonthStart);
  while (cursor <= throughMonthStart) {
    const dueDate = getDueDateForMonth(bill, cursor.getFullYear(), cursor.getMonth());
    if (!isPaidForPeriod(bill, dueDate)) {
      candidates.push(dueDate);
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return candidates;
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
    const dueDates = getBillDueDateCandidates(bill, ref, payday);
    return dueDates.some((dueDate) => dueDate <= payday);
  }).sort((a, b) => {
    const aDue = getBillDueDate(a, ref).getTime();
    const bDue = getBillDueDate(b, ref).getTime();
    return aDue - bDue;
  });
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
  paycheckAmount: number,
  minSavings: number = 0
): number {
  const percent = (() => {
    switch (mode) {
      case "survival":
        return 0.05;
      case "normal":
        return 0.10;
      case "growth":
        return 0.15;
      default:
        return 0.10;
    }
  })();

  return Math.max(minSavings, paycheckAmount * percent);
}

export function getAdaptiveSavingsContribution(
  mode: "survival" | "normal" | "growth",
  paycheckAmount: number,
  remainingAfterEssentials: number,
  minSavings: number = 0
): number {
  if (remainingAfterEssentials <= 0) return 0;

  const target = getSavingsContribution(mode, paycheckAmount, minSavings);
  return Math.min(target, remainingAfterEssentials);
}

function getCategoryAmount(
  allocations: PaycheckAllocation[],
  category: PaycheckAllocation["category"]
): number {
  return allocations.find((allocation) => allocation.category === category)?.amount || 0;
}

function buildAllocationPlan(
  paycheckAmount: number,
  bills: Bill[],
  payday: Date,
  fundingMap: Record<string, number>,
  savingsMode: "survival" | "normal" | "growth",
  settings: PlanningSettings
): { allocations: PaycheckAllocation[]; billAllocations: Record<string, number>; shortfall: number } {
  const billsDue = getBillsDueBeforePayday(bills, payday).sort((a, b) => {
    const dueDiff = getBillDueDate(a).getTime() - getBillDueDate(b).getTime();
    return dueDiff === 0 ? a.priority - b.priority : dueDiff;
  });
  const billAllocations: Record<string, number> = {};
  let remainingPaycheck = Math.max(0, paycheckAmount);

  billsDue.forEach((bill) => {
    const remainingBillNeed = Math.max(0, bill.amount - (fundingMap[bill.id] || 0));
    const amount = Math.min(remainingBillNeed, remainingPaycheck);
    if (amount > 0) {
      billAllocations[bill.id] = amount;
      remainingPaycheck -= amount;
    }
  });

  const billsToFund = Object.values(billAllocations).reduce((sum, amount) => sum + amount, 0);
  const groceries = Math.min(settings.groceryDefault, remainingPaycheck);
  remainingPaycheck -= groceries;

  const gas = Math.min(settings.gasDefault, remainingPaycheck);
  remainingPaycheck -= gas;

  const cushion = Math.min(settings.minBuffer, remainingPaycheck);
  remainingPaycheck -= cushion;

  const savingsContribution = getAdaptiveSavingsContribution(
    savingsMode,
    paycheckAmount,
    remainingPaycheck,
    settings.minSavings
  );
  remainingPaycheck -= savingsContribution;

  const totalBillNeed = billsDue.reduce((sum, bill) => {
    return sum + Math.max(0, bill.amount - (fundingMap[bill.id] || 0));
  }, 0);
  const shortfall = Math.max(0, totalBillNeed - billsToFund);

  return {
    billAllocations,
    shortfall,
    allocations: [
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
        amount: Math.max(0, remainingPaycheck),
        color: "#EC4899",
      },
    ],
  };
}

export function suggestBillAllocations(
  paycheckAmount: number,
  bills: Bill[],
  payday: Date,
  fundingMap: Record<string, number>,
  savingsMode: "survival" | "normal" | "growth",
  settings: PlanningSettings
): Record<string, number> {
  return buildAllocationPlan(
    paycheckAmount,
    bills,
    payday,
    fundingMap,
    savingsMode,
    settings
  ).billAllocations;
}

export function calculateAllocationShortfall(
  paycheckAmount: number,
  bills: Bill[],
  payday: Date,
  fundingMap: Record<string, number>,
  billAllocations: Record<string, number>
): number {
  const billsDue = getBillsDueBeforePayday(bills, payday);
  const allocatedToBills = Object.values(billAllocations).reduce((sum, amount) => sum + amount, 0);
  const totalNeed = billsDue.reduce((sum, bill) => {
    return sum + Math.max(0, bill.amount - (fundingMap[bill.id] || 0));
  }, 0);

  return Math.max(0, totalNeed - Math.min(allocatedToBills, paycheckAmount));
}

export function rebalanceSafeToSpend(
  paycheckAmount: number,
  allocations: PaycheckAllocation[],
  billAllocations: Record<string, number>
): PaycheckAllocation[] {
  const billTotal = Object.values(billAllocations).reduce((sum, amount) => sum + Math.max(0, amount), 0);
  const nonSafeNonBills = allocations.reduce((sum, allocation) => {
    if (allocation.category === "safe" || allocation.category === "bills") return sum;
    return sum + Math.max(0, allocation.amount);
  }, 0);
  const safe = Math.max(0, paycheckAmount - billTotal - nonSafeNonBills);

  return allocations.map((allocation) => {
    if (allocation.category === "bills") return { ...allocation, amount: billTotal };
    if (allocation.category === "safe") return { ...allocation, amount: safe };
    return allocation;
  });
}

export function getAllocationTotal(allocations: PaycheckAllocation[]): number {
  return allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
}

export function getAllocationAmount(
  allocations: PaycheckAllocation[],
  category: PaycheckAllocation["category"]
): number {
  return getCategoryAmount(allocations, category);
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
  const billsDue = getBillsDueBeforePayday(bills, payday);
  
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
  
  const savingsContribution = getSavingsContribution(savingsMode, paycheckAmount, settings.minSavings);
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
  return buildAllocationPlan(
    paycheckAmount,
    bills,
    payday,
    fundingMap,
    savingsMode,
    settings
  ).allocations;
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
    incomeSource.amount,
    settings.minSavings
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

export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getPeriodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function isBillPaidForCurrentPeriod(bill: Bill): boolean {
  const currentPeriod = getCurrentPeriod();
  if (bill.status === "paid" && bill.paidPeriod === currentPeriod) {
    return true;
  }
  if (bill.paidPeriod === currentPeriod) {
    return true;
  }
  return false;
}

export function getBillDueDate(bill: Bill, referenceDate?: Date): Date {
  const ref = referenceDate || getToday();
  const currentDueDate = getDueDateForMonth(bill, ref.getFullYear(), ref.getMonth());

  if (isPaidForPeriod(bill, currentDueDate)) {
    return getDueDateForMonth(bill, ref.getFullYear(), ref.getMonth() + 1);
  }

  return currentDueDate;
}

export type ComputedBillStatus = "paid" | "due_soon" | "due_today" | "unpaid";

export function getComputedBillStatus(bill: Bill, referenceDate?: Date): ComputedBillStatus {
  const ref = referenceDate || getToday();
  
  if (isBillPaidForCurrentPeriod(bill)) {
    return "paid";
  }
  
  const dueDate = getBillDueDate(bill, ref);
  const daysUntilDue = differenceInDays(dueDate, ref);
  
  if (daysUntilDue < 0) {
    return "unpaid";
  } else if (daysUntilDue === 0) {
    return "due_today";
  } else if (daysUntilDue <= 7) {
    return "due_soon";
  }
  
  return "unpaid";
}

export function getNextBillDueDate(bill: Bill): Date {
  return getBillDueDate(bill);
}

export function markBillAsPaid(bill: Bill): Bill {
  const currentPeriod = getCurrentPeriod();
  return {
    ...bill,
    status: "paid",
    paidDate: new Date().toISOString().split("T")[0],
    paidPeriod: currentPeriod,
  };
}

export function resetBillForNewPeriod(bill: Bill): Bill {
  const currentPeriod = getCurrentPeriod();
  if (bill.paidPeriod && bill.paidPeriod !== currentPeriod) {
    return {
      ...bill,
      status: "unpaid",
      paidDate: undefined,
      paidPeriod: undefined,
    };
  }
  return bill;
}

export function getBillsForCurrentPeriod(bills: Bill[]): { unpaid: Bill[]; paid: Bill[]; dueSoon: Bill[] } {
  const currentPeriod = getCurrentPeriod();
  const today = new Date();
  
  const paid = bills.filter(b => b.paidPeriod === currentPeriod);
  const unpaid = bills.filter(b => b.paidPeriod !== currentPeriod);
  
  const dueSoon = unpaid.filter(bill => {
    const dueDate = getBillDueDate(bill, today);
    const daysUntilDue = differenceInDays(dueDate, today);
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });
  
  const overdue = unpaid.filter(bill => {
    const dueDate = getBillDueDate(bill, today);
    return isBefore(dueDate, today);
  });
  
  return { paid, unpaid, dueSoon: [...dueSoon, ...overdue] };
}
