import { 
  SmartAlert, 
  Recommendation, 
  ShortfallScenario,
  PlanningRules,
  Scenario,
  AlertSeverity,
  AlertCategory,
  Bill,
  SavingsGoal,
  Expense,
  ExpenseBucket,
  AllocationCategory
} from "./types";
import { getBills, getSavingsGoals, getExpenses, getPaychecks, getPaycheckPlans, getBalance, getPlanningRules } from "./storage";
import { addAlert, addTriggeredAlert, addActivityEntry, getDefaultPlanningRules } from "./storage";
import { format, addDays, parseISO, isAfter, isBefore, startOfDay, differenceInDays } from "date-fns";

const generateId = () => Math.random().toString(36).substring(2, 11);

export function analyzeAlerts(): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const rules = getPlanningRules() as PlanningRules || getDefaultPlanningRules() as PlanningRules;
  const bills = getBills() as Bill[];
  const goals = getSavingsGoals() as SavingsGoal[];
  const expenses = getExpenses() as Expense[];
  const currentBalance = getBalance();
  const paychecks = getPaychecks() as { amount: number; date: string; isReceived: boolean }[];
  const plans = getPaycheckPlans() as { allocations: { category: string; amount: number }[] }[];
  
  const nextPayday = paychecks.find(p => !p.isReceived);
  const totalIncome = paychecks.reduce((sum, p) => sum + (p.isReceived ? p.amount : 0), 0) + (nextPayday?.amount || 0);
  
  const billsDueSoon = bills.filter(b => {
    const dueDay = b.dueDay;
    const today = new Date().getDate();
    return dueDay >= today && dueDay <= today + 7;
  });
  
  const totalBillsDue = billsDueSoon.reduce((sum, b) => sum + b.amount, 0);
  
  const billsAllocated = plans.reduce((sum, plan) => {
    const billAlloc = plan.allocations.find(a => a.category === "bills");
    return sum + (billAlloc?.amount || 0);
  }, 0);

  if (billsDueSoon.length > 0 && billsAllocated < totalBillsDue * 0.5) {
    alerts.push(createAlert(
      "bill_risk",
      "critical",
      "Bills Due Soon - Underfunded",
      `You have ${billsDueSoon.length} bill${billsDueSoon.length > 1 ? 's' : ''} due in the next week, but only have ${formatCurrency(billsAllocated)} set aside.`,
      `Reserve at least ${formatCurrency(totalBillsDue - billsAllocated)} more from your next paycheck for upcoming bills.`,
      totalBillsDue - billsAllocated
    ));
  }

  const projectedBalance = currentBalance + totalIncome - totalBillsDue - getExpensesThisMonth();
  
  if (projectedBalance < rules.minBufferTarget && projectedBalance > 0) {
    alerts.push(createAlert(
      "shortfall",
      "warning",
      "Projected Buffer Risk",
      `After covering bills and expenses, your buffer could drop to ${formatCurrency(projectedBalance)}, below your ${formatCurrency(rules.minBufferTarget)} target.`,
      `Consider reducing flexible spending this pay period to protect your buffer.`,
      rules.minBufferTarget - projectedBalance
    ));
  } else if (projectedBalance <= 0) {
    alerts.push(createAlert(
      "shortfall",
      "critical",
      "Projected Shortfall",
      `Your projected balance could go negative before the next paycheck.`,
      `Take action now: reduce spending, lower savings contributions, or use buffer if available.`,
      Math.abs(projectedBalance)
    ));
  }

  const bufferAlloc = plans.reduce((sum, plan) => {
    const bufAlloc = plan.allocations.find(a => a.category === "buffer");
    return sum + (bufAlloc?.amount || 0);
  }, 0);

  if (currentBalance < rules.minBufferTarget * 0.5) {
    alerts.push(createAlert(
      "buffer",
      "warning",
      "Low Buffer Warning",
      `Your buffer is at ${formatCurrency(currentBalance)}, well below your ${formatCurrency(rules.minBufferTarget)} target.`,
      `Prioritize rebuilding your buffer before new savings goals.`,
      rules.minBufferTarget - currentBalance
    ));
  }

  const spendingByCategory = getSpendingByCategory(expenses);
  
  const grocerySpent = spendingByCategory.groceries || 0;
  const gasSpent = spendingByCategory.gas || 0;
  
  if (grocerySpent > rules.groceryBaseline * 1.2) {
    alerts.push(createAlert(
      "overspending",
      "warning",
      "Groceries Over Budget",
      `You've spent ${formatCurrency(grocerySpent)} on groceries this month, ${formatCurrency(grocerySpent - rules.groceryBaseline)} over your ${formatCurrency(rules.groceryBaseline)} baseline.`,
      `Try meal planning or checking for sales to stay on track.`,
      grocerySpent - rules.groceryBaseline
    ));
  }
  
  if (gasSpent > rules.gasBaseline * 1.2) {
    alerts.push(createAlert(
      "overspending",
      "warning",
      "Gas Spending Up",
      `You've spent ${formatCurrency(gasSpent)} on gas this month, ${formatCurrency(gasSpent - rules.gasBaseline)} over your ${formatCurrency(rules.gasBaseline)} baseline.`,
      `Consider carpooling or combining errands to reduce trips.`,
      gasSpent - rules.gasBaseline
    ));
  }

  const allBillsCovered = billsAllocated >= totalBillsDue * 0.9;
  const bufferHealthy = currentBalance >= rules.minBufferTarget;
  const savingsOnTrack = goals.some(g => !g.isCompleted && (g.currentAmount / g.targetAmount) > 0.5);
  
  if (allBillsCovered && bufferHealthy) {
    alerts.push(createAlert(
      "bills_protected",
      "success",
      "Everything Protected",
      `Great news! Your bills are covered and your buffer is healthy. You're in a solid financial position.`,
      "Keep up the good work! You're prepared for the unexpected.",
      0
    ));
  }

  if (savingsOnTrack && allBillsCovered) {
    alerts.push(createAlert(
      "progress",
      "success",
      "Savings Progress",
      `You're making good progress on your savings goals. Keep it up!`,
      "Consider increasing contributions when possible.",
      0
    ));
  }

  saveAlertsToStorage(alerts);
  return alerts;
}

