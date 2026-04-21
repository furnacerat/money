"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  return (
    <ToastProvider>
      <AppShell>
        <EmptyState
          icon={<Bell size={24} className="text-slate-400" />}
          title="Smart alerts"
          description="Get notified about bill due dates, low balance, and payday. Coming in Phase 2."
        />
      </AppShell>
    </ToastProvider>
  );
}