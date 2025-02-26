import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const clsxMerge = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const cn = clsxMerge;

export const joinClassNames = (...classNames: string[]) => classNames.join(" ");