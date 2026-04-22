"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ToastProvider, Card, Button, Input, Badge, EmptyState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getCurrentHousehold, getMemberProfiles, createInvite, getInvites } from "@/lib/db";
import { UserPlus, Mail, Check, Copy, Users, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

export default function InvitePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "viewer">("member");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [household, setHousehold] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const hh = await getCurrentHousehold();
      if (hh) {
        setHousehold(hh);
        const m = await getMemberProfiles(hh.id);
        setMembers(m);
        const i = await getInvites(hh.id);
        setPendingInvites(i);
      }
    }
    if (user) loadData();
  }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !user) return;

    setLoading(true);
    try {
      await createInvite(household.id, user.id, email, role);
      const inviteLink = `${window.location.origin}/join?email=${encodeURIComponent(email)}`;
      setInviteLink(inviteLink);
      setSuccess(true);
      const i = await getInvites(household.id);
      setPendingInvites(i);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = household?.owner_id === user?.id;

  if (!user) {
    return (
      <ToastProvider>
        <AppShell>
            <EmptyState
              title="Sign in to invite members"
            description="You need to be signed in to invite household members."
          />
        </AppShell>
      </ToastProvider>
    );
  }

  if (!household) {
    return (
      <ToastProvider>
        <AppShell>
          <EmptyState
            title="No household found"
            description="Create a household first to invite members."
          />
        </AppShell>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Household</h1>
            <p className="text-slate-500">Manage your household members</p>
          </div>

          {/* Current Members */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Members</h2>
                <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {member.user?.full_name?.[0] || member.user?.email?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {member.user?.full_name || member.user?.email}
                        {member.role === 'owner' && <Badge variant="success" size="sm" className="ml-2">Owner</Badge>}
                      </p>
                      <p className="text-sm text-slate-500">{member.user?.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Invite Form */}
          {isOwner && (
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Invite Someone</h2>
                  <p className="text-sm text-slate-500">Add a family member to your household</p>
                </div>
              </div>

              {success ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <Check size={18} />
                      <span className="font-medium">Invite Created!</span>
                    </div>
                    <p className="text-sm text-emerald-600 mb-3">
                      Share this link with {email} to invite them to your household.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg"
                      />
                      <Button size="sm" onClick={handleCopyLink}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                  >
                    Send Another Invite
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="spouse@example.com"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("member")}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          role === "member"
                            ? "border-slate-800 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-slate-800">Member</p>
                        <p className="text-xs text-slate-500">Full access</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("viewer")}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          role === "viewer"
                            ? "border-slate-800 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-slate-800">Viewer</p>
                        <p className="text-xs text-slate-500">Read-only</p>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                    leftIcon={<Mail size={18} />}
                  >
                    Create Invite
                  </Button>
                </form>
              )}
            </Card>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <Card padding="lg">
              <h2 className="font-semibold text-slate-800 mb-4">Pending Invites</h2>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div>
                      <p className="font-medium text-amber-800">{invite.email}</p>
                      <p className="text-sm text-amber-600">Role: {invite.role}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </AppShell>
    </ToastProvider>
  );
}