function createAlert(
  category: AlertCategory,
  severity: AlertSeverity,
  title: string,
  message: string,
  suggestedAction: string,
  amount?: number
): SmartAlert {
  return {
    id: generateId(),
    category,
    severity,
    title,
    message,
    suggestedAction,
    amount,
    createdAt: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
  };
}

function saveAlertsToStorage(alerts: SmartAlert[]): void {
  const existing = getAlerts() as SmartAlert[];
  const merged = [...alerts, ...existing.filter(e => !alerts.find(a => a.id === e.id))];
  saveAlerts(merged.slice(0, 50));
}

function getSpendingByCategory(expenses: Expense[]): Record<string, number> {
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  
  return expenses
    .filter(e => isAfter(parseISO(e.date), monthStart))
    .reduce((acc, e) => {
      const bucket = e.bucket || "misc";
      acc[bucket] = (acc[bucket] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
}

function getExpensesThisMonth(): number {
  const expenses = getExpenses() as Expense[];
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  
  return expenses
    .filter(e => isAfter(parseISO(e.date), monthStart))
    .reduce((sum, e) => sum + e.amount, 0);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function generateRecommendations(): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const rules = getPlanningRules() as PlanningRules || getDefaultPlanningRules() as PlanningRules;
  const bills = getBills() as Bill[];
  const goals = getSavingsGoals() as SavingsGoal[];
  const expenses = getExpenses() as Expense[];
  const currentBalance = getBalance();
  const paychecks = getPaychecks() as { amount: number; date: string; isReceived: boolean }[];
  const plans = getPaycheckPlans() as { allocations: { category: string; amount: number }[] }[];
  
  const nextPaycheck = paychecks.find(p => !p.isReceived);
  const totalIncome = nextPaycheck?.amount || 0;
  
  const billsDue = bills.filter(b => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0);
  const billsAllocated = plans.reduce((sum, plan) => {
    const billAlloc = plan.allocations.find(a => a.category === "bills");
    return sum + (billAlloc?.amount || 0);
  }, 0);
  
  const housingBills = bills.filter(b => b.category === "housing");
  const nonEssential = bills.filter(b => b.category === "subscriptions" || b.category === "other");
  
  if (billsAllocated < billsDue && totalIncome > 0) {
    const shortfall = billsDue - billsAllocated;
    const availableForBills = totalIncome * 0.7;
    
    if (shortfall <= availableForBills) {
      recommendations.push({
        id: generateId(),
        type: "reserve_more",
        priority: 1,
        title: "Reserve more for bills",
        explanation: `You're short ${formatCurrency(shortfall)} to cover all bills. With your next paycheck of ${formatCurrency(totalIncome)}, you can comfortably reserve more.`,
        recommendedAmount: shortfall,
        actionLabel: "Adjust allocation",
      });
    }
  }

  if (housingBills.length > 0 && nonEssential.length > 0) {
    const housingTotal = housingBills.reduce((sum, b) => sum + b.amount, 0);
    const nonEssentialTotal = nonEssential.reduce((sum, b) => sum + b.amount, 0);
    
    if (housingTotal < nonEssentialTotal) {
      recommendations.push({
        id: generateId(),
        type: "prioritize",
        priority: 2,
        title: "Prioritize housing bills",
        explanation: `Your housing costs (${formatCurrency(housingTotal)}) are lower than non-essential bills (${formatCurrency(nonEssentialTotal)}). Consider which to prioritize first.`,
        actionLabel: "Review priorities",
      });
    }
  }

  const spendingByCategory = getSpendingByCategory(expenses);
  const grocerySpent = spendingByCategory.groceries || 0;
  const gasSpent = spendingByCategory.gas || 0;
  
  if (grocerySpent > rules.groceryBaseline) {
    const overage = grocerySpent - rules.groceryBaseline;
    recommendations.push({
      id: generateId(),
      type: "reduce_spending",
      priority: 3,
      title: "Reduce grocery spending",
      explanation: `You've spent ${formatCurrency(overage)} over your grocery baseline. Reducing by even ${formatCurrency(Math.min(overage, 50))} would help keep you on track.`,
      recommendedAmount: Math.min(overage, 50),
      category: "groceries",
      actionLabel: "Review grocery budget",
      impactEstimate: `Saving ${formatCurrency(Math.min(overage, 50))} would bring you closer to your baseline.`,
    });
  }

  const activeGoals = goals.filter(g => !g.isCompleted && g.contributionPerPaycheck > 0);
  if (activeGoals.length > 0 && currentBalance < rules.minBufferTarget) {
    const goalToPause = activeGoals[0];
    recommendations.push({
      id: generateId(),
      type: "pause_goal",
      priority: 4,
      title: `Temporarily pause "${goalToPause.name}"`,
      explanation: `Your buffer is low. Pausing contributions to "${goalToPause.name}" for one pay period would add ${formatCurrency(goalToPause.contributionPerPaycheck)} to your buffer.`,
      recommendedAmount: goalToPause.contributionPerPaycheck,
      actionLabel: "Pause goal",
      impactEstimate: `This would give you ${formatCurrency(goalToPause.contributionPerPaycheck)} more breathing room.`,
    });
  }

  if (currentBalance > rules.minBufferTarget * 1.5 && rules.minSavingsTarget > 0) {
    recommendations.push({
      id: generateId(),
      type: "lower_savings",
      priority: 6,
      title: "Consider increasing savings",
      explanation: `Your buffer is healthy. You might be able to increase savings contributions without straining your budget.`,
      actionLabel: "Review savings",
    });
  }

  const bufferAlloc = plans.reduce((sum, plan) => {
    const bufAlloc = plan.allocations.find(a => a.category === "buffer");
    return sum + (bufAlloc?.amount || 0);
  }, 0);

  if (currentBalance < rules.minBufferTarget && bufferAlloc < 100) {
    recommendations.push({
      id: generateId(),
      type: "use_buffer",
      priority: 5,
      title: "Top up your buffer",
      explanation: `Your buffer is below target. Consider setting aside more this pay period to reach your ${formatCurrency(rules.minBufferTarget)} goal.`,
      recommendedAmount: rules.minBufferTarget - currentBalance,
      actionLabel: "Add to buffer",
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function analyzeShortfall(): ShortfallScenario {
  const rules = getPlanningRules() as PlanningRules || getDefaultPlanningRules() as PlanningRules;
  const bills = getBills() as Bill[];
  const expenses = getExpenses() as Expense[];
  const currentBalance = getBalance();
  const paychecks = getPaycheckPlans() as { allocations: { category: string; amount: number }[] }[];
  
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalAllocated = paychecks.reduce((sum, plan) => {
    return sum + plan.allocations.reduce((s, a) => s + a.amount, 0);
  }, 0);
  
  const shortfallAmount = Math.max(0, totalBills - totalAllocated - currentBalance);
  
  const atRiskItems = bills
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(b => ({ id: b.id, name: b.name, amount: b.amount, priority: b.priority }));
  
  const recommendedCuts: { category: string; amount: number; safe: boolean }[] = [];
  
  const spendingByCategory = getSpendingByCategory(expenses);
  const grocerySpent = spendingByCategory.groceries || 0;
  const gasSpent = spendingByCategory.gas || 0;
  const diningSpent = spendingByCategory.dining || 0;
  
  if (grocerySpent > rules.groceryBaseline * 0.8) {
    recommendedCuts.push({
      category: "groceries",
      amount: Math.min(grocerySpent - rules.groceryBaseline * 0.8, shortfallAmount),
      safe: true,
    });
  }
  
  if (diningSpent > 50) {
    recommendedCuts.push({
      category: "dining",
      amount: Math.min(diningSpent - 50, shortfallAmount),
      safe: true,
    });
  }
  
  if (gasSpent > rules.gasBaseline * 0.8) {
    recommendedCuts.push({
      category: "gas",
      amount: Math.min(gasSpent - rules.gasBaseline * 0.8, shortfallAmount),
      safe: true,
    });
  }

  const suggestedBufferUse = Math.min(
    Math.max(0, currentBalance - rules.minBufferTarget * 0.5),
    shortfallAmount
  );

  let recoveryPlan: { periods: number; amountPerPeriod: number } | null = null;
  if (shortfallAmount > 0) {
    const perPeriod = Math.ceil(shortfallAmount / 3);
    recoveryPlan = { periods: 3, amountPerPeriod: perPeriod };
  }

  return {
    isTight: shortfallAmount > 0 || currentBalance < rules.minBufferTarget,
    shortfallAmount,
    atRiskItems,
    recommendedCuts,
    suggestedBufferUse,
    recoveryPlan,
  };
}

export function runScenario(scenarioType: Scenario["type"], amount: number): Scenario {
  const rules = getPlanningRules() as PlanningRules || getDefaultPlanningRules() as PlanningRules;
  const currentBalance = getBalance();
  const bills = getBills() as Bill[];
  const goals = getSavingsGoals() as SavingsGoal[];
  const paychecks = getPaychecks() as { amount: number; date: string; isReceived: boolean }[];
  
  const nextPaycheck = paychecks.find(p => !p.isReceived);
  const income = nextPaycheck?.amount || 0;
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalSavings = goals.reduce((sum, g) => sum + g.contributionPerPaycheck, 0);
  
  let newBalance = currentBalance;
  let billsCovered = true;
  let savingsAffected = 0;
  let bufferAfter = currentBalance;

  switch (scenarioType) {
    case "spend_extra":
      newBalance = currentBalance - amount;
      billsCovered = newBalance + income >= totalBills;
      bufferAfter = newBalance;
      break;
    case "skip_savings":
      newBalance = currentBalance + totalSavings;
      savingsAffected = -totalSavings;
      bufferAfter = newBalance;
      break;
    case "bill_increase":
      const increase = amount;
      billsCovered = currentBalance + income >= totalBills + increase;
      bufferAfter = currentBalance - increase;
      newBalance = currentBalance - increase;
      break;
    case "extra_income":
      newBalance = currentBalance + amount;
      billsCovered = true;
      bufferAfter = newBalance;
      break;
  }

  return {
    id: generateId(),
    name: getScenarioName(scenarioType, amount),
    type: scenarioType,
    amount,
    impact: {
      newBalance,
      billsCovered,
      savingsAffected,
      bufferAfter,
    },
    createdAt: new Date().toISOString(),
  };
}

function getScenarioName(type: Scenario["type"], amount: number): string {
  switch (type) {
    case "spend_extra": return `Spend $${amount} extra`;
    case "skip_savings": return "Skip savings this pay period";
    case "bill_increase": return `Bill increases by $${amount}`;
    case "extra_income": return `Extra $${amount} income`;
  }
}

export function trackAlertTriggered(alertId: string, actionTaken?: string): void {
  const triggered = {
    id: generateId(),
    alertId,
    actionTaken,
    createdAt: new Date().toISOString(),
  };
  addTriggeredAlert(triggered);
  
  addActivityEntry({
    id: generateId(),
    action: "alert_triggered",
    description: actionTaken || `Alert triggered: ${alertId}`,
    relatedId: alertId,
    relatedType: "alert",
    userId: "self",
    createdAt: new Date().toISOString(),
  });
}

function getAlerts() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("household_planner_alerts");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: SmartAlert[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("household_planner_alerts", JSON.stringify(alerts));
  } catch (error) {
    console.error("Failed to save alerts:", error);
  }
}
