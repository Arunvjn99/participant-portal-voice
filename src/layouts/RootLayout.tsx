import { Outlet } from "react-router-dom";
import { FloatingRetirementSearch } from "../components/ai/FloatingRetirementSearch";

/**
 * Root layout - wraps all routes. Renders Outlet + global floating components.
 * FloatingRetirementSearch appears on every screen.
 */
export const RootLayout = () => (
  <>
    <Outlet />
    <FloatingRetirementSearch />
  </>
);
