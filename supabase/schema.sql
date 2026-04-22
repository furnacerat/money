-- Household Planner Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Households table
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Household members
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Income sources
CREATE TABLE IF NOT EXISTS public.income_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  next_payday DATE NOT NULL,
  has_variable_income BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'irregular')),
  is_auto_pay BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL CHECK (category IN ('housing', 'utilities', 'insurance', 'subscriptions', 'transportation', 'healthcare', 'debt', 'other')),
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due_soon', 'due_today', 'overdue', 'paid')),
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('emergency', 'vacation', 'home', 'car', 'debt', 'custom')),
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  contribution_per_paycheck NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings contributions
CREATE TABLE IF NOT EXISTS public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  paycheck_id UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  bucket TEXT NOT NULL CHECK (bucket IN ('groceries', 'gas', 'household', 'kids', 'dining', 'entertainment', 'misc')),
  date DATE NOT NULL,
  note TEXT,
  entered_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paycheck plans
CREATE TABLE IF NOT EXISTS public.paycheck_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  paycheck_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  allocations JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill funding allocations
CREATE TABLE IF NOT EXISTS public.bill_funding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  paycheck_id UUID NOT NULL REFERENCES paycheck_plans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bill_risk', 'shortfall', 'savings_adjusted', 'buffer', 'overspending', 'bills_protected', 'progress')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'success')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  suggested_action TEXT,
  related_id UUID,
  related_type TEXT,
  amount NUMERIC,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE UNIQUE,
  savings_mode TEXT NOT NULL DEFAULT 'normal' CHECK (savings_mode IN ('survival', 'normal', 'growth')),
  min_savings_per_paycheck NUMERIC DEFAULT 100,
  buffer_target NUMERIC DEFAULT 500,
  current_buffer NUMERIC DEFAULT 0,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invites
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'viewer')),
  invited_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users: users can read their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Households: members can read their household
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can read household" ON public.households
  FOR SELECT USING (
    id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Household members: members can read household members
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can read members" ON public.household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Bills: members can CRUD their household bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage bills" ON public.bills
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Savings goals: members can CRUD
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage savings goals" ON public.savings_goals
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Expenses: members can CRUD
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage expenses" ON public.expenses
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Paycheck plans: members can CRUD
ALTER TABLE public.paycheck_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage paycheck plans" ON public.paycheck_plans
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Bill funding: members can CRUD
ALTER TABLE public.bill_funding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage bill funding" ON public.bill_funding
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Alerts: members can read their household alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can read alerts" ON public.alerts
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Activity feed: members can read their household activity
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can read activity" ON public.activity_feed
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Settings: members can read/update their household settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage settings" ON public.settings
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Income sources: members can CRUD
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage income sources" ON public.income_sources
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Savings contributions: members can CRUD
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can manage contributions" ON public.savings_contributions
  FOR ALL USING (
    household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active')
  );

-- Invites: only household owner can manage
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household owner can manage invites" ON public.invites
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_household ON public.bills(household_id);
CREATE INDEX IF NOT EXISTS idx_expenses_household ON public.expenses(household_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_household ON public.savings_goals(household_id);
CREATE INDEX IF NOT EXISTS idx_paycheck_plans_household ON public.paycheck_plans(household_id);
CREATE INDEX IF NOT EXISTS idx_alerts_household ON public.alerts(household_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_household ON public.activity_feed(household_id);

-- Function to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
