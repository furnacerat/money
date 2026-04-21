"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { HouseholdProvider } from "@/lib/context";
import PaycheckPlan from "@/components/paycheck/PaycheckPlan";

export default function PaycheckPage() {
  return (
    <HouseholdProvider>
      <AppShell householdName="The Foster Family">
        <PaycheckPlan />
      </AppShell>
    </HouseholdProvider>
  );
}