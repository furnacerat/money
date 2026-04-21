"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { HouseholdProvider } from "@/lib/context";
import CalendarPage from "@/components/calendar/CalendarPage";

export default function Calendar() {
  return (
    <HouseholdProvider>
      <AppShell householdName="The Foster Family">
        <CalendarPage />
      </AppShell>
    </HouseholdProvider>
  );
}