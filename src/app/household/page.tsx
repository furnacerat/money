"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { Users } from "lucide-react";

export default function HouseholdPage() {
  return (
    <ToastProvider>
      <AppShell>
        <EmptyState
          icon={<Users size={24} className="text-slate-400" />}
          title="Household members"
          description="Invite your partner to share and sync data. Coming in Phase 2."
        />
      </AppShell>
    </ToastProvider>
  );
}