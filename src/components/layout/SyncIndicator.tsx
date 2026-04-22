"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getCurrentHousehold, subscribeToHouseholdChanges } from "@/lib/db";

interface SyncContextValue {
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
  triggerSync: () => void;
}

const SyncContext = createContext<SyncContextValue>({
  isSyncing: false,
  lastSynced: null,
  error: null,
  triggerSync: () => {},
});

export function useSync() {
  return useContext(SyncContext);
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      if (user) {
        const household = await getCurrentHousehold();
        if (household) {
          setHouseholdId(household.id);
          setLastSynced(new Date());
        }
      }
    }
    init();
  }, [user]);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribe = subscribeToHouseholdChanges(householdId, () => {
      setLastSynced(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, [householdId]);

  const triggerSync = useCallback(() => {
    setIsSyncing(true);
    setError(null);
    
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced(new Date());
    }, 1000);
  }, []);

  return (
    <SyncContext.Provider value={{ isSyncing, lastSynced, error, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}