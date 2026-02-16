import { MOCK_ENROLLMENT_SUMMARY } from "../../data/enrollmentSummary";
import { DashboardShell } from "../../components/dashboard/core/DashboardShell";

/**
 * Post-Enrollment Dashboard — Retirement Command Center
 *
 * Architecture:
 * - DashboardShell orchestrates layout via the module registry
 * - useDashboardEngine computes personalization scores & recommendations
 * - Modules are lazy-loaded, memoized, and condition-gated
 * - All rendering uses global design tokens — zero hardcoded colors
 *
 * Route: /dashboard/post-enrollment
 */
export const PostEnrollmentDashboard = () => {
  return <DashboardShell data={MOCK_ENROLLMENT_SUMMARY} />;
};
