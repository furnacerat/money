"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { HouseholdProvider } from "@/lib/context";
import SavingsPage from "@/components/savings/SavingsPage";

export default function Savings() {
  return (
    <HouseholdProvider>
      <AppShell householdName="The Foster Family">
        <SavingsPage />
      </AppShell>
    </HouseholdProvider>
  );
}