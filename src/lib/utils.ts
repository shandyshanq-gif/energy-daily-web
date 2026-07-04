import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  try {
    const parsed = parseISO(date);
    return format(parsed, "yyyy年MM月dd日");
  } catch {
    return date;
  }
}

export function getWeekday(date: string): string {
  try {
    const parsed = parseISO(date);
    return format(parsed, "EEEE");
  } catch {
    return "";
  }
}

export function formatDateShort(date: string): string {
  try {
    const parsed = parseISO(date);
    return format(parsed, "MM/dd");
  } catch {
    return date;
  }
}
