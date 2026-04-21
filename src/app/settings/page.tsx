"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <ToastProvider>
      <AppShell>
        <EmptyState
          icon={<SettingsIcon size={24} className="text-slate-400" />}
          title="App settings"
          description="Notifications, savings mode, and preferences. Coming in Phase 2."
        />
      </AppShell>
    </ToastProvider>
  );
}