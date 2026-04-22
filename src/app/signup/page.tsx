"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider, Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signUp(email, password, fullName);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <ToastProvider>
        <AppShell>
          <div className="min-h-[80vh] flex items-center justify-center">
            <Card padding="lg" className="w-full max-w-md">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h1>
                <p className="text-slate-600 mb-6">
                  We sent a confirmation link to <strong>{email}</strong>. Click the link to verify your email and complete signup.
                </p>
                <Link href="/signin">
                  <Button variant="secondary">Go to Sign In</Button>
                </Link>
              </div>
            </Card>
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card padding="lg" className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
              <p className="text-slate-500">Start planning your household budget</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                hint="Must be at least 6 characters"
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight size={20} />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}