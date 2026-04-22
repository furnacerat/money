"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider, Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { createHousehold, getCurrentHousehold } from "@/lib/db";
import { Home, ArrowRight, AlertCircle } from "lucide-react";

export default function HouseholdSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [householdName, setHouseholdName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError(null);
    setLoading(true);

    try {
      await createHousehold(householdName, user.id);
      router.push("/onboarding");
    } catch (err) {
      setError("Failed to create household. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <AppShell>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card padding="lg" className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Create Your Household</h1>
              <p className="text-slate-500">Set up your family budget</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Household Name"
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="The Smiths"
                hint="Give your household a name"
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight size={20} />}
              >
                Create Household
              </Button>
            </form>
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}