import { supabase, Household, HouseholdMember, IncomeSource, Bill, SavingsGoal, SavingsContribution, Expense, PaycheckPlan, BillFunding, Alert, ActivityEntry, Settings, Invite, User } from "./supabase";
import { useAuth } from "./auth";

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface SyncState {
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
}

export async function getCurrentHousehold(): Promise<Household | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("role", ["owner", "member"])
    .single();

  if (!member) return null;

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("id", member.household_id)
    .single();

  return household as Household | null;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { data } = await supabase
    .from("household_members")
    .select("*")
    .eq("household_id", householdId);

  return (data || []) as HouseholdMember[];
}

export async function getMemberProfiles(householdId: string): Promise<(HouseholdMember & { user: User })[]> {
  const { data: members } = await supabase
    .from("household_members")
    .select("*")
    .eq("household_id", householdId);

  if (!members) return [];

  const membersWithProfiles = await Promise.all(
    members.map(async (member) => {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", member.user_id)
        .single();
      
      return { ...member, user: user as User };
    })
  );

  return membersWithProfiles as (HouseholdMember & { user: User })[];
}

export async function createHousehold(name: string, ownerId: string): Promise<Household> {
  const household = {
    id: generateId(),
    name,
    owner_id: ownerId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await supabase.from("households").insert(household);

  await supabase.from("household_members").insert({
    id: generateId(),
    household_id: household.id,
    user_id: ownerId,
    role: "owner",
    status: "active",
    created_at: new Date().toISOString(),
  });

  await supabase.from("settings").insert({
    id: generateId(),
    household_id: household.id,
    savings_mode: "normal",
    min_savings_per_paycheck: 100,
    buffer_target: 500,
    current_buffer: 0,
    notifications_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return household as Household;
}

export async function getIncomeSources(householdId: string): Promise<IncomeSource[]> {
  const { data } = await supabase
    .from("income_sources")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at");

  return (data || []) as IncomeSource[];
}

export async function addIncomeSource(householdId: string, source: Omit<IncomeSource, "id" | "household_id" | "created_at" | "updated_at">): Promise<IncomeSource> {
  const newSource = {
    id: generateId(),
    household_id: householdId,
    ...source,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await supabase.from("income_sources").insert(newSource);
  return newSource as IncomeSource;
}

export async function getBills(householdId: string): Promise<Bill[]> {
  const { data } = await supabase
    .from("bills")
    .select("*")
    .eq("household_id", householdId)
    .order("priority");

  return (data || []) as Bill[];
}

export async function addBill(householdId: string, bill: Omit<Bill, "id" | "household_id" | "created_at" | "updated_at">): Promise<Bill> {
  const newBill = {
    id: generateId(),
    household_id: householdId,
    ...bill,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await supabase.from("bills").insert(newBill);
  return newBill as Bill;
}

export async function updateBill(billId: string, updates: Partial<Bill>): Promise<void> {
  await supabase
    .from("bills")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", billId);
}

export async function deleteBill(billId: string): Promise<void> {
  await supabase.from("bills").delete().eq("id", billId);
}

export async function getSavingsGoals(householdId: string): Promise<SavingsGoal[]> {
  const { data } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("household_id", householdId)
    .order("priority");

  return (data || []) as SavingsGoal[];
}

export async function addSavingsGoal(householdId: string, goal: Omit<SavingsGoal, "id" | "household_id" | "created_at" | "updated_at">): Promise<SavingsGoal> {
  const newGoal = {
    id: generateId(),
    household_id: householdId,
    ...goal,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await supabase.from("savings_goals").insert(newGoal);
  return newGoal as SavingsGoal;
}

export async function updateSavingsGoal(goalId: string, updates: Partial<SavingsGoal>): Promise<void> {
  await supabase
    .from("savings_goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", goalId);
}

export async function deleteSavingsGoal(goalId: string): Promise<void> {
  await supabase.from("savings_goals").delete().eq("id", goalId);
}

export async function getContributions(householdId: string): Promise<SavingsContribution[]> {
  const { data } = await supabase
    .from("savings_contributions")
    .select("*")
    .eq("household_id", householdId)
    .order("date", { ascending: false });

  return (data || []) as SavingsContribution[];
}

export async function addContribution(householdId: string, contribution: Omit<SavingsContribution, "id" | "household_id" | "created_at">): Promise<SavingsContribution> {
  const newContribution = {
    id: generateId(),
    household_id: householdId,
    ...contribution,
    created_at: new Date().toISOString(),
  };

  await supabase.from("savings_contributions").insert(newContribution);
  
  const { data: goal } = await supabase
    .from("savings_goals")
    .select("current_amount")
    .eq("id", contribution.goal_id)
    .single();
  
  if (goal) {
    await supabase
      .from("savings_goals")
      .update({ 
        current_amount: goal.current_amount + contribution.amount,
        updated_at: new Date().toISOString()
      })
      .eq("id", contribution.goal_id);
  }

  return newContribution as SavingsContribution;
}

export async function getExpenses(householdId: string): Promise<Expense[]> {
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("household_id", householdId)
    .order("date", { ascending: false });

  return (data || []) as Expense[];
}

export async function addExpense(householdId: string, expense: Omit<Expense, "id" | "household_id" | "created_at">): Promise<Expense> {
  const newExpense = {
    id: generateId(),
    household_id: householdId,
    ...expense,
    created_at: new Date().toISOString(),
  };

  await supabase.from("expenses").insert(newExpense);
  return newExpense as Expense;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await supabase.from("expenses").delete().eq("id", expenseId);
}

export async function getPaycheckPlans(householdId: string): Promise<PaycheckPlan[]> {
  const { data } = await supabase
    .from("paycheck_plans")
    .select("*")
    .eq("household_id", householdId)
    .order("paycheck_date", { ascending: false });

  return (data || []) as PaycheckPlan[];
}

export async function addPaycheckPlan(householdId: string, plan: Omit<PaycheckPlan, "id" | "household_id" | "created_at">): Promise<PaycheckPlan> {
  const newPlan = {
    id: generateId(),
    household_id: householdId,
    ...plan,
    created_at: new Date().toISOString(),
  };

  await supabase.from("paycheck_plans").insert(newPlan);
  return newPlan as PaycheckPlan;
}

export async function getBillFunding(householdId: string): Promise<BillFunding[]> {
  const { data } = await supabase
    .from("bill_funding")
    .select("*")
    .eq("household_id", householdId);

  return (data || []) as BillFunding[];
}

export async function updateBillFunding(householdId: string, billId: string, paycheckId: string, amount: number): Promise<void> {
  const { data: existing } = await supabase
    .from("bill_funding")
    .select("*")
    .eq("bill_id", billId)
    .eq("paycheck_id", paycheckId)
    .single();

  if (existing) {
    await supabase
      .from("bill_funding")
      .update({ amount })
      .eq("id", existing.id);
  } else {
    await supabase.from("bill_funding").insert({
      id: generateId(),
      household_id: householdId,
      bill_id: billId,
      paycheck_id: paycheckId,
      amount,
    });
  }
}

export async function getAlerts(householdId: string): Promise<Alert[]> {
  const { data } = await supabase
    .from("alerts")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []) as Alert[];
}

export async function addAlert(householdId: string, alert: Omit<Alert, "id" | "household_id" | "created_at">): Promise<Alert> {
  const newAlert = {
    id: generateId(),
    household_id: householdId,
    ...alert,
    created_at: new Date().toISOString(),
  };

  await supabase.from("alerts").insert(newAlert);
  return newAlert as Alert;
}

export async function markAlertRead(alertId: string): Promise<void> {
  await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("id", alertId);
}

export async function dismissAlert(alertId: string): Promise<void> {
  await supabase
    .from("alerts")
    .update({ is_dismissed: true })
    .eq("id", alertId);
}

export async function getActivityFeed(householdId: string): Promise<ActivityEntry[]> {
  const { data } = await supabase
    .from("activity_feed")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []) as ActivityEntry[];
}

export async function addActivityEntry(householdId: string, userId: string, entry: Omit<ActivityEntry, "id" | "household_id" | "user_id" | "created_at">): Promise<ActivityEntry> {
  const newEntry = {
    id: generateId(),
    household_id: householdId,
    user_id: userId,
    ...entry,
    created_at: new Date().toISOString(),
  };

  await supabase.from("activity_feed").insert(newEntry);
  return newEntry as ActivityEntry;
}

export async function getSettings(householdId: string): Promise<Settings | null> {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("household_id", householdId)
    .single();

  return data as Settings | null;
}

export async function updateSettings(householdId: string, updates: Partial<Settings>): Promise<void> {
  await supabase
    .from("settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("household_id", householdId);
}

export async function getInvites(householdId: string): Promise<Invite[]> {
  const { data } = await supabase
    .from("invites")
    .select("*")
    .eq("household_id", householdId)
    .eq("status", "pending");

  return (data || []) as Invite[];
}

export async function createInvite(householdId: string, invitedBy: string, email: string, role: "member" | "viewer"): Promise<Invite> {
  const token = generateId() + generateId();
  const invite = {
    id: generateId(),
    household_id: householdId,
    email,
    role,
    invited_by: invitedBy,
    token,
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };

  await supabase.from("invites").insert(invite);
  return invite as Invite;
}

export async function acceptInvite(token: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const { data: invite } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invite) {
    return { success: false, error: "Invalid or expired invite" };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { success: false, error: "Invite has expired" };
  }

  await supabase.from("household_members").insert({
    id: generateId(),
    household_id: invite.household_id,
    user_id: userId,
    role: invite.role,
    status: "active",
    invited_by: invite.invited_by,
    created_at: new Date().toISOString(),
  });

  await supabase
    .from("invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  return { success: true };
}

export function subscribeToHouseholdChanges(householdId: string, callback: (payload: any) => void) {
  const channels = [
    supabase.channel(`bills:${householdId}`).on("postgres_changes", { event: "*", schema: "public", table: "bills", filter: `household_id=eq.${householdId}` }, callback),
    supabase.channel(`savings_goals:${householdId}`).on("postgres_changes", { event: "*", schema: "public", table: "savings_goals", filter: `household_id=eq.${householdId}` }, callback),
    supabase.channel(`expenses:${householdId}`).on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `household_id=eq.${householdId}` }, callback),
    supabase.channel(`paycheck_plans:${householdId}`).on("postgres_changes", { event: "*", schema: "public", table: "paycheck_plans", filter: `household_id=eq.${householdId}` }, callback),
    supabase.channel(`activity_feed:${householdId}`).on("postgres_changes", { event: "*", schema: "public", table: "activity_feed", filter: `household_id=eq.${householdId}` }, callback),
    supabase.channel(`alerts:${householdId}`).on("postgres_changes", { event: "*", schema: "public", table: "alerts", filter: `household_id=eq.${householdId}` }, callback),
  ];

  channels.forEach(channel => channel.subscribe());

  return () => {
    channels.forEach(channel => supabase.removeChannel(channel));
  };
}
