"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-slate-100/88 border border-slate-300/70 shadow-soft backdrop-blur-xl",
    elevated: "bg-slate-100 border border-slate-300/80 shadow-medium",
    outlined: "bg-slate-200/45 border border-slate-300/80 backdrop-blur-xl",
    gradient: "bg-gradient-to-br from-slate-100 via-blue-50/80 to-cyan-100/60 border border-slate-300/70 shadow-soft backdrop-blur-xl",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  return (
    <div
      className={cn(
        "rounded-lg transition-all duration-250",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
