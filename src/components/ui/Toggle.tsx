"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked = false, onChange, label, description, disabled = false, className }, ref) => {
    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between w-full py-3 px-4 rounded-xl border border-slate-200 bg-white transition-all",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50",
          className
        )}
      >
        <div className="flex flex-col items-start">
          {label && (
            <span className="text-base font-medium text-slate-800">{label}</span>
          )}
          {description && (
            <span className="text-sm text-slate-500 mt-0.5">{description}</span>
          )}
        </div>
        <div
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0",
            checked ? "bg-violet-600" : "bg-slate-200"
          )}
        >
          <div
            className={cn(
              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </div>
      </button>
    );
  }
);

Toggle.displayName = "Toggle";