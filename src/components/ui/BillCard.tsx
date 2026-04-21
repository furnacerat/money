"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Bill } from "@/lib/types";
import { formatCurrency, getBillCategoryColor } from "@/lib/utils";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { format, differenceInDays } from "date-fns";
import {
  Calendar,
  CreditCard,
  Home,
  Zap,
  Shield,
  Tv,
  Car,
  Heart,
  Package,
} from "lucide-react";

interface BillCardProps {
  bill: Bill;
  onMarkPaid?: () => void;
  compact?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  housing: Home,
  utilities: Zap,
  insurance: Shield,
  subscriptions: Tv,
  transportation: Car,
  healthcare: Heart,
  debt: CreditCard,
  other: Package,
};

const frequencyLabels: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Yearly",
  irregular: "Variable",
};

export function BillCard({ bill, onMarkPaid, compact = false }: BillCardProps) {
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
  const daysUntilDue = differenceInDays(dueDate, today);
  const Icon = categoryIcons[bill.category] || Package;
  const categoryColor = getBillCategoryColor(bill.category);

  const getStatusBadge = () => {
    switch (bill.status) {
      case "due_today":
        return <Badge variant="danger" size="sm">Due Today</Badge>;
      case "due_soon":
        return <Badge variant="warning" size="sm">Due Soon</Badge>;
      case "overdue":
        return <Badge variant="danger" size="sm" pulse>Overdue</Badge>;
      case "paid":
        return <Badge variant="success" size="sm">Paid</Badge>;
      default:
        return null;
    }
  };

  const getDueLabel = () => {
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    return `Due in ${daysUntilDue} days`;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-white shadow-soft">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            <Icon size={18} style={{ color: categoryColor }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{bill.name}</p>
            <p className="text-xs text-slate-500">{getDueLabel()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800">{formatCurrency(bill.amount)}</p>
          {bill.isAutoPay && (
            <p className="text-xs text-slate-400">Auto-pay</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full opacity-10"
        style={{ backgroundColor: categoryColor }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            <Icon size={22} style={{ color: categoryColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800">{bill.name}</h3>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {format(dueDate, "MMM d")}
              </span>
              <span>{frequencyLabels[bill.frequency]}</span>
              {bill.isAutoPay && (
                <span className="text-violet-600">Auto-pay</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-800">
            {formatCurrency(bill.amount)}
          </p>
        </div>
      </div>
      {onMarkPaid && bill.status !== "paid" && (
        <button
          onClick={onMarkPaid}
          className="mt-4 w-full py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors"
        >
          Mark as Paid
        </button>
      )}
    </Card>
  );
}