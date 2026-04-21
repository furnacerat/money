"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { HouseholdProvider } from "@/lib/context";
import BillsPage from "@/components/bills/BillsPage";

export default function Bills() {
  return (
    <HouseholdProvider>
      <AppShell householdName="The Foster Family">
        <BillsPage />
      </AppShell>
    </HouseholdProvider>
  );
}