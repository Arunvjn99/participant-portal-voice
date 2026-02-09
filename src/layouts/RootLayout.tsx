import { Outlet, useLocation } from "react-router-dom";
import { FloatingRetirementSearch } from "../components/ai/FloatingRetirementSearch";

const HIDE_CORE_AI_PATHS = ["/", "/voice"];

/**
 * Root layout - wraps all routes. Renders Outlet + global floating components.
 * FloatingRetirementSearch appears on every screen except login and voice pages.
 */
export const RootLayout = () => {
  const { pathname } = useLocation();
  const showCoreAI = !HIDE_CORE_AI_PATHS.includes(pathname);

  return (
    <>
      <Outlet />
      {showCoreAI && <FloatingRetirementSearch />}
    </>
  );
};
