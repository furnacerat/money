"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { SmartAlert, AlertSeverity, AlertCategory, Recommendation } from "@/lib/types";
import { getAlerts, dismissAlert, markAlertRead } from "@/lib/storage";
import { analyzeAlerts, generateRecommendations, analyzeShortfall } from "@/lib/intelligence";
import { format, parseISO, formatDistanceToNow, isAfter, startOfDay } from "date-fns";
import { Bell, AlertTriangle, CheckCircle, Info, ChevronRight, Shield, Zap, TrendingUp, DollarSign, Calendar, ArrowRight } from "lucide-react";

const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; bg: string; icon: React.ReactNode }> = {
  critical: { color: "text-red-700", bg: "bg-red-50", icon: <AlertTriangle size={18} /> },
  warning: { color: "text-amber-700", bg: "bg-amber-50", icon: <AlertTriangle size={18} /> },
  info: { color: "text-blue-700", bg: "bg-blue-50", icon: <Info size={18} /> },
  success: { color: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle size={18} /> },
};

const CATEGORY_CONFIG: Record<AlertCategory, { label: string; description: string }> = {
  bill_risk: { label: "Bill Risk", description: "Upcoming bills that need attention" },
  shortfall: { label: "Shortfall", description: "Potential money gaps" },
  savings_adjusted: { label: "Savings Adjusted", description: "Savings changes" },
  buffer: { label: "Buffer", description: "Your safety net" },
  overspending: { label: "Overspending", description: "Categories over budget" },
  bills_protected: { label: "Protected", description: "You're covered" },
  progress: { label: "Progress", description: "Positive updates" },
};

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<"alerts" | "recommendations" | "shortfall">("alerts");
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [shortfall, setShortfall] = useState<ReturnType<typeof analyzeShortfall> | null>(null);

  useEffect(() => {
    const loadedAlerts = analyzeAlerts() as SmartAlert[];
    setAlerts(loadedAlerts.filter(a => !a.isDismissed));
    setRecommendations(generateRecommendations());
    setShortfall(analyzeShortfall());
  }, []);

  const activeAlerts = alerts.filter(a => !a.isDismissed);
  const unreadCount = activeAlerts.filter(a => !a.isRead).length;

  const handleDismiss = (id: string) => {
    dismissAlert(id);
    setAlerts(alerts.filter(a => a.id !== id));
    markAlertRead(id);
  };

  return (
    <ToastProvider>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Alerts</h1>
              <p className="text-slate-500">Stay ahead of your finances</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="danger">{unreadCount} new</Badge>
            )}
          </div>

          {shortfall?.isTight && (
            <Card 
              variant="gradient" 
              padding="lg"
              className="border-l-4 border-amber-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-1">Tight Month</h3>
                  <p className="text-amber-700 text-sm mb-3">
                    You're heading into a tight period. {shortfall.shortfallAmount > 0 
                      ? `Shortfall: ${formatCurrency(shortfall.shortfallAmount)}`
                      : "Your buffer is low."
                    }
                  </p>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setActiveTab("shortfall")}
                  >
                    View Plan
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-2 border-b border-slate-200">
            <TabButton 
              active={activeTab === "alerts"} 
              onClick={() => setActiveTab("alerts")}
              count={activeAlerts.length}
            >
              Alerts
            </TabButton>
            <TabButton 
              active={activeTab === "recommendations"} 
              onClick={() => setActiveTab("recommendations")}
              count={recommendations.length}
            >
              Recommendations
            </TabButton>
            <TabButton 
              active={activeTab === "shortfall"} 
              onClick={() => setActiveTab("shortfall")}
              count={shortfall?.isTight ? 1 : 0}
            >
              Shortfall
            </TabButton>
          </div>

          {activeTab === "alerts" && (
            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <Card padding="lg">
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">All caught up!</p>
                    <p className="text-slate-400 text-sm">No alerts right now</p>
                  </div>
                </Card>
              ) : (
                activeAlerts.map((alert) => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onDismiss={() => handleDismiss(alert.id)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <Card padding="lg">
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">You're on track!</p>
                    <p className="text-slate-400 text-sm">No recommendations right now</p>
                  </div>
                </Card>
              ) : (
                recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))
              )}
            </div>
          )}

          {activeTab === "shortfall" && shortfall && (
            <ShortfallView scenario={shortfall} />
          )}
        </div>
      </AppShell>
    </ToastProvider>
  );
}

function TabButton({ 
  children, 
  active, 
  onClick, 
  count 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active 
          ? "border-blue-500 text-blue-600" 
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

function AlertCard({ alert, onDismiss }: { alert: SmartAlert; onDismiss: () => void }) {
  const config = SEVERITY_CONFIG[alert.severity];
  const categoryInfo = CATEGORY_CONFIG[alert.category];
  
  return (
    <Card 
      padding="lg" 
      className={`${config.bg} border-l-4 ${alert.severity === "critical" ? "border-red-500" : alert.severity === "warning" ? "border-amber-500" : alert.severity === "success" ? "border-emerald-500" : "border-blue-500"}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase">
              {categoryInfo.label}
            </span>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(parseISO(alert.createdAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">{alert.title}</h3>
          <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
          {alert.suggestedAction && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">
                {alert.suggestedAction}
              </span>
              <ChevronRight size={16} className="text-blue-400" />
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          Dismiss
        </button>
      </div>
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Card padding="md" className="hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-slate-800 mb-1">{recommendation.title}</h4>
          <p className="text-sm text-slate-600 mb-2">{recommendation.explanation}</p>
          {recommendation.impactEstimate && (
            <p className="text-sm text-emerald-600 font-medium">
              {recommendation.impactEstimate}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function ShortfallView({ scenario }: { scenario: ReturnType<typeof analyzeShortfall> }) {
  return (
    <div className="space-y-6">
      <Card variant="gradient" padding="lg">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tight Month Ahead</h3>
          <p className="text-slate-600">
            {scenario.shortfallAmount > 0 
              ? `You're short ${formatCurrency(scenario.shortfallAmount)}. Here's how to handle it.`
              : "Your buffer is low. Here's how to recover."
            }
          </p>
        </div>
      </Card>

      {scenario.atRiskItems.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">At Risk</h4>
          <div className="space-y-2">
            {scenario.atRiskItems.map((item) => (
              <Card key={item.id} padding="md" className="flex items-center justify-between">
                <span className="text-slate-700">{item.name}</span>
                <span className="font-medium text-slate-800">{formatCurrency(item.amount)}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {scenario.recommendedCuts.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">Recommended Cuts</h4>
          <div className="space-y-2">
            {scenario.recommendedCuts.map((cut, i) => (
              <Card key={i} padding="md" className="flex items-center justify-between">
                <span className="text-slate-700 capitalize">{cut.category}</span>
                <span className="font-medium text-amber-600">-{formatCurrency(cut.amount)}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {scenario.suggestedBufferUse > 0 && (
        <Card padding="md" className="bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-amber-800">Use Buffer</h4>
              <p className="text-sm text-amber-700">You can safely use this much</p>
            </div>
            <span className="text-xl font-bold text-amber-700">
              {formatCurrency(scenario.suggestedBufferUse)}
            </span>
          </div>
        </Card>
      )}

      {scenario.recoveryPlan && (
        <Card padding="md">
          <h4 className="font-medium text-slate-700 mb-2">Recovery Plan</h4>
          <p className="text-sm text-slate-600">
            Recover over {scenario.recoveryPlan.periods} pay periods by setting aside an extra {formatCurrency(scenario.recoveryPlan.amountPerPeriod)} each time.
          </p>
        </Card>
      )}
    </div>
  );
}