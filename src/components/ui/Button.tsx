import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "outline-white" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-2.5 gap-2.5 font-semibold",
  };

  const variants = {
    primary:
      "bg-[#E50914] text-white hover:bg-[#B91C1C] active:scale-[0.98] shadow-sm hover:shadow",
    outline:
      "border border-[#7F0000] text-[#7F0000] hover:bg-[#7F0000] hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950",
    "outline-white":
      "border border-white/80 text-white hover:bg-white hover:text-[#7F0000] backdrop-blur-sm",
    secondary:
      "bg-[#FBEFEF] text-[#7F0000] hover:bg-red-100 dark:bg-stone-800 dark:text-stone-200",
    ghost:
      "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800",
  };

  return (
    <button
      className={cn(base, sizeStyles[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
