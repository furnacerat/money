import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Household,
  DashboardData,
  Bill,
  SavingsGoal,
  Paycheck,
  SavingsMode,
  PaycheckPlan,
  CalendarEvent,
} from "./types";
import {
  getDashboardData,
  getCalendarEvents,
} from "./data";
import { generateId } from "./utils";

type HouseholdContextType = {
  household: Household;
  dashboard: DashboardData;
  calendarEvents: CalendarEvent[];
  updateCurrentBalance: (amount: number) => void;
  addBill: (bill: Omit<Bill, "id">) => void;
  markBillPaid: (billId: string) => void;
  updateBill: (billId: string, updates: Partial<Bill>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (goalId: string, updates: Partial<SavingsGoal>) => void;
  addContribution: (goalId: string, amount: number) => void;
  setSavingsMode: (mode: SavingsMode) => void;
  getPaycheckPlan: (paycheck: Paycheck) => PaycheckPlan;
};

const defaultHousehold: Household = {
  id: "default",
  name: "Your Household",
  owner: { id: "1", name: "You" },
  incomeSources: [],
  bills: [],
  savingsGoals: [],
  settings: {
    savingsMode: "normal",
    minSavingsPerPaycheck: 200,
    buffer: { currentBalance: 0, targetBuffer: 1000, cashOnHand: 0 },
    notifications: { billReminders: true, paydayReminders: true, lowBalanceAlerts: true },
  },
  currentBalance: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const HouseholdContext = createContext<HouseholdContextType | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [household, setHousehold] = useState<Household>(defaultHousehold);
  const [dashboard] = useState<DashboardData>(() => getDashboardData(defaultHousehold));
  const [calendarEvents] = useState<CalendarEvent[]>(() =>
    getCalendarEvents(defaultHousehold)
  );

  const updateCurrentBalance = (amount: number) => {
    setHousehold((prev) => ({
      ...prev,
      currentBalance: amount,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addBill = (bill: Omit<Bill, "id">) => {
    const newBill: Bill = { ...bill, id: generateId() };
    setHousehold((prev) => ({
      ...prev,
      bills: [...prev.bills, newBill],
    }));
  };

  const markBillPaid = (billId: string) => {
    setHousehold((prev) => ({
      ...prev,
      bills: prev.bills.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              status: "paid" as const,
              paidDate: new Date().toISOString().split("T")[0],
            }
          : bill
      ),
    }));
  };

  const updateBill = (billId: string, updates: Partial<Bill>) => {
    setHousehold((prev) => ({
      ...prev,
      bills: prev.bills.map((bill) =>
        bill.id === billId ? { ...bill, ...updates } : bill
      ),
    }));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, "id">) => {
    const newGoal: SavingsGoal = { ...goal, id: generateId() };
    setHousehold((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal],
    }));
  };

  const updateSavingsGoal = (goalId: string, updates: Partial<SavingsGoal>) => {
    setHousehold((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((goal) =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ),
    }));
  };

  const addContribution = (goalId: string, amount: number) => {
    setHousehold((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentAmount: goal.currentAmount + amount,
              isCompleted: goal.currentAmount + amount >= goal.targetAmount,
            }
          : goal
      ),
    }));
  };

  const setSavingsMode = (mode: SavingsMode) => {
    setHousehold((prev) => ({
      ...prev,
      savingsMode: mode,
    }));
  };

  const getPaycheckPlan = (paycheck: Paycheck): PaycheckPlan => {
    const amount = paycheck.amount;
    const totalBills = household.bills
      .filter((b) => b.status !== "paid")
      .reduce((sum, b) => sum + b.amount, 0);
    const totalSavings = household.savingsGoals.reduce(
      (sum, g) => sum + g.contributionPerPaycheck,
      0
    );

    const groceries = 400;
    const gas = 150;
    const cushion = 200;
    const billsAllocation = Math.min(totalBills, amount * 0.45);
    const savingsAllocation = Math.min(totalSavings, amount * 0.15);
    const safeToSpend = amount - billsAllocation - savingsAllocation - groceries - gas - cushion;

    return {
      paycheckId: paycheck.id,
      totalAmount: amount,
      allocations: [
        { category: "bills", amount: billsAllocation, percentage: 0.45, label: "Bills", color: "#8B5CF6" },
        { category: "savings", amount: savingsAllocation, percentage: 0.15, label: "Savings", color: "#10B981" },
        { category: "groceries", amount: groceries, percentage: 0.14, label: "Groceries", color: "#F59E0B" },
        { category: "gas", amount: gas, percentage: 0.05, label: "Gas", color: "#3B82F6" },
        { category: "cushion", amount: cushion, percentage: 0.07, label: "Cushion", color: "#06B6D4" },
        { category: "buffer", amount: Math.max(0, safeToSpend), percentage: Math.max(0, safeToSpend) / amount, label: "Safe to Spend", color: "#EC4899" },
      ],
      safeToSpend: Math.max(0, safeToSpend),
      billsToCover: [],
      suggestedSavings: savingsAllocation,
      suggestedGroceries: groceries,
      suggestedGas: gas,
    };
  };

  return (
    <HouseholdContext.Provider
      value={{
        household,
        dashboard,
        calendarEvents,
        updateCurrentBalance,
        addBill,
        markBillPaid,
        updateBill,
        addSavingsGoal,
        updateSavingsGoal,
        addContribution,
        setSavingsMode,
        getPaycheckPlan,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
}