import * as React from "react";
import { Check, X, TrendingUp, ShieldCheck, Unlock, Activity, Lock, User, Briefcase, Calendar, MapPin, PiggyBank, Clock } from "lucide-react";
import type { PlanOption } from "../../types/enrollment";

export interface PlanDetailsUserSnapshot {
  age: number;
  retirementAge: number;
  salary: number;
  yearsToRetire?: number;
  retirementLocation?: string;
  otherSavings?: number;
}

export interface PlanDetailsPanelProps {
  plan: PlanOption | null;
  user: PlanDetailsUserSnapshot;
  rationale?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

/* ── Shared card style using tokens ── */
const cardStyle: React.CSSProperties = {
  background: "var(--enroll-card-bg)",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--enroll-card-radius)",
  boxShadow: "var(--enroll-elevation-2)",
};

const softBgStyle: React.CSSProperties = {
  background: "var(--enroll-soft-bg)",
  border: "1px solid var(--enroll-card-border)",
};

export function PlanDetailsPanel({ plan, user, rationale }: PlanDetailsPanelProps) {
  if (!plan) {
    return (
      <div
        className="animate-fade-in flex flex-col items-center justify-center min-h-[320px] p-8 text-center"
        style={{ ...cardStyle, opacity: 0.7 }}
      >
        <p className="text-sm" style={{ color: "var(--enroll-text-muted)" }}>Select a plan to see details.</p>
      </div>
    );
  }

  if (plan.isEligible === false) {
    return (
      <div className="animate-fade-in h-full">
        <div
          className="p-6 flex flex-col items-center text-center h-full justify-center min-h-[400px]"
          style={{ ...cardStyle, opacity: 0.7 }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: "var(--enroll-soft-bg)", color: "var(--enroll-text-muted)" }}
          >
            <Lock size={24} />
          </div>
          <h3 className="text-sm font-bold mb-2" style={{ color: "var(--enroll-text-primary)" }}>Plan Unavailable</h3>
          <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: "var(--enroll-text-muted)" }}>
            {plan.ineligibilityReason ?? "This plan is not available for your current profile."}
          </p>
        </div>
      </div>
    );
  }

  const confidenceScore = plan.fitScore ?? 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Plan Overview */}
      <div className="p-6" style={cardStyle}>
        <h4
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          Plan Overview
        </h4>
        <p className="text-lg font-medium leading-snug mb-2" style={{ color: "var(--enroll-text-primary)" }}>
          {plan.isRecommended
            ? "Best for tax-free growth over time."
            : "A solid option for your retirement savings."}
        </p>
        {rationale && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--enroll-text-secondary)" }}>
            {rationale}
          </p>
        )}
        <div
          className="rounded-xl p-4 relative overflow-hidden group"
          style={{
            background: "rgb(var(--enroll-brand-rgb) / 0.06)",
            border: "1px solid rgb(var(--enroll-brand-rgb) / 0.12)",
          }}
        >
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: "var(--enroll-brand)" }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-brand)" }}>Match Score</span>
              </div>
              <span className="text-xl font-bold" style={{ color: "var(--enroll-brand)" }}>{confidenceScore}%</span>
            </div>
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: "var(--enroll-soft-bg)" }}
            >
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, confidenceScore)}%`, background: "var(--enroll-brand)" }}
              />
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--enroll-text-secondary)" }}>
              {plan.isRecommended
                ? "Excellent for growing your money tax-free."
                : "Better for keeping more money in your paycheck today."}
            </p>
          </div>
        </div>
      </div>

      {/* Your Details */}
      <div className="p-5" style={cardStyle}>
        <h4
          className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          <User size={12} /> Your Details
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <DetailCell icon={<User size={10} />} label="Age" value={String(user.age)} />
          <DetailCell icon={<Calendar size={10} />} label="Retiring At" value={String(user.retirementAge)} />
          <DetailCell icon={<Briefcase size={10} />} label="Salary" value={typeof user.salary === "number" ? formatCurrency(user.salary) : String(user.salary)} />
          {user.yearsToRetire != null && user.yearsToRetire >= 0 && (
            <DetailCell icon={<Clock size={10} />} label="Years to Retire" value={String(user.yearsToRetire)} colSpan />
          )}
          {user.retirementLocation && (
            <DetailCell icon={<MapPin size={10} />} label="Retirement Location" value={user.retirementLocation} colSpan />
          )}
          {user.otherSavings != null && user.otherSavings > 0 && (
            <DetailCell icon={<PiggyBank size={10} />} label="Other Savings" value={formatCurrency(user.otherSavings)} colSpan />
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6 space-y-5" style={cardStyle}>
        <MetricRow icon={<TrendingUp size={14} />} label="Growth" value={confidenceScore > 90 ? "Maximum" : "Stable"} score={confidenceScore} />
        <MetricRow icon={<ShieldCheck size={14} />} label="Tax Benefits" value={confidenceScore > 90 ? "Tax-Free" : "Pay Later"} score={confidenceScore} />
        <MetricRow icon={<Unlock size={14} />} label="Access to Money" value="Flexible" score={Math.min(100, (plan.benefits?.length ?? 0) * 25)} />
      </div>

      {/* Pros / Cons */}
      <div className="p-6 space-y-6" style={cardStyle}>
        <div className="space-y-3">
          <h5
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--enroll-accent)" }} aria-hidden /> Pros
          </h5>
          <ul className="space-y-2.5">
            {(plan.benefits ?? []).map((value, i) => (
              <li key={i} className="flex gap-2.5 text-xs" style={{ color: "var(--enroll-text-secondary)" }}>
                <Check size={14} className="shrink-0" style={{ color: "var(--enroll-accent)" }} />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full h-px" style={{ background: "var(--enroll-card-border)" }} aria-hidden />
        <div className="space-y-3">
          <h5
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden /> Cons
          </h5>
          <ul className="space-y-2.5">
            <li className="flex gap-2.5 text-xs" style={{ color: "var(--enroll-text-muted)" }}>
              <X size={14} className="shrink-0" style={{ color: "var(--enroll-text-muted)" }} />
              <span>{plan.id === "roth-401k" || plan.isRecommended ? "You don't get a tax break today" : "You pay taxes when you take money out"}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

const DetailCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  colSpan?: boolean;
}> = ({ icon, label, value, colSpan }) => (
  <div
    className={`p-3 rounded-xl flex flex-col justify-center ${colSpan ? "col-span-3 sm:col-span-1" : ""}`}
    style={softBgStyle}
  >
    <div className="flex items-center gap-1.5 mb-1">
      <span style={{ color: "var(--enroll-text-muted)" }}>{icon}</span>
      <span className="text-[10px] font-medium" style={{ color: "var(--enroll-text-muted)" }}>{label}</span>
    </div>
    <div className="text-sm font-bold truncate" style={{ color: "var(--enroll-text-primary)" }} title={value}>
      {value}
    </div>
  </div>
);

const MetricRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  score: number;
}> = ({ icon, label, value, score }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ ...softBgStyle, color: "var(--enroll-text-muted)" }}
    >
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>{label}</span>
        <span className="text-[10px] font-bold" style={{ color: "var(--enroll-text-primary)" }}>{value}</span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "var(--enroll-soft-bg)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, score)}%`, background: "var(--enroll-brand)" }}
        />
      </div>
    </div>
  </div>
);
