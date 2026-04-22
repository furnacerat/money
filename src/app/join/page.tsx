"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider, Card, Button, Input, EmptyState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { acceptInvite, getCurrentHousehold } from "@/lib/db";
import { UserPlus, Check, AlertCircle, Home } from "lucide-react";

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    async function checkExistingHousehold() {
      if (user) {
        const existing = await getCurrentHousehold();
        if (existing) {
          setAlreadyMember(true);
        }
      }
    }
    checkExistingHousehold();
  }, [user]);

  const handleJoin = async () => {
    if (!user) return;
    
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token) {
      setError("Invalid invite link");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await acceptInvite(token, user.id);
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Failed to join household");
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card padding="lg" className="w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Sign In Required</h1>
            <p className="text-slate-600 mb-6">
              You need to sign in to accept this household invite.
            </p>
            <Button
              className="w-full"
              onClick={() => router.push(`/signin?redirect=/join?${searchParams.toString()}`)}
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (alreadyMember) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card padding="lg" className="w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Already in a Household</h1>
            <p className="text-slate-600 mb-6">
              You're already part of a household. You can only be in one household at a time.
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card padding="lg" className="w-full max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Join Household</h1>
          <p className="text-slate-600 mb-6">
            You&apos;ve been invited to join a household. Accept the invite to see their budget data.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleJoin}
            isLoading={loading}
            leftIcon={<Check size={18} />}
          >
            Accept Invite
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function JoinPage() {
  return (
    <ToastProvider>
      <AppShell>
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        }>
          <JoinPageContent />
        </Suspense>
      </AppShell>
    </ToastProvider>
  );
}