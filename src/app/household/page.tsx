"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge } from "@/components/ui";
import { Household } from "@/lib/types";
import { getHouseholdData, getActivityFeed } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Users, UserPlus, Settings, Bell, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HouseholdPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [activities, setActivities] = useState<unknown[]>([]);

  useEffect(() => {
    const data = getHouseholdData() as Household | null;
    if (data) {
      setHousehold(data);
      setActivities(getActivityFeed().slice(0, 10));
    }
  }, []);

  if (!household) {
    return (
      <ToastProvider>
        <AppShell>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "bill_paid": return "✓";
      case "bill_added": return "+";
      case "paycheck_planned": return "$";
      case "expense_added": return "-";
      case "goal_added": return "★";
      case "contribution_added": return "↗";
      default: return "•";
    }
  };

  const getActivityLabel = (action: string) => {
    switch (action) {
      case "bill_paid": return "paid a bill";
      case "bill_added": return "added a bill";
      case "paycheck_planned": return "planned a paycheck";
      case "expense_added": return "logged an expense";
      case "goal_added": return "created a savings goal";
      case "contribution_added": return "added to savings";
      default: return "made a change";
    }
  };

  return (
    <ToastProvider>
      <AppShell householdName={household.name}>
        <div className="space-y-6">
          {/* Household Header */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{household.name}</h2>
                <p className="text-sm text-slate-500">
                  {household.spouse ? "2 members" : "1 member"}
                </p>
              </div>
            </div>
          </Card>

          {/* Members Section */}
          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Members</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {household.owner.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{household.owner.name}</p>
                    <p className="text-xs text-slate-500">Owner</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">You</Badge>
              </div>
              
              {household.spouse ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {household.spouse.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{household.spouse.name}</p>
                      <p className="text-xs text-slate-500">Partner</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">Invited</Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-600">Invite Partner</p>
                      <p className="text-xs text-slate-400">Share your household</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Invite
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Recent Activity</h3>
              <Badge variant="neutral" size="sm">{activities.length}</Badge>
            </div>
            
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No recent activity</p>
                <p className="text-xs text-slate-400">Your actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity: unknown, index: number) => {
                  const act = activity as { action: string; description: string; createdAt: string; amount?: number };
                  return (
                    <div key={index} className="flex items-start gap-3 p-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">{getActivityIcon(act.action)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{act.description}</p>
                        <p className="text-xs text-slate-400">
                          {act.createdAt ? format(parseISO(act.createdAt), "MMM d, h:mm a") : ""}
                        </p>
                      </div>
                      {act.amount && (
                        <p className="text-sm font-medium text-slate-800">
                          {formatCurrency(act.amount)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Links */}
          <div className="space-y-2">
            <Link href="/settings">
              <Card padding="md" className="flex items-center justify-between hover:shadow-medium transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-700">Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Card>
            </Link>
          </div>
        </div>
      </AppShell>
    </ToastProvider>
  );
}