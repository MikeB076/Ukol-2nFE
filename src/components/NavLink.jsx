import React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function isModifiedEvent(e) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
}

function isExternalHref(href) {
  return typeof href === "string" && /^(https?:)?\/\//i.test(href);
}

function navigate(to) {
  if (to === window.location.pathname) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new Event("nav"));
}

/**
 * Custom NavLink for the project's built-in router (pushState + "nav" event).
 *
 * Props:
 * - to: string (required)
 * - className: string
 * - activeClassName: string
 * - pendingClassName: string (kept for API compatibility; not used by this router)
 * - end: boolean (if false, marks link active when pathname startsWith(to))
 */
export function NavLink({
  to,
  className = "",
  activeClassName = "",
  pendingClassName = "",
  end = false,
  children,
  onClick,
  target,
  rel,
  ...props
}) {
  const pathname = window.location.pathname;
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  // We don't have async navigation here, but keep prop for compatibility.
  const isPending = false;

  const finalRel = target === "_blank" ? rel || "noopener noreferrer" : rel;

  return (
    <a
      href={to}
      className={cn(className, isActive && activeClassName, isPending && pendingClassName)}
      aria-current={isActive ? "page" : undefined}
      target={target}
      rel={finalRel}
      onClick={(e) => {
        // Let user handler run first.
        if (typeof onClick === "function") onClick(e);

        // If already prevented, respect it.
        if (e.defaultPrevented) return;

        // Allow normal browser behavior for:
        // - new tabs/windows
        // - modifier clicks
        // - non-left clicks
        // - external URLs
        if (target === "_blank" || isModifiedEvent(e) || e.button !== 0 || isExternalHref(to)) {
          return;
        }

        e.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}