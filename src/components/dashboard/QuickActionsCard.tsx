import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  id: string;
  label: string;
  route: string;
  iconColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

const ACTIONS: QuickAction[] = [
  {
    id: "contribution",
    label: "Change Contribution",
    route: "/enrollment/contribution",
    iconColor: "#5D3FD3",
    iconBg: "#ECEBFC",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "transfer",
    label: "Transfer Funds",
    route: "/transactions/transfer/start",
    iconColor: "#3465F5",
    iconBg: "#EBF2FF",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 9 4 12 8 15" />
        <polyline points="16 9 20 12 16 15" />
      </svg>
    ),
  },
  {
    id: "rebalance",
    label: "Rebalance",
    route: "/transactions/rebalance/start",
    iconColor: "#4CAF50",
    iconBg: "#EAF8EB",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-9-9" />
        <path d="M21 3v6h-6" />
      </svg>
    ),
  },
  {
    id: "rollover",
    label: "Start Rollover",
    route: "/transactions/rollover/start",
    iconColor: "#F59E0B",
    iconBg: "#FFF8EA",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="18 11 21 14 18 17" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Update Profile",
    route: "/profile",
    iconColor: "#6B7280",
    iconBg: "#F3F4F6",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * Quick Actions - Figma 595-1666
 * Five cards with colored icon circles, labels, hover animations
 */
export const QuickActionsCard = () => {
  const navigate = useNavigate();

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 xl:p-6 lg:col-start-1">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ACTIONS.map((action) => (
          <motion.button
            key={action.id}
            type="button"
            variants={itemVariants}
            onClick={() => navigate(action.route)}
            className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-5 shadow-sm transition-shadow hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-600 dark:bg-slate-700/50 dark:hover:border-slate-500 dark:hover:bg-slate-700/80 dark:hover:shadow-lg dark:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            whileHover={{
              scale: 1.03,
              y: -4,
              transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.15 },
            }}
          >
            <motion.span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm"
              style={{ backgroundColor: action.iconBg }}
              whileHover={{
                scale: 1.12,
                rotate: action.id === "rebalance" ? 180 : 0,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              <span style={{ color: action.iconColor }} className="[&>svg]:h-6 [&>svg]:w-6">
                {action.icon}
              </span>
            </motion.span>
            <span className="text-center text-sm font-medium text-slate-700 dark:text-slate-200">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
};
