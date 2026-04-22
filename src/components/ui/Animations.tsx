"use client";

import React from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function FadeIn({ delay = 0, className, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type SlideUpProps = HTMLMotionProps<"div"> & {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function SlideUp({ delay = 0, className, children, ...props }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type ScaleInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function ScaleIn({ delay = 0, className, children, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MotionCardProps = HTMLMotionProps<"div"> & {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function MotionCard({ delay = 0, className, children, ...props }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      className={cn("transition-shadow", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "",
  className 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}

export function ProgressFill({ 
  progress, 
  color = "#10B981",
  height = 8,
  className,
  animate = true
}: { 
  progress: number; 
  color?: string;
  height?: number;
  className?: string;
  animate?: boolean;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress * 100));
  
  return (
    <div 
      className={cn("bg-slate-100 rounded-full overflow-hidden", className)}
      style={{ height }}
    >
      <motion.div
        initial={animate ? { width: 0 } : { width: `${clampedProgress}%` }}
        animate={{ width: `${clampedProgress}%` }}
        transition={animate ? { duration: 0.8, ease: "easeOut" } : { duration: 0 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export function CountUp({ 
  value, 
  duration = 1,
  prefix = "",
  suffix = "",
  className 
}: { 
  value: number; 
  duration?: number;
  prefix?: string; 
  suffix?: string;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}

export function PulseDot({ 
  className, 
  color = "#10B981" 
}: { 
  className?: string; 
  color?: string;
}) {
  return (
    <motion.span
      className={cn("inline-block rounded-full", className)}
      style={{ backgroundColor: color }}
      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

export function SuccessCheck({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      </svg>
    </motion.div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-slate-200 rounded", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ListItem({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function NumberFlow({ 
  value, 
  from = 0,
  prefix = "",
  suffix = "",
  className,
  duration = 0.8
}: { 
  value: number; 
  from?: number;
  prefix?: string; 
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}