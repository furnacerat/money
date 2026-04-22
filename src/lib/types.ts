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

export type BillStatus = "unpaid" | "due_soon" | "due_today" | "paid";

export type BillPeriod = {
  year: number;
  month: number;
  weekOfYear?: number;
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
  paidPeriod?: string;
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

export type PaycheckEntry = {
  id: string;
  amount: number;
  date: string;
  incomeSourceId: string;
  notes?: string;
  allocations: PaycheckAllocation[];
  status: "planned" | "confirmed" | "completed";
  createdAt: string;
};

export type PaycheckAllocation = {
  category: "bills" | "savings" | "groceries" | "gas" | "cushion" | "safe";
  label: string;
  amount: number;
  color: string;
};

export type BillFunding = {
  billId: string;
  amount: number;
  date: string;
  paycheckId: string;
};

export type ExpenseBucket = "groceries" | "gas" | "household" | "kids" | "dining" | "entertainment" | "misc";

export type Expense = {
  id: string;
  amount: number;
  bucket: ExpenseBucket;
  date: string;
  note?: string;
  enteredBy: string;
  createdAt: string;
};

export type ExpenseCategory = 
  | "groceries" 
  | "gas" 
  | "household" 
  | "kids" 
  | "dining" 
  | "entertainment" 
  | "misc";

export type SavingsContribution = {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  paycheckId?: string;
  note?: string;
};

export type ActivityAction = 
  | "bill_added" 
  | "bill_paid" 
  | "bill_edited" 
  | "paycheck_planned" 
  | "expense_added" 
  | "expense_edited" 
  | "goal_added" 
  | "goal_updated" 
  | "goal_completed" 
  | "contribution_added" 
  | "settings_updated";

export type ActivityEntry = {
  id: string;
  action: ActivityAction;
  description: string;
  amount?: number;
  relatedId?: string;
  relatedType?: "bill" | "expense" | "goal" | "paycheck" | "settings";
  userId: string;
  createdAt: string;
};

export type HouseholdMember = {
  id: string;
  name: string;
  email?: string;
  role: "owner" | "member" | "viewer";
  isOnline: boolean;
  lastSeen?: string;
};

export type TimelineEvent = {
  id: string;
  date: string;
  type: "payday" | "bill_due" | "contribution" | "expense" | "milestone" | "risk";
  title: string;
  amount?: number;
  category?: string;
  isHighlighted: boolean;
  isWarning: boolean;
};

export type SpendingInsight = {
  category: ExpenseBucket;
  spent: number;
  budget: number;
  remaining: number;
  percentUsed: number;
};

export type CashFlowProjection = {
  date: string;
  projectedBalance: number;
  obligations: number;
  income: number;
  isRiskDay: boolean;
};

export type AlertSeverity = "critical" | "warning" | "info" | "success";

export type AlertCategory = 
  | "bill_risk"
  | "shortfall"
  | "savings_adjusted"
  | "buffer"
  | "overspending"
  | "bills_protected"
  | "progress";

export type SmartAlert = {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  suggestedAction: string;
  relatedId?: string;
  relatedType?: "bill" | "expense" | "goal" | "paycheck";
  amount?: number;
  createdAt: string;
  isRead: boolean;
  isDismissed: boolean;
};

export type Recommendation = {
  id: string;
  type: "reserve_more" | "reduce_spending" | "lower_savings" | "move_bill" | "prioritize" | "pause_goal" | "use_buffer";
  priority: number;
  title: string;
  explanation: string;
  recommendedAmount?: number;
  category?: AllocationCategory;
  actionLabel: string;
  impactEstimate?: string;
};

export type ShortfallScenario = {
  isTight: boolean;
  shortfallAmount: number;
  atRiskItems: { id: string; name: string; amount: number; priority: number }[];
  recommendedCuts: { category: string; amount: number; safe: boolean }[];
  suggestedBufferUse: number;
  recoveryPlan: { periods: number; amountPerPeriod: number } | null;
};

export type PlanningRules = {
  minBufferTarget: number;
  minSavingsTarget: number;
  savingsModeDefault: SavingsMode;
  groceryBaseline: number;
  gasBaseline: number;
  billPriorityRules: { billId: string; priority: number }[];
  autoReserveBehavior: "full" | "minimal" | "none";
  shortfallHandlingPreference: "reduce_savings" | "use_buffer" | "alert_only";
};

export type Scenario = {
  id: string;
  name: string;
  type: "spend_extra" | "skip_savings" | "bill_increase" | "extra_income";
  amount: number;
  impact: {
    newBalance: number;
    billsCovered: boolean;
    savingsAffected: number;
    bufferAfter: number;
  };
  createdAt: string;
};

export type TriggeredAlert = {
  id: string;
  alertId: string;
  actionTaken?: string;
  resolvedAt?: string;
  createdAt: string;
};