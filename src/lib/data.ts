import {
  Household,
  Bill,
  SavingsGoal,
  Paycheck,
  DashboardData,
  CalendarEvent,
} from "./types";
import { addDays, addWeeks, differenceInDays, format, isBefore, parseISO } from "date-fns";

const today = new Date();

export const mockBills: Bill[] = [
  {
    id: "b1",
    name: "Rent",
    amount: 1850,
    dueDate: format(addDays(today, 8), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: true,
    category: "housing",
    isReserved: true,
    reservedAmount: 1850,
    status: "upcoming",
  },
  {
    id: "b2",
    name: "Electric",
    amount: 145,
    dueDate: format(addDays(today, 12), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: true,
    category: "utilities",
    isReserved: true,
    reservedAmount: 145,
    status: "upcoming",
  },
  {
    id: "b3",
    name: "Internet",
    amount: 75,
    dueDate: format(addDays(today, 15), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: true,
    category: "utilities",
    isReserved: true,
    reservedAmount: 75,
    status: "upcoming",
  },
  {
    id: "b4",
    name: "Car Insurance",
    amount: 165,
    dueDate: format(addDays(today, 20), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: true,
    category: "insurance",
    isReserved: true,
    reservedAmount: 165,
    status: "upcoming",
  },
  {
    id: "b5",
    name: "Phone",
    amount: 120,
    dueDate: format(addDays(today, 5), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: false,
    category: "utilities",
    isReserved: true,
    reservedAmount: 120,
    status: "due_soon",
  },
  {
    id: "b6",
    name: "Netflix",
    amount: 15.99,
    dueDate: format(addDays(today, 3), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: true,
    category: "subscriptions",
    isReserved: true,
    reservedAmount: 15.99,
    status: "due_soon",
  },
  {
    id: "b7",
    name: "Spotify",
    amount: 10.99,
    dueDate: format(addDays(today, 18), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: true,
    category: "subscriptions",
    isReserved: true,
    reservedAmount: 10.99,
    status: "upcoming",
  },
  {
    id: "b8",
    name: "Gym",
    amount: 45,
    dueDate: format(addDays(today, 10), "yyyy-MM-dd"),
    frequency: "monthly",
    isAutoPay: false,
    category: "healthcare",
    isReserved: true,
    reservedAmount: 45,
    status: "upcoming",
  },
];

export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "s1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 4200,
    type: "emergency",
    targetDate: format(addMonths(today, 8), "yyyy-MM-dd"),
    isCompleted: false,
    priority: 1,
    contributionPerPaycheck: 300,
  },
  {
    id: "s2",
    name: "Hawaii Trip",
    targetAmount: 3500,
    currentAmount: 1800,
    type: "vacation",
    targetDate: format(addMonths(today, 6), "yyyy-MM-dd"),
    isCompleted: false,
    priority: 2,
    contributionPerPaycheck: 200,
  },
  {
    id: "s3",
    name: "New Laptop",
    targetAmount: 2000,
    currentAmount: 950,
    type: "custom",
    isCompleted: false,
    priority: 3,
    contributionPerPaycheck: 100,
  },
];

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const nextPayday1 = addWeeks(today, 1);
const nextPayday2 = addWeeks(nextPayday1, 2);

export const mockPaychecks: Paycheck[] = [
  {
    id: "p1",
    date: format(addDays(today, -14), "yyyy-MM-dd"),
    amount: 2850,
    isReceived: true,
  },
  {
    id: "p2",
    date: format(nextPayday1, "yyyy-MM-dd"),
    amount: 2850,
    isReceived: false,
  },
  {
    id: "p3",
    date: format(nextPayday2, "yyyy-MM-dd"),
    amount: 2850,
    isReceived: false,
  },
];

export const mockHousehold: Household = {
  id: "h1",
  name: "The Foster Family",
  monthlyIncome: 5700,
  paychecks: mockPaychecks,
  bills: mockBills,
  savingsGoals: mockSavingsGoals,
  savingsMode: "normal",
  billsReserves: {},
  currentBalance: 2847,
  lastUpdated: format(today, "yyyy-MM-dd'T'HH:mm:ss"),
};

export function getDashboardData(household: Household): DashboardData {
  const now = new Date();
  const upcomingPaycheck = household.paychecks.find((p) => !p.isReceived);
  const paydayDate = upcomingPaycheck ? parseISO(upcomingPaycheck.date) : now;

  const billsDueSoon = household.bills.filter((bill) => {
    const dueDate = parseISO(bill.dueDate);
    return isBefore(dueDate, paydayDate) && bill.status !== "paid";
  });

  const totalBillsDue = billsDueSoon.reduce((sum, bill) => sum + bill.amount, 0);
  const totalSavingsTarget = household.savingsGoals.reduce((sum, goal) => sum + goal.contributionPerPaycheck, 0);

  const safeToSpend = household.currentBalance - totalBillsDue - totalSavingsTarget - 400;

  const totalSaved = household.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = household.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  let status: DashboardData["overallStatus"] = "on_track";
  if (safeToSpend < 200) {
    status = "tight_this_week";
  } else if (billsDueSoon.length > 4) {
    status = "bills_covered";
  } else if (safeToSpend < 0) {
    status = "shortfall_risk";
  }

  return {
    safeToSpend: Math.max(0, safeToSpend),
    nextPayday: upcomingPaycheck?.date || "",
    paydayCountdown: differenceInDays(paydayDate, now),
    billsDueBeforePayday: billsDueSoon,
    totalBillsDue,
    amountSetAside: totalBillsDue + totalSavingsTarget + 400,
    savingsProgress: totalSaved,
    savingsTarget: totalTarget,
    overallStatus: status,
    currentPaycheck: household.paychecks.find((p) => p.isReceived) || null,
    nextPaycheck: upcomingPaycheck || null,
    recentActivity: [],
  };
}

export function getCalendarEvents(household: Household): CalendarEvent[] {
  const now = new Date();
  const events: CalendarEvent[] = [];

  household.paychecks.forEach((paycheck) => {
    events.push({
      id: `pay-${paycheck.id}`,
      date: paycheck.date,
      type: "payday",
      title: paycheck.isReceived ? "Paycheck Received" : "Payday",
      amount: paycheck.amount,
      isHighlighted: true,
    });
  });

  household.bills
    .filter((bill) => bill.status !== "paid")
    .forEach((bill) => {
      events.push({
        id: `bill-${bill.id}`,
        date: bill.dueDate,
        type: "bill_due",
        title: bill.name,
        amount: bill.amount,
        isHighlighted: bill.status === "due_soon" || bill.status === "due_today",
      });
    });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}