import {
  Household,
  DashboardData,
  CalendarEvent,
} from "./types";
import { differenceInDays, format, isBefore } from "date-fns";

const today = new Date();

export function getDashboardData(household: Household): DashboardData {
  const now = new Date();
  const paydayDate = household.incomeSources.length > 0 
    ? new Date(household.incomeSources[0].nextPayday)
    : now;

  const billsDueSoon = household.bills.filter((bill) => {
    const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.dueDay);
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
    nextPayday: paydayDate.toISOString(),
    paydayCountdown: differenceInDays(paydayDate, now),
    billsDueBeforePayday: billsDueSoon,
    totalBillsDue,
    amountSetAside: totalBillsDue + totalSavingsTarget + 400,
    savingsProgress: totalSaved,
    savingsTarget: totalTarget,
    overallStatus: status,
    currentPaycheck: null,
    nextPaycheck: null,
    recentActivity: [],
  };
}

export function getCalendarEvents(household: Household): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  household.incomeSources.forEach((source) => {
    events.push({
      id: `pay-${source.id}`,
      date: source.nextPayday,
      type: "payday",
      title: source.name,
      amount: source.amount,
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