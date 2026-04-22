"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ToastProvider, Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (useOtp) {
      const result = await signInWithOtp(email);
      setLoading(false);
      if (result.error) {
        setError(result.error.message);
      } else {
        setOtpSent(true);
      }
      return;
    }

    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      router.push("/");
    }
  };

  if (otpSent) {
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
                  We sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in.
                </p>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setUseOtp(false);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Back to sign in
                </button>
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
              <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
              <p className="text-slate-500">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              {!useOtp && (
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight size={20} />}
              >
                {useOtp ? "Send Magic Link" : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setUseOtp(!useOtp)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {useOtp ? "Use password instead" : "Use magic link instead"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </AppShell>
    </ToastProvider>
  );
}