import { branding } from "../../config/branding";

/**
 * Footer scoped to the right auth panel only.
 * Bottom-aligned, same width as auth card. Flexbox only.
 */
export const AuthFooter = () => {
  const { copyright, privacyLink, core } = branding.footer;

  return (
    <footer
      className="flex w-full flex-shrink-0 justify-center bg-transparent px-4 py-6 md:px-8 lg:px-12"
      role="contentinfo"
    >
      <div className="flex w-full max-w-[420px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <p className="order-1 text-center text-xs text-muted-foreground sm:text-left dark:text-slate-400">
          {copyright}
        </p>
        <a
          href={privacyLink.href}
          className="order-2 text-center text-xs text-muted-foreground no-underline hover:underline dark:text-slate-400 dark:hover:text-slate-300"
        >
          {privacyLink.label}
        </a>
        <div className="order-3 flex shrink-0 items-center justify-center sm:justify-end">
          <img
            src={core.src}
            alt={core.label}
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>
    </footer>
  );
};
