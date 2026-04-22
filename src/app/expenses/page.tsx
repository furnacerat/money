"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Expense, ExpenseBucket } from "@/lib/types";
import { getExpenses, addExpense, saveExpenses } from "@/lib/storage";
import { format, isToday, isYesterday, parseISO, startOfMonth } from "date-fns";
import { Plus, Receipt, ChevronRight, Calendar, User } from "lucide-react";

const BUCKET_LABELS: Record<ExpenseBucket, string> = {
  groceries: "Groceries",
  gas: "Gas",
  household: "Household",
  kids: "Kids",
  dining: "Dining Out",
  entertainment: "Entertainment",
  misc: "Misc",
};

const BUCKET_COLORS: Record<ExpenseBucket, string> = {
  groceries: "#10B981",
  gas: "#3B82F6",
  household: "#8B5CF6",
  kids: "#F59E0B",
  dining: "#EF4444",
  entertainment: "#EC4899",
  misc: "#6B7280",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const data = getExpenses() as Expense[];
    setExpenses(data);
  }, []);

  const totalThisMonth = expenses
    .filter(e => {
      const expDate = parseISO(e.date);
      const monthStart = startOfMonth(new Date());
      return expDate >= monthStart;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const formatExpenseDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const groupExpenses = expenses.reduce((groups, expense) => {
    const date = format(parseISO(expense.date), "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(groupExpenses).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          {/* Summary */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">This Month</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(totalThisMonth)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Receipt className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Add Button */}
          <Link href="/expenses/new">
            <Button size="lg" className="w-full" leftIcon={<Plus size={20} />}>
              Add Expense
            </Button>
          </Link>

          {/* Expense List */}
          {expenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Start tracking your spending to see where your money goes."
              action={
                <Link href="/expenses/new">
                  <Button variant="outline" leftIcon={<Plus size={16} />}>
                    Add First Expense
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {sortedDates.map((date) => (
                <div key={date}>
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    {formatExpenseDate(date)}
                  </p>
                  <div className="space-y-2">
                    {groupExpenses[date].map((expense) => {
                      const color = BUCKET_COLORS[expense.bucket] || "#6B7280";
                      return (
                        <Link key={expense.id} href={`/expenses/${expense.id}`}>
                          <Card padding="md" className="hover:shadow-medium transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {BUCKET_LABELS[expense.bucket]}
                                  </p>
                                  {expense.note && (
                                    <p className="text-sm text-slate-500">
                                      {expense.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-bold text-slate-800">
                                  {formatCurrency(expense.amount)}
                                </p>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ToastProvider>
  );
}