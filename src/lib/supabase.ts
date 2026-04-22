import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key-for-build');

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role: 'owner' | 'member' | 'viewer';
          status: 'active' | 'pending';
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role?: 'owner' | 'member' | 'viewer';
          status?: 'active' | 'pending';
          invited_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          role?: 'owner' | 'member' | 'viewer';
          status?: 'active' | 'pending';
          invited_by?: string | null;
          created_at?: string;
        };
      };
      income_sources: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          amount: number;
          frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
          next_payday: string;
          has_variable_income: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          amount: number;
          frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
          next_payday: string;
          has_variable_income?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          amount?: number;
          frequency?: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
          next_payday?: string;
          has_variable_income?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          amount: number;
          due_day: number;
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
          is_auto_pay: boolean;
          category: 'housing' | 'utilities' | 'insurance' | 'subscriptions' | 'transportation' | 'healthcare' | 'debt' | 'other';
          priority: number;
          status: 'unpaid' | 'due_soon' | 'due_today' | 'paid';
          paid_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          amount: number;
          due_day: number;
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
          is_auto_pay?: boolean;
          category: 'housing' | 'utilities' | 'insurance' | 'subscriptions' | 'transportation' | 'healthcare' | 'debt' | 'other';
          priority: number;
          status?: 'unpaid' | 'due_soon' | 'due_today' | 'paid';
          paid_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          amount?: number;
          due_day?: number;
          frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
          is_auto_pay?: boolean;
          category?: 'housing' | 'utilities' | 'insurance' | 'subscriptions' | 'transportation' | 'healthcare' | 'debt' | 'other';
          priority?: number;
          status?: 'unpaid' | 'due_soon' | 'due_today' | 'paid';
          paid_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          type: 'emergency' | 'vacation' | 'home' | 'car' | 'debt' | 'custom';
          target_date: string | null;
          is_completed: boolean;
          priority: number;
          contribution_per_paycheck: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          type: 'emergency' | 'vacation' | 'home' | 'car' | 'debt' | 'custom';
          target_date?: string | null;
          is_completed?: boolean;
          priority: number;
          contribution_per_paycheck: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          type?: 'emergency' | 'vacation' | 'home' | 'car' | 'debt' | 'custom';
          target_date?: string | null;
          is_completed?: boolean;
          priority?: number;
          contribution_per_paycheck?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      savings_contributions: {
        Row: {
          id: string;
          household_id: string;
          goal_id: string;
          amount: number;
          date: string;
          paycheck_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          goal_id: string;
          amount: number;
          date: string;
          paycheck_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          goal_id?: string;
          amount?: number;
          date?: string;
          paycheck_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          household_id: string;
          amount: number;
          bucket: 'groceries' | 'gas' | 'household' | 'kids' | 'dining' | 'entertainment' | 'misc';
          date: string;
          note: string | null;
          entered_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          amount: number;
          bucket: 'groceries' | 'gas' | 'household' | 'kids' | 'dining' | 'entertainment' | 'misc';
          date: string;
          note?: string | null;
          entered_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          amount?: number;
          bucket?: 'groceries' | 'gas' | 'household' | 'kids' | 'dining' | 'entertainment' | 'misc';
          date?: string;
          note?: string | null;
          entered_by?: string;
          created_at?: string;
        };
      };
      paycheck_plans: {
        Row: {
          id: string;
          household_id: string;
          paycheck_date: string;
          total_amount: number;
          allocations: Json;
          status: 'planned' | 'confirmed' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          paycheck_date: string;
          total_amount: number;
          allocations: Json;
          status?: 'planned' | 'confirmed' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          paycheck_date?: string;
          total_amount?: number;
          allocations?: Json;
          status?: 'planned' | 'confirmed' | 'completed';
          created_at?: string;
        };
      };
      bill_funding: {
        Row: {
          id: string;
          household_id: string;
          bill_id: string;
          paycheck_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          bill_id: string;
          paycheck_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          bill_id?: string;
          paycheck_id?: string;
          amount?: number;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          household_id: string;
          category: 'bill_risk' | 'shortfall' | 'savings_adjusted' | 'buffer' | 'overspending' | 'bills_protected' | 'progress';
          severity: 'critical' | 'warning' | 'info' | 'success';
          title: string;
          message: string;
          suggested_action: string | null;
          related_id: string | null;
          related_type: string | null;
          amount: number | null;
          is_read: boolean;
          is_dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          category: 'bill_risk' | 'shortfall' | 'savings_adjusted' | 'buffer' | 'overspending' | 'bills_protected' | 'progress';
          severity: 'critical' | 'warning' | 'info' | 'success';
          title: string;
          message: string;
          suggested_action?: string | null;
          related_id?: string | null;
          related_type?: string | null;
          amount?: number | null;
          is_read?: boolean;
          is_dismissed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          category?: 'bill_risk' | 'shortfall' | 'savings_adjusted' | 'buffer' | 'overspending' | 'bills_protected' | 'progress';
          severity?: 'critical' | 'warning' | 'info' | 'success';
          title?: string;
          message?: string;
          suggested_action?: string | null;
          related_id?: string | null;
          related_type?: string | null;
          amount?: number | null;
          is_read?: boolean;
          is_dismissed?: boolean;
          created_at?: string;
        };
      };
      activity_feed: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          action: string;
          description: string;
          amount: number | null;
          related_id: string | null;
          related_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          action: string;
          description: string;
          amount?: number | null;
          related_id?: string | null;
          related_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          action?: string;
          description?: string;
          amount?: number | null;
          related_id?: string | null;
          related_type?: string | null;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          household_id: string;
          savings_mode: 'survival' | 'normal' | 'growth';
          min_savings_per_paycheck: number;
          buffer_target: number;
          current_buffer: number;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          savings_mode?: 'survival' | 'normal' | 'growth';
          min_savings_per_paycheck?: number;
          buffer_target?: number;
          current_buffer?: number;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          savings_mode?: 'survival' | 'normal' | 'growth';
          min_savings_per_paycheck?: number;
          buffer_target?: number;
          current_buffer?: number;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          household_id: string;
          email: string;
          role: 'member' | 'viewer';
          invited_by: string;
          token: string;
          status: 'pending' | 'accepted' | 'expired';
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          email: string;
          role?: 'member' | 'viewer';
          invited_by: string;
          token: string;
          status?: 'pending' | 'accepted' | 'expired';
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          email?: string;
          role?: 'member' | 'viewer';
          invited_by?: string;
          token?: string;
          status?: 'pending' | 'accepted' | 'expired';
          expires_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type User = Database['public']['Tables']['users']['Row'];
export type Household = Database['public']['Tables']['households']['Row'];
export type HouseholdMember = Database['public']['Tables']['household_members']['Row'];
export type IncomeSource = Database['public']['Tables']['income_sources']['Row'];
export type Bill = Database['public']['Tables']['bills']['Row'];
export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];
export type SavingsContribution = Database['public']['Tables']['savings_contributions']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type PaycheckPlan = Database['public']['Tables']['paycheck_plans']['Row'];
export type BillFunding = Database['public']['Tables']['bill_funding']['Row'];
export type Alert = Database['public']['Tables']['alerts']['Row'];
export type ActivityEntry = Database['public']['Tables']['activity_feed']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type Invite = Database['public']['Tables']['invites']['Row'];
