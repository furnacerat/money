"use client";

import React, { useState, useMemo } from "react";
import { useHousehold } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { CalendarEvent } from "@/lib/types";
import { Card, Badge } from "@/components/ui";
import { format, addDays, startOfToday, parseISO, differenceInDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const { calendarEvents, household } = useHousehold();
  const [viewDate, setViewDate] = useState(startOfToday());

  const today = startOfToday();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    calendarEvents.forEach((event) => {
      const date = event.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });
    return grouped;
  }, [calendarEvents]);

  const paydays = calendarEvents.filter((e) => e.type === "payday" && !e.isHighlighted);

  const riskDays = useMemo(() => {
    return days.filter((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const events = eventsByDay[dayStr] || [];
      const hasBillDue = events.some((e) => e.type === "bill_due");
      const hasPayday = events.some((e) => e.type === "payday" && e.isHighlighted);
      return hasBillDue && !hasPayday;
    });
  }, [days, eventsByDay]);

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "payday":
        return DollarSign;
      case "bill_due":
        return AlertTriangle;
      case "savings_milestone":
        return TrendingUp;
      default:
        return CalendarIcon;
    }
  };

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "payday":
        return "#10B981";
      case "bill_due":
        return "#EF4444";
      case "savings_milestone":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(addDays(viewDate, -7))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="text-slate-600" size={20} />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">
          {format(viewDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setViewDate(addDays(viewDate, 7))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="text-slate-600" size={20} />
        </button>
      </div>

      {/* Timeline View */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-800 mb-4">Next 2 Weeks</h3>
        <div className="space-y-3">
          {days.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const events = eventsByDay[dayStr] || [];
            const isToday = isSameDay(day, today);
            const hasPayday = events.some((e) => e.type === "payday" && e.isHighlighted);
            const hasBillDue = events.some((e) => e.type === "bill_due");

            return (
              <div
                key={dayStr}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  isToday ? "bg-violet-50" : "bg-slate-50"
                }`}
              >
                <div className="w-12 text-center flex-shrink-0">
                  <p className={`text-xs font-medium ${isToday ? "text-violet-600" : "text-slate-500"}`}>
                    {format(day, "EEE")}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? "text-violet-600" : "text-slate-800"}`}>
                    {format(day, "d")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  {events.length === 0 ? (
                    <p className="text-sm text-slate-400">No events</p>
                  ) : (
                    events.map((event) => {
                      const Icon = getEventIcon(event.type);
                      const color = getEventColor(event.type);
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon size={12} style={{ color }} />
                          </div>
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {event.title}
                          </p>
                          {event.amount && (
                            <p className="text-sm font-semibold text-slate-800 flex-shrink-0">
                              {formatCurrency(event.amount)}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                  {hasPayday && (
                    <Badge variant="success" size="sm" className="mt-2">
                      Money Day
                    </Badge>
                  )}
                  {hasBillDue && !hasPayday && (
                    <Badge variant="warning" size="sm" className="mt-2">
                      Bill Due
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Risk Warning */}
      {riskDays.length > 0 && (
        <Card className="bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Watch Out</p>
              <p className="text-sm text-amber-700">
                {riskDays.length} day{riskDays.length > 1 ? "s" : ""} with bills due before your next payday
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Paydays */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Upcoming Paydays</h3>
        <div className="space-y-3">
          {household.paychecks
            .filter((p) => !p.isReceived)
            .map((paycheck) => (
              <div
                key={paycheck.id}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {format(parseISO(paycheck.date), "EEEE, MMM d")}
                    </p>
                    <p className="text-sm text-slate-500">
                      {differenceInDays(parseISO(paycheck.date), today)} days away
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(paycheck.amount)}
                </p>
              </div>
            ))}
        </div>
      </Card>

      {/* Legend */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
              <DollarSign size={12} className="text-emerald-600" />
            </div>
            <span className="text-sm text-slate-600">Payday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center">
              <AlertTriangle size={12} className="text-red-600" />
            </div>
            <span className="text-sm text-slate-600">Bill Due</span>
          </div>
        </div>
      </Card>
    </div>
  );
}