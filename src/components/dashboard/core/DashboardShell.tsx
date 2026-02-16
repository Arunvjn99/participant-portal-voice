import { useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../../../layouts/DashboardLayout";
import { DashboardHeader } from "../DashboardHeader";
import type { EnrollmentSummary } from "../../../data/enrollmentSummary";
import { useDashboardEngine } from "./useDashboardEngine";
import { DashboardRegistry } from "./DashboardRegistry";
import { DashboardSlot } from "./DashboardSlot";
import type { DashboardModuleEntry, ModuleProps } from "./types";

interface DashboardShellProps {
  data: EnrollmentSummary;
}

/**
 * Dashboard Shell — Orchestrates the entire command center.
 *
 * 1. Runs the personalization engine
 * 2. Filters registry modules by condition
 * 3. Sorts by priority
 * 4. Renders full-width, primary (2/3), and secondary (1/3) slots
 */
export function DashboardShell({ data }: DashboardShellProps) {
  const engine = useDashboardEngine(data);

  const { fullModules, primaryModules, secondaryModules } = useMemo(() => {
    const active = DashboardRegistry
      .filter((entry) => entry.condition(engine))
      .sort((a, b) => a.priority - b.priority);

    return {
      fullModules: active.filter((m) => m.span === "full"),
      primaryModules: active.filter((m) => m.span === "primary"),
      secondaryModules: active.filter((m) => m.span === "secondary"),
    };
  }, [engine]);

  const moduleProps: ModuleProps = { engine, data };

  let slotIndex = 0;

  return (
    <DashboardLayout header={<DashboardHeader />}>
      <div
        className="w-full min-w-0 space-y-6"
        role="region"
        aria-label="Retirement command center"
      >
        {/* Full-width modules (Hero) */}
        {fullModules.map((entry) => (
          <DashboardSlot
            key={entry.id}
            entry={entry}
            moduleProps={moduleProps}
            index={slotIndex++}
          />
        ))}

        {/* Main grid: primary (2/3) + secondary (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {primaryModules.map((entry) => (
              <DashboardSlot
                key={entry.id}
                entry={entry}
                moduleProps={moduleProps}
                index={slotIndex++}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {secondaryModules.map((entry) => (
                <DashboardSlot
                  key={entry.id}
                  entry={entry}
                  moduleProps={moduleProps}
                  index={slotIndex++}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Inspirational footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center py-6"
        >
          <p
            className="text-sm italic"
            style={{ color: "var(--enroll-text-muted)", opacity: 0.7 }}
          >
            "Time is your most powerful asset."
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
