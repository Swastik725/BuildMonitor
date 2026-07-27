"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent/90 disabled:bg-accent/40",
  secondary: "bg-surface-2 text-text border border-border hover:border-accent/60 disabled:opacity-50",
  danger: "bg-error/10 text-error border border-error/30 hover:bg-error/20 disabled:opacity-50",
  ghost: "text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-50",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }
>(({ className, variant = "primary", loading, children, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? "Working..." : children}
    </button>
  );
});
Button.displayName = "Button";
