import {
  Household,
  Bill,
  SavingsGoal,
  Paycheck,
  DashboardData,
  CalendarEvent,
  PayFrequency,
} from "./types";
import { addDays, addWeeks, differenceInDays, format, isBefore, parseISO } from "date-fns";

const today = new Date();

export function getDashboardData(household: Household): DashboardData {
  const now = new Date();
  const upcomingPaycheck = household.paychecks.find((p) => !p.isReceived);
  const paydayDate = upcomingPaycheck ? parseISO(upcomingPaycheck.date) : now;

  const billsDueSoon = household.bills.filter((bill) => {
    const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
    return isBefore(dueDate, paydayDate) && bill.status !== "paid";
  });

  const totalBillsDue = billsDueSoon.reduce((sum, bill) => sum + bill.amount, 0);
  const totalSavingsTarget = household.savingsGoals.reduce(
    (sum, goal) => sum + goal.contributionPerPaycheck,
    0
  );

  const safeToSpend = household.currentBalance - totalBillsDue - totalSavingsTarget - 400;

  const totalSaved = household.savingsGoals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );
  const totalTarget = household.savingsGoals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0
  );

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
        date: format(new Date(today.getFullYear(), today.getMonth(), bill.dueDay), "yyyy-MM-dd"),
        type: "bill_due",
        title: bill.name,
        amount: bill.amount,
        isHighlighted: bill.status === "due_soon" || bill.status === "due_today",
      });
    });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateNextPayday(
  frequency: PayFrequency,
  lastPayday?: string
): string {
  const base = lastPayday ? parseISO(lastPayday) : today;

  switch (frequency) {
    case "weekly":
      return format(addWeeks(base, 1), "yyyy-MM-dd");
    case "biweekly":
      return format(addWeeks(base, 2), "yyyy-MM-dd");
    case "semimonthly":
      return format(addDays(base, 15), "yyyy-MM-dd");
    case "monthly":
      return format(addDays(base, 30), "yyyy-MM-dd");
    default:
      return format(addWeeks(base, 2), "yyyy-MM-dd");
  }
}