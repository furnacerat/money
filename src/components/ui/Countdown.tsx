"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { differenceInDays, parseISO, format } from "date-fns";
import { Calendar } from "lucide-react";

interface CountdownProps {
  targetDate: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function Countdown({
  targetDate,
  label = "Next Payday",
  size = "md",
}: CountdownProps) {
  const days = differenceInDays(parseISO(targetDate), new Date());
  const isToday = days === 0;
  const isTomorrow = days === 1;

  const getDisplayDays = () => {
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return days;
  };

  const getSubtext = () => {
    if (isToday) return "Get ready!";
    if (isTomorrow) return "Get ready!";
    return `${days} days`;
  };

  return (
    <Card
      padding={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
      className="text-center"
    >
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-xl mb-3",
          isToday ? "bg-emerald-100" : "bg-violet-100"
        )}
      >
        <Calendar
          size={size === "sm" ? 18 : size === "lg" ? 24 : 20}
          className={isToday ? "text-emerald-600" : "text-violet-600"}
        />
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p
        className={cn(
          "font-bold text-slate-800 mt-1",
          size === "sm" && "text-2xl",
          size === "md" && "text-3xl",
          size === "lg" && "text-4xl sm:text-5xl"
        )}
      >
        {getDisplayDays()}
      </p>
      <p
        className={cn(
          "text-sm",
          isToday ? "text-emerald-600 font-semibold" : "text-slate-500"
        )}
      >
        {getSubtext()}
      </p>
      <p className="text-xs text-slate-400 mt-2">
        {format(parseISO(targetDate), "EEEE, MMM d")}
      </p>
    </Card>
  );
}