"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { CreditCard } from "lucide-react";

export default function ExpensesPage() {
  return (
    <ToastProvider>
      <AppShell>
        <EmptyState
          icon={<CreditCard size={24} className="text-slate-400" />}
          title="Expenses tracking"
          description="Track your daily spending and see where your money goes. Coming in Phase 2."
        />
      </AppShell>
    </ToastProvider>
  );
}