export type OnboardingStep =
  | "welcome"
  | "household"
  | "income"
  | "bills"
  | "savings"
  | "buffer"
  | "summary";

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export type IncomeSource = {
  id: string;
  name: string;
  amount: number;
  frequency: PayFrequency;
  nextPayday: string;
  hasVariableIncome: boolean;
};

export type User = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
};

export type Household = {
  id: string;
  name: string;
  owner: User;
  spouse?: User;
  incomeSources: IncomeSource[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  settings: Settings;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type BillFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annual" | "irregular";

export type BillStatus = "upcoming" | "due_soon" | "due_today" | "overdue" | "paid";

export type BillCategory =
  | "housing"
  | "utilities"
  | "insurance"
  | "subscriptions"
  | "transportation"
  | "healthcare"
  | "debt"
  | "other";

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  frequency: BillFrequency;
  isAutoPay: boolean;
  category: BillCategory;
  priority: number;
  status: BillStatus;
  paidDate?: string;
};

export type SavingsMode = "survival" | "normal" | "growth";

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

export type BufferSettings = {
  currentBalance: number;
  targetBuffer: number;
  cashOnHand: number;
};

export type Settings = {
  savingsMode: SavingsMode;
  minSavingsPerPaycheck: number;
  buffer: BufferSettings;
  notifications: NotificationSettings;
};

export type NotificationSettings = {
  billReminders: boolean;
  paydayReminders: boolean;
  lowBalanceAlerts: boolean;
};

export type PaySchedule = {
  frequency: PayFrequency;
  nextPayday: string;
  paydays: string[];
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

export type Paycheck = {
  id: string;
  date: string;
  amount: number;
  isReceived: boolean;
};

export type CalendarEvent = {
  id: string;
  date: string;
  type: "payday" | "bill_due" | "savings_milestone" | "risk_day";
  title: string;
  amount?: number;
  isHighlighted: boolean;
};

export type ActivityItem = {
  id: string;
  type: "bill_paid" | "savings_deposit" | "paycheck_received" | "withdrawal";
  description: string;
  amount: number;
  date: string;
};

export type OnboardingData = {
  step: OnboardingStep;
  householdName: string;
  userName: string;
  spouseName: string;
  inviteLater: boolean;
  incomeSource: string;
  payFrequency: PayFrequency;
  paycheckAmount: number;
  nextPayday: string;
  hasVariableIncome: boolean;
  bills: Omit<Bill, "id">[];
  emergencyFundTarget: number;
  minSavingsPerPaycheck: number;
  savingsMode: SavingsMode;
  currentBalance: number;
  targetBuffer: number;
  cashOnHand: number;
};

export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
};

export type Alert = {
  id: string;
  type: "bill_due" | "low_balance" | "payday" | "savings_goal";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
};

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};