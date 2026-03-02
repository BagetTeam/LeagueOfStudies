"use client";

import cn from "@/utils/cn";
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
        "flex items-center rounded-none border border-black bg-white p-3 text-black shadow-[2px_2px_0_0_black] hover:cursor-pointer hover:shadow-[1px_1px_0_0_black] active:shadow-[1px_1px_0_0_black]",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
