import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline" | "tint";
  children: React.ReactNode;
}

export default function Badge({
  variant = "solid",
  children,
  className,
  ...props
}: BadgeProps) {
  const variants = {
    solid: "bg-[#7F0000] text-white hover:bg-[#6B0000]",
    outline: "border border-[#B91C1C] text-[#B91C1C] dark:border-red-400 dark:text-red-400 bg-transparent",
    tint: "bg-[#FBEFEF] text-[#7F0000] dark:bg-[#2E1818] dark:text-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
