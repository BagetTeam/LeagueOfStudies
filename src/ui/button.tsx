"use client";

import cn from "@/lib/cn";
import { ButtonHTMLAttributes } from "react";
import { HTMLMotionProps, motion } from "motion/react";

type Props = {
  variant?: "normal" | "special";
} & ButtonHTMLAttributes<HTMLButtonElement> &
  HTMLMotionProps<"button">;

export default function Button({
  children,
  variant,
  className,
  ...props
}: Props) {
  return (
    <motion.button
      {...props}
      className={cn(
        "rounded-xl p-3 hover:cursor-pointer",
        variant === "normal" &&
          "border-border border border-solid bg-transparent",
        variant === "special" && "bg-theme-purple text-background",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
