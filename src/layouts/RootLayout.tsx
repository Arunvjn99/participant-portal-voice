import { Outlet, useLocation } from "react-router-dom";
import { CoreAIFab } from "../components/ai/CoreAIFab";
import { DemoSwitcher } from "../components/demo/DemoSwitcher";

const HIDE_CORE_AI_PATHS = ["/"];

/**
 * Root layout - wraps all routes. Renders Outlet + global floating components.
 * CoreAIFab opens the unified CoreAIModal (chat + voice in one modal).
 * DemoSwitcher manages its own visibility internally.
 */
export const RootLayout = () => {
  const { pathname } = useLocation();
  const showCoreAI = !HIDE_CORE_AI_PATHS.includes(pathname);

  return (
    <>
      <Outlet />
      {showCoreAI && <CoreAIFab />}
      <DemoSwitcher />
    </>
  );
};
