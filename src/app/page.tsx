"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { HouseholdProvider } from "@/lib/context";
import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <HouseholdProvider>
      <AppShell householdName="The Foster Family">
        <Dashboard />
      </AppShell>
    </HouseholdProvider>
  );
}