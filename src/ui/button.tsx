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
        "rounded-lg p-2",
        variant === "normal" &&
          "border-secondary border border-solid bg-transparent",
        variant === "special" && "bg-primary",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
