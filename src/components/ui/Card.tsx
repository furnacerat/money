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
    default: "bg-white/90 border border-white/80 shadow-soft backdrop-blur-xl",
    elevated: "bg-white border border-white shadow-medium",
    outlined: "bg-white/45 border border-slate-200/80 backdrop-blur-xl",
    gradient: "bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 border border-white/80 shadow-soft backdrop-blur-xl",
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
