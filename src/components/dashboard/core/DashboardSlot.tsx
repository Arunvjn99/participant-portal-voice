import { Suspense, memo } from "react";
import { motion } from "framer-motion";
import type { DashboardModuleEntry, ModuleProps } from "./types";

interface DashboardSlotProps {
  entry: DashboardModuleEntry;
  moduleProps: ModuleProps;
  index: number;
}

/**
 * Renders a single dashboard module inside a Suspense boundary
 * with staggered entrance animation.
 */
export const DashboardSlot = memo(function DashboardSlot({
  entry,
  moduleProps,
  index,
}: DashboardSlotProps) {
  const Component = entry.component;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.06 * index,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Suspense
        fallback={
          <div
            className="animate-pulse rounded-2xl"
            style={{
              background: "var(--color-bg-soft, var(--enroll-soft-bg))",
              height: entry.span === "full" ? 200 : 160,
            }}
          />
        }
      >
        <Component engine={moduleProps.engine} data={moduleProps.data} />
      </Suspense>
    </motion.div>
  );
});
