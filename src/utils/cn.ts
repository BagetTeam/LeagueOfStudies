import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...styles: ClassValue[]) => {
  return twMerge(clsx(...styles));
};

export default cn;
