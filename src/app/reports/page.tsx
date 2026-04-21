"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <ToastProvider>
      <AppShell>
        <EmptyState
          icon={<BarChart3 size={24} className="text-slate-400" />}
          title="Reports & insights"
          description="See spending trends, savings progress, and monthly summaries. Coming in Phase 2."
        />
      </AppShell>
    </ToastProvider>
  );
}