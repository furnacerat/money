"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { Badge, Card, ProgressBar, StatusBadge, ToastProvider } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Household } from "@/lib/types";
import { getBillFundingStatus, getDashboardState, getNextPayday, PlanningSettings } from "@/lib/planner";
import { getFundingMap, getHouseholdData, getSettings, isOnboarded } from "@/lib/storage";
import { analyzeAlerts, analyzeShortfall, generateRecommendations } from "@/lib/intelligence";
import { differenceInDays, format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  PiggyBank,
  Receipt,
  Shield,
  WalletCards,
} from "lucide-react";

export default function HomeDashboard() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [dashboardState, setDashboardState] = useState<ReturnType<typeof getDashboardState> | null>(null);
  const [settings, setSettings] = useState<PlanningSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shortfall, setShortfall] = useState<ReturnType<typeof analyzeShortfall> | null>(null);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof generateRecommendations>>([]);

  useEffect(() => {
    const loadDashboard = () => {
      if (!isOnboarded()) {
        router.push("/onboarding");
        return;
      }

      const data = getHouseholdData() as Household | null;
      const fundingMap = getFundingMap();
      const loadedSettings = getSettings();

      if (data) {
        setHousehold(data);
        setSettings(loadedSettings);
        setDashboardState(getDashboardState(data, fundingMap, loadedSettings));
        setShortfall(analyzeShortfall());
        setRecommendations(generateRecommendations());
        analyzeAlerts();
      }

      setIsLoading(false);
    };

    void Promise.resolve().then(loadDashboard);
  }, [router]);

  if (isLoading || !household || !dashboardState || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  const incomeSource = household.incomeSources[0];
  const payday = incomeSource
    ? getNextPayday(incomeSource.frequency, incomeSource.nextPayday)
    : new Date();
  const daysUntil = differenceInDays(payday, new Date());
  const billsDue = dashboardState.billsDueBeforePayday;
  const nextRecommendation = recommendations[0];
  const hasBillsToPlan = billsDue.some((bill) => {
    const status = getBillFundingStatus(bill, getFundingMap()[bill.id] || 0);
    return !status.isFunded;
  });

  const primaryAction = dashboardState.shortfall > 0 || hasBillsToPlan
    ? {
        href: "/paycheck",
        label: "Plan next check",
        description: "Reserve money for bills due before payday.",
        icon: WalletCards,
      }
    : {
        href: "/bills",
        label: "Review bills",
        description: "Everything looks covered. Keep bills current.",
        icon: CheckCircle2,
      };
  const PrimaryIcon = primaryAction.icon;

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-5 animate-fade-in">
          <Card className="relative overflow-hidden bg-slate-950 text-white shadow-lifted">
            <div className="absolute inset-x-0 top-0 h-1 surface-line" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,70,229,0.28),transparent_45%),linear-gradient(225deg,rgba(20,184,166,0.22),transparent_40%)]" />
            <div className="relative py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Today&apos;s answer</p>
                  <h2 className="mt-2 text-5xl font-black tracking-tight text-white">
                    {formatCurrency(dashboardState.safeToSpend)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">safe to spend after protected money</p>
                </div>
                <StatusBadge status={dashboardState.overallStatus} />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Payday</p>
                  <p className="mt-1 text-lg font-black text-white">{daysUntil}</p>
                  <p className="text-[11px] text-slate-300">{daysUntil === 1 ? "day" : "days"}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Bills</p>
                  <p className="mt-1 text-lg font-black text-amber-200">{formatCurrency(dashboardState.totalBillsDue)}</p>
                  <p className="text-[11px] text-slate-300">{billsDue.length} due</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Buffer</p>
                  <p className="mt-1 text-lg font-black text-cyan-200">{formatCurrency(settings.minBuffer)}</p>
                  <p className="text-[11px] text-slate-300">target</p>
                </div>
              </div>
            </div>
          </Card>

          <Link href={primaryAction.href}>
            <Card padding="lg" className="border-slate-500/40 bg-slate-900/88 text-white hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/12">
                  <PrimaryIcon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Next best step</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-white">{primaryAction.label}</h3>
                  <p className="mt-1 text-sm text-slate-300">{primaryAction.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>
            </Card>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/paycheck">
              <Card padding="md" className="h-full bg-blue-950/86 text-white border-blue-800/70">
                <WalletCards className="mb-3 h-5 w-5 text-cyan-200" />
                <p className="font-black text-white">Plan Check</p>
                <p className="mt-1 text-xs text-blue-100">Allocate a new paycheck.</p>
              </Card>
            </Link>
            <Link href="/timeline">
              <Card padding="md" className="h-full bg-teal-950/86 text-white border-teal-800/70">
                <CalendarDays className="mb-3 h-5 w-5 text-emerald-200" />
                <p className="font-black text-white">Calendar</p>
                <p className="mt-1 text-xs text-teal-100">See bills and paydays.</p>
              </Card>
            </Link>
          </div>

          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Bills Before Payday</h3>
                  <p className="text-sm text-slate-600">{format(payday, "EEE, MMM d")} is the next check</p>
                </div>
              </div>
              <Badge variant={hasBillsToPlan ? "warning" : "success"}>{hasBillsToPlan ? "Needs plan" : "Covered"}</Badge>
            </div>

            {billsDue.length > 0 ? (
              <div className="space-y-3">
                {billsDue.slice(0, 4).map((bill) => {
                  const status = getBillFundingStatus(bill, getFundingMap()[bill.id] || 0);
                  const progress = bill.amount > 0 ? status.fundedAmount / bill.amount : 0;

                  return (
                    <div key={bill.id} className="rounded-lg bg-slate-200/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{bill.name}</p>
                          <p className="text-xs text-slate-600">Due day {bill.dueDay}</p>
                        </div>
                        <p className="font-black text-slate-900">{formatCurrency(bill.amount)}</p>
                      </div>
                      <div className="mt-3">
                        <ProgressBar
                          progress={progress}
                          color={status.isFunded ? "#10B981" : "#F59E0B"}
                          backgroundColor="#CBD5E1"
                          height={7}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">{formatCurrency(status.fundedAmount)} reserved</span>
                        <span className={status.isFunded ? "text-emerald-700" : "text-amber-700"}>
                          {status.isFunded ? "Covered" : `${formatCurrency(status.remainingNeeded)} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <Link href="/bills" className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white">
                  Open bills <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-100 p-4 text-sm font-semibold text-emerald-800">
                No bills are due before the next paycheck.
              </div>
            )}
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Link href="/savings">
              <Card padding="sm" className="text-center">
                <PiggyBank className="mx-auto mb-2 text-emerald-600" size={20} />
                <p className="text-xs text-slate-600">Savings</p>
                <p className="text-lg font-black text-slate-900">{household.savingsGoals.length}</p>
              </Card>
            </Link>
            <Link href="/expenses">
              <Card padding="sm" className="text-center">
                <DollarSign className="mx-auto mb-2 text-blue-600" size={20} />
                <p className="text-xs text-slate-600">Balance</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(household.currentBalance)}</p>
              </Card>
            </Link>
            <Link href="/rules">
              <Card padding="sm" className="text-center">
                <Shield className="mx-auto mb-2 text-violet-600" size={20} />
                <p className="text-xs text-slate-600">Rules</p>
                <p className="text-lg font-black text-slate-900">Set</p>
              </Card>
            </Link>
          </div>

          {(shortfall?.isTight || nextRecommendation) && (
            <Card padding="lg" className={shortfall?.isTight ? "border-amber-300 bg-amber-100" : "border-blue-300 bg-blue-100"}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={shortfall?.isTight ? "mt-1 h-5 w-5 text-amber-700" : "mt-1 h-5 w-5 text-blue-700"} />
                <div>
                  <p className={shortfall?.isTight ? "font-black text-amber-900" : "font-black text-blue-900"}>
                    {shortfall?.isTight ? "Cash flow needs attention" : nextRecommendation?.title}
                  </p>
                  <p className={shortfall?.isTight ? "mt-1 text-sm text-amber-800" : "mt-1 text-sm text-blue-800"}>
                    {shortfall?.shortfallAmount
                      ? `You are short ${formatCurrency(shortfall.shortfallAmount)} this pay period.`
                      : nextRecommendation?.explanation || "Review your plan before spending extra."}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </AppShell>
    </ToastProvider>
  );
}
