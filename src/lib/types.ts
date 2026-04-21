export type Paycheck = {
  id: string;
  date: string;
  amount: number;
  isReceived: boolean;
};

export type BillFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annual" | "irregular";

export type BillStatus = "upcoming" | "due_soon" | "due_today" | "overdue" | "paid";

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: BillFrequency;
  isAutoPay: boolean;
  category: BillCategory;
  isReserved: boolean;
  reservedAmount: number;
  status: BillStatus;
  paidDate?: string;
  notes?: string;
};

export type BillCategory =
  | "housing"
  | "utilities"
  | "insurance"
  | "subscriptions"
  | "transportation"
  | "healthcare"
  | "debt"
  | "other";

export type SavingsMode = "minimum" | "normal" | "aggressive";

export type SavingsGoalType = "emergency" | "vacation" | "home" | "car" | "debt" | "custom";

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  type: SavingsGoalType;
  targetDate?: string;
  isCompleted: boolean;
  priority: number;
  contributionPerPaycheck: number;
};

export type AllocationCategory =
  | "bills"
  | "savings"
  | "groceries"
  | "gas"
  | "cushion"
  | "buffer";

export type Allocation = {
  category: AllocationCategory;
  amount: number;
  percentage: number;
  label: string;
  color: string;
};

export type PaycheckPlan = {
  paycheckId: string;
  totalAmount: number;
  allocations: Allocation[];
  safeToSpend: number;
  billsToCover: Allocation[];
  suggestedSavings: number;
  suggestedGroceries: number;
  suggestedGas: number;
};

export type HouseholdStatus =
  | "on_track"
  | "tight_this_week"
  | "bills_covered"
  | "shortfall_risk"
  | "emergency";

export type CalendarEvent = {
  id: string;
  date: string;
  type: "payday" | "bill_due" | "savings_milestone" | "risk_day";
  title: string;
  amount?: number;
  isHighlighted: boolean;
};

export type Household = {
  id: string;
  name: string;
  monthlyIncome: number;
  paychecks: Paycheck[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  savingsMode: SavingsMode;
  billsReserves: Record<string, number>;
  currentBalance: number;
  lastUpdated: string;
};

export type DashboardData = {
  safeToSpend: number;
  nextPayday: string;
  paydayCountdown: number;
  billsDueBeforePayday: Bill[];
  totalBillsDue: number;
  amountSetAside: number;
  savingsProgress: number;
  savingsTarget: number;
  overallStatus: HouseholdStatus;
  currentPaycheck: Paycheck | null;
  nextPaycheck: Paycheck | null;
  recentActivity: ActivityItem[];
};

export type ActivityItem = {
  id: string;
  type: "bill_paid" | "savings_deposit" | "paycheck_received" | "withdrawal";
  description: string;
  amount: number;
  date: string;
};