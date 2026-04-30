"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-slate-950 text-white hover:bg-slate-800 shadow-soft hover:shadow-medium active:scale-[0.98]",
    secondary:
      "bg-white/80 text-slate-800 border border-slate-200 hover:bg-white hover:border-slate-300 active:scale-[0.98]",
    outline:
      "border border-slate-300 bg-white/60 text-slate-800 hover:bg-white hover:border-slate-400 active:scale-[0.98]",
    ghost:
      "text-slate-600 hover:bg-white/70 active:scale-[0.98]",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-soft active:scale-[0.98]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
        variantStyles[variant],
        sizeStyles[size],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === "sm" ? 14 : size === "md" ? 18 : 22} className="animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
